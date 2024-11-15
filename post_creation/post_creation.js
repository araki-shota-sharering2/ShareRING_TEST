document.addEventListener("DOMContentLoaded", initMap);

function initMap() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                console.log(`現在地: 緯度 ${userLocation.lat}, 経度 ${userLocation.lng}`);

                const spots = await findNearbyPlaces(userLocation);
                displaySpots(spots, userLocation);
            },
            (error) => {
                console.error("位置情報の取得に失敗しました", error);
            }
        );
    } else {
        alert("ブラウザが位置情報サービスに対応していません");
    }
}

async function findNearbyPlaces(location) {
    return new Promise((resolve, reject) => {
        const service = new google.maps.places.PlacesService(document.createElement("div"));
        const request = {
            location: location,
            radius: 200, // 半径200m
            type: ["store", "restaurant", "park"], // 検索対象の種類
        };

        service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                resolve(results);
            } else {
                reject(`Nearby Searchに失敗しました: ${status}`);
            }
        });
    });
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 地球の半径 (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // 距離 (m) に変換
}

function displaySpots(spots, userLocation) {
    const spotsList = document.getElementById("spotsList");
    spotsList.innerHTML = "";

    spots.forEach((spot) => {
        const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            spot.geometry.location.lat(),
            spot.geometry.location.lng()
        );

        const listItem = document.createElement("li");
        listItem.classList.add("spot-item");
        listItem.onclick = () => selectSpot(spot);

        listItem.innerHTML = `
            <img src="https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/${spot.icon}" alt="icon">
            <div class="info">
                <h2>${spot.name}</h2>
                <p>${spot.vicinity}</p>
            </div>
            <span class="distance">${distance.toFixed(0)} m</span>
        `;

        spotsList.appendChild(listItem);
    });
}

function selectSpot(spot) {
    // 選択されたスポットの情報を投稿作成画面に渡す処理
    // ここでは例としてスポット名と住所をコンソールに出力します
    console.log("選択されたスポット:", spot.name, spot.vicinity);

    // 必要に応じて投稿作成画面に遷移する処理を追加
    // location.href = "post_creation_form.html?name=" + encodeURIComponent(spot.name) + "&address=" + encodeURIComponent(spot.vicinity);
}
