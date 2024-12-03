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

        // 日付
        const date = document.createElement("div");
        date.className = "date";
        date.textContent = `日付: ${new Date(activity.recorded_at).toLocaleDateString()}`;

        // 運動内容
        const details = document.createElement("div");
        details.className = "details";

        // 詳細表示
        const formattedDetails = `
            種類: ${activity.activity_type}<br>
            時間: ${activity.duration} 分<br>
            距離: ${activity.distance ? activity.distance.toFixed(2) + " km" : "データなし"}<br>
            カロリー: ${activity.calories_burned.toFixed(1)} kcal
        `;
        details.innerHTML = formattedDetails;

        listItem.appendChild(date);
        listItem.appendChild(details);
        resultsList.appendChild(listItem);
    });
}
