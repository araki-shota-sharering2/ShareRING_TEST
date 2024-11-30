let userLatitude, userLongitude;

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
async function fetchNearbySpots(genre) {
    try {
        const response = await fetch(`/nearbysearch?location=${userLatitude},${userLongitude}&radius=5000&type=${genre}`);
        const data = await response.json();

        if (data.results) {
            displaySpots(data.results);
        } else {
            console.error("スポット情報が見つかりませんでした:", data);
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

    if (!genre) {
        alert("ジャンルを選択してください！");
        return;
    }

    try {
        await getCurrentLocation();
        await fetchNearbySpots(genre);
    } catch (error) {
        console.error("検索中にエラーが発生しました:", error);
    }
}

// スポット情報の表示
function displaySpots(spots) {
    const spotList = document.getElementById('spot-list');
    spotList.innerHTML = ''; // リストを初期化

    spots.forEach(spot => {
        const distance = calculateDistance(
            userLatitude,
            userLongitude,
            spot.geometry.location.lat,
            spot.geometry.location.lng
        ).toFixed(2); // 距離を計算

        const listItem = document.createElement('div');
        listItem.className = 'spot-item';
        listItem.innerHTML = `
            <h3>${spot.name}</h3>
            <p>住所: ${spot.vicinity || "情報なし"}</p>
            <p>距離: ${distance} km</p>
            <img src="${spot.photos && spot.photos[0] ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${spot.photos[0].photo_reference}&key=AIzaSyCIbW8SaZBjgKXB3yt7ig0OYnzD0TIi2h8` : '画像なし'}" alt="${spot.name}" />
            <button onclick="showRoutePopup(${spot.geometry.location.lat}, ${spot.geometry.location.lng})">ルートを見る</button>
        `;
        spotList.appendChild(listItem);
    });
}

// ポップアップでルートを表示
function showRoutePopup(destLatitude, destLongitude) {
    const popup = document.getElementById('popup');
    const iframe = document.getElementById('popup-map');
    iframe.src = `https://www.google.com/maps/embed/v1/directions?key=AIzaSyCIbW8SaZBjgKXB3yt7ig0OYnzD0TIi2h8&origin=${userLatitude},${userLongitude}&destination=${destLatitude},${destLongitude}&mode=walking`;
    popup.classList.remove('hidden');
}

// ポップアップを閉じる
document.getElementById('popup-close').addEventListener('click', () => {
    const popup = document.getElementById('popup');
    popup.classList.add('hidden');
});

// イベントリスナー
document.getElementById('search-button').addEventListener('click', startSearch);
