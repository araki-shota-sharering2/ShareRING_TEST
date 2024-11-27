document.addEventListener("DOMContentLoaded", function() {
    console.log("MYMAP画面が読み込まれました");

    // フッターリンクの強調表示
    const path = window.location.pathname;
    const footerLinks = document.querySelectorAll("footer a");
    footerLinks.forEach(link => {
        if (link.getAttribute("href") === path) {
            link.classList.add("active");
        }
    });

    // 星のランダム配置
    const body = document.querySelector('body');
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        star.style.top = Math.random() * 100 + 'vh';
        star.style.left = Math.random() * 100 + 'vw';
        star.style.animationDuration = (Math.random() * 2 + 1) + 's';
        body.appendChild(star);
    }
});

// Google Map 初期化関数
function initMap() {
    const mapOptions = {
        center: { lat: 35.6895, lng: 139.6917 }, // 東京の初期座標
        zoom: 12
    };
    const map = new google.maps.Map(document.getElementById("map"), mapOptions);

    // 現在位置のマーカーを設定（カスタムアイコンを使用）
    let marker = new google.maps.Marker({
        map: map,
        title: "現在位置",
        icon: {
            url: "/assets/images/icons/current_location.svg", // 現在位置のアイコン画像パス
            scaledSize: new google.maps.Size(40, 40) // アイコンのサイズ
        }
    });

    // 位置情報が取得できた場合の処理
    function updatePosition(position) {
        const currentPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        marker.setPosition(currentPos);
        map.setCenter(currentPos); // 地図の中心も更新
    }

    // 位置情報取得のエラーハンドリング
    function handleError(error) {
        console.error("位置情報の取得に失敗しました:", error);
    }

    // 継続的に位置情報を取得
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(updatePosition, handleError, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        });
    } else {
        alert("このブラウザでは位置情報の取得がサポートされていません");
    }
}
