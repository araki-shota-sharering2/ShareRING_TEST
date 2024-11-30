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

    document.getElementById('search-button').addEventListener('click', startSearch);

    // マップを初期化
    map = new google.maps.Map(document.getElementById('map-container'), {
        center: { lat: 35.6895, lng: 139.6917 }, // 初期位置は東京
        zoom: 14,
    });
    directionsRenderer.setMap(map);
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
        const distance = calculateDistance(
            userLatitude,
            userLongitude,
            spot.geometry.location.lat,
            spot.geometry.location.lng
        ).toFixed(2);

        const rating = spot.rating || 0;
        const totalRatings = spot.user_ratings_total || 0;
        const stars = "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));

        const listItem = document.createElement('div');
        listItem.className = 'spot-item';
        listItem.innerHTML = `
            <h3>${spot.name}</h3>
            <p>住所: ${spot.vicinity || "情報なし"}</p>
            <p>距離: ${distance} km</p>
            <p>評価: ${stars} (${rating} / 5, ${totalRatings}件)</p>
            <img src="${spot.photos && spot.photos[0] ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${spot.photos[0].photo_reference}&key=AIzaSyCIbW8SaZBjgKXB3yt7ig0OYnzD0TIi2h8` : '画像なし'}" alt="${spot.name}" />
            <button onclick="showRoute(${spot.geometry.location.lat}, ${spot.geometry.location.lng})">ルートを見る</button>
        `;
        spotList.appendChild(listItem);
    });
}

// ルート表示
function showRoute(destLatitude, destLongitude) {
    map.setCenter({ lat: destLatitude, lng: destLongitude });

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

// Google Maps API をロードし、コールバック関数を実行
loadGoogleMapsAPI(initializeGoogleMaps);
