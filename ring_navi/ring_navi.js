let userLatitude, userLongitude, map, directionsService, directionsRenderer;

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
        await getCurrentLocation();
        await fetchNearbySpots(genre, radius);
    } catch (error) {
        console.error("検索中にエラーが発生しました:", error);
    }
}

// スポット情報の表示
function displaySpots(spots) {
    const spotList = document.getElementById('spot-list');
    spotList.innerHTML = '';

    spots.forEach(spot => {
        const listItem = document.createElement('div');
        listItem.className = 'spot-item';
        listItem.innerHTML = `
            <h3>${spot.name}</h3>
            <p>住所: ${spot.vicinity || "情報なし"}</p>
            <button onclick="showRoutePopup(${spot.geometry.location.lat}, ${spot.geometry.location.lng})">ルートを見る</button>
        `;
        spotList.appendChild(listItem);
    });
}

// ポップアップでルートを表示
function showRoutePopup(destLatitude, destLongitude) {
    const popup = document.getElementById('popup');
    popup.classList.remove('hidden');

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();

    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: userLatitude, lng: userLongitude },
        zoom: 14,
    });

    directionsRenderer.setMap(map);

    const request = {
        origin: { lat: userLatitude, lng: userLongitude },
        destination: { lat: destLatitude, lng: destLongitude },
        travelMode: 'WALKING',
    };

    directionsService.route(request, (result, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
        } else {
            alert("ルートの取得に失敗しました。");
        }
    });
}

// ポップアップを閉じる
document.getElementById('popup-close').addEventListener('click', () => {
    const popup = document.getElementById('popup');
    popup.classList.add('hidden');
    document.getElementById('map').innerHTML = ''; // マップをクリア
});

// イベントリスナー
document.getElementById('search-button').addEventListener('click', startSearch);
