const { createServer } = require("./lib/server");

const server = createServer("db/db.json");

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Mock Server running on http://0.0.0.0:${PORT}`);
  console.log("\n� AUTHENTICATION ENABLED");
  console.log("\n�📋 Available endpoints:");

  console.log("\n🔍 Cases endpoints:");
  console.log("  GET /cases");
  console.log("  GET /cases?q=optimization");
  console.log("  GET /cases?_sort=name&_order=desc");
  console.log("  GET /cases?_page=1&_limit=10");
  console.log("  POST /cases");
  console.log("  PUT /cases/1");
  console.log("  DELETE /cases/1");

  console.log("\n💬 Feedback endpoints:");
  console.log("  GET /feedback");
  console.log("  GET /feedback?dateFrom=2023-01-01&dateTo=2023-12-31");
  console.log("  GET /feedback?rating_gte=4");
  console.log("  POST /feedback");
  console.log("  PUT /feedback/1");
  console.log("  DELETE /feedback/1");

  console.log("\n💬 Chat endpoints:");
  console.log("  GET /chats");
  console.log("  POST /chat");
  
  console.log("\n🛠  Utility endpoints:");
  console.log("  GET /health");
  console.log("  GET /help");
  console.log("  GET /");

  console.log("\n🔧 Query parameters:");
  console.log("  _page=1           - Página número");
  console.log("  _limit=10         - Elementos por página");
  console.log("  _sort=field       - Campo para ordenar");
  console.log("  _order=asc|desc   - Orden ascendente o descendente");
  console.log("  q=text            - Búsqueda full-text (todas las rutas)");
  console.log("  field=value       - Filtro exacto por campo");
  console.log("  field_gte=value   - Mayor o igual que");
  console.log("  field_lte=value   - Menor o igual que");
  console.log("  field_ne=value    - No igual");
  console.log("  field_like=text   - Contiene texto");
  console.log("  dateFrom/dateTo   - Filtros de fecha (solo /feedback)");

  console.log("\n🔑 Authentication examples:");
  console.log("  curl -u admin:password123 http://localhost:5000/cases");
  console.log("  fetch('http://localhost:5000/cases', {");
  console.log(
    "    headers: { 'Authorization': 'Basic ' + btoa('admin:password123') }"
  );
  console.log("  })");
});
