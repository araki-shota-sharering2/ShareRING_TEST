document.addEventListener("DOMContentLoaded", async () => {
    const timeline = document.querySelector(".timeline");
    const mapPopup = document.getElementById("map-popup");
    const mapElement = document.getElementById("map");
    const distanceElement = document.getElementById("distance");
    const durationElement = document.getElementById("duration");
    const checkInButton = document.getElementById("check-in");
    const testCheckInButton = document.getElementById("test-check-in");
    const celebrationPopup = document.getElementById("celebration-popup");
    const closeMapButton = document.createElement("button");

    let map;
    let directionsService;
    let directionsRenderer;
    let currentLat, currentLng;
    let destinationLat, destinationLng;
    let currentLocationMarker, destinationMarker;
    let currentPage = 1;
    const postsPerPage = 8; // 1ページあたりの投稿数
    const travelMode = "WALKING"; // 徒歩のみに固定
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

        closeMapButton.textContent = "閉じる";
        closeMapButton.style.position = "absolute";
        closeMapButton.style.bottom = "10px";
        closeMapButton.style.right = "10px";
        closeMapButton.style.padding = "10px 20px";
        closeMapButton.style.backgroundColor = "#394575";
        closeMapButton.style.color = "white";
        closeMapButton.style.border = "none";
        closeMapButton.style.borderRadius = "5px";
        closeMapButton.style.cursor = "pointer";
        mapPopup.appendChild(closeMapButton);

        closeMapButton.addEventListener("click", () => {
            mapPopup.classList.add("hidden");
        });

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
                        rotation: 0,
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
                placeDestinationMarker();
                updateRoute();
            } else {
                console.error("住所のジオコーディングに失敗しました:", status);
            }
        });
    }

    async function fetchPosts(page = 1) {
        try {
            const response = await fetch(`/post-viewing-handler?page=${page}`, { method: "GET" });
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
        timeline.innerHTML = ""; // タイムラインの中身をクリア

        // 前のページボタン
        const prevPage = document.createElement("div");
        prevPage.className = "pagination-item";
        prevPage.innerHTML = `<button id="prev-page" class="pagination-button">前のページ</button>`;
        prevPage.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                fetchPosts(currentPage);
            }
        });
        timeline.appendChild(prevPage);

        // 投稿内容を追加
        posts.forEach((post) => {
            const postFrame = document.createElement("div");
            postFrame.className = "post-frame";

            postFrame.innerHTML = `
                <div class="post-content">
                    <img src="${post.image_url}" alt="投稿画像" class="post-image">
                    <div class="post-details">
                        <p>${post.caption || "コメントなし"}</p>
                    </div>
                </div>
            `;
            timeline.appendChild(postFrame);
        });

        // 次のページボタン
        const nextPage = document.createElement("div");
        nextPage.className = "pagination-item";
        nextPage.innerHTML = `<button id="next-page" class="pagination-button">次のページ</button>`;
        nextPage.addEventListener("click", () => {
            currentPage++;
            fetchPosts(currentPage);
        });
        timeline.appendChild(nextPage);
    }

    function placeDestinationMarker() {
        if (destinationLat && destinationLng) {
            const destination = { lat: destinationLat, lng: destinationLng };

            if (!destinationMarker) {
                destinationMarker = new google.maps.Marker({
                    position: destination,
                    map: map,
                    title: "目的地",
                    icon: {
                        url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                    },
                });
            } else {
                destinationMarker.setPosition(destination);
            }
        } else {
            console.error("目的地の情報がありません");
        }
    }

    await initializeMap();
    await fetchPosts(currentPage);
});
