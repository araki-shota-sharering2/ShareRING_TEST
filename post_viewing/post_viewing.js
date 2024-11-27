document.addEventListener("DOMContentLoaded", async () => {
    const timeline = document.querySelector(".timeline");
    const mapPopup = document.getElementById("map-popup");
    const mapElement = document.getElementById("map");
    const distanceElement = document.getElementById("distance");
    const durationElement = document.getElementById("duration");
    const checkInButton = document.getElementById("check-in");
    const celebrationPopup = document.getElementById("celebration-popup");
    const travelModeButtons = document.querySelectorAll(".travel-mode-button");

    let map;
    let directionsService;
    let directionsRenderer;
    let currentLat, currentLng;
    let destinationLat, destinationLng;
    let currentLocationMarker, destinationMarker;
    let travelMode = "WALKING";
    const CHECK_IN_RADIUS = 50;
    const MIN_ROUTE_DISTANCE = 100;

    async function initializeMap() {
        map = new google.maps.Map(mapElement, {
            zoom: 15,
            center: { lat: 0, lng: 0 },
        });
        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer({ suppressMarkers: true });
        directionsRenderer.setMap(map);

        await updateMapCenter();
    }

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
                    reject(error);
                }
            );
        });
    }

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
            console.error("マップの中心位置の更新に失敗しました:", error);
        }
    }

    async function updateRoute() {
        if (!destinationLat || !destinationLng) {
            console.error("目的地が設定されていません");
            return;
        }

        const origin = { lat: currentLat, lng: currentLng };
        const destination = { lat: destinationLat, lng: destinationLng };

        const distance = calculateDistance(currentLat, currentLng, destinationLat, destinationLng);

        if (distance < MIN_ROUTE_DISTANCE) {
            distanceElement.textContent = "距離: 目的地はすぐ近くです";
            durationElement.textContent = "所要時間: 数秒";
            directionsRenderer.setDirections({});
            map.setCenter(destination);

            if (!destinationMarker) {
                destinationMarker = new google.maps.Marker({
                    position: destination,
                    map: map,
                    title: "目的地",
                });
            } else {
                destinationMarker.setPosition(destination);
            }

            updateCheckInStatus(distance, true);
            return;
        }

        directionsService.route(
            {
                origin,
                destination,
                travelMode: google.maps.TravelMode[travelMode],
            },
            (result, status) => {
                if (status === "OK") {
                    const route = result.routes[0].legs[0];
                    directionsRenderer.setDirections(result);
                    distanceElement.textContent = `距離: ${route.distance.text}`;
                    durationElement.textContent = `所要時間: ${route.duration.text}`;
                    updateCheckInStatus(route.distance.value);
                } else {
                    console.error("ルート検索に失敗しました:", status);
                    distanceElement.textContent = "距離: 不明";
                    durationElement.textContent = "所要時間: 不明";
                    updateCheckInStatus(CHECK_IN_RADIUS - 1);
                }
            }
        );
    }

    function calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371e3;
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lng2 - lng1) * Math.PI) / 180;

        const a =
            Math.sin(Δφ / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    async function showMapPopup(address) {
        mapPopup.classList.remove("hidden");

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address }, async (results, status) => {
            if (status === "OK") {
                const location = results[0].geometry.location;
                destinationLat = location.lat();
                destinationLng = location.lng();

                await updateMapCenter();
                updateRoute();
            } else {
                console.error("住所のジオコーディングに失敗しました:", status);
            }
        });
    }

    function updateCheckInStatus(distance, forceEnable = false) {
        if (forceEnable || distance <= CHECK_IN_RADIUS) {
            checkInButton.classList.remove("disabled");
            checkInButton.removeAttribute("disabled");
            checkInButton.textContent = "チェックイン可能！";
        } else {
            checkInButton.classList.add("disabled");
            checkInButton.setAttribute("disabled", true);
            checkInButton.textContent = "まだ到着していません";
        }
    }

    checkInButton.addEventListener("click", () => {
        alert("チェックインが完了しました！");
        showCelebrationPopup("到着しました！🎉", "目的地にチェックインしました！");
    });

    function showCelebrationPopup(title, message) {
        celebrationPopup.classList.remove("hidden");
        celebrationPopup.innerHTML = `
            <div class="celebration-content">
                <h1>${title}</h1>
                <p>${message}</p>
            </div>
        `;
        setTimeout(() => {
            celebrationPopup.classList.add("hidden");
        }, 5000);
    }

    travelModeButtons.forEach((button) => {
        button.addEventListener("click", () => {
            travelModeButtons.forEach((btn) => btn.classList.remove("active"));
            button.classList.add("active");
            travelMode = button.getAttribute("data-mode");
            updateRoute();
        });
    });

    await initializeMap();
});
