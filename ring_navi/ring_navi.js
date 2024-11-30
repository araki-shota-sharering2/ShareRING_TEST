let userLatitude, userLongitude, map, directionsService, directionsRenderer;

// Google Maps API を動的にロード
function loadGoogleMapsAPI(callback) {
    if (window.google && window.google.maps) {
        callback();
        return;
    }
    const script = document.createElement('script');
    script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyCIbW8SaZBjgKXB3yt7ig0OYnzD0TIi2h8&libraries=places";
    script.async = true;
    script.defer = true;
    script.onload = callback;
    document.head.appendChild(script);
}

// Google Maps の初期化
function initializeGoogleMaps() {
    console.log("Google Maps API が正常にロードされました");
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();

    // 現在地を取得して初期表示
    getCurrentLocation()
        .then(position => {
            const { latitude, longitude } = position;

            map = new google.maps.Map(document.getElementById('map-container'), {
                center: { lat: latitude, lng: longitude },
                zoom: 14,
            });

            directionsRenderer.setMap(map);
        })
        .catch(error => {
            console.error("現在地の取得に失敗しました:", error);
            map = new google.maps.Map(document.getElementById('map-container'), {
                center: { lat: 35.6895, lng: 139.6917 }, // 東京をデフォルトに設定
                zoom: 14,
            });
            directionsRenderer.setMap(map);
        });

    document.getElementById('search-button').addEventListener('click', startSearch);
}

// 現在地の取得
async function getCurrentLocation() {
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
                    alert("現在地を取得できませんでした。");
                    reject(error);
                }
            );
        } else {
            alert("このブラウザは位置情報の取得に対応していません。");
            reject(new Error("Geolocation not supported"));
        }
    });
}

// 距離を計算
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 地球の半径 (km)
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// スポット情報の取得
async function fetchNearbySpots(genre, radius) {
    try {
        const response = await fetch(`/nearbysearch?location=${userLatitude},${userLongitude}&radius=${radius}&type=${genre}`);
        const data = await response.json();

        if (data.results) {
            const sortedSpots = data.results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            displaySpots(sortedSpots);
        } else {
            alert("スポット情報が見つかりませんでした。");
        }
    } catch (error) {
        console.error("スポット情報の取得に失敗しました:", error);
        alert("スポット情報の取得中にエラーが発生しました。");
    }
}

// 検索開始
async function startSearch() {
    const genre = document.getElementById('genre').value;
    const radius = document.getElementById('radius').value;

    if (!genre) {
        alert("ジャンルを選択してください！");
        return;
    }

    try {
        await fetchNearbySpots(genre, radius);
    } catch (error) {
        console.error("検索中にエラーが発生しました:", error);
    }
}

// モーダル制御
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.getElementById('close-modal');

// モーダルを開く関数
function showModal(spot) {
    modalBody.innerHTML = `
        <h3>${spot.name}</h3>
        <p>住所: ${spot.vicinity || "情報なし"}</p>
        <p>評価: ${spot.rating || "評価なし"} / 5 (${spot.user_ratings_total || 0}件)</p>
        <p>営業時間: ${spot.opening_hours ? (spot.opening_hours.open_now ? "営業中" : "営業時間外") : "情報なし"}</p>
        <img src="${spot.photos && spot.photos[0] ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${spot.photos[0].photo_reference}&key=AIzaSyCIbW8SaZBjgKXB3yt7ig0OYnzD0TIi2h8` : '画像なし'}" alt="${spot.name}" style="max-width: 100%; border-radius: 10px; margin-top: 10px;">
    `;
    modal.style.display = 'flex';
}

// モーダルを閉じる
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// スポット情報の表示
function displaySpots(spots) {
    const spotList = document.getElementById('spot-list');
    spotList.innerHTML = '';

    spots.forEach(spot => {
        const distance = calculateDistance(
            userLatitude,
            userLongitude,
            spot.geometry.location.lat,
            spot.geometry.location.lng
        ).toFixed(2);

        const listItem = document.createElement('div');
        listItem.className = 'spot-item';
        listItem.innerHTML = `
            <h3>${spot.name}</h3>
            <p>住所: ${spot.vicinity || "情報なし"}</p>
            <p>距離: ${distance} km</p>
            <img src="${spot.photos && spot.photos[0] ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${spot.photos[0].photo_reference}&key=AIzaSyCIbW8SaZBjgKXB3yt7ig0OYnzD0TIi2h8` : '画像なし'}" alt="${spot.name}" class="spot-photo" />
        `;
        spotList.appendChild(listItem);

        const photo = listItem.querySelector('.spot-photo');
        photo.addEventListener('click', () => showModal(spot));
    });
}

// Googleマップでルートを表示
function openGoogleMapsRoute(destLatitude, destLongitude) {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLatitude},${userLongitude}&destination=${destLatitude},${destLongitude}&travelmode=walking`;
    window.location.href = url; // 現在のタブで遷移
}

// 星をランダムに配置
const body = document.querySelector('body');
for (let i = 0; i < 100; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    star.style.top = Math.random() * 100 + 'vh';
    star.style.left = Math.random() * 100 + 'vw';
    star.style.animationDuration = (Math.random() * 2 + 1) + 's';
    body.appendChild(star);
}

// Google Maps API をロードし、コールバック関数を実行
loadGoogleMapsAPI(initializeGoogleMaps);
