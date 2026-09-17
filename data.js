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
        name: "停止時の水量"
    },
    {
        id: "water_002",
        order: 2,
        name: "水道元栓"
    },
    {
        id: "water_003",
        order: 3,
        name: "駐車場元栓"
    },
    {
        id: "water_004",
        order: 4,
        name: "機械室横元栓＆蛇口"
    },
    {
        id: "water_005",
        order: 5,
        name: "トイレ前元栓"
    },
    {
        id: "water_006",
        order: 6,
        name: "洗面所前元栓"
    },
    {
        id: "water_007",
        order: 7,
        name: "和室前止水栓"
    },
    {
        id: "water_008",
        order: 8,
        name: "台所前止水栓"
    },
    {
        id: "water_009",
        order: 9,
        name: "給湯器止水栓（水、湯）"
    },
    {
        id: "water_010",
        order: 10,
        name: "庭蛇口"
    },
    {
        id: "water_011",
        order: 11,
        name: "台所蛇口"
    },
    {
        id: "water_012",
        order: 12,
        name: "台所蛇口水抜栓（水）"
    },
    {
        id: "water_013",
        order: 13,
        name: "台所蛇口水抜栓（湯）"
    },
    {
        id: "water_014",
        order: 14,
        name: "洗面台蛇口（水、湯）"
    },
    {
        id: "water_015",
        order: 15,
        name: "洗面台下水抜栓（水）"
    },
    {
        id: "water_016",
        order: 16,
        name: "洗面台下水抜栓（湯）"
    },
    {
        id: "water_017",
        order: 17,
        name: "トイレ手洗い蛇口"
    },
    {
        id: "water_018",
        order: 18,
        name: "トイレタンク水抜"
    },
    {
        id: "water_019",
        order: 19,
        name: "ウォシュレット水抜"
    },
    {
        id: "water_020",
        order: 20,
        name: "トイレ水たまりクーラント入れ"
    },
    {
        id: "water_021",
        order: 21,
        name: "ウォシュレットコンセント抜"
    },
    {
        id: "water_022",
        order: 22,
        name: "シャワーヘッド床置き"
    },
    {
        id: "water_023",
        order: 23,
        name: "シャワー/蛇口切替を蛇口側に"
    },
    {
        id: "water_024",
        order: 24,
        name: "シャワー蛇口（水、湯）"
    },
    {
        id: "water_025",
        order: 25,
        name: "シャワー蛇口水抜栓（水、湯）"
    },
    {
        id: "water_026",
        order: 26,
        name: "浴槽蛇口（水、湯）"
    },
    {
        id: "water_027",
        order: 27,
        name: "輸送バルブを閉じる"
    },
    {
        id: "water_028",
        order: 28,
        name: "（給湯器）給油元栓を閉じる"
    },
    {
        id: "water_029",
        order: 29,
        name: "（給湯器）加圧逃し弁を開ける"
    },
    {
        id: "water_030",
        order: 30,
        name: "（給湯器）給油口水抜栓を開く"
    },
    {
        id: "water_031",
        order: 31,
        name: "（給湯器）配管排水（リモコンで実施）"
    },
    {
        id: "water_032",
        order: 32,
        name: "（給湯器）給湯排水栓を開く"
    },
    {
        id: "water_033",
        order: 33,
        name: "（給湯器）ふろ排水栓を開く"
    },
    {
        id: "water_034",
        order: 34,
        name: "（給湯器）ポンプ排水栓を開く"
    },
    {
        id: "water_035",
        order: 35,
        name: "（給湯器）電源プラグ抜き"
    }
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
