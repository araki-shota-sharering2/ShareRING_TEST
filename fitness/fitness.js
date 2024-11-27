let map; // Google Map オブジェクト
let path = []; // 軌跡を保持する配列
let polyline; // 地図上のポリライン
let watchId; // Geolocation API のウォッチ ID
let totalDistance = 0; // 合計距離 (km)
let lastPosition = null; // 前回の位置
let exerciseType = "running"; // 運動タイプ
//let exerciseType2 = "walking"
let weight = 0; // 体重 (kg)


document.addEventListener("DOMContentLoaded", function() {
    console.log("ホーム画面が読み込まれました");

    // 現在のURLに基づいてフッターリンクを強調
    const path = window.location.pathname;
    const footerLinks = document.querySelectorAll("footer a");

    footerLinks.forEach(link => {
        if (link.getAttribute("href") === path) {
            link.classList.add("active");
        }
    });

    function initMap() {
        map = new google.maps.Map(document.getElementById("map"), {
          center: { lat: 35.6895, lng: 139.6917 }, // 東京の初期位置
          zoom: 15,
        });
      
        polyline = new google.maps.Polyline({
          path: path,
          geodesic: true,
          strokeColor: "#FF0000",
          strokeOpacity: 1.0,
          strokeWeight: 3,
        });
      
        polyline.setMap(map);
      }

      function calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // 地球の半径 (km)
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      }

      // 距離計算 (Haversine 方式)
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // 地球の半径 (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  // 消費カロリー計算
  function calculateCalories() {
    if (!weight || totalDistance <= 0) {
      alert("体重を入力し、運動してください。");
      return;
    }
  
    let calories = 0;
    if (exerciseType === "running") {
      // ランニング: 体重 (kg) × 距離 (km) × 1.036
      calories = (weight * totalDistance * 1.036).toFixed(2);
    } else if (exerciseType === "walking") {
      // ウォーキング: 体重 (kg) × 距離 (km) × 0.57
      calories = (weight * totalDistance * 0.57).toFixed(2);
    }
  
    document.getElementById("caloriesResult").textContent = `消費カロリー: ${calories} kcal`;
  }
  
  // 位置情報をリアルタイムで取得
  function startTracking() {
    weight = parseFloat(document.getElementById("weight").value);
    exerciseType = document.getElementById("exerciseType").value;
  
    if (!weight || weight <= 0) {
      alert("正しい体重を入力してください。");
      return;
    }
  
    if (!navigator.geolocation) {
      alert("このブラウザでは位置情報がサポートされていません。");
      return;
    }
  
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const newLatLng = { lat, lng };
  
        if (lastPosition) {
          const distance = calculateDistance(
            lastPosition.lat,
            lastPosition.lng,
            lat,
            lng
          );
          totalDistance += distance;
        }
  
        lastPosition = newLatLng;
        path.push(newLatLng);
        polyline.setPath(path);
        map.setCenter(newLatLng);
      },
      (error) => {
        console.error("位置情報取得エラー:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );
  
    console.log("トラッキングを開始しました。");
  }
  
  // トラッキング停止
  function stopTracking() {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
      console.log("トラッキングを終了しました。");
      calculateCalories(); // 終了時にカロリー計算
    }
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    initMap();
  
    document.getElementById("startTracking").addEventListener("click", startTracking);
    document.getElementById("stopTracking").addEventListener("click", stopTracking);
  });
  
  
  
  
  
  
  
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("bmiButton").addEventListener("click", calculateBMI);
    document.getElementById("caloriesButton").addEventListener("click", calculateCalories);
  
    // 星の生成
    createStars();
  });

    function calculateBMI() {
  const height = parseFloat(document.getElementById("height").value) / 100; // 身長をメートルに変換
  const weight = parseFloat(document.getElementById("weight").value);

  if (isNaN(height) || isNaN(weight) || height <= 0 || weight <= 0) {
    alert("正しい身長と体重を入力してください。");
    return;
  }

  const bmi = (weight / (height * height)).toFixed(2);
  document.getElementById("bmiResult").textContent = `BMI: ${bmi}`;
}
    function calculateCalories() {
  const weight = parseFloat(document.getElementById("weight").value); // 体重
  const exerciseType = document.getElementById("exerciseType").value; // 運動タイプ
  const exerciseTime = parseFloat(document.getElementById("exerciseTime").value); // 運動時間（分）

      

    // 星をランダムに配置
    const body = document.querySelector('body');
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        star.style.top = Math.random() * 100 + 'vh';
        star.style.left = Math.random() * 100 + 'vw';
        star.style.animationDuration = (Math.random() * 2 + 1) + 's';
        body.appendChild(star);
    }
});
