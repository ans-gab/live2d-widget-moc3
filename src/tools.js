import fa_comment from "@fortawesome/fontawesome-free/svgs/solid/comment.svg";
import fa_paper_plane from "@fortawesome/fontawesome-free/svgs/solid/paper-plane.svg";
import fa_street_view from "@fortawesome/fontawesome-free/svgs/solid/street-view.svg";
import fa_camera_retro from "@fortawesome/fontawesome-free/svgs/solid/camera-retro.svg";
import fa_info_circle from "@fortawesome/fontawesome-free/svgs/solid/circle-info.svg";
import fa_xmark from "@fortawesome/fontawesome-free/svgs/solid/xmark.svg";
import fa_circle_arrow_down from "@fortawesome/fontawesome-free/svgs/solid/circle-arrow-down.svg";
import fa_circle_arrow_up from "@fortawesome/fontawesome-free/svgs/solid/circle-arrow-up.svg";


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

const tools = {
    "hitokoto": {
        icon: fa_comment,
        callback: showHitokoto
    },
    "asteroids": {
        icon: fa_paper_plane,
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
