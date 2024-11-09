document.getElementById("registrationForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const profileImage = document.getElementById("profile_image").value;

    try {
        const response = await fetch("/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password, profileImage })
        });

        if (!response.ok) {
            throw new Error(`HTTPエラー: ${response.status}`);
        }

        const result = await response.json();
        document.getElementById("message").innerText = result.message;
    } catch (error) {
        console.error("リクエストエラー:", error);
        document.getElementById("message").innerText = "登録に失敗しました。もう一度お試しください。";
    }
});
