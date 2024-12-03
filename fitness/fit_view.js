document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("/get-fitness-activities");
        if (response.ok) {
            const activities = await response.json();
            displayActivities(activities);
        } else {
            console.error("データ取得エラー:", response.status);
        }
    } catch (error) {
        console.error("通信エラー:", error);
    }
});

function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}時間${remainingMinutes}分`;
}

function displayActivities(activities) {
    const totalCalories = activities.reduce((sum, a) => sum + a.calories_burned, 0).toFixed(1);
    const totalDistance = activities.reduce((sum, a) => sum + (a.distance || 0), 0).toFixed(2);
    const totalDuration = activities.reduce((sum, a) => sum + a.duration, 0);

    document.getElementById("total-calories").textContent = `${totalCalories} kcal`;
    document.getElementById("total-distance").textContent = `${totalDistance} km`;
    document.getElementById("total-duration").textContent = formatDuration(totalDuration);

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
            時間: ${formatDuration(activity.duration)}<br>
            距離: ${activity.distance ? activity.distance.toFixed(2) + " km" : "データなし"}<br>
            カロリー: ${activity.calories_burned.toFixed(1)} kcal
        `;

        listItem.appendChild(date);
        listItem.appendChild(details);
        resultsList.appendChild(listItem);
    });
}
