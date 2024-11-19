import showMessage from "./message.js";
import randomSelection from "./utils.js";
import * as PIXI from "pixi.js";
import {Live2DModel} from "pixi-live2d-display";

// expose PIXI to window so that this plugin is able to
// reference window.PIXI.Ticker to automatically update Live2D models

/**
 * 本地加载模型
 * https://github.com/liyupi
 */

window.PIXI = PIXI;

class LocalModel {
  constructor(config) {
    // modelListPath: 模型列表 json 文件路径(可不填，就是约定 modelsPath 下的 model_list.json)；modelsPath：模型的跟路径
    const {modelListPath, modelsPath} = config;

    if (!modelsPath) {
      throw "LocalModel requires modelListPath and modelsPath!";
    }
    const safeModelsPath = modelsPath.endsWith("/") ? modelsPath : modelsPath + "/";
    // 确保路径以 / 结尾
    this.modelsPath = safeModelsPath;
    this.modelListPath = modelListPath ?? safeModelsPath + "model_list.json";
  }

  async loadModelList() {
    // 加载 JSON 文件
    const loadJsonFile = async (path) => {
      // 浏览器环境
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    }
    try {
      this.modelList = await loadJsonFile(this.modelListPath);
      console.log(this.modelListPath, this.modelList);

      if (!this.modelList.models || !this.modelList.messages) {
        throw "Invalid model list format!";
      }
    } catch (error) {
      console.error("Failed to load model list:", error);
      throw "Failed to load model list!";
    }
  }

  async loadModelPixi(id, jsonpath) {
    const element = document.getElementById(id);
    const app = new PIXI.Application({
      view: element,
      transparent: true,
    });
    const model = await Live2DModel.from(jsonpath);

    app.stage.addChild(model);

    const parentWidth = element.width;
    const parentHeight = element.height;
    // Scale to fit the stage
    const ratio = Math.min(
      parentWidth / model.width,
      parentHeight / model.height
    );
    model.scale.set(ratio, ratio);
    // Align bottom and center horizontally

    model.x = (parentWidth - model.width) / 2;
    model.y = parentHeight - model.height;

  }

  async loadModel(modelId, modelTexturesId, message) {
    localStorage.setItem("modelId", modelId);
    localStorage.setItem("modelTexturesId", modelTexturesId);
    showMessage(message, 4000, 10);

    if (!this.modelList) {
      await this.loadModelList();
    }

    const target = randomSelection(this.modelList.models[modelId - 1]);
    const indexPath = `${this.modelsPath}${target}/index.json`;
    const modelsPath = `${this.modelsPath}${target}/${target}.model3.json`;

    try {
      await fetch(indexPath).then(response => {
        if (response.ok) {
          return this.loadModelPixi("live2d", indexPath);
        } else {
          throw new Error("Index not found");
        }
      });
    } catch (error) {
      try {
        const modelsResponse = await fetch(modelsPath);
        if (modelsResponse.ok) {
          this.loadModelPixi("live2d", modelsPath);
        } else {
          console.error("Both index.json and models.json not found.");
        }
      } catch (error) {
        console.error("Error fetching models.json:", error);
      }
    }
    console.log(`Live2D 模型 ${modelId}-${modelTexturesId}-${target} 加载完成`);
  }

  async loadRandModel() {
    const modelId = localStorage.getItem("modelId");
    let modelTexturesId = localStorage.getItem("modelTexturesId");

    if (!this.modelList) {
      await this.loadModelList();
    }

    const currentModel = this.modelList.models[modelId];

    if (Array.isArray(currentModel)) {
      // 对于数组类型的模型，随机选择一个不同的贴图
      let newTextureId;
      do {
        newTextureId = Math.floor(Math.random() * currentModel.length);
      } while (newTextureId === parseInt(modelTexturesId) && currentModel.length > 1);

      if (newTextureId === parseInt(modelTexturesId)) {
        showMessage("我还没有其他衣服呢！", 4000, 10);
        return;
      }

      this.loadModel(modelId, newTextureId, "我的新衣服好看嘛？");
    } else {
      showMessage("我还没有其他衣服呢！", 4000, 10);
    }
  }

  async loadOtherModel(direction) {
    let modelId = parseInt(localStorage.getItem("modelId"));

    if (!this.modelList) {
      await this.loadModelList();
    }

    // 根据传入的 direction 参数增加或减少 modelId
    if (direction === 'next') {
      modelId++;
      if (modelId >= this.modelList.models.length) {
        modelId = 0; // 如果到达末尾则回到开始
      }
    } else if (direction === 'prev') {
      modelId--;
      if (modelId < 0) {
        modelId = this.modelList.models.length - 1; // 如果小于 0 则回到末尾
      }
    }

    this.loadModel(modelId, 0, this.modelList.messages[modelId]);
  }
}

export default LocalModel;
