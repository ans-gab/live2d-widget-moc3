import Model from "./model.js";
import showMessage from "./message.js";
import randomSelection from "./utils.js";
import tools from "./tools.js";
import LocalModel from "./localModel.js";

function loadWidget(config) {
    const model = config.isLocalModel ? new LocalModel(config) : new Model(config);
    localStorage.removeItem("waifu-display");
    sessionStorage.removeItem("waifu-text");
    document.body.insertAdjacentHTML("beforeend", `<div id="waifu">
            <div id="waifu-tips"></div>
            <canvas id="live2d" width="800" height="800"></canvas>
            <div id="waifu-tool"></div>
            <div id="waifu-align-tool" ></div>
        </div>`);
    // https://stackoverflow.com/questions/24148403/trigger-css-transition-on-appended-element
    setTimeout(() => {
        document.getElementById("waifu").style.bottom = 0;
    }, 0);

    (function registerTools() {
        tools["switch-model"].callback = () => model.loadOtherModel('next');
        tools["switch-prev-model"].callback = () => model.loadOtherModel('prev');
        tools["switch-texture"].callback = () => model.loadRandModel();
        if (!Array.isArray(config.tools)) {
            config.tools = Object.keys(tools);
        }
        for (let tool of config.tools) {
            if (tools[tool]) {
                const { icon, callback } = tools[tool];
                document.getElementById("waifu-tool").insertAdjacentHTML("beforeend", `<span id="waifu-tool-${tool}">${icon}</span>`);
                document.getElementById(`waifu-tool-${tool}`).addEventListener("click", callback);
            }
        }
    })();

    // 初始化对齐和透明度工具（悬浮显示）
    (function registerAlignTools() {
        const waifu = document.getElementById("waifu");

        // 存储当前的水平和垂直对齐状态
        let currentHorizontalAlignment = 'default'; // 'left', 'center', 'right', 'default'
        let currentVerticalAlignment = 'default';   // 'top', 'middle', 'bottom', 'default'

        // 通用位置设置函数（水平对齐）
        function setHorizontalAlignment(alignment, message) {
            const waifu = document.getElementById("waifu");
            const currentStyle = getComputedStyle(waifu);

            // 保留垂直方向的transform
            const currentTransform = currentStyle.transform || "";
            const translateYMatch = currentTransform.match(/translateY\([^)]+\)/g);
            const translateY = translateYMatch ? translateYMatch[0] : '';

            switch(alignment) {
                case 'left':
                    waifu.style.left = "20px";
                    waifu.style.right = "auto";
                    // 保留 translateY，组合新的水平 transform
                    waifu.style.transform = translateY ? `translateX(0) ${translateY}` : "translateX(0)";
                    break;
                case 'center':
                    waifu.style.left = "50%";
                    waifu.style.right = "auto";
                    // 保留 translateY，组合新的水平 transform
                    waifu.style.transform = translateY ? `translateX(-50%) ${translateY}` : "translateX(-50%)";
                    break;
                case 'right':
                    waifu.style.left = "auto";
                    waifu.style.right = "20px";
                    // 保留 translateY，组合新的水平 transform
                    waifu.style.transform = translateY ? `translateX(0) ${translateY}` : "translateX(0)";
                    break;
                default: // default
                    waifu.style.left = "0";
                    waifu.style.right = "auto";
                    // 保留 translateY，只移除 translateX 部分
                    if (translateY) {
                        waifu.style.transform = translateY;
                    } else {
                        waifu.style.transform = 'none';
                    }
            }

            currentHorizontalAlignment = alignment;
            localStorage.setItem('waifu-h-position', alignment);
            if (message) showMessage(message, 2000, 9);
        }

        // 通用位置设置函数（垂直对齐）
        function setVerticalAlignment(alignment, message) {
            const waifu = document.getElementById("waifu");
            const currentStyle = getComputedStyle(waifu);

            // 保留水平方向的transform
            const currentTransform = currentStyle.transform || "";
            const translateXMatch = currentTransform.match(/translateX\([^)]+\)/g);
            const translateX = translateXMatch ? translateXMatch[0] : '';

            switch(alignment) {
                case 'top':
                    waifu.style.top = "20px";
                    waifu.style.bottom = "auto";
                    // 保留 translateX，组合新的垂直 transform
                    waifu.style.transform = translateX ? `${translateX} translateY(0)` : "translateY(0)";
                    break;
                case 'middle':
                    waifu.style.top = "50%";
                    waifu.style.bottom = "auto";
                    // 保留 translateX，组合新的垂直 transform
                    waifu.style.transform = translateX ? `${translateX} translateY(-50%)` : "translateY(-50%)";
                    break;
                case 'bottom':
                    waifu.style.top = "auto";
                    waifu.style.bottom = "0px";
                    // 保留 translateX，组合新的垂直 transform
                    waifu.style.transform = translateX ? `${translateX} translateY(0)` : "translateY(0)";
                    break;
                default: // default
                    waifu.style.top = "auto";
                    waifu.style.bottom = "0px";
                    // 保留 translateX，只移除 translateY 部分
                    if (translateX) {
                        waifu.style.transform = translateX;
                    } else {
                        waifu.style.transform = 'none';
                    }
            }

            currentVerticalAlignment = alignment;
            localStorage.setItem('waifu-v-position', alignment);
            if (message) showMessage(message, 2000, 9);
        }

        // 恢复默认位置
        function resetPosition() {
            waifu.style.left = "0";
            waifu.style.right = "auto";
            waifu.style.top = "auto";
            waifu.style.bottom = "0px";
            waifu.style.transform = "translate(0)";
            currentHorizontalAlignment = 'default';
            currentVerticalAlignment = 'default';
            localStorage.setItem('waifu-h-position', 'default');
            localStorage.setItem('waifu-v-position', 'default');
            showMessage("已恢复默认位置", 2000, 9);
        }

        // 透明度调整功能
        function adjustOpacity() {
            const currentOpacity = parseFloat(waifu.style.opacity || "1");
            let newOpacity = currentOpacity <= 0.6 ? 1 : currentOpacity - 0.2;
            waifu.style.opacity = newOpacity;
            localStorage.setItem('waifu-opacity', newOpacity);
            showMessage(`透明度已调整为 ${(newOpacity * 100).toFixed(0)}%`, 2000, 9);
        }

        // 偏移处理函数
        function handleOffset(direction) {
            const currentStyle = getComputedStyle(waifu);

            if (currentStyle.left === '50%' || currentStyle.left === '50px') { // 居中对齐情况
                const currentTransform = currentStyle.transform;
                let translateValue = 0;
                const match = currentTransform.match(new RegExp(`${direction}X?\\(\\s*([+-]?\\d+\\.?\\d*)px?\\s*\\)`));
                if (match) translateValue = parseFloat(match[1]);

                // 修复偏移方向：translateX向左偏移-10px，translateY向上偏移-10px
                const offsetValue = direction === 'translateX' ? -10 : -10;
                const newValue = translateValue + offsetValue;
                const otherTransforms = currentTransform
                  .replace(new RegExp(`${direction}X?\\([^)]+\\)`, 'g'), '')
                  .replace(/\s+/g, ' ')
                  .trim();
                waifu.style.transform = `${otherTransforms} ${direction}X?(${newValue}px)`.trim();

                // 修正上面的错误：正确的transform名称
                waifu.style.transform = `${otherTransforms} ${direction}(${newValue}px)`.trim();
            } else {
                // 非居中对齐情况
                let currentValue, newValue;
                if (direction === 'translateX') {
                    // 处理水平偏移
                    currentValue = parseFloat(currentStyle.left) || 0;
                    newValue = Math.max(20, currentValue - 10); // 向左偏移
                    waifu.style.left = newValue + 'px';
                } else {
                    // 处理垂直偏移
                    currentValue = parseFloat(currentStyle.top) || (window.innerHeight - parseFloat(currentStyle.height || 0));
                    newValue = currentValue - 10; // 向上偏移
                    waifu.style.top = newValue + 'px';
                }
            }

            showMessage(direction === 'translateX' ? "已向左偏移" : "已向上偏移", 2000, 9);
        }

        // 修正后的偏移处理函数
        function handleHorizontalOffset(offsetDirection) {
            const currentStyle = getComputedStyle(waifu);

            if (currentStyle.left === '50%' || currentStyle.left === '50px') { // 居中对齐情况
                const currentTransform = currentStyle.transform;
                let translateXValue = 0;
                const match = currentTransform.match(/translateX\(\s*([+-]?\d+\.?\d*)px?\s*\)/);
                if (match) translateXValue = parseFloat(match[1]);

                const newValue = offsetDirection === 'left' ? translateXValue - 10 : translateXValue + 10;
                const otherTransforms = currentTransform
                  .replace(/translateX\([^)]+\)/g, '')
                  .replace(/\s+/g, ' ')
                  .trim();
                waifu.style.transform = `${otherTransforms} translateX(${newValue}px)`.trim();
            } else {
                // 非居中对齐情况
                let currentValue = parseFloat(currentStyle.left) || parseFloat(currentStyle.right) || 0;
                let newValue;

                if (currentStyle.left !== 'auto') {
                    // 当前是left定位
                    newValue = offsetDirection === 'left' ? Math.max(20, currentValue - 10) : currentValue + 10;
                    waifu.style.left = newValue + 'px';
                } else {
                    // 当前是right定位
                    newValue = offsetDirection === 'left' ? currentValue + 10 : Math.max(20, currentValue - 10);
                    waifu.style.right = newValue + 'px';
                }
            }

            showMessage(offsetDirection === 'left' ? "已向左偏移" : "已向右偏移", 2000, 9);
        }

        // 垂直偏移处理函数
        function handleVerticalOffset(offsetDirection) {
            const currentStyle = getComputedStyle(waifu);

            if (currentStyle.top === '50%' || currentStyle.top === '50px') { // 垂直居中对齐情况
                const currentTransform = currentStyle.transform;
                let translateYValue = 0;
                const match = currentTransform.match(/translateY\(\s*([+-]?\d+\.?\d*)px?\s*\)/);
                if (match) translateYValue = parseFloat(match[1]);

                const newValue = offsetDirection === 'up' ? translateYValue - 10 : translateYValue + 10;
                const otherTransforms = currentTransform
                  .replace(/translateY\([^)]+\)/g, '')
                  .replace(/\s+/g, ' ')
                  .trim();
                waifu.style.transform = `${otherTransforms} translateY(${newValue}px)`.trim();
            } else {
                // 非居中对齐情况
                let currentValue = parseFloat(currentStyle.top) || parseFloat(currentStyle.bottom) || 0;
                let newValue;

                if (currentStyle.top !== 'auto') {
                    // 当前是top定位
                    newValue = offsetDirection === 'up' ? currentValue - 10 : currentValue + 10;
                    waifu.style.top = newValue + 'px';
                } else {
                    // 当前是bottom定位
                    newValue = offsetDirection === 'up' ? currentValue + 10 : Math.max(20, currentValue - 10);
                    waifu.style.bottom = newValue + 'px';
                }
            }

            showMessage(offsetDirection === 'up' ? "已向上偏移" : "已向下偏移", 2000, 9);
        }

        // 位置对齐功能
        const alignments = {
            'left': () => setHorizontalAlignment('left', "已设置为靠左"),
            'center': () => setHorizontalAlignment('center', "已设置为居中"),
            'right': () => setHorizontalAlignment('right', "已设置为靠右"),
            'top': () => setVerticalAlignment('top', "已设置为顶部"),
            'middle': () => setVerticalAlignment('middle', "已设置为中部"),
            'bottom': () => setVerticalAlignment('bottom', "已设置为底部")
        };

        // 添加对齐工具按钮
        document.getElementById("waifu-align-tool").insertAdjacentHTML("beforeend", `            
            <span id="waifu-offset-left" title="向左偏移"><svg t="1766711454694" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5540" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16"><path d="M448 384h576v64H448zM448 576h386v64H448zM448 192h576v64H448zM0 192h320v64H0zM448 768h576v64H448zM0 768h320v64H0z" fill="#727272" p-id="5541"></path><path d="M322.5 704L184.8 576H384V448H184.9l137.7-128H207.9L1.3 512.1 207.8 704z" fill="#497CAD" p-id="5542"></path></svg></span>
            <span id="waifu-offset-right" title="向右偏移"><svg t="1766711466647" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5706" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16"><path d="M448 384h576v64H448zM448 576h386v64H448zM448 192h576v64H448zM0 192h320v64H0zM448 768h576v64H448zM0 768h320v64H0z" fill="#727272" p-id="5707"></path><path d="M62.8 704l137.8-128H1.3V448h199.1L62.7 320h114.8L384 512.1 177.6 704z" fill="#497CAD" p-id="5708"></path></svg></span>
            <span id="waifu-align-left" title="水平靠左"><svg t="1766711022507" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4267" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16"><path d="M64 64h64v896H64z" fill="#727272" p-id="4268"></path><path d="M192 192h515v256H192z" fill="#B3B3B3" p-id="4269"></path><path d="M192 576h768v256H192z" fill="#497CAD" p-id="4270"></path></svg></span>
            <span id="waifu-align-center" title="水平居中"><svg t="1766711048418" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4601" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16"><path d="M480 64h64v896h-64z" fill="#727272" p-id="4602"></path><path d="M256 192h512v256H256z" fill="#B3B3B3" p-id="4603"></path><path d="M128 576h768v256H128z" fill="#497CAD" p-id="4604"></path></svg></span>
            <span id="waifu-align-right" title="水平靠右"><svg t="1766711043934" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4434" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16"><path d="M896 64h64v896h-64z" fill="#727272" p-id="4435"></path><path d="M320 192h512v256H320z" fill="#B3B3B3" p-id="4436"></path><path d="M64 576h768v256H64z" fill="#497CAD" p-id="4437"></path></svg></span>
            <span id="waifu-align-top" title="顶部对齐"><svg t="1766711085246" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5202" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16"><path d="M64 64h896v64H64z" fill="#727272" p-id="5203"></path><path d="M192 960V192h256v768z" fill="#497CAD" p-id="5204"></path><path d="M576 704V192h256v512z" fill="#B3B3B3" p-id="5205"></path></svg></span>
            <span id="waifu-align-middle" title="垂直居中"><svg t="1766711094431" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5371" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16"><path d="M64 480h896v64H64z" fill="#727272" p-id="5372"></path><path d="M832 256v512H576V256z" fill="#B3B3B3" p-id="5373"></path><path d="M448 128v768H192V128z" fill="#497CAD" p-id="5374"></path></svg></span>
            <span id="waifu-align-bottom" title="底部对齐"><svg t="1766711067727" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4768" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16"><path d="M64 896h896v64H64z" fill="#727272" p-id="4769"></path><path d="M192 832V64h256v768z" fill="#497CAD" p-id="4770"></path><path d="M576 832V320h256v512z" fill="#B3B3B3" p-id="4771"></path></svg></span>
            <span id="waifu-opacity" title="调整透明度"><svg t="1766733922997" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11381" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16"><path d="M128.023999 638.168114C128.023999 570.780326 161.749891 484.257734 222.034123 380.776201c23.9985-41.149428 51.83676-84.282732 82.810824-128.759952A2936.136491 2936.136491 0 0 1 473.858384 33.085932l4.031748-4.671708L502.592588 0l24.766452 28.414224 3.967752 4.735704 11.071308 12.991188a2970.630336 2970.630336 0 0 1 158.070121 206.003125c30.846072 44.413224 58.748328 87.546528 82.682832 128.63196 60.284232 103.481532 94.07412 190.068121 94.07412 257.391913 0 212.850697-167.541529 385.76789-374.632585 385.76789C295.565527 1023.936004 128.023999 851.018811 128.023999 638.168114z m346.730329-502.752577a2830.927067 2830.927067 0 0 0-116.088745 154.678332c-30.07812 43.069308-56.95644 84.666708-79.995 124.280233-54.780576 93.882132-84.986688 171.381289-84.986688 223.794012 0 176.756953 138.551341 319.660021 308.908693 319.660022 170.421349 0 308.908693-142.903069 308.908693-319.660022 0-52.412724-30.206112-129.911881-84.986688-223.794012a1860.363727 1860.363727 0 0 0-79.867008-124.280233 2899.082807 2899.082807 0 0 0-144.054997-188.788201c-8.703456 10.495344-17.982876 21.886632-27.83826 34.109869z m27.83826 773.711643c-144.310981 0-261.359665-118.136616-261.359665-263.983501 0-145.782889 135.863509-71.9955 261.359665 0 126.07212 72.31548 261.359665-145.782889 261.359665 0s-117.048684 263.919505-261.359665 263.919505z" fill="#B4B4B4" p-id="11382"></path></svg></span>
            <span id="waifu-align-reset" title="默认"><svg t="1766733810968" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8518" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16"><path d="M950.4 425.4c-11.8-59.2-34.8-114.4-68.4-164-32.5-47.9-73.4-88.5-121.7-120.8S658.8 85.9 602.2 74.2c-58.7-12.2-118.5-12.4-177.7-0.7-81.3 16.1-155 53.5-215.2 108.9l-95-97.8C105 75 88.6 81.5 88.4 94.9l-3.6 249c-0.1 8.3 6.5 15.2 14.8 15.3l249 3.6c13.4 0.2 20.4-15.9 11-25.6L259.5 234.1c50.2-45.7 111.5-76.5 179-89.9 98.4-19.5 198.5 0.5 281.8 56.2 83.4 55.8 140 140.6 159.5 239s-0.5 198.5-56.2 281.8c-55.8 83.4-140.6 140-239 159.5-77.3 15.3-156 6.3-227.6-26.1-70.1-31.7-127.9-83.1-167.4-148.7-10.2-17-32.4-22.6-49.4-12.3-17 10.2-22.5 32.4-12.3 49.4 23.4 38.9 52.5 74 86.7 104.2 33.7 29.9 71.7 54.5 112.7 73.1 58.3 26.4 120.5 39.8 183.5 39.8 29.2 0 58.6-2.9 87.8-8.7 59.2-11.8 114.4-34.8 164-68.4 47.9-32.5 88.5-73.4 120.8-121.7s54.6-101.5 66.4-158.2c12.2-58.7 12.4-118.5 0.6-177.7z" fill="#333333" p-id="8519"></path></svg></span>
        `);

        // 添加事件监听器
        document.getElementById("waifu-offset-left").addEventListener("click", () => handleHorizontalOffset('left'));
        document.getElementById("waifu-offset-right").addEventListener("click", () => handleHorizontalOffset('right'));
        for (const [key, func] of Object.entries(alignments)) {
            document.getElementById(`waifu-align-${key}`).addEventListener("click", func);
        }
        document.getElementById("waifu-opacity").addEventListener("click", adjustOpacity);
        document.getElementById("waifu-align-reset").addEventListener("click", resetPosition);

        // 从localStorage恢复之前保存的设置
        const savedHorizontalAlignment = localStorage.getItem('waifu-h-position') || 'default';
        const savedVerticalAlignment = localStorage.getItem('waifu-v-position') || 'default';
        const savedOpacity = localStorage.getItem('waifu-opacity');

        if (savedOpacity !== null) {
            waifu.style.opacity = savedOpacity;
        }

        // 根据保存的位置设置应用样式
        setHorizontalAlignment(savedHorizontalAlignment, "");
        setVerticalAlignment(savedVerticalAlignment, "");
    })();


    function welcomeMessage(time) {
        if (location.pathname === "/") { // 如果是主页
            for (let { hour, text } of time) {
                const now = new Date(),
                  after = hour.split("-")[0],
                  before = hour.split("-")[1] || after;
                if (after <= now.getHours() && now.getHours() <= before) {
                    return randomSelection(text);
                }
            }
        }
        const text = `欢迎来到<span>「${document.title.split(" - ")[0]}」</span>`;
        let from;
        if (document.referrer !== "") {
            const referrer = new URL(document.referrer),
              domain = referrer.hostname.split(".")[1];
            const domains = {
                "baidu": "百度",
                "so": "360搜索",
                "google": "谷歌搜索"
            };
            if (location.hostname === referrer.hostname) return text;

            if (domain in domains) from = domains[domain];
            else from = referrer.hostname;
            return `Hello！来自 <span>${from}</span> 的朋友<br>${text}`;
        }
        return text;
    }

    function registerEventListener(result) {
        // 检测用户活动状态，并在空闲时显示消息
        let userAction = false,
          userActionTimer,
          messageArray = result.message.default,
          lastHoverElement,
          lastHoveredText;
        window.addEventListener("mousemove", () => userAction = true);
        window.addEventListener("keydown", () => userAction = true);
        setInterval(() => {
            if (userAction) {
                userAction = false;
                clearInterval(userActionTimer);
                userActionTimer = null;
            } else if (!userActionTimer) {
                userActionTimer = setInterval(() => {
                    showMessage(messageArray, 4000, 7);
                }, 20000);
            }
        }, 1000);
        showMessage(welcomeMessage(result.time), 6000, 8);
        window.addEventListener("mousemove", event => {
            clearTimeout(window.hoverTimeout); // 清除之前的定时器
            window.hoverTimeout = setTimeout(() => { // 设置新的定时器
                for (let { selector, text } of result.mouseover) {
                    if (!event.target.closest(selector)) continue;
                    if (lastHoverElement === selector && lastHoveredText === event.target.innerText && event.target.id !=='live2d') return;
                    lastHoverElement = selector;
                    lastHoveredText = event.target.innerText;
                    text = randomSelection(text);
                    text = text.replace("{text}", event.target.innerText);
                    showMessage(text, 4000, 8);
                    return;
                }
            }, 100); // 300毫秒的延迟
        });
        window.addEventListener("click", event => {
            for (let { selector, text } of result.click) {
                if (!event.target.closest(selector)) continue;
                text = randomSelection(text);
                text = text.replace("{text}", event.target.innerText);
                showMessage(text, 4000, 9);
                return;
            }
        });
        result.seasons.forEach(({ date, text }) => {
            const now = new Date(),
              after = date.split("-")[0],
              before = date.split("-")[1] || after;
            if ((after.split("/")[0] <= now.getMonth() + 1 && now.getMonth() + 1 <= before.split("/")[0]) && (after.split("/")[1] <= now.getDate() && now.getDate() <= before.split("/")[1])) {
                text = randomSelection(text);
                text = text.replace("{year}", now.getFullYear());
                messageArray.push(text);
            }
        });

        const devtools = () => { };
        console.log("%c", devtools);
        devtools.toString = () => {
            showMessage(result.message.console, 6000, 9);
        };
        window.addEventListener("copy", () => {
            showMessage(result.message.copy, 6000, 10);
        });
        window.addEventListener("visibilitychange", () => {
            if (!document.hidden) showMessage(result.message.visibilitychange, 6000, 7);
        });
    }

    (function initModel() {
        let modelId = localStorage.getItem("modelId"),
          modelTexturesId = localStorage.getItem("modelTexturesId");
        if (modelId === null) {
            // 首次访问加载 指定模型 的 指定材质
            modelId = 31; // 模型 ID
            modelTexturesId = 1; // 材质 ID
        }
        model.loadModel(modelId, modelTexturesId);
        fetch(config.waifuPath)
          .then(response => response.json())
          .then(registerEventListener);
    })();
}

function initWidget(config, apiPath) {
    if (typeof config === "string") {
        config = {
            waifuPath: config,
            apiPath
        };
    }
    document.body.insertAdjacentHTML("beforeend", `<div id="waifu-toggle">
            <span>看板娘</span>
        </div>`);
    const toggle = document.getElementById("waifu-toggle");
    toggle.addEventListener("click", () => {
        toggle.classList.remove("waifu-toggle-active");
        if (toggle.getAttribute("first-time")) {
            loadWidget(config);
            toggle.removeAttribute("first-time");
        } else {
            localStorage.removeItem("waifu-display");
            document.getElementById("waifu").style.display = "";
            setTimeout(() => {
                document.getElementById("waifu").style.bottom = 0;
            }, 0);
        }
    });
    if (localStorage.getItem("waifu-display") && Date.now() - localStorage.getItem("waifu-display") <= 86400000) {
        toggle.setAttribute("first-time", true);
        setTimeout(() => {
            toggle.classList.add("waifu-toggle-active");
        }, 0);
    } else {
        loadWidget(config);
    }
}

export default initWidget;
