import randomSelection from "./utils.js"; // 导入随机选择工具
import Typed from 'typed.js'; // 导入 Typed.js 库

let messageTimer; // 定义消息计时器

// 显示消息的函数
function showMessage(text, timeout, priority) {
    // 如果没有 text，或 sessionStorage 中的优先级小于当前优先级，则返回
    if (!text || (sessionStorage.getItem("waifu-text") && sessionStorage.getItem("waifu-text") < priority)) return;

    // 清除之前的计时器
    if (messageTimer) {
        clearTimeout(messageTimer);
        messageTimer = null;
    }

    // 随机选择文本
    text = randomSelection(text);
    sessionStorage.setItem("waifu-text", priority); // 存储当前优先级
    const tips = document.getElementById("waifu-tips"); // 获取提示元素
    tips.innerHTML = ''; // 清空之前的内容
    tips.classList.add("waifu-tips-active"); // 添加活动类

    // Typed.js 的选项配置
    const options = {
        strings: [text], // 要显示的文本
        typeSpeed: 10, // 打字速度
        fadeIn: true, // 淡入效果
        onComplete: () => {
            // 打字完成后设置计时器
            messageTimer = setTimeout(() => {
                sessionStorage.removeItem("waifu-text"); // 移除优先级
                tips.classList.remove("waifu-tips-active"); // 移除活动类
            }, timeout); // 超时时间
        }
    };

    new Typed(tips, options); // 创建新的 Typed 实例
}

export default showMessage; // 导出 showMessage 函数
