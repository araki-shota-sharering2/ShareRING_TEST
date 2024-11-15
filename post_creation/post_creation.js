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
                const tableBody = document.querySelector("#spotsTable tbody");

                // スポット情報をテーブルに追加
                spots.forEach((spot) => {
                    const distance = calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        spot.geometry.location.lat(),
                        spot.geometry.location.lng()
                    );

                    const row = `
                        <tr>
                            <td>${spot.name}</td>
                            <td>${spot.vicinity}</td>
                            <td>${distance.toFixed(2)}</td>
                        </tr>
                    `;

                    tableBody.innerHTML += row;
                });
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
            radius: 1000, // 半径1km
            type: ["restaurant", "park", "museum"], // 検索対象の種類
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
    return R * c; // 距離 (km)
}

// 初期化
window.onload = initMap;
