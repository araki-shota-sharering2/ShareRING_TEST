export async function onRequestPost(context) {
    const db = context.env.DB;
    const apiToken = context.env.R2_API_TOKEN;
    const bucketUrl = context.env.R2_BUCKET_URL.replace(/\/$/, '');

    console.log("処理を開始しました");  // 開始ログ

    try {
        const formData = await context.request.formData();
        const file = formData.get('file');
        const id = context.request.headers.get('X-Photo-ID');

        if (!file) {
            console.error("ファイルが見つかりません");
            return new Response('ファイルが必要です', { status: 400 });
        }

        if (!id) {
            console.error("IDが見つかりません");
            return new Response('IDが必要です', { status: 400 });
        }

        const key = `uploads/${Date.now()}_${encodeURIComponent(file.name)}`;
        const uploadUrl = `${bucketUrl}/${key}`;
        console.log("アップロードURL:", uploadUrl);  // URL確認ログ

        // R2にファイルをアップロード
        const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': file.type,
            },
            body: file.stream()
        });

        if (!uploadResponse.ok) {
            console.error("R2へのファイルアップロードに失敗しました", uploadResponse.status, await uploadResponse.text());
            throw new Error("R2へのファイルアップロードに失敗しました");
        }

        const imageUrl = uploadUrl;
        console.log("画像URL:", imageUrl);  // 画像URL確認ログ

        await db.prepare('INSERT INTO photo (id, url) VALUES (?, ?)').bind(id, imageUrl).run();
        console.log("データベースにURLを保存しました");  // DB保存確認ログ

        return new Response('画像が正常にアップロードされ、URLが保存されました', {
            status: 200,
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    } catch (error) {
        console.error('画像アップロードエラー:', error);
        return new Response(`画像アップロードエラー: ${error.message}`, {
            status: 500,
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    }
}
