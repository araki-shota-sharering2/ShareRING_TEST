// Google Map 初期化関数をグローバルスコープで定義
window.initMap = async function () {
    console.log("MYMAP画面が読み込まれました");

    const mapOptions = {
        center: { lat: 35.6895, lng: 139.6917 }, // 東京
        zoom: 12, // 地図の初期ズームレベル
        mapId: "175ab0da53e477c", // マップID
    };

    // 地図を初期化
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

        // 各投稿にカスタム円形マーカーを追加
        posts.forEach((post) => {
            try {
                const location = parseLocation(post.location); // POINT形式をパース

                // カスタムHTML要素を作成
                const markerDiv = document.createElement("div");
                markerDiv.classList.add("custom-marker");
                markerDiv.style.backgroundImage = `url(${post.image_url})`;

                // オーバーレイを作成
                const overlay = new google.maps.OverlayView();
                overlay.onAdd = function () {
                    const layer = this.getPanes().overlayMouseTarget;
                    layer.appendChild(markerDiv);
                };

                overlay.onRemove = function () {
                    markerDiv.parentNode.removeChild(markerDiv);
                };

                overlay.draw = function () {
                    const point = this.getProjection().fromLatLngToDivPixel(new google.maps.LatLng(location));
                    markerDiv.style.left = `${point.x - 25}px`; // 中心を調整
                    markerDiv.style.top = `${point.y - 25}px`; // 中心を調整
                };

                overlay.setMap(map);

                // 情報ウィンドウを作成
                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div class="info-window">
                            <h3>${post.caption || "投稿"}</h3>
                            <p>日時: ${new Date(post.created_at).toLocaleString()}</p>
                        </div>
                    `,
                });

                // カスタムマーカーのクリックイベント
                markerDiv.addEventListener("click", () => {
                    // 現在表示中の情報ウィンドウを閉じる
                    if (window.currentInfoWindow) {
                        window.currentInfoWindow.close();
                    }
                    // 新しい情報ウィンドウを開く
                    infoWindow.setPosition(location);
                    infoWindow.open(map);
                    window.currentInfoWindow = infoWindow;
                });
            } catch (error) {
                console.error("位置データのパースに失敗しました:", post.location, error);
            }
        });
    } catch (error) {
        console.error("投稿データの取得に失敗:", error);
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
};
