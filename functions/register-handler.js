export async function onRequestPost(context) {
    const { request, env } = context;
    const db = env.DB;

    try {
        const { username, email, password, profile_image } = await request.json();

        // Web Crypto APIを使用してパスワードをハッシュ化
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        const query = `
            INSERT INTO user_accounts (username, email, password, profile_image)
            VALUES (?, ?, ?, ?);
        `;
        await db.prepare(query).bind(username, email, hashedPassword, profile_image).run();

        return new Response(JSON.stringify({ message: "登録が完了しました！" }), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    } catch (error) {
        console.error('登録エラー:', error);
        return new Response(JSON.stringify({ message: "登録に失敗しました。" }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }
}
