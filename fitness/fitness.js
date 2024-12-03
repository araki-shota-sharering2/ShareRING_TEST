document.addEventListener("DOMContentLoaded", async () => {
  // 星をランダムに配置
  const body = document.querySelector("body");
  for (let i = 0; i < 100; i++) {
      const star = document.createElement("div");
      star.classList.add("star");
      star.style.top = Math.random() * 100 + "vh";
      star.style.left = Math.random() * 100 + "vw";
      star.style.animationDuration = Math.random() * 2 + 1 + "s";
      body.appendChild(star);
  }

  // 健康情報を取得しフォームに反映
  try {
      const response = await fetch("/get-health-info", { method: "GET" });
      if (response.ok) {
          const { height, weight } = await response.json();
          if (height) document.getElementById("height").value = height;
          if (weight) document.getElementById("weight").value = weight;
      }
  } catch (error) {
      console.error("健康情報取得エラー:", error);
  }

  // 運動結果一覧を取得
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

// 健康情報の保存処理
document.getElementById("health-form").addEventListener("submit", async function (event) {
  event.preventDefault();

  const height = document.getElementById("height").value;
  const weight = document.getElementById("weight").value;

  try {
      const response = await fetch("/save-health-info", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ height, weight }),
      });

      const result = await response.json();

      if (response.ok) {
          document.getElementById("response-message").textContent = "健康情報が保存されました！";
      } else {
          console.error("サーバーエラー:", result);
          document.getElementById("response-message").textContent = `エラー: ${result.message}`;
      }
  } catch (error) {
      console.error("クライアントエラー:", error);
      document.getElementById("response-message").textContent = "送信中にエラーが発生しました。";
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

// 運動結果のサマリーを表示
function displaySummary(activities) {
  const totalCalories = activities.reduce((sum, a) => sum + a.calories_burned, 0).toFixed(1);
  const totalDistance = activities.reduce((sum, a) => sum + (a.distance || 0), 0).toFixed(2);
  const totalDuration = activities.reduce((sum, a) => sum + parseDuration(a.duration), 0);

  document.getElementById("total-calories").textContent = `${totalCalories} kcal`;
  document.getElementById("total-distance").textContent = `${totalDistance} km`;
  document.getElementById("total-duration").textContent = formatDuration(totalDuration);
}

// 詳細ボタンの設定
function setupDetailsButton(activities) {
  const detailsButton = document.getElementById("details-button");
  detailsButton.addEventListener("click", () => {
      const resultsContainer = document.querySelector(".results-container");
      resultsContainer.style.display = "block";
      detailsButton.style.display = "none";
      displayActivities(activities);
  });
}

// 運動結果リストの表示
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
