document.addEventListener("DOMContentLoaded", function() {
    // 現在のURLに基づいてフッターリンクを強調表示
    const path = window.location.pathname.replace(/\/$/, ""); // 末尾のスラッシュを削除
    const footerLinks = document.querySelectorAll("footer a");

    footerLinks.forEach(link => {
        const href = link.getAttribute("href").replace(/\/$/, ""); // hrefの末尾スラッシュを削除
        if (href === path) {
            link.classList.add("active");
        }
    });

    // 背景の星をランダムに配置
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

let userLatitude, userLongitude;

// 現在地の取得
function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    userLatitude = position.coords.latitude;
                    userLongitude = position.coords.longitude;
                    resolve({ latitude: userLatitude, longitude: userLongitude });
                },
                error => {
                    console.error("現在地の取得に失敗しました:", error.message);
                    reject(error);
                }
            );
        } else {
            alert("このブラウザは位置情報の取得に対応していません。");
            reject(new Error("Geolocation not supported"));
        }
    });
}

// Google Maps API を使用してスポット情報を取得
async function fetchNearbySpots(genre) {
    const GOOGLE_MAPS_API_KEY = "AIzaSyCIbW8SaZBjgKXB3yt7ig0OYnzD0TIi2h8"; // あなたのAPIキーをここに記載

    try {
        const response = await fetch(`/nearbysearch?location=${userLatitude},${userLongitude}&radius=5000&type=${genre}`);
        const data = await response.json();

        if (data.results) {
            displaySpots(data.results);
        } else {
            console.error("スポット情報が見つかりませんでした:", data);
        }
    } catch (error) {
        console.error("スポット情報の取得に失敗しました:", error);
    }
}

// 検索ボタンが押されたときに呼び出す
async function startSearch() {
    const genreMap = {
        "restaurant": "restaurant",
        "park": "park",
        "museum": "museum"
    };

    const genre = document.getElementById('genre').value;

    if (!genre || !genreMap[genre]) {
        alert("ジャンルを選択してください！");
        return;
    }

    try {
        await getCurrentLocation();
        await fetchNearbySpots(genreMap[genre]);
    } catch (error) {
        console.error("検索中にエラーが発生しました:", error);
    }
}

// スポット情報を表示
function displaySpots(spots) {
    const spotList = document.getElementById('spot-list');
    spotList.innerHTML = ''; // 初期化

    spots.forEach(spot => {
        const listItem = document.createElement('div');
        listItem.className = 'spot-item';
        listItem.innerHTML = `
            <h3>${spot.name}</h3>
            <p>住所: ${spot.vicinity || "情報なし"}</p>
            <img src="${spot.photos && spot.photos[0] ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${spot.photos[0].photo_reference}&key=AIzaSyCIbW8SaZBjgKXB3yt7ig0OYnzD0TIi2h8` : '画像なし'}" alt="${spot.name}" />
            <p>営業情報: ${spot.opening_hours && spot.opening_hours.open_now ? "営業中" : "営業時間外"}</p>
            <button onclick="showRoute(${spot.geometry.location.lat}, ${spot.geometry.location.lng})">ルートを見る</button>
        `;
        spotList.appendChild(listItem);
    });
}

// Googleマップでルートを表示
function showRoute(destLatitude, destLongitude) {
    const currentUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLatitude},${userLongitude}&destination=${destLatitude},${destLongitude}`;
    window.open(currentUrl, '_blank'); // 新しいタブでルートを表示
}
