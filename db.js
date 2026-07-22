/*
====================================================

 WaterCheck

 IndexedDB管理

 Version 1.0.0

 Commit011

 ファイル：
 db.js

 役割：

 ・写真保存領域作成
 ・写真追加
 ・写真取得
 ・写真削除

====================================================
*/

"use strict";

/*
====================================================
 データベース設定
====================================================
*/

const DB_NAME =
    "WaterCheckDB";

const DB_VERSION =
    1;

const PHOTO_STORE =
    "photos";

/*
====================================================
 IndexedDB初期化

 初回起動時に自動作成

====================================================
*/

function openDatabase() {

    return new Promise(

        (resolve, reject) => {

            const request =
                indexedDB.open(

                    DB_NAME,

                    DB_VERSION

                );

            /*
            初回作成時
            */

            request.onupgradeneeded =
                event => {

                    const db =
                        event.target.result;

                    if (
                        !db.objectStoreNames.contains(
                            PHOTO_STORE
                        )
                    ) {

                        const store =
                            db.createObjectStore(

                                PHOTO_STORE,

                                {
                                    keyPath:
                                        "id",

                                    autoIncrement:
                                        true

                                }

                            );

                        store.createIndex(

                            "itemId",

                            "itemId",

                            {
                                unique:false
                            }

                        );

                    }

                };

            request.onsuccess =
                event => {

                    resolve(

                        event.target.result

                    );

                };

            request.onerror =
                event => {

                    reject(

                        event.target.error

                    );

                };

        }

    );

}

/*
====================================================
 写真保存

 itemId:
 水抜き項目ID

 image:
 Blob画像

 timestamp:
 撮影日時

====================================================
*/

async function savePhoto(

    itemId,

    image,

    timestamp

) {

    const db =
        await openDatabase();

    return new Promise(

        (resolve, reject) => {

            const transaction =
                db.transaction(

                    PHOTO_STORE,

                    "readwrite"

                );

            const store =
                transaction.objectStore(

                    PHOTO_STORE

                );

            const request =
                store.add(

                    {

                        itemId:itemId,

                        imageData:image,

                        timestamp:timestamp

                    }

                );

            request.onsuccess =
                event => {

                    resolve(

                        event.target.result

                    );

                };

            request.onerror =
                event => {

                    reject(

                        event.target.error

                    );

                };

        }

    );

}

/*
====================================================
 写真取得

 指定項目の写真一覧取得

====================================================
*/

async function getPhotosByItemId(

    itemId

) {

    const db =
        await openDatabase();

    return new Promise(

        (resolve,reject)=>{

            const transaction =
                db.transaction(

                    PHOTO_STORE,

                    "readonly"

                );

            const store =
                transaction.objectStore(

                    PHOTO_STORE

                );

            const index =
                store.index(

                    "itemId"

                );

            const request =
                index.getAll(

                    itemId

                );

            request.onsuccess =
                event => {

                    resolve(

                        event.target.result

                    );

                };

            request.onerror =
                event => {

                    reject(

                        event.target.error

                    );

                };

        }

    );

}

/*
====================================================
 写真削除

====================================================
*/

async function deletePhoto(

    id

) {

    const db =
        await openDatabase();

    return new Promise(

        (resolve,reject)=>{

            const transaction =
                db.transaction(

                    PHOTO_STORE,

                    "readwrite"

                );

            const store =
                transaction.objectStore(

                    PHOTO_STORE

                );

            const request =
                store.delete(

                    id

                );

            request.onsuccess =
                () => {

                    resolve();

                };

            request.onerror =
                event => {

                    reject(

                        event.target.error

                    );

                };

        }

    );

}
