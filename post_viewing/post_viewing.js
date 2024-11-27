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
