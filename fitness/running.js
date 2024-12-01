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
    const initialPosition = { lat: 35.681236, lng: 139.767125 }; // 初期位置（例: 東京駅）

    map = new google.maps.Map(document.getElementById("map"), {
        center: initialPosition,
        zoom: 15,
        disableDefaultUI: true, // UI要素を非表示にしてシンプルに
    });

    marker = new google.maps.Marker({
        position: initialPosition,
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
        distance,
        calories,
        averagePace: calculateAveragePace(),
        route: pathCoordinates,
    };

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
