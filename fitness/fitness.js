async function fetchFitnessData() {
  try {
      const response = await fetch('../functions/handler.js'); // エンドポイントを適宜変更
      if (!response.ok) {
          throw new Error('データの取得に失敗しました');
      }
      //  Jsondata1no、〇ってバツがあるよ
      const data = await response.text(html);
      console.log('フィットネスデータ:', data);
      displayFitnessData(data); // 取得したデータを表示する関数
  } catch (error) {
      console.error('エラー:', error);
  }
}
 
function displayFitnessData(data) {
  // 画面にデータを表示する処理をここに追加
  const dataContainer = document.getElementById('fitness-data');
  dataContainer.innerHTML = JSON.stringify(data, null, 2);
}
 
document.addEventListener('DOMContentLoaded', fetchFitnessData);
 
 
 
 
 
let map; // Google Map オブジェクト
let path = []; // 軌跡を保持する配列
let polyline; // 地図上のポリライン
let watchId; // Geolocation API のウォッチ ID
let starttime;
let totalDistance = 0; // 合計距離 (km)
let lastPosition = null; // 前回の位置
let exerciseType = "running"; // 運動タイプ
//let exerciseType2 = "walking"
let weight = 0; // 体重 (kg)
 
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 35.6895, lng: 139.6917 }, // 東京の初期位置
    zoom: 15,
  }),
 
 
 
window.onload = function() {
    console.log("ホーム画面が読み込まれました");
 
    // 現在のURLに基づいてフッターリンクを強調
    const path = window.location.pathname;
    const footerLinks = document.querySelectorAll("footer a");
 
    footerLinks.forEach(link => {
        if (link.getAttribute("href") === path) {
            link.classList.add("active");
        }
    });
 
   
     
        polyline = new google.maps.Polyline({
          path: path,
          geodesic: true,
          strokeColor: "#FF0000",
          strokeOpacity: 1.0,
          strokeWeight: 3,
        });
     
        polyline.setMap(map);
      };
 
     
 
      // 距離計算 (Haversine 方式)
      async function calculateDistance(lat, lon, destination) {
        // ここでGoogle Maps APIや他の地図APIを使用して距離を計算
        return { distance: 5.0, route: "サンプルルート" }; // 仮の値
    }
 
  // 消費カロリー計算
 
 
function isArrived(lat, lon, destination) {
  // 簡易的な距離判定ロジック
  return lat.toFixed(3) === destination.lat.toFixed(3) && lon.toFixed(3) === destination.lon.toFixed(3);
}
 
 
 
  // 位置情報をリアルタイムで取得
  function startTracking() {
    const destination = document.getElementById('destination').value;
    if (!destination) {
      alert('目的地を入力してください。');
      return;
  }
 
  startTime = new Date();
 
 
 
 
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        position => trackPosition(position, destination),
        error => console.error('位置情報エラー:', error),
        { enableHighAccuracy: true }
    );
} else {
    alert('位置情報を取得できる環境ではありません。');
}
 
    }
 
    function trackPosition(position, destination) {
      const { latitude, longitude } = position.coords;
 
      // 目的地までの距離を計算する（仮: Google Maps APIを使用）
      calculateDistance(latitude, longitude, destination).then(({ distance, route }) => {
          document.getElementById('route-info').innerText = `距離: ${distance} km\nルート: ${route}`;
 
          if (isArrived(latitude, longitude, destination)) {
              navigator.geolocation.clearWatch(watchId);
              const endTime = new Date();
              const timeSpent = (endTime - startTime) / 1000 / 60; // 分単位
              const caloriesBurned = calculateCaloriesBurned(distance, timeSpent);
              alert(`到着しました！\n移動時間: ${timeSpent.toFixed(2)} 分\n消費カロリー: ${caloriesBurned.toFixed(2)} kcal`);
          }
      });
  }
 
  let polyline = new google.maps.Polyline({
    path: [],
    geodesic: true,
    strokeColor: "#FF0000",
    strokeOpacity:1.0,
    strokeWeight: 3,
 
  });
 
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
 
      lastPosition = newLatLng; // この行をコメントアウトしない
      path.push(newLatLng); // 初期化されずに追加され続ける
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
 
  async function calculateAndSaveBMI() {
    const height = parseFloat(document.getElementById("height").value) / 100; // 身長をメートルに変換
    const weight = parseFloat(document.getElementById("weight").value);
 
    //if (isNaN(height) || isNaN(weight) || height <= 0 || weight <= 0) {
      if (isNaN(height) || isNaN(weight) || height <= 0 || weight <= 0) {
        alert("正しい身長と体重を入力してください。");
        return;
    }
 
    const bmi = weight / ((height / 100) * (height/100));
    document.getElementById("bmiResult").textContent = `BMI: ${bmi.toFixed(2)}`;
}
 
function calculateBMI(weight,height){
  return weight / ((height / 100) * (height / 100));
}
     
 
 
  document.addEventListener("DOMContentLoaded",() => {
    initMap();
    document.getElementById("bmiButton").addEventListener("click", calculateBMI);
    document.getElementById("caloriesButton").addEventListener("click", calculateCalories);
});
 
 
 
 
     
   
    function calculateCaloriesBurned(distance, timeSpent) {
      const MET = 3.5; // 仮のMET値 (ウォーキング)
      const weight = parseFloat(document.getElementById('weight').value);
      return (MET * 3.5 * weight * timeSpent) / 200;
 
 
}
    async function calculateCalories() {
      const height = parseFloat(document.getElementById("height").value); // 身長
  const weight = parseFloat(document.getElementById("weight").value); // 体重
  const exerciseType = document.getElementById("exerciseType").value; // 運動タイプ
  const exerciseTime = parseFloat(document.getElementById("exerciseTime").value); // 運動時間（分）
 
 
 
     
  if(isNaN(height) || isNaN(weight)){
    alert("正しい身長と体重を入力してください。");
    return;
  }
 
  const bmi = weight / ((height /100) *(height/100));
  alert(`計算されたBMI: ${bmi.toFixed(2)}`);
 
  //document.getElementById("bmiResult").textContent = `BMI: ${bmi}`;
  try{
    const response = await fetch('/api/save-bmi',{
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ height, weight,bmi })
    });
 
    if (!response.ok) throw new Error('BMIデータの保存に失敗しました');
        alert('BMIデータが保存されました！');
  }catch (error) {
    console.error('エラー:', error);
    alert('データ保存中にエラーが発生しました。');
}
 
 
let MET;
switch (exerciseType) {
    case "walking":
        MET = 3.5;
        break;
    case "running":
        MET = 7.5;
        break;
    case "cycling":
        MET = 6.0;
        break;
    default:
        MET = 3.0; // デフォルトのMET値
    }  
   
    function calculateCaloriesBurned(distance, timeSpent) {
      const MET = 3.5; // 仮のMET値 (ウォーキング)
      const weight = parseFloat(document.getElementById('weight').value);
      return (MET * 3.5 * weight * timeSpent) / 200;
  }
 
  const caloriesBurned = (MET * weight * exerciseTime) / 60;
  alert(`消費カロリーは約 ${caloriesBurned.toFixed(2)} kcal です。`);
 
  // 結果を画面に表示
  document.getElementById("caloriesResult").textContent = `消費カロリー: ${caloriesBurned.toFixed(2)} kcal`;
}
     
 
    // 星をランダムに配置
    function createStars(){
    const body = document.querySelector('body');
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        star.style.top = Math.random() * 100 + 'vh';
        star.style.left = Math.random() * 100 + 'vw';
        star.style.animationDuration = (Math.random() * 2 + 1) + 's';
        body.appendChild(star);
    }
    }
 