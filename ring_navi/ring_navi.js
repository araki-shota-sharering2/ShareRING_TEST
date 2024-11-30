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
            // 星の数順に並び替え
            const sortedSpots = data.results.sort((a, b) => {
                const ratingA = a.rating || 0;
                const ratingB = b.rating || 0;
                return ratingB - ratingA; // 高評価順
            });

            displaySpots(sortedSpots);
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

        const rating = spot.rating || 0;
        const totalRatings = spot.user_ratings_total || 0;
        const stars = "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating)); // ★表記

        const listItem = document.createElement('div');
        listItem.className = 'spot-item';
        listItem.innerHTML = `
            <h3>${spot.name}</h3>
            <p>住所: ${spot.vicinity || "情報なし"}</p>
            <p>距離: ${distance} km</p>
            <p>評価: ${stars} (${rating} / 5, ${totalRatings}件)</p>
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

    // ポップアップを表示
    popup.classList.remove('hidden');
}

// ポップアップを閉じるイベントリスナー
document.getElementById('popup-close').addEventListener('click', () => {
    const popup = document.getElementById('popup');
    popup.classList.add('hidden');
});

// イベントリスナー
document.getElementById('search-button').addEventListener('click', startSearch);
