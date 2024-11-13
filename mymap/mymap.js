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

// Google Map の初期化関数
function initMap() {
    const mapOptions = {
        center: { lat: 35.6895, lng: 139.6917 }, // 東京の座標
        zoom: 12
    };
    const map = new google.maps.Map(document.getElementById("map"), mapOptions);
}
