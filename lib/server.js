const jsonServer = require("json-server");
const authenticate = require("./auth");
const { v6: uuidv6 } = require("uuid");

function createServer(dbPath) {
  const server = jsonServer.create();

  const router = jsonServer.router(dbPath);

  const middlewares = jsonServer.defaults();

  server.use(jsonServer.bodyParser);

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

  // Aplicar autenticación a todas las rutas
  server.use(authenticate);

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

    // Extraer parámetros de filtrado específicos
    const { analysisNameType, search } = req.query;
    const { analysis = [], filters = {} } = cases;

    // Aplicar filtros específicos si se proporcionan
    if (analysisNameType || search) {
      let filteredAnalysis = analysis;
      let organizations = [];
      let CM = [];
      let SKU = [];
      let NVPN = [];

      if (analysisNameType) {
        // Filtrar por key exacto (case-insensitive)
        filteredAnalysis = analysis.filter(
          (item) =>
            item.key &&
            item.key.toLowerCase() === analysisNameType.toLowerCase()
        );

        // Si existe filters para esa key, extraer los datos
        const filterData =
          filters[analysisNameType] ||
          filters[analysisNameType.toUpperCase()] ||
          filters[analysisNameType.toLowerCase()];
        if (filterData) {
          organizations = filterData.organizations || [];
          CM = filterData.CM || [];
          SKU = filterData.SKU || [];
          NVPN = filterData.NVPN || [];
        }
      } else if (search) {
        const searchTerm = search.toLowerCase();
        filteredAnalysis = analysis.filter(
          (item) =>
            (item.name && item.name.toLowerCase().includes(searchTerm)) ||
            (item.key && item.key.toLowerCase().includes(searchTerm)) ||
            (item.description &&
              item.description.toLowerCase().includes(searchTerm))
        );
      }

      // Aplicar filtros estándar de JSON Server (excluyendo los ya procesados)
      const queryWithoutSpecificFilters = { ...req.query };
      delete queryWithoutSpecificFilters.analysisNameType;
      delete queryWithoutSpecificFilters.search;

      filteredAnalysis = applyJsonServerFilters(
        filteredAnalysis,
        queryWithoutSpecificFilters
      );
      filteredAnalysis = applySorting(
        filteredAnalysis,
        queryWithoutSpecificFilters
      );
      filteredAnalysis = applyPagination(
        filteredAnalysis,
        queryWithoutSpecificFilters,
        res
      );

      // Construir respuesta con datos filtrados
      const response = {
        ...cases,
        analysis: filteredAnalysis,
        ...(organizations.length > 0 && { organizations }),
        ...(CM.length > 0 && { CM }),
        ...(SKU.length > 0 && { SKU }),
        ...(NVPN.length > 0 && { NVPN }),
      };

      res.json(response);
    } else {
      if (cases.analysis) {
        cases.analysis = applyJsonServerFilters(cases.analysis, req.query);
        cases.analysis = applySorting(cases.analysis, req.query);
        cases.analysis = applyPagination(cases.analysis, req.query, res);
      }

      res.json(cases);
    }
  });

  // Endpoint para análisis con funcionalidad completa de JSON Server
  server.get("/cases/analysis", (req, res) => {
    const db = router.db;
    let analysis = db.get("cases.analysis").value();

    // Aplicar todos los filtros estándar de JSON Server
    analysis = applyJsonServerFilters(analysis, req.query);
    analysis = applySorting(analysis, req.query);
    analysis = applyPagination(analysis, req.query, res);

    res.json({ analysis });
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

  server.post("/chats", (req, res) => {
    const db = router.db;
    const { userId, title, metadata } = req.body || {};

    const defaultUserId = userId || "user123";
    const defaultTitle = title || "";
    const defaultMetadata = metadata || {};

    const chats = db.get("chats").value();
    const newChat = {
      id: uuidv6(),
      userId: defaultUserId,
      sessionId: `session_${uuidv6()}`,
      created: new Date().toISOString(),
      title: defaultTitle,
      messages: [],
      ...(Object.keys(defaultMetadata).length > 0 && {
        metadata: defaultMetadata,
      }),
    };

    chats.push(newChat);
    db.set("chats", chats).write();

    res.status(201).json(newChat);
  });

  server.post("/chat", (req, res) => {
    const db = router.db;

    const { chatId, messages } = req.body;

    if (!chatId || !messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        error: "chatId and messages array are required",
      });
    }

    const chats = db.get("chats").value();
    const chatIndex = chats.findIndex((chat) => chat.id === chatId);

    if (chatIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Chat not found",
      });
    }

    if (!chats[chatIndex].messages) {
      chats[chatIndex].messages = [];
    }

    const userMessages = messages.filter((msg) => msg.role === "user");
    const lastUserMessage = userMessages[userMessages.length - 1];

    if (!lastUserMessage) {
      return res.status(400).json({
        success: false,
        error: "No user message found",
      });
    }

    // Agregar el último mensaje del usuario
    const newMessage = {
      id: lastUserMessage.id || uuidv6(),
      role: "user",
      content: lastUserMessage.content,
      created: new Date().toISOString(),
      ...(lastUserMessage.metadata && { metadata: lastUserMessage.metadata }),
    };
    chats[chatIndex].messages.push(newMessage);

    // Generar respuesta del bot
    const shouldIncludeCode =
      Math.random() < 0.1 ||
      lastUserMessage.content.toLowerCase().includes("code"); // 10% de probabilidad o si contiene "code"
    const shouldIncludeTable =
      Math.random() < 0.05 ||
      lastUserMessage.content.toLowerCase().includes("table"); // 5% de probabilidad o si contiene "table"

    const codeContent = `\`\`\`javascript
// Imports
import mongoose, { Schema } from 'mongoose'

// Collection name
export const collection = 'Design'

// Schema
const schema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  }
}, { timestamps: true })

// Model
export default mongoose.model(collection, schema, collection)
\`\`\``;

    const tableContent = `[SHOW_TABLE]`;

    let responseContent =
      "Thank you for your message. I am a virtual assistant specialized in data analysis, supply chain optimization, and market analysis. How can I help you today?";

    if (shouldIncludeCode) {
      responseContent += `\n\n${codeContent}`;
    }

    if (shouldIncludeTable) {
      responseContent += `\n\n${tableContent}`;
    }

    const botResponse = {
      id: uuidv6(),
      role: "assistant",
      title: "Response from bot",
      content: responseContent,
      created: new Date().toISOString(),
    };

    // Agregar respuesta del bot al chat
    chats[chatIndex].messages.push(botResponse);

    // Actualizar la base de datos
    db.set("chats", chats).write();

    // Retornar respuesta en formato OpenAI
    const now = new Date();
    res.json({
      id: botResponse.id,
      object: "chat.completion",
      model: "mock-bot-v1",
      created: now.getTime(),
      choices: [
        {
          message: {
            content: botResponse.content,
            role: "assistant",
            title: botResponse.title,
          },
          finish_reason: "stop",
          index: 0,
        },
      ],
      usage: {
        prompt_tokens: lastUserMessage.content?.length || 0,
        completion_tokens: botResponse.content.length,
        total_tokens:
          (lastUserMessage.content?.length || 0) + botResponse.content.length,
      },
    });
  });

  // Endpoint para actualizar feedbackVote en mensajes de chat
  server.put("/messages/:messageId/feedback", (req, res) => {
    const db = router.db;
    const { messageId } = req.params;
    const { feedbackVote } = req.body;

    // Validar que feedbackVote sea "up" o "down"
    if (!feedbackVote || !["up", "down"].includes(feedbackVote)) {
      return res.status(400).json({
        success: false,
        error: "feedbackVote is required and must be 'up' or 'down'",
      });
    }

    const chats = db.get("chats").value();

    // Buscar el mensaje en todos los chats
    let messageFound = false;
    let targetChat = null;
    let messageIndex = -1;

    for (const chat of chats) {
      const index = chat.messages.findIndex((msg) => msg.id === messageId);
      if (index !== -1) {
        messageFound = true;
        targetChat = chat;
        messageIndex = index;
        break;
      }
    }

    if (!messageFound) {
      return res.status(404).json({
        success: false,
        error: "Message not found",
      });
    }

    const message = targetChat.messages[messageIndex];

    console.log(message);

    // Verificar que el mensaje sea del rol "assistant"
    if (message.role !== "assistant") {
      return res.status(400).json({
        success: false,
        error: "Feedback can only be applied to assistant messages",
      });
    }

    // Actualizar el feedbackVote del mensaje
    targetChat.messages[messageIndex] = {
      ...message,
      feedbackVote: feedbackVote,
      feedbackUpdatedAt: new Date().toISOString(),
    };

    // Guardar los cambios en la base de datos
    db.set("chats", chats).write();

    res.json({
      success: true,
      data: {
        messageId: messageId,
        feedbackVote: feedbackVote,
        feedbackUpdatedAt: targetChat.messages[messageIndex].feedbackUpdatedAt,
      },
    });
  });

  // Endpoint para exportar datos de tabla por ID
  server.get("/export/:tableId", (req, res) => {
    const { tableId } = req.params;
    const { format = "csv" } = req.query;

    // Validar que tableId sea un string válido
    if (!tableId || typeof tableId !== "string" || tableId.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Table ID must be a valid string",
      });
    }

    // Validar formato de exportación
    if (!["csv", "excel"].includes(format)) {
      return res.status(400).json({
        success: false,
        error: "Format must be 'csv' or 'excel'",
      });
    }

    // Datos mockeados para exportación - siempre retorna los mismos datos de demanda
    const table = {
      id: tableId,
      name: "demand_data",
      displayName: "Demand Data",
      columns: [
        "Demand Priority",
        "Product Family",
        "System",
        "Region",
        "Created Date",
        "Demand Units",
        "Fulfilled Demand Units",
      ],
      data: [
        {
          "Demand Priority": "1",
          "Product Family": "HGS",
          System: "H100",
          Region: "North America",
          "Created Date": "2024-03-15",
          "Demand Units": "100K",
          "Fulfilled Demand Units": "80k",
        },
        {
          "Demand Priority": "2",
          "Product Family": "DGI",
          System: "B110",
          Region: "Asia",
          "Created Date": "2024-01-22",
          "Demand Units": "100K",
          "Fulfilled Demand Units": "80k",
        },
        {
          "Demand Priority": "3",
          "Product Family": "HGD",
          System: "System",
          Region: "Europe",
          "Created Date": "2024-05-08",
          "Demand Units": "100K",
          "Fulfilled Demand Units": "80k",
        },
        {
          "Demand Priority": "4",
          "Product Family": "DGE",
          System: "B100",
          Region: "South America",
          "Created Date": "2024-02-14",
          "Demand Units": "100K",
          "Fulfilled Demand Units": "80k",
        },
        {
          "Demand Priority": "5",
          "Product Family": "HGC",
          System: "B110",
          Region: "Africa",
          "Created Date": "2024-06-30",
          "Demand Units": "100K",
          "Fulfilled Demand Units": "80k",
        },
        {
          "Demand Priority": "6",
          "Product Family": "DGT",
          System: "System",
          Region: "Pacific",
          "Created Date": "2024-04-12",
          "Demand Units": "100K",
          "Fulfilled Demand Units": "80k",
        },
        {
          "Demand Priority": "7",
          "Product Family": "HGP",
          System: "B110",
          Region: "North America",
          "Created Date": "2024-07-19",
          "Demand Units": "100K",
          "Fulfilled Demand Units": "80k",
        },
        {
          "Demand Priority": "8",
          "Product Family": "DGS",
          System: "H100",
          Region: "Asia",
          "Created Date": "2024-03-05",
          "Demand Units": "100K",
          "Fulfilled Demand Units": "80k",
        },
        {
          "Demand Priority": "9",
          "Product Family": "HGI",
          System: "H200",
          Region: "Europe",
          "Created Date": "2024-08-01",
          "Demand Units": "100K",
          "Fulfilled Demand Units": "80k",
        },
        {
          "Demand Priority": "10",
          "Product Family": "DGS",
          System: "System",
          Region: "South America",
          "Created Date": "2024-01-10",
          "Demand Units": "100K",
          "Fulfilled Demand Units": "80k",
        },
        {
          "Demand Priority": "11",
          "Product Family": "HGI",
          System: "B100",
          Region: "Africa",
          "Created Date": "2024-05-20",
          "Demand Units": "100K",
          "Fulfilled Demand Units": "80k",
        },
        {
          "Demand Priority": "12",
          "Product Family": "DGD",
          System: "H200",
          Region: "Pacific",
          "Created Date": "2024-02-28",
          "Demand Units": "100K",
          "Fulfilled Demand Units": "80k",
        },
        {
          "Demand Priority": "13",
          "Product Family": "HGE",
          System: "System",
          Region: "North America",
          "Created Date": "2024-06-07",
          "Demand Units": "100K",
          "Fulfilled Demand Units": "80k",
        },
        {
          "Demand Priority": "14",
          "Product Family": "DGC",
          System: "B100",
          Region: "Asia",
          "Created Date": "2024-04-03",
          "Demand Units": "100K",
          "Fulfilled Demand Units": "80k",
        },
        {
          "Demand Priority": "15",
          "Product Family": "DGC",
          System: "B100",
          Region: "Europe",
          "Created Date": "2024-07-25",
          "Demand Units": "100K",
          "Fulfilled Demand Units": "80k",
        },
        {
          "Demand Priority": "16",
          "Product Family": "HGE",
          System: "B110",
          Region: "South America",
          "Created Date": "2024-03-18",
          "Demand Units": "100K",
          "Fulfilled Demand Units": "80k",
        },
        {
          "Demand Priority": "17",
          "Product Family": "DGD",
          System: "H100",
          Region: "Africa",
          "Created Date": "2024-05-11",
          "Demand Units": "100K",
          "Fulfilled Demand Units": "80k",
        },
        {
          "Demand Priority": "18",
          "Product Family": "HGI",
          System: "System",
          Region: "Pacific",
          "Created Date": "2024-01-25",
          "Demand Units": "100K",
          "Fulfilled Demand Units": "80k",
        },
        {
          "Demand Priority": "19",
          "Product Family": "DGS",
          System: "B110",
          Region: "North America",
          "Created Date": "2024-06-14",
          "Demand Units": "100K",
          "Fulfilled Demand Units": "80k",
        },
        {
          "Demand Priority": "20",
          "Product Family": "HGP",
          System: "H200",
          Region: "Asia",
          "Created Date": "2024-04-29",
          "Demand Units": "100K",
          "Fulfilled Demand Units": "80k",
        },
      ],
    };

    // Obtener datos de la tabla
    const tableData = table.data;

    // Generar nombre de archivo
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .split("T")[0];
    const filename = `${table.name}_${timestamp}`;

    if (format === "csv") {
      // Exportar como CSV
      const csvWriter = require("csv-writer").createObjectCsvWriter({
        path: `/tmp/${filename}.csv`,
        header: table.columns.map((column) => ({
          id: column,
          title: column,
        })),
      });

      csvWriter
        .writeRecords(tableData)
        .then(() => {
          res.setHeader("Content-Type", "text/csv");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}.csv"`
          );

          // Leer el archivo y enviarlo
          const fs = require("fs");
          const fileStream = fs.createReadStream(`/tmp/${filename}.csv`);
          fileStream.pipe(res);

          // Limpiar archivo temporal después de enviar
          fileStream.on("end", () => {
            fs.unlink(`/tmp/${filename}.csv`, (err) => {
              if (err) console.error("Error deleting temp file:", err);
            });
          });
        })
        .catch((error) => {
          console.error("Error writing CSV:", error);
          res.status(500).json({
            success: false,
            error: "Error generating CSV file",
          });
        });
    } else if (format === "excel") {
      // Exportar como Excel
      const ExcelJS = require("exceljs");
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(table.displayName || table.name);

      // Agregar encabezados
      worksheet.addRow(table.columns);

      // Agregar datos
      tableData.forEach((row) => {
        const rowData = table.columns.map((column) => row[column]);
        worksheet.addRow(rowData);
      });

      // Estilo para encabezados
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };

      // Autoajustar columnas
      worksheet.columns.forEach((column, index) => {
        const headerLength = table.columns[index]
          ? table.columns[index].length
          : 10;
        const maxDataLength = Math.max(
          headerLength,
          ...tableData.map((row) => {
            const value = row[table.columns[index]];
            return value ? String(value).length : 0;
          })
        );
        column.width = Math.min(Math.max(maxDataLength + 2, 10), 50);
      });

      // Configurar headers de respuesta
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}.xlsx"`
      );

      // Escribir el archivo Excel directamente a la respuesta
      workbook.xlsx
        .write(res)
        .then(() => {
          console.log(`Excel file exported: ${filename}.xlsx`);
        })
        .catch((error) => {
          console.error("Error writing Excel:", error);
          res.status(500).json({
            success: false,
            error: "Error generating Excel file",
          });
        });
    }
  });

  // Usar el router por defecto para otras rutas
  server.use(router);

  return server;
}

module.exports = { createServer };
