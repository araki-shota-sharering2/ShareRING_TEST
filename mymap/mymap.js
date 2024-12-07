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
  window.location.href = "post_viewing/post_viewing.html";
}
