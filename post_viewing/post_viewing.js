document.addEventListener("DOMContentLoaded", async () => {
    const timeline = document.querySelector(".timeline");
    const mapPopup = document.getElementById("map-popup");
    const mapElement = document.getElementById("map");
    const distanceElement = document.getElementById("distance");
    const durationElement = document.getElementById("duration");
    const checkInButton = document.getElementById("check-in");
    const testCheckInButton = document.getElementById("test-check-in");
    const closeRouteButton = document.getElementById("close-route");
    const celebrationPopup = document.getElementById("celebration-popup");
    const travelModeButtons = document.querySelectorAll(".travel-mode-button");

    let map;
    let directionsService;
    let directionsRenderer;
    let currentLat, currentLng;

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

        await updateCurrentLocation();
    }

    async function updateCurrentLocation() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    currentLat = position.coords.latitude;
                    currentLng = position.coords.longitude;
                    map.setCenter({ lat: currentLat, lng: currentLng });
                    resolve();
                },
                (error) => {
                    console.error("現在地を取得できませんでした:", error);
                    reject(error);
                }
            );
        });
    }

    async function updateRoute(destinationLat, destinationLng) {
        const origin = { lat: currentLat, lng: currentLng };
        const destination = { lat: destinationLat, lng: destinationLng };

        directionsService.route(
            {
                origin,
                destination,
                travelMode: google.maps.TravelMode.WALKING,
            },
            (result, status) => {
                if (status === "OK") {
                    const route = result.routes[0].legs[0];
                    directionsRenderer.setDirections(result);
                    distanceElement.textContent = `距離: ${route.distance.text}`;
                    durationElement.textContent = `所要時間: ${route.duration.text}`;
                    updateCheckInStatus(route.distance.value);
                } else {
                    console.error("ルート取得失敗:", status);
                }
            }
        );
    }

    function updateCheckInStatus(distance) {
        if (distance <= CHECK_IN_RADIUS) {
            checkInButton.removeAttribute("disabled");
            checkInButton.classList.remove("disabled");
        } else {
            checkInButton.setAttribute("disabled", true);
            checkInButton.classList.add("disabled");
        }
    }

    async function fetchDistanceAndDuration(postLat, postLng) {
        const origin = { lat: currentLat, lng: currentLng };
        const destination = { lat: postLat, lng: postLng };

        return new Promise((resolve, reject) => {
            directionsService.route(
                {
                    origin,
                    destination,
                    travelMode: google.maps.TravelMode.WALKING,
                },
                (result, status) => {
                    if (status === "OK") {
                        const route = result.routes[0].legs[0];
                        resolve({
                            distance: route.distance.text,
                            duration: route.duration.text,
                        });
                    } else {
                        console.error("距離・時間取得失敗:", status);
                        reject(status);
                    }
                }
            );
        });
    }

    async function fetchPosts() {
        try {
            const response = await fetch(`/post-viewing-handler?page=1`);
            if (response.ok) {
                const posts = await response.json();
                displayPosts(posts);
            } else {
                console.error("投稿データの取得に失敗しました");
            }
        } catch (error) {
            console.error("投稿データ取得エラー:", error);
        }
    }

    async function displayPosts(posts) {
        for (const post of posts) {
            const postFrame = document.createElement("div");
            postFrame.className = "post-frame";

            const ringColor = post.ring_color || "#FFFFFF";
            let distanceAndDuration = { distance: "-", duration: "-" };

            if (post.location) {
                const [postLat, postLng] = post.location.split(",").map(Number);
                distanceAndDuration = await fetchDistanceAndDuration(postLat, postLng);
            }

            postFrame.innerHTML = `
                <div class="post-content">
                    <img src="${post.image_url}" alt="投稿画像" class="post-image" style="border-color: ${ringColor};">
                    <div class="post-details">
                        <div class="user-info">
                            <span>${post.username || "匿名ユーザー"}</span>
                            <span class="post-date">${new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                        <p class="post-comment">${post.caption || "コメントなし"}</p>
                        <p class="post-distance-duration" style="color: ${ringColor};">
                            距離: ${distanceAndDuration.distance}, 時間: ${distanceAndDuration.duration}
                        </p>
                    </div>
                </div>
            `;
            timeline.appendChild(postFrame);
        }
    }

    function showMapPopup(postLat, postLng) {
        mapPopup.classList.remove("hidden");
        updateRoute(postLat, postLng);
    }

    closeRouteButton.addEventListener("click", () => {
        mapPopup.classList.add("hidden");
    });

    testCheckInButton.addEventListener("click", () => {
        alert("テストチェックイン完了！");
    });

    checkInButton.addEventListener("click", () => {
        alert("チェックインが完了しました！");
    });

    travelModeButtons.forEach((button) => {
        button.addEventListener("click", () => {
            travelModeButtons.forEach((btn) => btn.classList.remove("active"));
            button.classList.add("active");
        });
    });

    await initializeMap();
    await fetchPosts();
});
