export async function onRequestPost(context) {
    const { env, request } = context;

    // クッキーからセッションIDを取得
    const cookieHeader = request.headers.get("Cookie");
    const cookies = new Map(cookieHeader?.split("; ").map(c => c.split("=")));
    const sessionId = cookies.get("session_id");

    if (!sessionId) {
        console.error("Unauthorized access: No session ID found");
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    try {
        // セッションIDを使用してユーザーIDを取得
        const session = await env.DB.prepare(`
            SELECT user_id FROM user_sessions 
            WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
        `).bind(sessionId).first();

        if (!session) {
            console.error("Unauthorized access: No valid session found");
            return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const userId = session.user_id;

        // リクエストの内容を取得
        const formData = await request.formData();
        const groupName = formData.get('group_name');
        const description = formData.get('description');

        if (!groupName) {
            return new Response(JSON.stringify({ message: "Group name is required" }), { status: 400 });
        }

        // グループをデータベースに挿入
        const result = await env.DB.prepare(`
            INSERT INTO user_groups (group_name, description, created_by)
            VALUES (?, ?, ?)
        `).bind(groupName, description || null, userId).run();

        return new Response(JSON.stringify({ message: "Group created successfully", groupId: result.lastInsertId }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("Error creating group:", error);
        return new Response(JSON.stringify({ message: "Failed to create group", error: error.message }), { status: 500 });
    }
}

export async function onRequestGet(context) {
    const { env, request } = context;

    // クッキーからセッションIDを取得
    const cookieHeader = request.headers.get("Cookie");
    const cookies = new Map(cookieHeader?.split("; ").map(c => c.split("=")));
    const sessionId = cookies.get("session_id");

    if (!sessionId) {
        console.error("Unauthorized access: No session ID found");
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    try {
        // セッションIDを使用してユーザーIDを取得
        const session = await env.DB.prepare(`
            SELECT user_id FROM user_sessions 
            WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
        `).bind(sessionId).first();

        if (!session) {
            console.error("Unauthorized access: No valid session found");
            return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }

        const userId = session.user_id;

        // ユーザーが参加しているグループを取得
        const groups = await env.DB.prepare(`
            SELECT g.group_id, g.group_name, g.description
            FROM user_groups g
            INNER JOIN user_group_members gm ON g.group_id = gm.group_id
            WHERE gm.user_id = ?
        `).bind(userId).all();

        return new Response(JSON.stringify(groups.results), { status: 200 });
    } catch (error) {
        console.error("Error fetching groups:", error);
        return new Response(JSON.stringify({ message: "Failed to fetch groups", error: error.message }), { status: 500 });
    }
}
