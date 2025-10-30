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
}function askAI() {
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
        max-width: 300px;
    `;

  // 创建对话历史显示区域
  const historyContainer = document.createElement('div');
  historyContainer.id = 'ai-history-container';
  historyContainer.style.cssText = `        max-height: 200px;
        overflow-y: auto;
        padding: 8px;
        border: 1px solid #eee;
        border-radius: 4px;
        background: white;
        font-size: 12px;
        margin-bottom: 8px;
        display: none;
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

  // 清除对话历史按钮
  const clearButton = document.createElement('button');
  clearButton.textContent = '清除历史';
  clearButton.style.cssText = `        padding: 6px 12px;
        background: #ff6b6b;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
    `;

  // 添加元素到容器
  buttonContainer.appendChild(clearButton);
  buttonContainer.appendChild(cancelButton);
  buttonContainer.appendChild(submitButton);

  inputContainer.appendChild(historyContainer);
  inputContainer.appendChild(input);
  inputContainer.appendChild(buttonContainer);

  // 添加到页面
  document.body.appendChild(inputContainer);

  // 从localStorage获取对话历史
  let conversationHistory = [];
  try {
    const savedHistory = localStorage.getItem('ai-conversation-history');
    if (savedHistory) {
      conversationHistory = JSON.parse(savedHistory);
      if (conversationHistory.length > 0) {
        historyContainer.style.display = 'block';
        updateHistoryDisplay(historyContainer, conversationHistory);
      }
    }
  } catch (e) {
    console.warn('Failed to parse conversation history', e);
  }

  // 聚焦到输入框
  input.focus();

  // 事件处理
  const removeInput = () => {
    if (document.body.contains(inputContainer)) {
      document.body.removeChild(inputContainer);
    }
  };

  cancelButton.addEventListener('click', removeInput);

  clearButton.addEventListener('click', () => {
    conversationHistory = [];
    localStorage.removeItem('ai-conversation-history');
    historyContainer.style.display = 'none';
    historyContainer.innerHTML = '';
    showMessage("对话历史已清除", 2000, 9);
  });

  submitButton.addEventListener('click', () => {
    const question = input.value.trim();
    if (question) {
      // 显示正在思考的消息
      showMessage("让我想想...", 2000, 9);

      // 获取当前页面URL和maincontent元素的内容
      let pageContent = '';
      try {
        const mainElement = document.getElementById("maincontent");
        if (!mainElement) {
          return "";
        }
        // 克隆元素以避免修改原始DOM
        const clonedElement = mainElement.cloneNode(true);
        // 移除所有svg元素
        const svgElements = clonedElement.querySelectorAll("svg");
        svgElements.forEach((svg) => svg.remove());
        pageContent = clonedElement.innerHTML;
        // 返回清理后的HTML内容
      } catch (error) {
        console.warn("获取主内容时出错:", error);
        return "";
      }

      // 构建消息数组，包括系统消息、历史对话和当前问题
      const messages = [
        {
          role: "system",
          content: `这是本页面的内容：${pageContent}，我希望你的回答最好能根据此页面的内容回答，不管什么问题，我都希望你能和当前页面的内容扯上关系，当然你可以幽默一点啦，我希望你是幽默的、有趣的助手`
        }
      ];

      // 添加历史对话
      conversationHistory.forEach(item => {
        messages.push({ role: item.role, content: item.content });
      });

      // 添加当前用户问题
      messages.push({ role: "user", content: question });

      // 向后端发送请求
      fetch('https://ai.vuestyle.com/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: messages,
        })
      })
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            throw new Error(data.error);
          }

          // 保存对话历史
          conversationHistory.push({ role: "user", content: question });
          conversationHistory.push({ role: "assistant", content: data.message });

          // 限制历史记录数量，只保留最近10条消息（5轮对话）
          if (conversationHistory.length > 10) {
            conversationHistory = conversationHistory.slice(-10);
          }

          // 保存到localStorage
          localStorage.setItem('ai-conversation-history', JSON.stringify(conversationHistory));

          // 更新历史显示
          if (conversationHistory.length > 0) {
            historyContainer.style.display = 'block';
            updateHistoryDisplay(historyContainer, conversationHistory);
          }

          showMessage(data.message, 8000, 9);
        })
        .catch(error => {
          console.error("Error:", error);
          showMessage("抱歉，我无法回答这个问题。", 4000, 9);
        });

      // 清空输入框
      input.value = '';
    }
  });

  // 回车提交
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      submitButton.click();
    }
  });
}

// 更新对话历史显示
function updateHistoryDisplay(container, history) {
  container.innerHTML = '';
  history.forEach((item, index) => {
    const messageElement = document.createElement('div');
    messageElement.style.cssText = `      padding: 4px;
      margin: 2px 0;
      border-radius: 3px;
      ${item.role === 'user' ? 'background: #e3f2fd;' : 'background: #f5f5f5;'}    `;
    messageElement.innerHTML = `<strong>${item.role === 'user' ? '你' : 'AI'}:</strong> ${item.content.substring(0, 50)}${item.content.length > 50 ? '...' : ''}`;
    container.appendChild(messageElement);
  });
  // 滚动到底部
  container.scrollTop = container.scrollHeight;
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
