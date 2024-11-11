// ログアウトボタンのクリックイベントを設定
document.getElementById('logout-button').addEventListener('click', async () => {
    try {
        const response = await fetch('/logout', {
            method: 'POST',
            credentials: 'include' // クッキーを含める
        });

        if (response.ok) {
            // ログアウト成功後にログインページにリダイレクト
            window.location.href = '/login.html';
        } else {
            console.error("ログアウトに失敗しました");
        }
    } catch (error) {
        console.error("エラーが発生しました:", error);
    }
});
