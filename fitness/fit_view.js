document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("/get-fitness-activities");
        if (response.ok) {
            const activities = await response.json();
            displaySummary(activities);
            setupDetailsButton(activities);
        } else {
            console.error("データ取得エラー:", response.status);
        }
    } catch (error) {
        console.error("通信エラー:", error);
    }
});

// hh:mm:ss を分単位に変換する関数
function parseDuration(duration) {
    const [hours, minutes, seconds] = duration.split(":").map(Number);
    return hours * 60 + minutes + seconds / 60; // 分単位に変換
}

// 分を hh:mm:ss に戻す関数（表示用）
function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.floor(minutes % 60);
    const seconds = Math.round((minutes % 1) * 60);
    return `${hours}時間${remainingMinutes}分${seconds}秒`;
}

function displaySummary(activities) {
    const totalCalories = activities.reduce((sum, a) => sum + a.calories_burned, 0).toFixed(1);
    const totalDistance = activities.reduce((sum, a) => sum + (a.distance || 0), 0).toFixed(2);
    const totalDuration = activities.reduce((sum, a) => sum + parseDuration(a.duration), 0);

    document.getElementById("total-calories").textContent = `${totalCalories} kcal`;
    document.getElementById("total-distance").textContent = `${totalDistance} km`;
    document.getElementById("total-duration").textContent = formatDuration(totalDuration);
}

function setupDetailsButton(activities) {
    const detailsButton = document.getElementById("details-button");
    detailsButton.addEventListener("click", () => {
        const resultsContainer = document.querySelector(".results-container");
        resultsContainer.style.display = "block";
        detailsButton.style.display = "none";
        displayActivities(activities);
    });
}

function displayActivities(activities) {
    const resultsList = document.getElementById("results-list");
    resultsList.innerHTML = "";

    activities.forEach((activity) => {
        const listItem = document.createElement("li");

        const date = document.createElement("div");
        date.className = "date";
        date.textContent = `日付: ${new Date(activity.recorded_at).toLocaleDateString()}`;

        const details = document.createElement("div");
        details.className = "details";
        details.innerHTML = `
            種類: ${activity.activity_type}<br>
            時間: ${formatDuration(parseDuration(activity.duration))}<br>
            距離: ${activity.distance ? activity.distance.toFixed(2) + " km" : "データなし"}<br>
            カロリー: ${activity.calories_burned.toFixed(1)} kcal
        `;

        listItem.appendChild(date);
        listItem.appendChild(details);
        resultsList.appendChild(listItem);
    });
}
