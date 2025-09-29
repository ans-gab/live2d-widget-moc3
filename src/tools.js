import fa_comment from "@fortawesome/fontawesome-free/svgs/solid/comment.svg";
import fa_jet_fighter_up from "@fortawesome/fontawesome-free/svgs/solid/jet-fighter-up.svg";
import fa_street_view from "@fortawesome/fontawesome-free/svgs/solid/street-view.svg";
import fa_camera_retro from "@fortawesome/fontawesome-free/svgs/solid/camera-retro.svg";
import fa_info_circle from "@fortawesome/fontawesome-free/svgs/solid/circle-info.svg";
import fa_xmark from "@fortawesome/fontawesome-free/svgs/solid/xmark.svg";
import fa_circle_arrow_down from "@fortawesome/fontawesome-free/svgs/solid/circle-arrow-down.svg";
import fa_circle_arrow_up from "@fortawesome/fontawesome-free/svgs/solid/circle-arrow-up.svg";
import fa_paper_plane from "@fortawesome/fontawesome-free/svgs/solid/paper-plane.svg";
import OpenAI from "openai"

import showMessage from "./message.js";

function showHitokoto() {
    // 增加 hitokoto.cn 的 API
    fetch("https://v1.hitokoto.cn")
      .then(response => response.json())
      .then(result => {
          const text = `${result.hitokoto}<br />来自 <span>「${result.from}」</span>`;
          showMessage(text, 4000, 9);
      });
}
function askAI() {
  // 创建输入框容器
  const inputContainer = document.createElement('div');
  inputContainer.id = 'ai-input-container';
  inputContainer.style.cssText = `        position: fixed;
        bottom: 20px;
        left: 20px;
        z-index: 10000;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 8px;
        padding: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
        gap: 8px;
        backdrop-filter: blur(5px);
        border: 1px solid rgba(0, 0, 0, 0.1);
    `;

  // 创建输入框
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = '请输入问题...';
  input.style.cssText = `        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        outline: none;
        width: 250px;
    `;

  // 创建按钮容器
  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `        display: flex;
        gap: 8px;
        justify-content: flex-end;
    `;

  // 提交按钮
  const submitButton = document.createElement('button');
  submitButton.textContent = '提交';
  submitButton.style.cssText = `        padding: 6px 12px;
        background: #4a90e2;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
    `;

  // 取消按钮
  const cancelButton = document.createElement('button');
  cancelButton.textContent = '取消';
  cancelButton.style.cssText = `        padding: 6px 12px;
        background: #f1f1f1;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
    `;

  // 添加元素到容器
  buttonContainer.appendChild(cancelButton);
  buttonContainer.appendChild(submitButton);

  inputContainer.appendChild(input);
  inputContainer.appendChild(buttonContainer);

  // 添加到页面
  document.body.appendChild(inputContainer);

  // 聚焦到输入框
  input.focus();

  // 事件处理
  const removeInput = () => {
    if (document.body.contains(inputContainer)) {
      document.body.removeChild(inputContainer);
    }
  };

  cancelButton.addEventListener('click', removeInput);

  submitButton.addEventListener('click', () => {
    const question = input.value.trim();
    if (question) {
      removeInput();
      // 显示正在思考的消息
      showMessage("让我想想...", 2000, 9);

      // 初始化 OpenAI 客户端
      const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: 'sk-2e4e5ab548e446f2b6c7588cff4a828e',
        dangerouslyAllowBrowser: true // 注意：在生产环境中应避免这样做，这里仅为演示用途
      });

      // 调用 API
      openai.chat.completions.create({
        messages: [
          { role: "system", content: "你是一个漂亮温柔的小可爱，请简短并礼貌的回复我的问题，尽可能提供多的情绪价值。" },
          { role: "user", content: question }
        ],
        model: "deepseek-chat",
      }).then(completion => {
        const answer = completion.choices[0].message.content;
        showMessage(answer, 8000, 9);
      }).catch(error => {
        console.error("Error:", error);
        showMessage("抱歉，我无法回答这个问题。", 4000, 9);
      });
    } else {
      removeInput();
    }
  });

  // 回车提交
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      submitButton.click();
    }
  });
}

const tools = {
    "hitokoto": {
        icon: fa_paper_plane,
        callback: showHitokoto
    },
    "asteroids": {
        icon: fa_jet_fighter_up,
        callback: () => {
            if (window.Asteroids) {
                if (!window.ASTEROIDSPLAYERS) window.ASTEROIDSPLAYERS = [];
                window.ASTEROIDSPLAYERS.push(new Asteroids());
            } else {
                const script = document.createElement("script");
                script.src = "https://fastly.jsdelivr.net/gh/stevenjoezhang/asteroids/asteroids.js";
                document.head.appendChild(script);
            }
        }
    },
    "switch-prev-model": {
        icon: fa_circle_arrow_up,
        callback: () => {
        }
    },
    "switch-model": {
        icon: fa_circle_arrow_down,
        callback: () => {
        }
    },
    "switch-texture": {
        icon: fa_street_view,
        callback: () => {
        }
    },
    "photo": {
        icon: fa_camera_retro,
        callback: () => {
            showMessage("照好了嘛，是不是很可爱呢？", 6000, 9);
            Live2D.captureName = "photo.png";
            Live2D.captureFrame = true;
        }
    },
  "ai": {
    icon: fa_comment,
    callback: askAI
  },
    "info": {
        icon: fa_info_circle,
        callback: () => {
            open("https://github.com/ans-gab/live2d-widget-moc3");
        }
    },
    "quit": {
        icon: fa_xmark,
        callback: () => {
            localStorage.setItem("waifu-display", Date.now());
            showMessage("愿你有一天能与重要的人重逢。", 2000, 11);
            document.getElementById("waifu").style.bottom = "-500px";
            setTimeout(() => {
                document.getElementById("waifu").style.display = "none";
                document.getElementById("waifu-toggle").classList.add("waifu-toggle-active");
            }, 3000);
        }
    }
};

export default tools;
