/**
 * Ejemplos prácticos de uso de las interfaces de Query Parameters
 *
 * Este archivo muestra cómo usar las interfaces definidas en query-params.d.ts
 * tanto en JavaScript como en TypeScript.
 */

// ===== IMPORTACIÓN DE TIPOS (TypeScript) =====

/*
import {
  FeedbackQueryParams,
  DefinitionsQueryParams,
  AnalysisQueryParams,
  PaginationParams,
  SortParams,
  ApiResponse,
  PaginatedResponse,
  buildPaginationParams,
  buildSortParams,
  buildFeedbackQuery,
  PAGINATION_DEFAULTS
} from './query-params';
*/

// ===== EJEMPLOS DE USO EN JAVASCRIPT =====

/**
 * Clase para manejar requests al servidor JSON
 */
class JsonServerClient {
  constructor(baseUrl = "http://localhost:5000") {
    this.baseUrl = baseUrl;
  }

  /**
   * Método genérico para hacer requests GET
   * @param {string} endpoint - El endpoint a consultar
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<Object>} - Respuesta del servidor
   */
  async get(endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    // Agregar parámetros de consulta
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });

    const response = await fetch(url.toString());
    return response.json();
  }

  // ===== MÉTODOS PARA FEEDBACK =====

  /**
   * Obtener feedback con filtros
   * @param {FeedbackQueryParams} params - Parámetros de consulta
   */
  async getFeedback(params = {}) {
    return this.get("/feedback", params);
  }

  /**
   * Obtener feedback paginado
   * @param {number} page - Número de página
   * @param {number} limit - Elementos por página
   * @param {Object} filters - Filtros adicionales
   */
  async getFeedbackPaginated(page = 1, limit = 10, filters = {}) {
    const params = {
      _page: page,
      _limit: limit,
      ...filters,
    };
    return this.getFeedback(params);
  }

  /**
   * Buscar feedback por texto
   * @param {string} searchText - Texto a buscar
   * @param {Object} additionalParams - Parámetros adicionales
   */
  async searchFeedback(searchText, additionalParams = {}) {
    const params = {
      search: searchText,
      ...additionalParams,
    };
    return this.getFeedback(params);
  }

  // ===== MÉTODOS PARA DEFINITIONS =====

  /**
   * Obtener definitions con filtros
   * @param {DefinitionsQueryParams} params - Parámetros de consulta
   */
  async getDefinitions(params = {}) {
    return this.get("/definitions", params);
  }

  /**
   * Buscar definitions por categoría
   * @param {string} category - Categoría a filtrar
   * @param {number} page - Número de página
   * @param {number} limit - Elementos por página
   */
  async getDefinitionsByCategory(category, page = 1, limit = 10) {
    const params = {
      category,
      _page: page,
      _limit: limit,
    };
    return this.getDefinitions(params);
  }

  /**
   * Búsqueda full-text en definitions
   * @param {string} query - Texto a buscar
   */
  async searchDefinitionsFullText(query) {
    const params = { q: query };
    return this.getDefinitions(params);
  }

  // ===== MÉTODOS PARA ANALYSIS =====

  /**
   * Obtener análisis con filtros
   * @param {AnalysisQueryParams} params - Parámetros de consulta
   */
  async getAnalysis(params = {}) {
    return this.get("/cases/analysis", params);
  }

  /**
   * Buscar análisis por nombre y código
   * @param {string} searchTerm - Término de búsqueda
   * @param {Object} options - Opciones de ordenación y paginación
   */
  async searchAnalysis(searchTerm, options = {}) {
    const params = {
      search: searchTerm,
      _sort: options.sortBy || "name",
      _order: options.sortOrder || "asc",
      _page: options.page || 1,
      _limit: options.limit || 10,
    };
    return this.getAnalysis(params);
  }
}

// ===== EJEMPLOS DE USO =====

// Crear instancia del cliente
const client = new JsonServerClient("http://localhost:5000");

// ===== EJEMPLO 1: Paginación básica =====
async function ejemploPaginacionBasica() {
  // Obtener primera página de feedback con 5 elementos
  const response = await client.getFeedbackPaginated(1, 5);

  console.log("Total elementos:", response.pagination.totalCount);
  console.log("Página actual:", response.pagination.currentPage);
  console.log("Elementos:", response.data);
}

// ===== EJEMPLO 2: Filtrado con múltiples criterios =====
async function ejemploFiltradoMultiple() {
  const params = {
    status: "open",
    category: "feature_request",
    _sort: "timestamp",
    _order: "desc",
    _page: 1,
    _limit: 10,
  };

  const response = await client.getFeedback(params);
  console.log("Feedback filtrado:", response.data);
}

// ===== EJEMPLO 3: Búsqueda de texto =====
async function ejemploBusquedaTexto() {
  // Buscar en feedback
  const feedbackResults = await client.searchFeedback("supply chain", {
    status: "open",
    _sort: "timestamp",
    _order: "desc",
  });

  // Buscar en definitions (full-text)
  const definitionsResults = await client.searchDefinitionsFullText(
    "optimization"
  );

  console.log("Feedback encontrado:", feedbackResults.data);
  console.log("Definitions encontradas:", definitionsResults.data);
}

// ===== EJEMPLO 4: Filtros de fecha =====
async function ejemploFiltrosFecha() {
  const params = {
    dateFrom: "2024-01-16",
    dateTo: "2024-01-17",
    _sort: "timestamp",
    _order: "asc",
  };

  const response = await client.getFeedback(params);
  console.log("Feedback en rango de fechas:", response.data);
}

// ===== EJEMPLO 5: Uso con async/await y manejo de errores =====
async function ejemploManejoErrores() {
  try {
    const response = await client.getDefinitionsByCategory(
      "Supply Chain",
      1,
      5
    );

    if (response.success) {
      console.log("Definitions de Supply Chain:", response.data);

      if (response.pagination) {
        console.log(
          `Página ${response.pagination.currentPage} de ${response.pagination.totalPages}`
        );
        console.log(`Total: ${response.pagination.totalCount} elementos`);
      }
    } else {
      console.error("Error en la respuesta:", response);
    }
  } catch (error) {
    console.error("Error de red:", error);
  }
}

// ===== EJEMPLO 6: Construcción dinámica de queries =====
function buildDynamicQuery(filters) {
  const baseParams = {
    _page: 1,
    _limit: 10,
    _sort: "timestamp",
    _order: "desc",
  };

  // Filtros condicionales
  const params = { ...baseParams };

  if (filters.search) {
    params.search = filters.search;
  }

  if (filters.status) {
    params.status = filters.status;
  }

  if (filters.category) {
    params.category = filters.category;
  }

  if (filters.userId) {
    params.userId = filters.userId;
  }

  if (filters.dateRange) {
    params.dateFrom = filters.dateRange.from;
    params.dateTo = filters.dateRange.to;
  }

  return params;
}

// Uso del constructor dinámico
async function ejemploQueryDinamico() {
  const userFilters = {
    search: "helpful",
    status: "open",
    dateRange: {
      from: "2024-01-15",
      to: "2024-01-17",
    },
  };

  const queryParams = buildDynamicQuery(userFilters);
  const response = await client.getFeedback(queryParams);

  console.log("Resultados con filtros dinámicos:", response.data);
}

// ===== EJEMPLO 7: Paginación con navegación =====
class PaginationHelper {
  constructor(client, endpoint, baseParams = {}) {
    this.client = client;
    this.endpoint = endpoint;
    this.baseParams = baseParams;
    this.currentPage = 1;
    this.totalPages = 1;
  }

  async loadPage(page = 1) {
    const params = {
      ...this.baseParams,
      _page: page,
      _limit: 10,
    };

    const response = await this.client.get(this.endpoint, params);

    if (response.pagination) {
      this.currentPage = response.pagination.currentPage;
      this.totalPages = response.pagination.totalPages;
    }

    return response;
  }

  async nextPage() {
    if (this.currentPage < this.totalPages) {
      return await this.loadPage(this.currentPage + 1);
    }
    return null;
  }

  async prevPage() {
    if (this.currentPage > 1) {
      return await this.loadPage(this.currentPage - 1);
    }
    return null;
  }

  async firstPage() {
    return await this.loadPage(1);
  }

  async lastPage() {
    return await this.loadPage(this.totalPages);
  }
}

// Uso del helper de paginación
async function ejemploPaginacionAvanzada() {
  const pagination = new PaginationHelper(client, "/feedback", {
    status: "open",
    _sort: "timestamp",
    _order: "desc",
  });

  // Cargar primera página
  let response = await pagination.loadPage(1);
  console.log("Primera página:", response.data);

  // Navegar a siguiente página
  response = await pagination.nextPage();
  if (response) {
    console.log("Segunda página:", response.data);
  }
}

// ===== EXPORTAR PARA USO EN OTROS MÓDULOS =====
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    JsonServerClient,
    PaginationHelper,
    buildDynamicQuery,
    ejemploPaginacionBasica,
    ejemploFiltradoMultiple,
    ejemploBusquedaTexto,
    ejemploFiltrosFecha,
    ejemploManejoErrores,
    ejemploQueryDinamico,
    ejemploPaginacionAvanzada,
  };
}
