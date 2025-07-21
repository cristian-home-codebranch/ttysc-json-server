/**
 * Validadores y Helpers para Query Parameters
 *
 * Funciones de utilidad para validar y manipular los parámetros de consulta
 * del servidor JSON Server.
 */

// ===== VALIDADORES =====

/**
 * Valida parámetros de paginación
 * @param {Object} params - Parámetros a validar
 * @returns {Object} - Parámetros validados y normalizados
 */
export function validatePaginationParams(params) {
  const result = {};

  if (params._page !== undefined) {
    const page = parseInt(params._page, 10);
    if (isNaN(page) || page < 1) {
      throw new Error("_page debe ser un número entero mayor a 0");
    }
    result._page = page;
  }

  if (params._limit !== undefined) {
    const limit = parseInt(params._limit, 10);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      throw new Error("_limit debe ser un número entero entre 1 y 100");
    }
    result._limit = limit;
  }

  return result;
}

/**
 * Valida parámetros de ordenación
 * @param {Object} params - Parámetros a validar
 * @param {string[]} allowedFields - Campos permitidos para ordenación
 * @returns {Object} - Parámetros validados
 */
export function validateSortParams(params, allowedFields = []) {
  const result = {};

  if (params._sort !== undefined) {
    if (allowedFields.length > 0 && !allowedFields.includes(params._sort)) {
      throw new Error(`_sort debe ser uno de: ${allowedFields.join(", ")}`);
    }
    result._sort = params._sort;
  }

  if (params._order !== undefined) {
    if (!["asc", "desc"].includes(params._order)) {
      throw new Error('_order debe ser "asc" o "desc"');
    }
    result._order = params._order;
  }

  return result;
}

/**
 * Valida parámetros de fecha
 * @param {Object} params - Parámetros a validar
 * @returns {Object} - Parámetros validados
 */
export function validateDateParams(params) {
  const result = {};

  if (params.dateFrom !== undefined) {
    const date = new Date(params.dateFrom);
    if (isNaN(date.getTime())) {
      throw new Error("dateFrom debe ser una fecha válida en formato ISO");
    }
    result.dateFrom = params.dateFrom;
  }

  if (params.dateTo !== undefined) {
    const date = new Date(params.dateTo);
    if (isNaN(date.getTime())) {
      throw new Error("dateTo debe ser una fecha válida en formato ISO");
    }
    result.dateTo = params.dateTo;
  }

  // Validar que dateFrom sea anterior a dateTo
  if (result.dateFrom && result.dateTo) {
    if (new Date(result.dateFrom) > new Date(result.dateTo)) {
      throw new Error("dateFrom debe ser anterior a dateTo");
    }
  }

  return result;
}

/**
 * Valida parámetros específicos para feedback
 * @param {Object} params - Parámetros a validar
 * @returns {Object} - Parámetros validados
 */
export function validateFeedbackParams(params) {
  const result = {};
  const validStatuses = ["open", "acknowledged", "in_progress", "closed"];
  const validCategories = [
    "feature_request",
    "positive",
    "bug_report",
    "improvement",
  ];

  if (params.status !== undefined) {
    if (!validStatuses.includes(params.status)) {
      throw new Error(`status debe ser uno de: ${validStatuses.join(", ")}`);
    }
    result.status = params.status;
  }

  if (params.category !== undefined) {
    if (!validCategories.includes(params.category)) {
      throw new Error(
        `category debe ser uno de: ${validCategories.join(", ")}`
      );
    }
    result.category = params.category;
  }

  if (params.userId !== undefined) {
    if (typeof params.userId !== "string" || params.userId.trim() === "") {
      throw new Error("userId debe ser una cadena no vacía");
    }
    result.userId = params.userId.trim();
  }

  if (params.search !== undefined) {
    if (typeof params.search !== "string" || params.search.trim() === "") {
      throw new Error("search debe ser una cadena no vacía");
    }
    result.search = params.search.trim();
  }

  return result;
}

/**
 * Valida parámetros específicos para definitions
 * @param {Object} params - Parámetros a validar
 * @returns {Object} - Parámetros validados
 */
export function validateDefinitionsParams(params) {
  const result = {};
  const validCategories = [
    "Supply Chain",
    "Market Analysis",
    "Risk Management",
    "Finance",
  ];

  if (params.category !== undefined) {
    if (!validCategories.includes(params.category)) {
      throw new Error(
        `category debe ser uno de: ${validCategories.join(", ")}`
      );
    }
    result.category = params.category;
  }

  if (params.q !== undefined) {
    if (typeof params.q !== "string" || params.q.trim() === "") {
      throw new Error("q debe ser una cadena no vacía para búsqueda full-text");
    }
    result.q = params.q.trim();
  }

  return result;
}

// ===== BUILDERS DE QUERY =====

/**
 * Constructor de query para feedback con validación
 * @param {Object} params - Parámetros de consulta
 * @returns {string} - Query string validado
 */
export function buildFeedbackQuery(params = {}) {
  try {
    const validatedParams = {
      ...validatePaginationParams(params),
      ...validateSortParams(params, [
        "id",
        "timestamp",
        "status",
        "category",
        "userId",
      ]),
      ...validateDateParams(params),
      ...validateFeedbackParams(params),
    };

    return buildQueryString(validatedParams);
  } catch (error) {
    throw new Error(`Error construyendo query para feedback: ${error.message}`);
  }
}

/**
 * Constructor de query para definitions con validación
 * @param {Object} params - Parámetros de consulta
 * @returns {string} - Query string validado
 */
export function buildDefinitionsQuery(params = {}) {
  try {
    const validatedParams = {
      ...validatePaginationParams(params),
      ...validateSortParams(params, ["id", "name", "category"]),
      ...validateDefinitionsParams(params),
    };

    return buildQueryString(validatedParams);
  } catch (error) {
    throw new Error(
      `Error construyendo query para definitions: ${error.message}`
    );
  }
}

/**
 * Constructor de query para analysis con validación
 * @param {Object} params - Parámetros de consulta
 * @returns {string} - Query string validado
 */
export function buildAnalysisQuery(params = {}) {
  try {
    const validatedParams = {
      ...validatePaginationParams(params),
      ...validateSortParams(params, ["id", "name", "code"]),
    };

    if (params.search !== undefined) {
      if (typeof params.search !== "string" || params.search.trim() === "") {
        throw new Error("search debe ser una cadena no vacía");
      }
      validatedParams.search = params.search.trim();
    }

    if (params.name !== undefined) {
      if (typeof params.name !== "string" || params.name.trim() === "") {
        throw new Error("name debe ser una cadena no vacía");
      }
      validatedParams.name = params.name.trim();
    }

    if (params.code !== undefined) {
      if (typeof params.code !== "string" || params.code.trim() === "") {
        throw new Error("code debe ser una cadena no vacía");
      }
      validatedParams.code = params.code.trim();
    }

    return buildQueryString(validatedParams);
  } catch (error) {
    throw new Error(`Error construyendo query para analysis: ${error.message}`);
  }
}

/**
 * Construye un query string desde un objeto de parámetros
 * @param {Object} params - Parámetros a convertir
 * @returns {string} - Query string
 */
export function buildQueryString(params) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
}

// ===== HELPERS DE PAGINACIÓN =====

/**
 * Calcula información de paginación
 * @param {number} totalCount - Total de elementos
 * @param {number} currentPage - Página actual
 * @param {number} perPage - Elementos por página
 * @returns {Object} - Información de paginación
 */
export function calculatePagination(totalCount, currentPage, perPage) {
  const totalPages = Math.ceil(totalCount / perPage);

  return {
    totalCount,
    totalPages,
    currentPage,
    perPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    startIndex: (currentPage - 1) * perPage,
    endIndex: Math.min(currentPage * perPage, totalCount),
  };
}

/**
 * Genera enlaces de paginación
 * @param {string} baseUrl - URL base
 * @param {Object} paginationInfo - Información de paginación
 * @param {Object} otherParams - Otros parámetros de query
 * @returns {Object} - Enlaces de paginación
 */
export function generatePaginationLinks(
  baseUrl,
  paginationInfo,
  otherParams = {}
) {
  const buildUrl = (page) => {
    const params = { ...otherParams, _page: page };
    const queryString = buildQueryString(params);
    return `${baseUrl}${queryString ? "?" + queryString : ""}`;
  };

  const links = {};

  if (paginationInfo.hasPrevPage) {
    links.prev = buildUrl(paginationInfo.currentPage - 1);
    links.first = buildUrl(1);
  }

  if (paginationInfo.hasNextPage) {
    links.next = buildUrl(paginationInfo.currentPage + 1);
    links.last = buildUrl(paginationInfo.totalPages);
  }

  return links;
}

// ===== HELPERS DE FILTRADO =====

/**
 * Limpia y normaliza parámetros de entrada
 * @param {Object} params - Parámetros a limpiar
 * @returns {Object} - Parámetros limpios
 */
export function sanitizeParams(params) {
  const cleaned = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      // Limpiar strings
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed !== "") {
          cleaned[key] = trimmed;
        }
      } else {
        cleaned[key] = value;
      }
    }
  });

  return cleaned;
}

/**
 * Convierte parámetros de string a tipos apropiados
 * @param {Object} params - Parámetros a convertir
 * @returns {Object} - Parámetros con tipos correctos
 */
export function normalizeParamTypes(params) {
  const normalized = { ...params };

  // Convertir números
  ["_page", "_limit"].forEach((key) => {
    if (normalized[key] !== undefined) {
      const num = parseInt(normalized[key], 10);
      if (!isNaN(num)) {
        normalized[key] = num;
      }
    }
  });

  // Convertir booleanos
  ["shareChats", "hideIndexTable"].forEach((key) => {
    if (normalized[key] !== undefined) {
      const str = String(normalized[key]).toLowerCase();
      if (str === "true" || str === "1") {
        normalized[key] = true;
      } else if (str === "false" || str === "0") {
        normalized[key] = false;
      }
    }
  });

  return normalized;
}

// ===== CONSTANTES Y CONFIGURACIÓN =====

export const VALIDATION_CONFIG = {
  pagination: {
    maxLimit: 100,
    defaultLimit: 10,
    defaultPage: 1,
  },
  feedback: {
    validStatuses: ["open", "acknowledged", "in_progress", "closed"],
    validCategories: [
      "feature_request",
      "positive",
      "bug_report",
      "improvement",
    ],
    sortableFields: ["id", "timestamp", "status", "category", "userId"],
  },
  definitions: {
    validCategories: [
      "Supply Chain",
      "Market Analysis",
      "Risk Management",
      "Finance",
    ],
    sortableFields: ["id", "name", "category"],
  },
  analysis: {
    sortableFields: ["id", "name", "code"],
  },
  settings: {
    sortableFields: ["id", "userId", "createdAt", "updatedAt"],
  },
};

export default {
  validatePaginationParams,
  validateSortParams,
  validateDateParams,
  validateFeedbackParams,
  validateDefinitionsParams,
  buildFeedbackQuery,
  buildDefinitionsQuery,
  buildAnalysisQuery,
  buildQueryString,
  calculatePagination,
  generatePaginationLinks,
  sanitizeParams,
  normalizeParamTypes,
  VALIDATION_CONFIG,
};
