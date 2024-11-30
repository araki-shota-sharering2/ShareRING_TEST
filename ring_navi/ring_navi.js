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

// ルート表示
function showRoute(destLatitude, destLongitude) {
    const routeUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLatitude},${userLongitude}&destination=${destLatitude},${destLongitude}`;
    window.open(routeUrl, '_blank');
}

// イベントリスナー
document.getElementById('search-button').addEventListener('click', startSearch);
