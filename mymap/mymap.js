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

                // カスタムアイコンを作成（円形フレーム）
                const iconCanvas = document.createElement("canvas");
                const context = iconCanvas.getContext("2d");
                iconCanvas.width = 60;
                iconCanvas.height = 60;

                // 円フレームを描画
                context.beginPath();
                context.arc(30, 30, 29, 0, 2 * Math.PI); // 外側の円
                context.fillStyle = post.ring_color || "#ff0000"; // フレーム色
                context.fill();

                // 中央に投稿画像を描画
                const img = new Image();
                img.crossOrigin = "anonymous"; // クロスオリジン設定
                img.src = post.image_url;
                img.onload = () => {
                    context.save();
                    context.beginPath();
                    context.arc(30, 30, 25, 0, 2 * Math.PI); // 内側の円
                    context.clip();
                    context.drawImage(img, 5, 5, 50, 50); // 中央に表示
                    context.restore();

                    // マーカーを追加
                    new google.maps.Marker({
                        position: location,
                        map: map,
                        title: post.caption || "投稿",
                        icon: {
                            url: iconCanvas.toDataURL(),
                            scaledSize: new google.maps.Size(40, 40),
                        },
                    }).addListener("click", function () {
                        // 情報ウィンドウを表示
                        const infoWindow = new google.maps.InfoWindow({
                            content: `
                                <div>
                                    <h3>${post.caption || "投稿"}</h3>
                                    <p>日時: ${new Date(post.created_at).toLocaleString()}</p>
                                    <p>${post.address || "住所情報なし"}</p>
                                </div>
                            `,
                        });
                        infoWindow.open(map, this);
                    });
                };

                img.onerror = () => {
                    console.error("画像の読み込みに失敗しました:", post.image_url);
                };
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
