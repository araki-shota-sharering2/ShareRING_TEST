document.addEventListener("DOMContentLoaded", () => {
  const healthInfoDiv = document.getElementById("health-info");
  const healthForm = document.getElementById("health-form");

  // サーバーから健康情報を取得
  fetch("/get_health_info")
      .then(response => {
          if (!response.ok) {
              throw new Error("Failed to fetch health info");
          }
          return response.json();
      })
      .then(data => {
          if (data.height && data.weight) {
              healthInfoDiv.innerHTML = `
                  <p>身長: ${data.height} cm</p>
                  <p>体重: ${data.weight} kg</p>
                  <p>BMI: ${data.bmi.toFixed(1)}</p>
                  <button id="edit-button">編集する</button>
              `;
              document.getElementById("edit-button").addEventListener("click", () => {
                  healthInfoDiv.classList.add("hidden");
                  healthForm.classList.remove("hidden");
                  document.getElementById("height").value = data.height;
                  document.getElementById("weight").value = data.weight;
              });
          } else {
              healthInfoDiv.innerHTML = "<p>健康情報が未登録です。</p>";
              healthForm.classList.remove("hidden");
          }
      })
      .catch(error => {
          console.error("Error fetching health info:", error);
      });

  // 健康情報を保存
  healthForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const height = document.getElementById("height").value;
      const weight = document.getElementById("weight").value;

      fetch("/save_health_info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ height, weight }),
      })
          .then(response => {
              if (!response.ok) {
                  throw new Error("Failed to save health info");
              }
              return response.json();
          })
          .then(data => {
              if (data.success) {
                  alert("健康情報を保存しました！");
                  location.reload();
              } else {
                  alert("保存に失敗しました。");
              }
          })
          .catch(error => {
              console.error("Error saving health info:", error);
          });
  });
});
