// トークンが有効か確認する関数
async function checkLogin() {
    const cookies = document.cookie.split('; ');
    const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
    const token = tokenCookie ? tokenCookie.split('=')[1] : null;

    if (token) {
        try {
            // サーバーにトークンの有効性を確認
            const response = await fetch('/functions/verify-token', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                // トークンが無効ならログインページにリダイレクト
                window.location.href = '/login/login.html';
            }
        } catch (error) {
            console.error('トークン確認エラー:', error);
            window.location.href = '/login/login.html';
        }
    } else {
        // トークンが存在しない場合、ログインページにリダイレクト
        window.location.href = '/login/login.html';
    }
}

// ページ読み込み時にログイン状態を確認
window.onload = checkLogin;
