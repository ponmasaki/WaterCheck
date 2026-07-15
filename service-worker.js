/*
====================================================

WaterCheck

Service Worker

Version 1.0.0

Commit010

キャッシュ制御

====================================================
*/


// キャッシュ名
const CACHE_NAME = "watercheck-cache-v1";


// オフライン時に必要なファイル一覧
const CACHE_FILES = [

    "./",

    "./index.html",

    "./style.css",

    "./app.js",

    "./data.js",

    "./manifest.json",

    "./icons/icon-192.png",

    "./icons/icon-512.png"

];



/*
====================================================
 Install

 Service Worker初回登録時

 必要ファイルをキャッシュする

====================================================
*/


self.addEventListener(
    "install",
    event => {


        event.waitUntil(

            caches.open(
                CACHE_NAME
            )

            .then(
                cache => {


                    return cache.addAll(
                        CACHE_FILES
                    );


                }

            )

        );


    }

);





/*
====================================================
 Activate

 古いキャッシュ削除

====================================================
*/


self.addEventListener(
    "activate",
    event => {


        event.waitUntil(


            caches.keys()

            .then(
                cacheNames => {


                    return Promise.all(

                        cacheNames.map(

                            cacheName => {


                                if(

                                    cacheName !== CACHE_NAME

                                ){

                                    return caches.delete(
                                        cacheName
                                    );

                                }


                            }

                        )

                    );


                }

            )


        );


    }

);





/*
====================================================
 Fetch

 キャッシュ優先

 オフライン対応

====================================================
*/


self.addEventListener(
    "fetch",
    event => {


        event.respondWith(


            caches.match(

                event.request

            )

            .then(

                response => {


                    return response || fetch(

                        event.request

                    );


                }

            )


        );


    }

);