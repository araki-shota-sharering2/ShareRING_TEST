let map;

function initMap() {
    // 現在地の取得
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                // 地図の初期化
                map = new google.maps.Map(document.getElementById("map"), {
                    center: userLocation,
                    zoom: 15,
                });

                // 現在地にマーカーを表示
                new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    title: "現在地",
                });

                // 周辺スポットを検索
                findNearbyPlaces(userLocation);
            },
            () => {
                alert("位置情報の取得に失敗しました");
            }
        );
    } else {
        alert("ブラウザが位置情報サービスに対応していません");
    }
}

function findNearbyPlaces(location) {
    const service = new google.maps.places.PlacesService(map);

    // Nearby Searchリクエスト
    const request = {
        location: location,
        radius: 1000, // 半径1km
        type: ["restaurant", "park", "museum"], // 表示したいスポットの種類
    };

    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            results.forEach((place) => {
                // スポットごとにマーカーを追加
                new google.maps.Marker({
                    position: place.geometry.location,
                    map: map,
                    title: place.name,
                });

                console.log(`スポット名: ${place.name}, 住所: ${place.vicinity}`);
            });
        } else {
            console.error("Nearby Searchに失敗しました:", status);
        }
    });
}

// ページロード時にマップを初期化
window.onload = initMap;
