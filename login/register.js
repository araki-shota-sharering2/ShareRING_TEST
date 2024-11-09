// 登録フォームの送信時に実行するイベントリスナーを設定
document.getElementById("registrationForm").addEventListener("submit", async function (event) {
    // フォームのデフォルトの送信動作を無効化
    event.preventDefault();

    // ユーザーが入力した値を取得
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const profileImage = document.getElementById("profile_image").value;

    try {
        // `/register` エンドポイントにPOSTリクエストを送信
        const response = await fetch("/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password, profileImage }) // JSON形式でデータを送信
        });

        // レスポンスが正常でない場合はエラーをスロー
        if (!response.ok) {
            throw new Error(`HTTPエラー: ${response.status}`);
        }

        // サーバーからのレスポンスをJSONとして取得し、メッセージを表示
        const result = await response.json();
        document.getElementById("message").innerText = result.message;
    } catch (error) {
        // エラーハンドリング：エラーが発生した場合のメッセージを表示
        console.error("リクエストエラー:", error);
        document.getElementById("message").innerText = "登録に失敗しました。もう一度お試しください。";
    }
});
