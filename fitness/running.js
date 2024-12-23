let map;
let marker;
let watchId;
let timerInterval;
let startTime;
let distance = 0;
let calories = 0;
let isRunning = false;
let pathCoordinates = [];
let polyline;

function initMap() {
    // 現在位置を取得
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const initialPosition = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                // 地図の初期化
                map = new google.maps.Map(document.getElementById("map"), {
                    center: initialPosition,
                    zoom: 15,
                });

                // 現在位置にマーカーを配置
                marker = new google.maps.Marker({
                    position: initialPosition,
                    map: map,
                });

                // ポリラインを初期化
                polyline = new google.maps.Polyline({
                    path: pathCoordinates,
                    geodesic: true,
                    strokeColor: "#FF0000",
                    strokeOpacity: 1.0,
                    strokeWeight: 3,
                });
                polyline.setMap(map);
            },
            (error) => {
                console.error("現在位置を取得できませんでした:", error);
                alert("現在位置を取得できませんでした。初期位置は東京駅になります。");
                // エラー時の初期位置（東京駅）
                const fallbackPosition = { lat: 35.681236, lng: 139.767125 };

                map = new google.maps.Map(document.getElementById("map"), {
                    center: fallbackPosition,
                    zoom: 15,
                });

                marker = new google.maps.Marker({
                    position: fallbackPosition,
                    map: map,
                });

                polyline = new google.maps.Polyline({
                    path: pathCoordinates,
                    geodesic: true,
                    strokeColor: "#FF0000",
                    strokeOpacity: 1.0,
                    strokeWeight: 3,
                });
                polyline.setMap(map);
            }
        );
    } else {
        alert("位置情報が利用できません。");
    }
}

document.getElementById("start-button").addEventListener("click", () => {
    startTime = new Date();
    isRunning = true;
    startTimer();
    startTracking();
    document.getElementById("start-button").disabled = true;
    document.getElementById("stop-button").disabled = false;
});

document.getElementById("stop-button").addEventListener("click", async () => {
    isRunning = false;
    clearInterval(timerInterval);
    stopTracking();
    document.getElementById("start-button").disabled = false;
    document.getElementById("stop-button").disabled = true;

    try {
        const success = await saveRunningData();
        if (success) {
            alert("運動お疲れさまでした！今の風景をみんなにシェアしましょう！");
            resetStats();
            window.location.href = "/post_creation/search_place.html";
        } else {
            alert("データ保存中にエラーが発生しました。もう一度お試しください。");
        }
    } catch (error) {
        console.error("ランニングデータ保存中のエラー:", error);
        alert("エラーが発生しました。インターネット接続を確認してください。");
    }
});

function startTimer() {
    timerInterval = setInterval(() => {
        const elapsed = new Date() - startTime;
        const hours = Math.floor(elapsed / (1000 * 60 * 60));
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
        document.querySelector(".timer").textContent = `${hours
            .toString()
            .padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

        if (isRunning) updateStats();
    }, 1000);
}

function startTracking() {
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const currentPosition = { lat: latitude, lng: longitude };

                map.setCenter(currentPosition);
                marker.setPosition(currentPosition);

                pathCoordinates.push(currentPosition);
                polyline.setPath(pathCoordinates);

                if (isRunning && pathCoordinates.length > 1) {
                    const previousPosition =
                        pathCoordinates[pathCoordinates.length - 2];
                    distance += calculateDistance(previousPosition, currentPosition);
                    calories = calculateCalories(distance);
                    updateStats();
                }
            },
            (error) => {
                console.error("現在位置取得エラー:", error);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000,
            }
        );
    } else {
        alert("位置情報を利用できません。");
    }
}

function stopTracking() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
    }
}

function resetStats() {
    distance = 0;
    calories = 0;
    pathCoordinates = [];
    if (polyline) polyline.setPath([]);
    document.querySelector(".timer").textContent = "00:00:00";
    document.querySelector(".stats .stat:nth-child(1) .value").textContent = "0.00";
    document.querySelector(".stats .stat:nth-child(2) .value").textContent = "0";
    document.querySelector(".stats .stat:nth-child(3) .value").textContent = "00:00";
}

function calculateDistance(prevPosition, currentPosition) {
    const R = 6371; // 地球の半径 (km)
    const dLat = ((currentPosition.lat - prevPosition.lat) * Math.PI) / 180;
    const dLng = ((currentPosition.lng - prevPosition.lng) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((prevPosition.lat * Math.PI) / 180) *
            Math.cos((currentPosition.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // 距離 (km)
}

function calculateCalories(distance) {
    const weight = 60; // 例: 体重60kg
    return Math.round(distance * weight * 1.036);
}

function calculateAveragePace() {
    const elapsedTime = new Date() - startTime; // ミリ秒単位
    const elapsedMinutes = elapsedTime / (1000 * 60); // 分単位に変換

    if (distance > 0) {
        const pace = elapsedMinutes / distance; // 分/km
        const minutes = Math.floor(pace);
        const seconds = Math.round((pace - minutes) * 60);
        return `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;
    } else {
        return "00:00";
    }
}

function updateStats() {
    document.querySelector(".stats .stat:nth-child(1) .value").textContent =
        distance.toFixed(2);
    document.querySelector(".stats .stat:nth-child(2) .value").textContent =
        calories;
    document.querySelector(".stats .stat:nth-child(3) .value").textContent =
        calculateAveragePace();
}

async function saveRunningData() {
    const data = {
        duration: document.querySelector(".timer").textContent,
        distance: distance.toFixed(2),
        calories,
        averagePace: calculateAveragePace(),
        route: pathCoordinates,
    };

    // ローカルストレージに保存
    localStorage.setItem("runningData", JSON.stringify(data));

    try {
        const response = await fetch("/save-running-data", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        return response.ok;
    } catch (error) {
        console.error("データ送信エラー:", error);
        return false;
    }
}

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
