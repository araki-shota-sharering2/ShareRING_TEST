let map;
let currentLocation = { lat: 35.682839, lng: 139.759455 }; // 初期位置 東京
let directionsService, directionsRenderer;
let selectedPlace;
let weatherInfoVisible = false;
let isActionPanelVisible = false;
let isTravelModePanelVisible = false;
let isDetailsPanelVisible = false;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: currentLocation,
    zoom: 15,
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);

  // 地図クリックイベント
  map.addListener("click", (event) => {
    const latLng = event.latLng;
    selectedPlace = { lat: latLng.lat(), lng: latLng.lng() };
    toggleActionButtons(latLng); // latLngオブジェクトをそのまま渡す
  });

  // 現在地取得
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        map.setCenter(currentLocation);

        new google.maps.Marker({
          position: currentLocation,
          map: map,
          title: "Your Location",
        });
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );
  }
  setupButtons();
}

// ボタンのイベント設定
function setupButtons() {
  const routeBtn = document.getElementById("route-btn");
  const infoBtn = document.getElementById("place-info-btn");

  routeBtn.addEventListener("click", () => {
    toggleTravelModeButtons();
  });

  infoBtn.addEventListener("click", () => {
    toggleDetailsPanel();
  });

  document.getElementById("walking-btn").addEventListener("click", () => {
    calculateRoute(google.maps.TravelMode.WALKING);
  });

  document.getElementById("driving-btn").addEventListener("click", () => {
    calculateRoute(google.maps.TravelMode.DRIVING);
  });

  document.getElementById("transit-btn").addEventListener("click", () => {
    calculateRoute(google.maps.TravelMode.TRANSIT);
  });
}

// アクションボタンを表示
function toggleActionButtons(latLng) {
  const actionPanel = document.getElementById("action-panel");
  if (isActionPanelVisible) {
    actionPanel.style.display = "none";
    isActionPanelVisible = false;
  } else {
    actionPanel.style.display = "block";
    isActionPanelVisible = true;
  }
}

function toggleTravelModeButtons() {
  const travelModePanel = document.getElementById("travel-mode-panel");
  if (isTravelModePanelVisible) {
    travelModePanel.style.display = "none";
    isTravelModePanelVisible = false;
  } else {
    travelModePanel.style.display = "block";
    isTravelModePanelVisible = true;
  }
}

function toggleDetailsPanel() {
  const detailsPanel = document.getElementById("details-panel");
  if (isDetailsPanelVisible) {
    detailsPanel.style.display = "none";
    isDetailsPanelVisible = false;
  } else {
    getPlaceDetails(selectedPlace);
    detailsPanel.style.display = "block";
    isDetailsPanelVisible = true;
  }
}

function calculateRoute(mode) {
  if (!selectedPlace) return;

  directionsService.route(
    {
      origin: currentLocation,
      destination: selectedPlace,
      travelMode: mode,
    },
    (result, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(result);
        const routeInfo = document.getElementById("route-info");
        routeInfo.innerHTML = `所要時間: ${result.routes[0].legs[0].duration.text}`;
      } else {
        console.error("Error calculating route:", status);
      }
    }
  );
}

// 詳細情報を表示
function getPlaceDetails(location) {
  const geocoder = new google.maps.Geocoder();
  const service = new google.maps.places.PlacesService(map);

  // クリック位置を逆ジオコーディング
  geocoder.geocode({ location: location }, (results, status) => {
    if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
      const place = results[0]; // 最も一致する場所を取得
      const placeId = place.place_id;

      if (placeId) {

      // 詳細情報を取得
      service.getDetails({ placeId: place.place_id }, (details, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          const detailsPanel = document.getElementById("details-panel");

          const reviewsHtml = details.reviews
            ?.map(
              (review) =>
                `<div class="review">
                  <p>${review.text}</p>
                  <span class="review-author">- ${review.author_name}</span>
                </div>`
            )
            .join("") || "<p>レビューがありません</p>";

          const photosHtml = details.photos
            ?.map(
              (photo) =>
                `<img src="${photo.getUrl()}" alt="Photo of ${details.name}" style="margin: 5px; width: auto; height: auto; max-width: 100%; max-height: 300px;">`
            )
            .join("") || "<p>写真がありません</p>";

          detailsPanel.innerHTML = `
            <h3>${details.name}</h3>
            <p><strong>住所:</strong> ${details.formatted_address}</p>
            <p><strong>評価:</strong> ${details.rating || "評価がありません"}</p>
            <p><strong>レビュー:</strong></p>
            <div class="reviews-container">
            ${reviewsHtml}
            </div>
            <p><strong>写真:</strong></p>
            <div class="photos-container">
            ${photosHtml}
            <div>
          `;
          detailsPanel.style.display = "block";
        } else {
          console.error("Details request failed:", status);
        }
      });
    } else {
      console.error("Nearby search failed:", status);
    }
  } else {
    console.error("Reverse geocoding failed:", status);
    }
  });
}

function displayReviews(reviews) {
  const reviewsContainer = document.getElementById("reviews");
  reviewsContainer.innerHTML = ""; // 既存の内容をクリア

  if (reviews.length === 0) {
    reviewsContainer.innerHTML = "<p>レビューがありません。</p>";
    return;
  }

  reviews.forEach((review) => {
    // カード要素を作成
    const reviewCard = document.createElement("div");
    reviewCard.classList.add("review");

    // レビューテキスト
    const reviewText = document.createElement("p");
    reviewText.textContent = review.text || "内容なし";

    // 投稿者名
    const reviewAuthor = document.createElement("span");
    reviewAuthor.textContent = `- ${review.author_name || "匿名"}`;
    reviewAuthor.classList.add("review-author");

    // レビューをカードに追加
    reviewCard.appendChild(reviewText);
    reviewCard.appendChild(reviewAuthor);

    // レビューをコンテナに追加
    reviewsContainer.appendChild(reviewCard);
  });
}


function toggleMenu() {
  const menuItems = document.getElementById("menuItems");
  if (menuItems.classList.contains("hidden")) {
    menuItems.classList.remove("hidden");
    //menuItems.style.display = "block"; // メニューを表示
  } else {
    menuItems.classList.add("hidden");
    //menuItems.style.display = "none"; // メニューを非表示
  }
}

function getWeather() {
  if (weatherInfoVisible) {
    document.getElementById("weatherInfo").classList.add("hidden");
    weatherInfoVisible = false;
    return;
  }

  const apiKey = "f4086c10fc0c216397a70b5755900c63";
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${currentLocation.lat}&lon=${currentLocation.lng}&appid=${apiKey}&units=metric&lang=ja`
  )
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("location").textContent = `場所: ${data.name}`;
      document.getElementById("temperature").textContent = `気温: ${data.main.temp}°C`;
      document.getElementById("condition").textContent = `天気: ${data.weather[0].description}`;
      document.getElementById("weatherInfo").classList.remove("hidden");
      weatherInfoVisible = true;
    })
    .catch((error) => console.error("Error fetching weather data:", error));
}

function startCamera() {
  const video = document.getElementById("cameraFeed");
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
      video.classList.remove("hidden");
      document.getElementById("captureButton").classList.remove("hidden");
    })
    .catch((error) => console.error("Error accessing camera:", error));
}

function capturePhoto() {
  const video = document.getElementById("cameraFeed");
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  alert("写真が撮影されました！");
  console.log(canvas.toDataURL("image/png"));
}

window.onload = initMap;

function navigateToPostViewing() {
  // post_viewing.html に遷移
  window.location.href = "/post_viewing/post_viewing.html";
}

window.initMap = async function () {
    console.log("MYMAP画面が読み込まれました");

    const mapOptions = {
        center: { lat: 35.6895, lng: 139.6917 }, // 東京
        zoom: 12, // 地図の初期ズームレベル
        mapId: "175ab0da53e477c", // マップID
    };

    // 地図を初期化
    const map = new google.maps.Map(document.getElementById("map"), mapOptions);

    // 現在位置を取得
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                map.setCenter(userLocation);

                // 現在位置を示すマーカーを追加
                new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    title: "現在位置",
                });
            },
            (error) => {
                console.error("現在位置の取得に失敗しました:", error);
            }
        );
    } else {
        console.error("ブラウザが位置情報取得をサポートしていません");
    }

    // サーバーから投稿データを取得
    try {
        const response = await fetch("/mymap-handler", {
            method: "GET",
            credentials: "include", // セッション情報を送信
        });

        if (!response.ok) {
            throw new Error("投稿データの取得に失敗しました");
        }

        const posts = await response.json();

        // 各投稿にカスタム円形マーカーを追加
        posts.forEach((post) => {
            try {
                const location = parseLocation(post.location); // POINT形式をパース

                // カスタムHTML要素を作成
                const markerDiv = document.createElement("div");
                markerDiv.classList.add("custom-marker");
                markerDiv.style.backgroundImage = `url(${post.image_url})`;

                // オーバーレイを作成
                const overlay = new google.maps.OverlayView();
                overlay.onAdd = function () {
                    const layer = this.getPanes().overlayMouseTarget;
                    layer.appendChild(markerDiv);
                };

                overlay.onRemove = function () {
                    markerDiv.parentNode.removeChild(markerDiv);
                };

                overlay.draw = function () {
                    const point = this.getProjection().fromLatLngToDivPixel(new google.maps.LatLng(location));
                    markerDiv.style.left = `${point.x - 25}px`; // 中心を調整
                    markerDiv.style.top = `${point.y - 25}px`; // 中心を調整
                };

                overlay.setMap(map);

                // 情報ウィンドウを作成
                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div class="info-window">
                            <h3>${post.caption || "投稿"}</h3>
                            <p>日時: ${new Date(post.created_at).toLocaleString()}</p>
                            <button class="route-button" onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}', '_blank')">ルート案内</button>
                        </div>
                    `,
                });

                // カスタムマーカーのクリックイベント
                markerDiv.addEventListener("click", () => {
                    // 現在表示中の情報ウィンドウを閉じる
                    if (window.currentInfoWindow) {
                        window.currentInfoWindow.close();
                    }
                    // 新しい情報ウィンドウを開く
                    infoWindow.setPosition(location);
                    infoWindow.open(map);
                    window.currentInfoWindow = infoWindow;
                });
            } catch (error) {
                console.error("位置データのパースに失敗しました:", post.location, error);
            }
        });
    } catch (error) {
        console.error("投稿データの取得に失敗:", error);
    }

    // POINT形式を緯度と経度に変換する関数
    function parseLocation(pointString) {
        const match = pointString.match(/POINT\(([\d.-]+) ([\d.-]+)\)/);
        if (match) {
            return {
                lng: parseFloat(match[1]), // 経度
                lat: parseFloat(match[2]), // 緯度
            };
        }
        throw new Error("無効なPOINT形式のデータです: " + pointString);
    }


};

