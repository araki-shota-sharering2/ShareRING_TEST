// トークンが有効か確認する関数
async function checkLogin() {
    const cookies = document.cookie.split('; ');
    const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
    const token = tokenCookie ? tokenCookie.split('=')[1] : null;

    if (token) {
        try {
            const response = await fetch('/functions/verify-token', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                console.warn('無効なトークン。ログインページにリダイレクトします。');
                window.location.href = '/login/login.html';
            }
        } catch (error) {
            console.error('トークン確認エラー:', error);
            window.location.href = '/login/login.html';
        }
    } else {
        console.warn('トークンがありません。ログインページにリダイレクトします。');
        window.location.href = '/login/login.html';
    }
}

// ページ読み込み時にログイン状態を確認
window.onload = checkLogin;
