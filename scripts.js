export default {
    async fetch(request, env) {
      const { pathname } = new URL(request.url);
  
      if (pathname === "/api/beverages") {
        // If you did not use `DB` as your binding name, change it here
        const { results } = await env.DB.prepare(
          "SELECT * FROM Customers WHERE CompanyName = ?"
        )
          .bind("Bs Beverages")
          .all();
        return new Response(JSON.stringify(results), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
      return new Response(
        "Call /api/beverages to see everyone who works at Bs Beverages"
      );
    },
  };