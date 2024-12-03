// Google Map 初期化関数をグローバルスコープで定義
window.initMap = async function () {
    console.log("MYMAP画面が読み込まれました");

    const mapOptions = {
        zoom: 12, // 地図の初期ズームレベル
    };

    // 地図を初期化（現在位置は後で設定）
    const map = new google.maps.Map(document.getElementById("map"), mapOptions);

    // 現在位置を取得
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                map.setCenter(userLocation);

                // 現在位置を示すマーカーを追加
                new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    title: "現在位置",
                });
            },
            (error) => {
                console.error("現在位置の取得に失敗しました:", error);
            }
        );
    } else {
        console.error("ブラウザが位置情報取得をサポートしていません");
    }

    // POINT形式を緯度と経度に変換する関数
    function parseLocation(pointString) {
        const match = pointString.match(/POINT\(([\d.-]+) ([\d.-]+)\)/);
        if (match) {
            return {
                lng: parseFloat(match[1]), // 経度
                lat: parseFloat(match[2]), // 緯度
            };
        }
        throw new Error("無効なPOINT形式のデータです: " + pointString);
    }

    // サーバーから投稿データを取得
    try {
        const response = await fetch("/mymap-handler", {
            method: "GET",
            credentials: "include", // セッション情報を送信
        });

        if (!response.ok) {
            throw new Error("投稿データの取得に失敗しました");
        }

        const posts = await response.json();

        // 各投稿にピンを表示
        posts.forEach((post) => {
            try {
                const location = parseLocation(post.location); // POINT形式をパース

                // マーカーを追加（直接画像を使用）
                const marker = new google.maps.Marker({
                    position: location,
                    map: map,
                    title: post.caption || "投稿",
                    icon: {
                        url: post.image_url, // 画像URLをそのまま使用
                        scaledSize: new google.maps.Size(40, 40), // サイズ調整
                    },
                });

                // ピンをクリックしたときの情報ウィンドウ
                marker.addListener("click", function () {
                    const infoWindow = new google.maps.InfoWindow({
                        content: `
                            <div>
                                <h3>${post.caption || "投稿"}</h3>
                                <p>日時: ${new Date(post.created_at).toLocaleString()}</p>
                                <p>${post.address || "住所情報なし"}</p>
                            </div>
                        `,
                    });
                    infoWindow.open(map, marker);
                });
            } catch (error) {
                console.error("位置データのパースに失敗しました:", post.location, error);
            }
        });
    } catch (error) {
        console.error("エラー:", error);
    }
};

// DOMContentLoadedイベントリスナーで初期化
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOMが読み込まれました");
});
