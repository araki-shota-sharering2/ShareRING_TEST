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

        // 各投稿にカスタムマーカーを追加
        posts.forEach((post) => {
            try {
                const location = parseLocation(post.location); // POINT形式をパース

                // 標準マーカーを作成
                const marker = new google.maps.Marker({
                    position: location,
                    map: map,
                    title: post.caption || "投稿",
                    icon: {
                        url: post.image_url, // 投稿画像をアイコンとして利用
                        scaledSize: new google.maps.Size(50, 50), // サイズを調整
                    },
                });

                // 情報ウィンドウを作成
                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div class="info-window">
                            <h3>${post.caption || "投稿"}</h3>
                            <p>日時: ${new Date(post.created_at).toLocaleString()}</p>
                        </div>
                    `,
                });

                // マーカークリック用にイベントを設定
                marker.addListener("click", () => {
                    // 現在表示中の情報ウィンドウを閉じる（必要に応じて追加）
                    if (window.currentInfoWindow) {
                        window.currentInfoWindow.close();
                    }
                    // 新しい情報ウィンドウを開く
                    infoWindow.open({
                        anchor: marker,
                        map,
                        shouldFocus: false,
                    });
                    // 現在の情報ウィンドウを記録
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
