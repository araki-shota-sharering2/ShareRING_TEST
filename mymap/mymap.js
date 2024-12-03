document.addEventListener("DOMContentLoaded", function() {
    console.log("MYMAP画面が読み込まれました");

    // Google Map 初期化関数
    window.initMap = async function() {
        const mapOptions = {
            center: { lat: 35.6895, lng: 139.6917 }, // 初期位置（東京）
            zoom: 12
        };
        const map = new google.maps.Map(document.getElementById("map"), mapOptions);

        // サーバーから投稿データを取得
        try {
            const response = await fetch("/mymap-handler", {
                method: "GET",
                credentials: "include" // セッション情報を送信
            });

            if (!response.ok) {
                throw new Error("投稿データの取得に失敗しました");
            }

            const posts = await response.json();

            // 各投稿にピンを表示
            posts.forEach(post => {
                new google.maps.Marker({
                    position: {
                        lat: parseFloat(post.location.split(",")[0]),
                        lng: parseFloat(post.location.split(",")[1])
                    },
                    map: map,
                    title: post.caption || "投稿",
                    icon: {
                        url: post.image_url, // 投稿画像をアイコンに設定
                        scaledSize: new google.maps.Size(40, 40)
                    }
                });
            });
        } catch (error) {
            console.error("エラー:", error);
        }
    };
});
