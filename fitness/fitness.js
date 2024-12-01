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
  });
  
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
  