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
