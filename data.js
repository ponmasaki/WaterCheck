/*
====================================================
 WaterCheck

 Ver.1.0.0

 Commit003

 ファイル：
 data.js

 目的：
 ・水抜きチェック項目管理
 ・内部ID管理
 ・表示順管理
 ・初期設定管理

 設計方針：

 id
 ------------
 内部管理用固定値

 order
 ------------
 表示順

 name
 ------------
 表示名称


 将来的に

 ・並び替え
 ・名称変更
 ・項目追加
 ・項目削除

 を可能にする。

====================================================
*/

const CHECK_ITEMS = [
  {
    id: "water_001",
    order: 1,
    name: "キッチン蛇口",
  },

  {
    id: "water_002",
    order: 2,
    name: "キッチン水栓水抜き栓",
  },

  {
    id: "water_003",
    order: 3,
    name: "洗面台",
  },

  {
    id: "water_004",
    order: 4,
    name: "洗面台水抜き栓",
  },

  {
    id: "water_005",
    order: 5,
    name: "トイレ（タンク）",
  },

  {
    id: "water_006",
    order: 6,
    name: "トイレ（ウォシュレット）",
  },

  {
    id: "water_007",
    order: 7,
    name: "トイレ（手洗い）",
  },

  {
    id: "water_008",
    order: 8,
    name: "浴室（浴槽蛇口）",
  },

  {
    id: "water_009",
    order: 9,
    name: "シャワー蛇口",
  },

  {
    id: "water_010",
    order: 10,
    name: "シャワー水抜き栓",
  },

  {
    id: "water_011",
    order: 11,
    name: "給湯器水抜き栓１",
  },

  {
    id: "water_012",
    order: 12,
    name: "給湯器水抜き栓２",
  },

  {
    id: "water_013",
    order: 13,
    name: "給湯器水抜き栓３",
  },

  {
    id: "water_014",
    order: 14,
    name: "駐車場",
  },

  {
    id: "water_015",
    order: 15,
    name: "トイレ屋外水抜き栓",
  },

  {
    id: "water_016",
    order: 16,
    name: "給湯器水抜き栓",
  },

  {
    id: "water_017",
    order: 17,
    name: "室内水道水抜き栓",
  },

  {
    id: "water_018",
    order: 18,
    name: "庭蛇口",
  },

  {
    id: "water_019",
    order: 19,
    name: "給湯器（水）水道管水抜き栓",
  },

  {
    id: "water_020",
    order: 20,
    name: "給湯器（湯）水道管水抜き栓",
  },

  {
    id: "water_021",
    order: 21,
    name: "和室水道管水抜き栓",
  },

  {
    id: "water_022",
    order: 22,
    name: "キッチン水道管水抜き栓",
  },
];

/*
====================================================
 初期データ生成用設定

====================================================
*/

const DEFAULT_ITEM_DATA = {
  status: "none",

  photos: [],

  memo: "",

  checkedTime: "",

  photoTime: "",
};

/*
====================================================
 アプリ設定

 将来拡張用

====================================================
*/

const APP_CONFIG = {
  appName: "WaterCheck",

  version: "1.0.0",

  maxPhotosPerItem: 3,

  enableThreeStatus: true,

  enableHistory: false,

  enableBackup: false,

  storageType: "LocalStorage",
};
