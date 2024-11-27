document.addEventListener("DOMContentLoaded", () => {
    const mapPopup = document.getElementById("map-popup");
    const mapElement = document.getElementById("map");
    const closeMapButton = document.getElementById("close-map");
    const distanceElement = document.getElementById("distance");
    const durationElement = document.getElementById("duration");

    let map;
    let directionsService;
    let directionsRenderer;
    let currentPositionWatcher;
    let currentLocationMarker;
    let currentHeading = 0;

    // 投稿一覧のタイムライン取得
    const timeline = document.querySelector(".timeline");

    function initializeMap() {
        if (!map) {
            map = new google.maps.Map(mapElement, {
                zoom: 15,
                center: { lat: 35.6895, lng: 139.6917 }, // Default to Tokyo
            });

            directionsService = new google.maps.DirectionsService();
            directionsRenderer = new google.maps.DirectionsRenderer({ suppressMarkers: true });
            directionsRenderer.setMap(map);

            // Current location marker with rotation for heading
            currentLocationMarker = new google.maps.Marker({
                map: map,
                icon: {
                    url: '/assets/images/current-location-icon.svg', // Replace with your current location icon
                    scaledSize: new google.maps.Size(40, 40),
                    anchor: new google.maps.Point(20, 20),
                },
            });
        }
    }

    function showMapPopup(destination) {
        mapPopup.classList.remove("hidden");
        initializeMap();

        const destinationMarker = new google.maps.Marker({
            position: destination,
            map: map,
            icon: {
                url: '/assets/images/destination-pin.svg', // Replace with your destination pin icon
                scaledSize: new google.maps.Size(40, 40),
            },
        });

        if (currentPositionWatcher) {
            navigator.geolocation.clearWatch(currentPositionWatcher);
        }

        currentPositionWatcher = navigator.geolocation.watchPosition(
            (position) => {
                const origin = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                // Update current location marker
                currentLocationMarker.setPosition(origin);
                map.setCenter(origin);

                // Set direction for current location marker
                currentLocationMarker.setIcon({
                    url: '/assets/images/current-location-icon.svg',
                    scaledSize: new google.maps.Size(40, 40),
                    rotation: currentHeading, // Apply heading
                    anchor: new google.maps.Point(20, 20),
                });

                // Get route
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
                            console.error("ルート取得エラー:", status);
                        }
                    }
                );
            },
            (error) => {
                console.error("位置情報取得エラー:", error);
            },
            { enableHighAccuracy: true }
        );

        window.addEventListener("deviceorientation", (event) => {
            if (event.alpha !== null) {
                currentHeading = event.alpha; // Update heading
            }
        });
    }

    closeMapButton.addEventListener("click", () => {
        mapPopup.classList.add("hidden");
        if (currentPositionWatcher) {
            navigator.geolocation.clearWatch(currentPositionWatcher);
        }
    });

    // 投稿データの取得と表示
    async function fetchPosts() {
        try {
            const response = await fetch(`/post-viewing-handler`, {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                const posts = await response.json();
                displayPosts(posts);
            }
        } catch (error) {
            console.error("投稿データ取得エラー:", error);
        }
    }

    function displayPosts(posts) {
        posts.forEach((post) => {
            const postFrame = document.createElement("div");
            postFrame.className = "post-frame";

            const ringColor = post.ring_color || "#FFFFFF";

            postFrame.innerHTML = `
                <div class="post-content">
                    <img src="${post.image_url}" alt="投稿画像" class="post-image" style="border-color: ${ringColor};">
                    <div class="post-details">
                        <span class="post-address">${post.address || "住所情報なし"}</span>
                        <p class="post-comment">${post.caption || "コメントなし"}</p>
                    </div>
                </div>
            `;

            postFrame.addEventListener("click", () => {
                const destination = {
                    lat: post.location.lat,
                    lng: post.location.lng,
                };
                showMapPopup(destination);
            });

            timeline.appendChild(postFrame);
        });
    }

    // 初回の投稿データ取得
    fetchPosts();
});
