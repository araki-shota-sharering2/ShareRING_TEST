let map;
let marker;
let watchId;
let timerInterval;
let startTime;
let distance = 0;
let calories = 0;
let isRunning = false;

function initMap() {
    const initialPosition = { lat: 35.681236, lng: 139.767125 };
    map = new google.maps.Map(document.getElementById("map"), {
        center: initialPosition,
        zoom: 15,
    });
    marker = new google.maps.Marker({
        position: initialPosition,
        map: map,
    });
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
    await sendRunningData();
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

                if (isRunning) {
                    distance += calculateDistance(
                        marker.getPosition(),
                        currentPosition
                    );
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

function calculateDistance(prevPosition, currentPosition) {
    const R = 6371; // 地球の半径 (km)
    const dLat = ((currentPosition.lat - prevPosition.lat()) * Math.PI) / 180;
    const dLng = ((currentPosition.lng - prevPosition.lng()) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((prevPosition.lat() * Math.PI) / 180) *
            Math.cos((currentPosition.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function calculateCalories(distance) {
    const weight = 60; // 例: 体重60kg
    return Math.round(distance * weight * 1.036);
}

function updateStats() {
    document.querySelector(".stats .stat:nth-child(1) .value").textContent =
        distance.toFixed(2);
    document.querySelector(".stats .stat:nth-child(2) .value").textContent =
        calories;
}

async function sendRunningData() {
    const data = {
        duration: document.querySelector(".timer").textContent,
        distance,
        calories,
    };

    try {
        const response = await fetch("/save-running-data", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            alert("ランニングデータが保存されました！");
        } else {
            alert("データ保存に失敗しました。");
        }
    } catch (error) {
        console.error("データ送信エラー:", error);
        alert("データ送信中にエラーが発生しました。");
    }
}
