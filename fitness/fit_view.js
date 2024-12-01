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
        details.textContent = `種類: ${activity.activity_type} | 時間: ${activity.duration}分 | 距離: ${activity.distance} km | カロリー: ${activity.calories_burned} kcal | 歩数: ${activity.steps}`;

        listItem.appendChild(date);
        listItem.appendChild(details);
        resultsList.appendChild(listItem);
    });
}
