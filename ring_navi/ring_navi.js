document.addEventListener("DOMContentLoaded", async () => {
    const mapElement = document.getElementById("map");
    const distanceElement = document.getElementById("distance");
    const durationElement = document.getElementById("duration");
    const routeInfoElement = document.getElementById("route-info");

    let map;
    let directionsService;
    let directionsRenderer;
    let currentLat, currentLng;
    let destinationLat, destinationLng;
    let currentLocationMarker, destinationMarker;

    // Google Maps 初期化
    async function initializeMap() {
        map = new google.maps.Map(mapElement, {
            zoom: 15,
            center: { lat: 0, lng: 0 }, // 初期位置は空
        });

        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer({ suppressMarkers: true });
        directionsRenderer.setMap(map);

        await updateMapCenter();
    }

    // 現在地の取得
    async function fetchCurrentLocation() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    currentLat = position.coords.latitude;
                    currentLng = position.coords.longitude;
                    resolve({ lat: currentLat, lng: currentLng });
                },
                (error) => {
                    console.error("現在地の取得に失敗しました:", error);
                    alert("現在地を取得できませんでした。");
                    reject(error);
                }
            );
        });
    }

    // 地図の中心を現在地に更新
    async function updateMapCenter() {
        try {
            const currentLocation = await fetchCurrentLocation();
            map.setCenter(currentLocation);

            if (!currentLocationMarker) {
                currentLocationMarker = new google.maps.Marker({
                    position: currentLocation,
                    map: map,
                    icon: {
                        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                        scale: 5,
                        fillColor: "#00F",
                        fillOpacity: 1,
                        strokeWeight: 2,
                    },
                    title: "現在地",
                });
            } else {
                currentLocationMarker.setPosition(currentLocation);
            }
        } catch (error) {
            console.error("現在地の更新に失敗しました:", error);
        }
    }

    // ルートの更新
    async function updateRoute(destination) {
        destinationLat = destination.lat;
        destinationLng = destination.lng;

        const origin = { lat: currentLat, lng: currentLng };
        const destinationPoint = { lat: destinationLat, lng: destinationLng };

        directionsService.route(
            {
                origin,
                destination: destinationPoint,
                travelMode: google.maps.TravelMode.WALKING,
            },
            (result, status) => {
                if (status === "OK") {
                    const route = result.routes[0].legs[0];
                    directionsRenderer.setDirections(result);

                    // 距離と時間を表示
                    distanceElement.textContent = `距離: ${route.distance.text}`;
                    durationElement.textContent = `所要時間: ${route.duration.text}`;

                    // 目的地のマーカーを配置
                    if (!destinationMarker) {
                        destinationMarker = new google.maps.Marker({
                            position: destinationPoint,
                            map: map,
                            title: "目的地",
                            icon: {
                                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                            },
                        });
                    } else {
                        destinationMarker.setPosition(destinationPoint);
                    }
                } else {
                    console.error("ルート検索に失敗しました:", status);
                    distanceElement.textContent = "距離: 不明";
                    durationElement.textContent = "所要時間: 不明";
                }
            }
        );
    }

    // 目的地を設定してルート案内開始
    document.querySelectorAll(".destination-button").forEach((button) => {
        button.addEventListener("click", async () => {
            const destinationAddress = button.getAttribute("data-address");

            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address: destinationAddress }, async (results, status) => {
                if (status === "OK") {
                    const location = results[0].geometry.location;
                    await updateRoute({ lat: location.lat(), lng: location.lng() });
                } else {
                    console.error("住所のジオコーディングに失敗しました:", status);
                    alert("目的地を特定できませんでした。");
                }
            });
        });
    });

    // 初期化
    await initializeMap();
});
