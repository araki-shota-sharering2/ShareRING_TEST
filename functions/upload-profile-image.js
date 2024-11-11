export async function onRequestPost(context) {
    const { request, env } = context;
    const cookieHeader = request.headers.get("Cookie");
    const cookies = new Map(cookieHeader?.split("; ").map(c => c.split("=")));
    const sessionId = cookies.get("session_id");

    if (!sessionId) {
        return new Response("Unauthorized", { status: 401 });
    }

    const session = await env.DB.prepare(`
        SELECT user_id, profile_image FROM user_accounts 
        JOIN user_sessions ON user_accounts.user_id = user_sessions.user_id 
        WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
    `).bind(sessionId).first();

    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
        return new Response("No file uploaded", { status: 400 });
    }

    try {
        if (session.profile_image) {
            await env.R2_BUCKET.delete(session.profile_image.replace(/^.+\/([^/]+)$/, '$1'));
        }

        const newFileName = `profile_images/${session.user_id}-${Date.now()}`;
        await env.R2_BUCKET.put(newFileName, file.stream(), {
            httpMetadata: { contentType: file.type }
        });

        const newImageUrl = `${env.R2_PUBLIC_URL}/${newFileName}`;

        await env.DB.prepare(`
            UPDATE user_accounts SET profile_image = ? WHERE user_id = ?
        `).bind(newImageUrl, session.user_id).run();

        return new Response(JSON.stringify({ newImageUrl }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("エラー:", error);
        return new Response("画像のアップロードに失敗しました", { status: 500 });
    }
}
