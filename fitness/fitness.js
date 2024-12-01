document.getElementById("health-form").addEventListener("submit", async function (event) {
  event.preventDefault();

  const height = document.getElementById("height").value;
  const weight = document.getElementById("weight").value;

  const response = await fetch("/save-health-info", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({ height, weight }),
  });

  if (response.ok) {
      alert("健康情報が保存されました！");
      // 次の画面に遷移（例: ホーム画面）
      window.location.href = "/home";
  } else {
      alert("エラーが発生しました。再試行してください。");
  }
});
