const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db/db.json");
const middlewares = jsonServer.defaults();

// Middleware universal para interceptar TODAS las respuestas JSON
const universalWrapper = (req, res, next) => {
  const originalSend = res.send;
  const originalJson = res.json;

  // Interceptar res.send
  res.send = function (data) {
    // Si es JSON y es una respuesta GET, envolverla
    if (
      req.method === "GET" &&
      res.get("Content-Type")?.includes("application/json")
    ) {
      try {
        const parsedData = typeof data === "string" ? JSON.parse(data) : data;
        const wrappedData = wrapData(parsedData, req, res);
        return originalSend.call(this, JSON.stringify(wrappedData));
      } catch {
        // Si no se puede parsear, enviar tal como está
        return originalSend.call(this, data);
      }
    }
    return originalSend.call(this, data);
  };

  // Interceptar res.json también por seguridad
  res.json = function (data) {
    if (req.method === "GET") {
      const wrappedData = wrapData(data, req, res);
      return originalJson.call(this, wrappedData);
    }
    return originalJson.call(this, data);
  };

  next();
};

// Función para envolver datos
const wrapData = (data, req, res) => {
  // Si ya está envuelto, no envolver de nuevo
  if (data && typeof data === "object" && data.success !== undefined) {
    return data;
  }

  // Detectar paginación tanto de query params originales como procesados
  const hasNativePagination =
    req.query._page ||
    req.query._limit ||
    req.originalUrl.includes("_page=") ||
    req.originalUrl.includes("_limit=");
  let paginationInfo = null;

  console.log(
    `WrapData: URL=${req.url}, originalUrl=${
      req.originalUrl
    }, hasNativePagination=${hasNativePagination}, isArray=${Array.isArray(
      data
    )}`
  );

  // Verificar headers de paginación existentes (rutas personalizadas)
  const customTotalCount = res.get("X-Total-Count");
  const customTotalPages = res.get("X-Total-Pages");
  const customCurrentPage = res.get("X-Current-Page");
  const customPerPage = res.get("X-Per-Page");

  if (customTotalCount && customTotalPages) {
    console.log(`Usando paginación personalizada existente`);
    paginationInfo = createPaginationInfo(
      customTotalCount,
      customTotalPages,
      customCurrentPage,
      customPerPage
    );
  } else if (hasNativePagination && Array.isArray(data)) {
    console.log(`Calculando paginación nativa`);
    // Para rutas nativas, calcular paginación basada en la data actual
    paginationInfo = calculateNativePaginationFromData(req, res, data);
  }

  return {
    success: true,
    data: data,
    ...(paginationInfo && { pagination: paginationInfo }),
  };
};

// Función para calcular paginación desde los datos (para rutas nativas)
const calculateNativePaginationFromData = (req, res, data) => {
  // Extraer parámetros de la URL original si no están en req.query
  const urlParams = new URLSearchParams(req.originalUrl.split("?")[1] || "");
  const page = parseInt(req.query._page || urlParams.get("_page")) || 1;
  const limit = parseInt(req.query._limit || urlParams.get("_limit")) || 10;

  // Para rutas nativas, necesitamos obtener el total desde la BD
  let totalCount = getTotalCountFromDatabase(req, data.length);

  // Si no pudimos obtener el total de la BD, usar el tamaño actual como estimación
  if (totalCount === data.length && data.length === limit) {
    // Puede haber más páginas, usar una estimación conservadora
    totalCount = data.length * 2; // Estimación simple
  }

  const totalPages = Math.ceil(totalCount / limit);

  console.log(
    `Paginación nativa: page=${page}, limit=${limit}, totalCount=${totalCount}, dataLength=${data.length}`
  );

  // Agregar headers para consistencia
  res.header("X-Total-Count", totalCount);
  res.header("X-Total-Pages", totalPages);
  res.header("X-Current-Page", page);
  res.header("X-Per-Page", limit);

  return createPaginationInfo(totalCount, totalPages, page, limit);
};

// Función auxiliar para crear información de paginación
const createPaginationInfo = (totalCount, totalPages, currentPage, perPage) => {
  const total = parseInt(totalCount);
  const pages = parseInt(totalPages);
  const current = parseInt(currentPage);
  const per = parseInt(perPage);

  return {
    totalCount: total,
    totalPages: pages,
    currentPage: current,
    perPage: per,
    hasNextPage: current < pages,
    hasPrevPage: current > 1,
  };
};

// Función auxiliar para calcular paginación nativa
const calculateNativePagination = (req, res, data) => {
  const page = parseInt(req.query._page) || 1;
  const limit = parseInt(req.query._limit) || 10;

  // Usar total count del header si existe
  const totalCountHeader = res.get("X-Total-Count");
  let totalCount = totalCountHeader ? parseInt(totalCountHeader) : data.length;

  // Si no hay header, intentar obtener el total de la base de datos
  if (!totalCountHeader) {
    totalCount = getTotalCountFromDatabase(req, data.length);
  }

  const totalPages = Math.ceil(totalCount / limit);

  // Agregar headers para consistencia
  res.header("X-Total-Count", totalCount);
  res.header("X-Total-Pages", totalPages);
  res.header("X-Current-Page", page);
  res.header("X-Per-Page", limit);

  return createPaginationInfo(totalCount, totalPages, page, limit);
};

// Función auxiliar para obtener total count de la base de datos
const getTotalCountFromDatabase = (req, fallbackCount) => {
  try {
    const pathParts = req.path.split("/").filter(Boolean);
    const resourceName = pathParts[0];

    console.log(`Intentando obtener total para recurso: ${resourceName}`);

    if (router.db?.get) {
      const fullData = router.db.get(resourceName).value();
      console.log(
        `Datos completos encontrados: ${
          fullData ? fullData.length : "null"
        } elementos`
      );
      if (Array.isArray(fullData)) {
        return fullData.length;
      }
    }
  } catch (error) {
    console.log(`Error obteniendo total de BD: ${error.message}`);
  }

  console.log(`Usando fallback count: ${fallbackCount}`);
  return fallbackCount;
};

// Usar middlewares por defecto
server.use(middlewares);

// Aplicar el middleware universal primero
server.use(universalWrapper);

// Middleware para logging de consultas
server.use((req, res, next) => {
  if (req.method === "GET") {
    console.log(`${req.method} ${req.url} - Query params:`, req.query);
  }
  next();
});

// Rutas personalizadas avanzadas
server.get("/cases", (req, res) => {
  const db = router.db;
  const cases = db.get("cases").value();
  const { analysis = [], filters = {} } = cases;
  const { analysisNameType, search, _sort, _order } = req.query;

  let filteredAnalysis = analysis;
  let organizations = [];
  let CM = [];
  let SKU = [];
  let NVPN = [];

  if (analysisNameType) {
    // Filtrar por key exacto (case-insensitive)
    filteredAnalysis = analysis.filter(item => item.key && item.key.toLowerCase() === analysisNameType.toLowerCase());
    // Si existe filters para esa key, extraer los datos
    const filterData = filters[analysisNameType] || filters[analysisNameType.toUpperCase()] || filters[analysisNameType.toLowerCase()];
    if (filterData) {
      organizations = filterData.organizations || [];
      CM = filterData.CM || [];
      SKU = filterData.SKU || [];
      NVPN = filterData.NVPN || [];
    }
  } else if (search) {
    const s = search.toLowerCase();
    filteredAnalysis = analysis.filter(item =>
      (item.name && item.name.toLowerCase().includes(s)) ||
      (item.key && item.key.toLowerCase().includes(s))
    );
  }

  // Ordenar si corresponde
  let sortedAnalysis = filteredAnalysis;
  if (_sort && sortedAnalysis) {
    const sortField = _sort;
    const sortOrder = _order === "desc" ? -1 : 1;
    sortedAnalysis = [...sortedAnalysis].sort((a, b) => {
      if (a[sortField] < b[sortField]) return -1 * sortOrder;
      if (a[sortField] > b[sortField]) return 1 * sortOrder;
      return 0;
    });
  }

  const response = {
    analysis: sortedAnalysis,
    organizations,
    CM,
    SKU,
    NVPN,
  };

  res.json(response);
});

// Endpoint para análisis con paginación completa
server.get("/cases/analysis", (req, res) => {
  const db = router.db;
  let analysis = db.get("cases.analysis").value();

  // Aplicar filtros de búsqueda
  const { search, name, code, _sort, _order, _page, _limit } = req.query;

  if (search || name || code) {
    analysis = analysis.filter((item) => {
      let matches = true;

      if (search) {
        matches =
          matches &&
          (item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.code.toLowerCase().includes(search.toLowerCase()) ||
            item.description.toLowerCase().includes(search.toLowerCase()));
      }

      if (name) {
        matches =
          matches && item.name.toLowerCase().includes(name.toLowerCase());
      }

      if (code) {
        matches =
          matches && item.code.toLowerCase().includes(code.toLowerCase());
      }

      return matches;
    });
  }

  // Aplicar ordenación
  if (_sort) {
    const sortField = _sort;
    const sortOrder = _order === "desc" ? -1 : 1;

    analysis.sort((a, b) => {
      if (a[sortField] < b[sortField]) return -1 * sortOrder;
      if (a[sortField] > b[sortField]) return 1 * sortOrder;
      return 0;
    });
  }

  // Aplicar paginación manual
  if (_page || _limit) {
    const page = parseInt(_page) || 1;
    const limit = parseInt(_limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    // Agregar headers de paginación
    res.header("X-Total-Count", analysis.length);
    res.header("X-Total-Pages", Math.ceil(analysis.length / limit));
    res.header("X-Current-Page", page);
    res.header("X-Per-Page", limit);

    analysis = analysis.slice(startIndex, endIndex);
  }

  res.json({analysis});
});

// Endpoint para feedback con filtros avanzados
server.get("/feedback", (req, res) => {
  const db = router.db;
  let feedback = db.get("feedback").value();

  const {
    status,
    category,
    userId,
    search,
    dateFrom,
    dateTo,
    _sort,
    _order,
    _page,
    _limit,
  } = req.query;

  // Aplicar filtros
  if (status || category || userId || search || dateFrom || dateTo) {
    feedback = feedback.filter((item) => {
      let matches = true;

      if (status) matches = matches && item.status === status;
      if (category) matches = matches && item.category === category;
      if (userId) matches = matches && item.userId === userId;

      if (search) {
        matches =
          matches && item.message.toLowerCase().includes(search.toLowerCase());
      }

      if (dateFrom) {
        matches = matches && new Date(item.timestamp) >= new Date(dateFrom);
      }

      if (dateTo) {
        matches = matches && new Date(item.timestamp) <= new Date(dateTo);
      }

      return matches;
    });
  }

  // Aplicar ordenación
  if (_sort) {
    const sortField = _sort;
    const sortOrder = _order === "desc" ? -1 : 1;

    feedback.sort((a, b) => {
      if (sortField === "timestamp") {
        return (new Date(a[sortField]) - new Date(b[sortField])) * sortOrder;
      }

      if (a[sortField] < b[sortField]) return -1 * sortOrder;
      if (a[sortField] > b[sortField]) return 1 * sortOrder;
      return 0;
    });
  }

  // Aplicar paginación
  if (_page || _limit) {
    const page = parseInt(_page) || 1;
    const limit = parseInt(_limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    res.header("X-Total-Count", feedback.length);
    res.header("X-Total-Pages", Math.ceil(feedback.length / limit));
    res.header("X-Current-Page", page);
    res.header("X-Per-Page", limit);

    feedback = feedback.slice(startIndex, endIndex);
  }

  res.json(feedback);
});

// Usar el router por defecto para otras rutas
server.use(router);

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Mock Server running on http://0.0.0.0:${PORT}`);
  console.log("\n📋 Available endpoints:");

  console.log("\n🔍 Cases endpoints:");
  console.log("  GET /cases");
  console.log("  GET /cases?analysisNameType=Supply");
  console.log("  GET /cases?search=optimization");
  console.log("  GET /cases?_sort=name&_order=desc");

  console.log("\n📊 Analysis endpoints:");
  console.log("  GET /cases/analysis");
  console.log("  GET /cases/analysis?_page=1&_limit=2");
  console.log("  GET /cases/analysis?search=supply&_sort=name");
  console.log("  GET /cases/analysis?name=Supply&code=SCO");

  console.log("\n💬 Feedback endpoints:");
  console.log("  GET /feedback");
  console.log("  GET /feedback?status=open");
  console.log("  GET /feedback?category=feature_request");
  console.log("  GET /feedback?_page=1&_limit=2&_sort=timestamp&_order=desc");
  console.log("  GET /feedback?search=supply&status=open");
  console.log("  GET /feedback?dateFrom=2024-01-16&dateTo=2024-01-17");

  console.log("\n📋 Other endpoints:");
  console.log("  GET /definitions");
  console.log("  GET /definitions?_page=1&_limit=2");
  console.log("  GET /definitions?category=Supply Chain");
  console.log("  GET /definitions?q=optimization");
  console.log("  GET /settings");
  console.log("  GET /chat");
  console.log("  GET /options/tables");

  console.log("\n🔧 Query Parameters:");
  console.log("  _page=1        - Página número");
  console.log("  _limit=10      - Elementos por página");
  console.log("  _sort=field    - Campo para ordenar");
  console.log("  _order=asc|desc- Orden ascendente o descendente");
  console.log("  q=text         - Búsqueda full-text (solo rutas nativas)");
  console.log("  search=text    - Búsqueda personalizada");
});
