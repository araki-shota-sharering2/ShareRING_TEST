export async function onRequestPost(context) {
    const { env, request } = context;

    try {
        // クッキーからセッションIDを取得
        const cookieHeader = request.headers.get("Cookie");
        const cookies = Object.fromEntries(
            cookieHeader.split("; ").map((c) => c.split("=").map(decodeURIComponent))
        );
        const sessionId = cookies.session_id;

        if (!sessionId) {
            return new Response(JSON.stringify({ message: "セッションIDがありません。" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // セッションからユーザーIDを取得
        const session = await env.DB.prepare(
            "SELECT user_id FROM user_sessions WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP"
        )
            .bind(sessionId)
            .first();

        if (!session) {
            return new Response(JSON.stringify({ message: "セッションが無効または期限切れです。" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        const userId = session.user_id;

        // フォームデータの取得
        const formData = await request.formData();
        const groupName = formData.get("groupName");
        const description = formData.get("description");
        const groupImage = formData.get("groupImage");

        if (!groupName || !groupImage) {
            return new Response(JSON.stringify({ message: "グループ名と画像は必須です" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // 画像をCloudflare R2にアップロード
        const timestamp = Date.now();
        const uniqueFileName = `group-${timestamp}-${groupImage.name}`;
        const r2Key = `group_images/${uniqueFileName}`;

        await env.MY_R2_BUCKET.put(r2Key, groupImage.stream(), {
            headers: { "Content-Type": groupImage.type },
        });

        // pub- から始まるURLを生成
        const groupImageUrl = `https://pub-ae948fe5f8c746a298df11804f9d8839.r2.dev/${r2Key}`;

        // データベースにグループ情報を保存
        const createGroupQuery = `
            INSERT INTO user_groups (group_name, description, group_image_url, created_by)
            VALUES (?, ?, ?, ?)
        `;
        const result = await env.DB.prepare(createGroupQuery)
            .bind(groupName, description, groupImageUrl, userId)
            .run();

        const groupId = result.lastInsertRowId;

        // 作成者をグループメンバーとして追加
        const addMemberQuery = `
            INSERT INTO user_group_members (group_id, user_id)
            VALUES (?, ?)
        `;
        await env.DB.prepare(addMemberQuery).bind(groupId, userId).run();

        return new Response(JSON.stringify({ message: "グループが正常に作成されました", groupId }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("グループ作成エラー:", error);
        return new Response(JSON.stringify({ message: "グループ作成に失敗しました", error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export async function onRequestGet(context) {
    const { env } = context;

    try {
        // 現在ログインしているユーザーのセッションIDを取得
        const cookieHeader = context.request.headers.get("Cookie");
        const cookies = Object.fromEntries(
            cookieHeader.split("; ").map((c) => c.split("=").map(decodeURIComponent))
        );
        const sessionId = cookies.session_id;

        if (!sessionId) {
            return new Response(JSON.stringify({ message: "セッションIDがありません。" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // セッションからユーザーIDを取得
        const session = await env.DB.prepare(
            "SELECT user_id FROM user_sessions WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP"
        )
            .bind(sessionId)
            .first();

        if (!session) {
            return new Response(JSON.stringify({ message: "セッションが無効または期限切れです。" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        const userId = session.user_id;

        // ユーザーが参加しているグループの取得
        const groupsQuery = `
            SELECT g.group_id, g.group_name
            FROM user_groups g
            JOIN user_group_members m ON g.group_id = m.group_id
            WHERE m.user_id = ?
        `;
        const groups = await env.DB.prepare(groupsQuery).bind(userId).all();

        return new Response(JSON.stringify(groups.results), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("グループ取得エラー:", error);
        return new Response(JSON.stringify({ message: "グループの取得に失敗しました" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
