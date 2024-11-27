document.addEventListener("DOMContentLoaded", async () => {
    const timeline = document.querySelector(".timeline");
    const mapPopup = document.getElementById("map-popup");
    const mapElement = document.getElementById("map");
    const closeMapButton = document.getElementById("close-map");
    const distanceElement = document.getElementById("distance");
    const durationElement = document.getElementById("duration");
    const checkInButton = document.getElementById("check-in");
    const celebrationPopup = document.getElementById("celebration-popup");
    const travelModeButtons = document.querySelectorAll(".travel-mode-button");

    let map;
    let directionsService;
    let directionsRenderer;
    let currentLat, currentLng;
    let destinationLat, destinationLng; // 目的地の緯度・経度
    let travelMode = "WALKING"; // デフォルトの移動手段
    const CHECK_IN_RADIUS = 50; // チェックイン可能な距離（メートル）

    function initializeMap() {
        map = new google.maps.Map(mapElement, {
            zoom: 15,
            center: { lat: 0, lng: 0 }, // 初期値は (0, 0) に設定し、後で現在地に更新
        });
        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer({ suppressMarkers: true });
        directionsRenderer.setMap(map);
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
        } catch (error) {
            console.error("マップの中心位置の更新に失敗しました:", error);
        }
    }

    function updateRoute() {
        if (!destinationLat || !destinationLng) return;

        const origin = { lat: currentLat, lng: currentLng };
        const destination = { lat: destinationLat, lng: destinationLng };

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
                }
            }
        );
    }

    function updateCheckInStatus(distance) {
        if (distance <= CHECK_IN_RADIUS) {
            checkInButton.classList.remove("disabled");
            checkInButton.removeAttribute("disabled");
            checkInButton.textContent = "チェックイン可能！";
        } else {
            checkInButton.classList.add("disabled");
            checkInButton.setAttribute("disabled", true);
            checkInButton.textContent = "まだ到着していません";
        }
    }

    async function showMapPopup(address) {
        mapPopup.classList.remove("hidden");

        // Geocoding APIで住所から緯度経度を取得
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address }, async (results, status) => {
            if (status === "OK") {
                const location = results[0].geometry.location;
                destinationLat = location.lat();
                destinationLng = location.lng();

                // 現在地を取得してマップを更新
                await updateMapCenter();
                updateRoute();
            } else {
                console.error("住所のジオコーディングに失敗しました:", status);
            }
        });
    }

    function trackUserPosition() {
        navigator.geolocation.watchPosition(
            (position) => {
                currentLat = position.coords.latitude;
                currentLng = position.coords.longitude;
                updateRoute();
            },
            (error) => {
                console.error("位置情報の追跡に失敗しました:", error);
            }
        );
    }

    async function fetchPosts() {
        try {
            const response = await fetch(`/post-viewing-handler?page=1`, { method: "GET" });
            if (response.ok) {
                const posts = await response.json();
                displayPosts(posts);
            } else {
                console.error("投稿データの取得に失敗しました");
            }
        } catch (error) {
            console.error("投稿データの取得中にエラーが発生しました:", error);
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
            if (startY - endY > 50) {
                showMapPopup(address);
            }
        });
    }

    checkInButton.addEventListener("click", () => {
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
    });

    closeMapButton.addEventListener("click", () => {
        mapPopup.classList.add("hidden");
    });

    travelModeButtons.forEach((button) => {
        button.addEventListener("click", () => {
            travelModeButtons.forEach((btn) => btn.classList.remove("active"));
            button.classList.add("active");
            travelMode = button.getAttribute("data-mode");
            updateRoute();
        });
    });

    initializeMap();
    await fetchPosts();
});
