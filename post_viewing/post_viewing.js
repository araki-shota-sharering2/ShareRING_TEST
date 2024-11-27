document.addEventListener("DOMContentLoaded", async () => {
    const timeline = document.querySelector(".timeline");
    const mapPopup = document.getElementById("map-popup");
    const mapElement = document.getElementById("map");
    const closeMapButton = document.getElementById("close-map");
    const distanceElement = document.getElementById("distance");
    const durationElement = document.getElementById("duration");
    const travelModeSelect = document.getElementById("travel-mode");
    const checkInButton = document.getElementById("check-in");
    const celebrationPopup = document.getElementById("celebration-popup");

    let map;
    let directionsService;
    let directionsRenderer;
    let currentPositionWatcher;
    let destinationMarker;
    let compassMarker;
    let posts = [];
    let currentPage = 0;
    let isFetching = false;
    let destination = null;
    const CHECK_IN_RADIUS = 50; // チェックイン可能な距離（メートル）

    async function fetchPosts() {
        if (isFetching) return;
        isFetching = true;

        try {
            const response = await fetch(`/post-viewing-handler?page=${currentPage + 1}`, {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                const newPosts = await response.json();
                if (newPosts.length > 0) {
                    posts = [...posts, ...newPosts];
                    displayPosts(newPosts);
                    currentPage++;
                }
                isFetching = false;
            }
        } catch (error) {
            console.error("投稿データ取得エラー:", error);
            isFetching = false;
        }
    }

    function displayPosts(newPosts) {
        newPosts.forEach((post) => {
            const postFrame = document.createElement("div");
            postFrame.className = "post-frame";

            const ringColor = post.ring_color || "#FFFFFF";

            postFrame.innerHTML = `
                <div class="post-content">
                    <img src="${post.image_url}" alt="投稿画像" class="post-image" style="border-color: ${ringColor};">
                    <div class="post-details">
                        <div class="user-info">
                            <img class="user-avatar" src="${post.profile_image || '/assets/images/default-avatar.png'}" alt="ユーザー画像">
                            <span>${post.username || "匿名ユーザー"}</span>
                            <span class="post-address">${post.address || "住所情報なし"}</span>
                        </div>
                        <p class="post-comment">${post.caption || "コメントなし"}</p>
                        <p class="post-date">投稿日: ${new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                    <div class="post-actions">
                        <button class="like-button">いいね</button>
                        <button class="keep-button">Keep</button>
                        <div class="swipe-guide">↑ スワイプしてルート案内を開始</div>
                    </div>
                </div>
            `;
            addSwipeFunctionality(postFrame, post.address);
            timeline.appendChild(postFrame);
        });
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
                showMapPopup(address);
            }
        });
    }

    function showMapPopup(destinationAddress) {
        mapPopup.classList.remove("hidden");

        destination = destinationAddress;

        if (!map) {
            map = new google.maps.Map(mapElement, {
                zoom: 15,
                center: { lat: 35.6895, lng: 139.6917 },
            });
            directionsService = new google.maps.DirectionsService();
            directionsRenderer = new google.maps.DirectionsRenderer({ suppressMarkers: true });
            directionsRenderer.setMap(map);

            compassMarker = new google.maps.Marker({
                map: map,
                icon: {
                    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    scale: 5,
                    strokeColor: "#00f",
                },
            });
        }

        updateRoute();
        trackUserPosition();
    }

    function updateRoute() {
        if (!destination) return;

        const travelMode = travelModeSelect.value;

        navigator.geolocation.getCurrentPosition((position) => {
            const origin = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };

            directionsService.route(
                {
                    origin: origin,
                    destination: destination,
                    travelMode: google.maps.TravelMode[travelMode],
                },
                (result, status) => {
                    if (status === "OK") {
                        directionsRenderer.setDirections(result);

                        const route = result.routes[0].legs[0];
                        distanceElement.textContent = `距離: ${route.distance.text}`;
                        durationElement.textContent = `所要時間: ${route.duration.text}`;

                        // チェックイン可能か確認
                        if (route.distance.value <= CHECK_IN_RADIUS) {
                            checkInButton.classList.remove("hidden");
                        } else {
                            checkInButton.classList.add("hidden");
                        }
                    } else {
                        console.error("Directions request failed:", status);
                    }
                }
            );
        });
    }

    function trackUserPosition() {
        if (currentPositionWatcher) {
            navigator.geolocation.clearWatch(currentPositionWatcher);
        }

        currentPositionWatcher = navigator.geolocation.watchPosition(
            (position) => {
                const origin = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                compassMarker.setPosition(origin);
                compassMarker.setIcon({
                    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    scale: 5,
                    rotation: position.coords.heading || 0,
                    strokeColor: "#00f",
                });

                updateRoute();
            },
            (error) => {
                console.error("位置情報の取得に失敗しました:", error);
            }
        );
    }

    checkInButton.addEventListener("click", () => {
        showCelebrationPopup();
    });

    function showCelebrationPopup() {
        celebrationPopup.classList.remove("hidden");
        celebrationPopup.innerHTML = `
            <div class="celebration-content">
                <h1>到着しました！🎉</h1>
                <p>目的地にチェックインしました！</p>
            </div>
        `;
        setTimeout(() => {
            celebrationPopup.classList.add("hidden");
        }, 5000);
    }

    closeMapButton.addEventListener("click", () => {
        mapPopup.classList.add("hidden");
        if (currentPositionWatcher) {
            navigator.geolocation.clearWatch(currentPositionWatcher);
        }
    });

    travelModeSelect.addEventListener("change", updateRoute);

    await fetchPosts();
});
