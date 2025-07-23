const jsonServer = require("json-server");

function createServer(dbPath) {
  const server = jsonServer.create();

  const router = jsonServer.router(dbPath);

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
  const createPaginationInfo = (
    totalCount,
    totalPages,
    currentPage,
    perPage
  ) => {
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

  // Función auxiliar para aplicar filtros de JSON Server a datos personalizados
  const applyJsonServerFilters = (data, query) => {
    let filtered = [...data];

    // Aplicar filtros de campo exacto
    Object.keys(query).forEach((key) => {
      if (
        !key.startsWith("_") &&
        key !== "q" &&
        key !== "dateFrom" &&
        key !== "dateTo"
      ) {
        const value = query[key];

        // Operadores de rango
        if (key.endsWith("_gte")) {
          const field = key.replace("_gte", "");
          filtered = filtered.filter((item) => {
            const itemValue = parseFloat(item[field]) || item[field];
            const queryValue = parseFloat(value) || value;
            return itemValue >= queryValue;
          });
        } else if (key.endsWith("_lte")) {
          const field = key.replace("_lte", "");
          filtered = filtered.filter((item) => {
            const itemValue = parseFloat(item[field]) || item[field];
            const queryValue = parseFloat(value) || value;
            return itemValue <= queryValue;
          });
        } else if (key.endsWith("_ne")) {
          const field = key.replace("_ne", "");
          filtered = filtered.filter((item) => item[field] != value);
        } else if (key.endsWith("_like")) {
          const field = key.replace("_like", "");
          filtered = filtered.filter((item) =>
            item[field]?.toString().toLowerCase().includes(value.toLowerCase())
          );
        } else {
          // Filtro exacto
          filtered = filtered.filter((item) => item[key] == value);
        }
      }
    });

    // Búsqueda full-text con 'q'
    if (query.q) {
      const searchTerm = query.q.toLowerCase();
      filtered = filtered.filter((item) =>
        Object.values(item).some((value) =>
          value?.toString().toLowerCase().includes(searchTerm)
        )
      );
    }

    return filtered;
  };

  // Función auxiliar para aplicar ordenación
  const applySorting = (data, query) => {
    if (!query._sort) return data;

    const sortFields = query._sort.split(",");
    const sortOrders = query._order ? query._order.split(",") : [];

    return data.sort((a, b) => {
      for (let i = 0; i < sortFields.length; i++) {
        const field = sortFields[i];
        const order = sortOrders[i] === "desc" ? -1 : 1;

        let aVal = a[field];
        let bVal = b[field];

        // Manejar fechas
        if (
          field === "timestamp" ||
          field.includes("date") ||
          field.includes("Date")
        ) {
          aVal = new Date(aVal);
          bVal = new Date(bVal);
        }

        // Manejar números
        if (!isNaN(aVal) && !isNaN(bVal)) {
          aVal = parseFloat(aVal);
          bVal = parseFloat(bVal);
        }

        if (aVal < bVal) return -1 * order;
        if (aVal > bVal) return 1 * order;
      }
      return 0;
    });
  };

  // Función auxiliar para aplicar paginación
  const applyPagination = (data, query, res) => {
    if (!query._page && !query._limit) return data;

    const page = parseInt(query._page) || 1;
    const limit = parseInt(query._limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    // Agregar headers de paginación
    res.header("X-Total-Count", data.length);
    res.header("X-Total-Pages", Math.ceil(data.length / limit));
    res.header("X-Current-Page", page);
    res.header("X-Per-Page", limit);

    return data.slice(startIndex, endIndex);
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

  // Rutas personalizadas estandarizadas
  server.get("/cases", (req, res) => {
    const db = router.db;
    let cases = db.get("cases").value();

    // Aplicar filtros estándar de JSON Server solo si hay análisis
    if (cases.analysis) {
      cases.analysis = applyJsonServerFilters(cases.analysis, req.query);
      cases.analysis = applySorting(cases.analysis, req.query);
      cases.analysis = applyPagination(cases.analysis, req.query, res);
    }

    res.json(cases);
  });

  // Endpoint para análisis con funcionalidad completa de JSON Server
  server.get("/cases/analysis", (req, res) => {
    const db = router.db;
    let analysis = db.get("cases.analysis").value();

    // Aplicar todos los filtros estándar de JSON Server
    analysis = applyJsonServerFilters(analysis, req.query);
    analysis = applySorting(analysis, req.query);
    analysis = applyPagination(analysis, req.query, res);

    res.json(analysis);
  });

  // Endpoint para feedback con filtros avanzados
  server.get("/feedback", (req, res) => {
    const db = router.db;
    let feedback = db.get("feedback").value();

    // Aplicar filtros de fecha personalizados (mantener funcionalidad específica)
    const { dateFrom, dateTo } = req.query;

    if (dateFrom || dateTo) {
      feedback = feedback.filter((item) => {
        let matches = true;

        if (dateFrom) {
          matches = matches && new Date(item.timestamp) >= new Date(dateFrom);
        }

        if (dateTo) {
          matches = matches && new Date(item.timestamp) <= new Date(dateTo);
        }

        return matches;
      });
    }

    // Aplicar filtros estándar de JSON Server
    feedback = applyJsonServerFilters(feedback, req.query);
    feedback = applySorting(feedback, req.query);
    feedback = applyPagination(feedback, req.query, res);

    res.json(feedback);
  });

  // Usar el router por defecto para otras rutas
  server.use(router);

  return server;
}

module.exports = { createServer };
