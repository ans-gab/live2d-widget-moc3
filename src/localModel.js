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

    const target = randomSelection(this.modelList.models[modelId]);
    console.log(target, 'target');
    const live3dArray = [
      'aidang_2',          'aierdeliqi_4', 'aierdeliqi_5',
      'aimierbeierding_2', 'banrenma_2',   'beierfasite_2',
      'biaoqiang',         'biaoqiang_3',  'bisimai_2',
      'bisimai_2',         'chuixue_3',    'dafeng_2',
      'deyizhi_3',         'dujiaoshou_4', 'dunkeerke_2',
      'genaisennao_2',     'heitaizi_2',   'huangjiafangzhou_3',
      'huonululu_3',       'huonululu_5',  'kelifulan_3',
      'lafei',             'lafei_4',      'lingbo',
      'mao_pro',           'mingshi',      'ninghai_4',
      'pinghai_4',         'qibolin_2',    'shengluyisi_2',
      'shengluyisi_3',     'sipeibojue_5', 'taiyuan_2',
      'tianlangxing_3',    'tierbici_2',   'xianghe_2',
      'xixuegui_4',        'xuefeng',      'yichui_2',
      'z23',               'z46_2',        'zhala_2',"mark_free_t04"
    ];
    const live2dArray = [
      'Battleship-Girl/209-2',
      'Battleship-Girl/248_1',
      'Battleship-Girl/325_1',
      'bilibili-live/22',
      'bilibili-live/33',
      'Gemstone-Story/aite',
      'Gemstone-Story/lili',
      'Gemstone-Story/magelite',
      'Gemstone-Story/safeiya',
      'Gemstone-Story/west',
      'Gemstone-Story2/elizabeth_1',
      'Gemstone-Story2/elizabeth_2',
      'Gemstone-Story2/elizabeth_3',
      'Gemstone-Story2/elizabeth_4',
      'Gemstone-Story2/elizabeth_5',
      'Gemstone-Story2/elizabeth_6',
      'Gemstone-Story2/elizabeth_7',
      'Gemstone-Story2/elizabeth_8',
      'Gemstone-Story2/elizabeth_9',
      'Gemstone-Story2/elizabeth_9_1',
      'Haru/01',
      'Haru/02',
      'hijiki',
      'HonkaiAcademy/bronya',
      'HonkaiAcademy/BYC',
      'HonkaiAcademy/delisha',
      'HonkaiAcademy/himeko',
      'HonkaiAcademy/houraiji',
      'HonkaiAcademy/kaguya',
      'HonkaiAcademy/keluoyi',
      'HonkaiAcademy/Kiana',
      'HonkaiAcademy/kika',
      'HonkaiAcademy/Kiro',
      'HonkaiAcademy/Lita',
      'HonkaiAcademy/mie',
      'HonkaiAcademy/Nina',
      'HonkaiAcademy/Nindi',
      'HonkaiAcademy/shin',
      'HonkaiAcademy/xier',
      'HonkaiAcademy/xilin2.1',
      'HonkaiAcademy/yazakura',
      'HonkaiAcademy/yiselin',
      'HyperdimensionNeptunia/blanc_classic',
      'HyperdimensionNeptunia/blanc_normal',
      'HyperdimensionNeptunia/blanc_swimwear',
      'HyperdimensionNeptunia/histoire',
      'HyperdimensionNeptunia/histoirenohover',
      'HyperdimensionNeptunia/nepgear',
      'HyperdimensionNeptunia/nepgearswim',
      'HyperdimensionNeptunia/nepgear_extra',
      'HyperdimensionNeptunia/nepmaid',
      'HyperdimensionNeptunia/nepnep',
      'HyperdimensionNeptunia/nepswim',
      'HyperdimensionNeptunia/neptune_classic',
      'HyperdimensionNeptunia/neptune_santa',
      'HyperdimensionNeptunia/noir',
      'HyperdimensionNeptunia/noireswim',
      'HyperdimensionNeptunia/noir_classic',
      'HyperdimensionNeptunia/noir_santa',
      'HyperdimensionNeptunia/vert_classic',
      'HyperdimensionNeptunia/vert_normal',
      'HyperdimensionNeptunia/vert_swimwear',
      'KantaiCollection/murakumo',
      'Koharu',
      'Potion-Maker/Pio',
      'Potion-Maker/Tia',
      'ShizukuTalk/shizuku-48',
      'ShizukuTalk/shizuku-pajama',
      'tororo'
    ];

    let loadPath;
    if (live3dArray.includes(target)) {
      loadPath = `${this.modelsPath}${target}/${target}.model3.json`;
    } else if (live2dArray.includes(target)) {
      loadPath = `${this.modelsPath}${target}/index.json`;
    } else {
      console.error(`Target ${target} not found in either live2dArray or live3dArray`);
      return;
    }

    try {
      const response = await fetch(loadPath);
      if (response.ok) {
        await this.loadModelPixi('live2d', loadPath);
        console.log(`模型 ${modelId}-${modelTexturesId}-${target} 加载完成`);
      } else {
        console.error(`加载 ${loadPath} 失败，状态码：${response.status}`);
      }
    } catch (error) {
      console.error(`加载 ${loadPath} 时发生错误：`, error);
    }
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
        modelId = 1; // 如果到达末尾则回到开始
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
