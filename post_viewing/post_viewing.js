document.addEventListener("DOMContentLoaded", async () => {
    const timeline = document.querySelector(".timeline");
    const mapPopup = document.getElementById("map-popup");
    const mapElement = document.getElementById("map");
    const closeMapButton = document.getElementById("close-map");
    const distanceElement = document.getElementById("distance");
    const durationElement = document.getElementById("duration");
    const headingValueElement = document.getElementById("heading-value");

    let map;
    let directionsService;
    let directionsRenderer;
    let currentPositionWatcher;
    let userMarker;
    let destinationMarker;
    let destinationLatLng;
    let currentHeading = 0;

    async function fetchPosts() {
        // 投稿データの取得処理（省略）
    }

    function displayPosts(newPosts) {
        // 投稿表示処理（省略）
    }

    function addSwipeFunctionality(postFrame, address) {
        let startY = 0;
        let endY = 0;

        postFrame.addEventListener("touchstart", (e) => {
            startY = e.touches[0].clientY;
        });

        postFrame.addEventListener("touchmove", (e) => {
            endY = e.touches[0].clientY;
        });

        postFrame.addEventListener("touchend", () => {
            if (startY - endY > 50) { // スワイプ距離が一定以上の場合
                geocodeAddress(address);
            }
        });
    }

    function geocodeAddress(address) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: address }, (results, status) => {
            if (status === "OK" && results[0]) {
                destinationLatLng = results[0].geometry.location;
                showMapPopup(destinationLatLng, address);
            } else {
                console.error("目的地のジオコーディングエラー:", status);
            }
        });
    }

    function showMapPopup(destination, address) {
        mapPopup.classList.remove("hidden");

        if (!map) {
            map = new google.maps.Map(mapElement, {
                zoom: 15,
                center: destination,
            });
            directionsService = new google.maps.DirectionsService();
            directionsRenderer = new google.maps.DirectionsRenderer({ suppressMarkers: true });
            directionsRenderer.setMap(map);

            // 目的地のピンを追加
            destinationMarker = new google.maps.Marker({
                position: destination,
                map: map,
                title: address,
            });

            userMarker = new google.maps.Marker({
                position: { lat: 0, lng: 0 }, // 初期値
                map: map,
                icon: {
                    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    scale: 4,
                    strokeColor: "#00f",
                },
                title: "現在地",
            });
        } else {
            destinationMarker.setPosition(destination);
        }

        if (currentPositionWatcher) {
            navigator.geolocation.clearWatch(currentPositionWatcher);
        }

        currentPositionWatcher = navigator.geolocation.watchPosition(
            (position) => {
                const origin = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                userMarker.setPosition(origin);
                map.panTo(origin);

                directionsService.route(
                    {
                        origin: origin,
                        destination: destination,
                        travelMode: google.maps.TravelMode.WALKING,
                    },
                    (result, status) => {
                        if (status === "OK") {
                            directionsRenderer.setDirections(result);

                            const route = result.routes[0].legs[0];
                            distanceElement.textContent = `距離: ${route.distance.text}`;
                            durationElement.textContent = `所要時間: ${route.duration.text}`;
                        } else {
                            console.error("ルート案内エラー:", status);
                        }
                    }
                );
            },
            (error) => console.error("現在位置取得エラー:", error),
            { enableHighAccuracy: true }
        );
    }

    function updateHeading(event) {
        if (event.alpha !== null) {
            currentHeading = Math.round(event.alpha); // コンパスの向き
            headingValueElement.textContent = currentHeading;
            userMarker.setIcon({
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 4,
                rotation: currentHeading,
                strokeColor: "#00f",
            });
        }
    }

    closeMapButton.addEventListener("click", () => {
        mapPopup.classList.add("hidden");
        if (currentPositionWatcher) {
            navigator.geolocation.clearWatch(currentPositionWatcher);
        }
    });

    window.addEventListener("deviceorientation", updateHeading);

    await fetchPosts();
});
