export async function onRequestGet(context) {
    const { request, env } = context;
    const cookieHeader = request.headers.get("Cookie");
    const cookies = new Map(cookieHeader?.split("; ").map(c => c.split("=")));
    const sessionId = cookies.get("session_id");
 
    if (!sessionId) {
        return new Response("Unauthorized", { status: 401 });
    }
 
    // セッションからユーザーIDを取得
    const session = await env.DB.prepare(`
        SELECT user_id FROM user_sessions WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP
    `).bind(sessionId).first();
 
    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }
 
    // ユーザーのフィットネスデータを取得
    const fitnessData = await env.DB.prepare(`
        SELECT * FROM fitness_activities WHERE user_id = ?
    `).bind(session.user_id).all();
 
       // フィットネスデータをHTMLテーブル形式で整形
       let fitnessDataHtml = `
       <html>
       <head><title>フィットネスデータ</title></head>
       <body>
           <h1>フィットネスアクティビティのリスト</h1>
           <table border="1">
               <tr>
                   <th>アクティビティ名</th>
                   <th>時間</th>
                   <th>消費カロリー</th>
               </tr>`;
 
   fitnessData.results.forEach(activity => {
       fitnessDataHtml += `
           <tr>
               <td>${activity.activity_name}</td>
               <td>${activity.duration}</td>
               <td>${activity.calories_burned}</td>
           </tr>`;
   });
 
   fitnessDataHtml += `
           </table>
       </body>
       </html>`;
 
   return new Response(fitnessDataHtml, {
       status: 200,
       headers: { "Content-Type": "text/html" }
   });
}