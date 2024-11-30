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
                    alert("現在地を取得できませんでした。");
                    reject(error);
                }
            );
        } else {
            alert("ブラウザが位置情報の取得に対応していません。");
            reject(new Error("Geolocation not supported"));
        }
    });
}

// スポット検索開始
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
        console.error("エラーが発生しました:", error);
    }
}

// スポット情報の取得
async function fetchNearbySpots(genre, radius) {
    try {
        const response = await fetch(`/nearbysearch?location=${userLatitude},${userLongitude}&radius=${radius}&type=${genre}`);
        const data = await response.json();

        if (data.results) {
            displaySpots(data.results);
        } else {
            alert("スポット情報が見つかりませんでした。");
        }
    } catch (error) {
        console.error("エラーが発生しました:", error);
        alert("スポット情報の取得中にエラーが発生しました。");
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

    if (!map) {
        map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: userLatitude, lng: userLongitude },
            zoom: 14,
        });
        directionsRenderer.setMap(map);
    }

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
    directionsRenderer.setMap(null); // マップをリセット
    document.getElementById('map').innerHTML = ''; // マップをクリア
});

// Google Maps API をロード
loadGoogleMapsAPI(initializeGoogleMaps);
