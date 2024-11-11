// トークンが有効か確認する関数
async function checkLogin() {
    const cookies = document.cookie.split('; ');
    const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
    const token = tokenCookie ? tokenCookie.split('=')[1] : null;

    if (token) {
        try {
            // サーバーにトークンの有効性を確認（例: /auth/verify-token）
            const response = await fetch('/functions/verify-token', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                window.location.href = '/login/login.html';
            }
        } catch (error) {
            console.error('トークン確認エラー:', error);
            window.location.href = '/login/login.html';
        }
    } else {
        window.location.href = '/login/login.html';
    }
}

// ページ読み込み時にログイン状態を確認
window.onload = checkLogin;
