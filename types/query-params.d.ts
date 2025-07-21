/**
 * JSON Server 0.17 - Interfaces y Tipos para Query Parameters
 *
 * Este archivo define las interfaces y tipos para los parámetros de consulta
 * utilizados en el servidor JSON Server con funcionalidades de paginación,
 * filtrado, búsqueda y ordenación.
 */

// ===== INTERFACES PARA QUERY PARAMETERS =====

/**
 * Parámetros de paginación para todas las rutas
 */
export interface PaginationParams {
  /** Número de página (comenzando desde 1) */
  _page?: number | string;
  /** Número de elementos por página */
  _limit?: number | string;
}

/**
 * Parámetros de ordenación para todas las rutas
 */
export interface SortParams {
  /** Campo por el cual ordenar */
  _sort?: string;
  /** Orden: 'asc' para ascendente, 'desc' para descendente */
  _order?: "asc" | "desc";
}

/**
 * Parámetros de búsqueda full-text (solo rutas nativas)
 */
export interface FullTextSearchParams {
  /** Búsqueda full-text en todos los campos */
  q?: string;
}

/**
 * Parámetros de búsqueda personalizada (rutas personalizadas)
 */
export interface CustomSearchParams {
  /** Búsqueda en campos específicos */
  search?: string;
}

/**
 * Operadores de rango para rutas nativas
 */
export interface RangeOperators {
  /** Mayor o igual que */
  [key: `${string}_gte`]: number | string;
  /** Menor o igual que */
  [key: `${string}_lte`]: number | string;
  /** No igual */
  [key: `${string}_ne`]: number | string;
  /** Contiene (like) */
  [key: `${string}_like`]: string;
}

/**
 * Parámetros base que todas las rutas pueden aceptar
 */
export interface BaseQueryParams extends PaginationParams, SortParams {
  /** Cualquier campo del modelo para filtrado exacto */
  [key: string]: string | number | undefined;
}

// ===== INTERFACES ESPECÍFICAS POR ENDPOINT =====

/**
 * Query parameters para el endpoint /feedback
 */
export interface FeedbackQueryParams
  extends BaseQueryParams,
    CustomSearchParams {
  /** Filtrar por status */
  status?: "open" | "acknowledged" | "in_progress" | "closed";
  /** Filtrar por categoría */
  category?: "feature_request" | "positive" | "bug_report" | "improvement";
  /** Filtrar por ID de usuario */
  userId?: string;
  /** Filtrar desde una fecha (ISO string) */
  dateFrom?: string;
  /** Filtrar hasta una fecha (ISO string) */
  dateTo?: string;
}

/**
 * Query parameters para el endpoint /cases/analysis
 */
export interface AnalysisQueryParams
  extends BaseQueryParams,
    CustomSearchParams {
  /** Filtrar por nombre del análisis */
  name?: string;
  /** Filtrar por código del análisis */
  code?: string;
}

/**
 * Query parameters para el endpoint /cases
 */
export interface CasesQueryParams extends BaseQueryParams, CustomSearchParams {
  /** Filtrar por tipo de análisis */
  analysisNameType?: string;
}

/**
 * Query parameters para endpoints nativos (definitions, settings, etc.)
 */
export interface NativeQueryParams
  extends BaseQueryParams,
    FullTextSearchParams,
    Partial<RangeOperators> {
  /** Filtros específicos del modelo */
  [key: string]: string | number | undefined;
}

/**
 * Query parameters específicos para /definitions
 */
export interface DefinitionsQueryParams extends NativeQueryParams {
  /** Filtrar por categoría */
  category?: "Supply Chain" | "Market Analysis" | "Risk Management" | "Finance";
}

/**
 * Query parameters específicos para /settings
 */
export interface SettingsQueryParams extends NativeQueryParams {
  /** Filtrar por ID de usuario */
  userId?: string;
  /** Filtrar por configuración de compartir chats */
  shareChats?: boolean | string;
  /** Filtrar por configuración de ocultar tabla de índice */
  hideIndexTable?: boolean | string;
}

// ===== INTERFACES PARA RESPUESTAS =====

/**
 * Información de paginación incluida en las respuestas
 */
export interface PaginationInfo {
  /** Número total de elementos */
  totalCount: number;
  /** Número total de páginas */
  totalPages: number;
  /** Página actual */
  currentPage: number;
  /** Elementos por página */
  perPage: number;
  /** Si hay página siguiente */
  hasNextPage: boolean;
  /** Si hay página anterior */
  hasPrevPage: boolean;
}

/**
 * Estructura base de todas las respuestas del servidor
 */
export interface ApiResponse<T = any> {
  /** Indica si la operación fue exitosa */
  success: boolean;
  /** Los datos de la respuesta */
  data: T;
  /** Información de paginación (opcional) */
  pagination?: PaginationInfo;
}

/**
 * Respuesta específica para listas paginadas
 */
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  /** Información de paginación (siempre presente) */
  pagination: PaginationInfo;
}

// ===== TIPOS DE UTILIDAD =====

/**
 * Tipos de métodos HTTP soportados
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Opciones de ordenación
 */
export type SortOrder = "asc" | "desc";

/**
 * Estados disponibles para feedback
 */
export type FeedbackStatus = "open" | "acknowledged" | "in_progress" | "closed";

/**
 * Categorías disponibles para feedback
 */
export type FeedbackCategory =
  | "feature_request"
  | "positive"
  | "bug_report"
  | "improvement";

/**
 * Categorías disponibles para definitions
 */
export type DefinitionCategory =
  | "Supply Chain"
  | "Market Analysis"
  | "Risk Management"
  | "Finance";

// ===== FUNCIONES DE UTILIDAD PARA CONSTRUIR QUERIES =====

/**
 * Construye query parameters para paginación
 */
export const buildPaginationParams = (
  page: number,
  limit: number
): PaginationParams => ({
  _page: page,
  _limit: limit,
});

/**
 * Construye query parameters para ordenación
 */
export const buildSortParams = (
  field: string,
  order: SortOrder = "asc"
): SortParams => ({
  _sort: field,
  _order: order,
});

/**
 * Construye query parameters para búsqueda de feedback
 */
export const buildFeedbackQuery = (
  params: Partial<FeedbackQueryParams>
): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
};

/**
 * Construye query parameters para búsqueda de definitions
 */
export const buildDefinitionsQuery = (
  params: Partial<DefinitionsQueryParams>
): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
};

// ===== CONSTANTES =====

/**
 * Valores por defecto para paginación
 */
export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 10,
  maxLimit: 100,
} as const;

/**
 * Campos disponibles para ordenación por endpoint
 */
export const SORTABLE_FIELDS = {
  feedback: ["id", "timestamp", "status", "category", "userId"],
  definitions: ["id", "name", "category"],
  analysis: ["id", "name", "code"],
  settings: ["id", "userId", "createdAt", "updatedAt"],
} as const;

/**
 * Operadores de rango disponibles
 */
export const RANGE_OPERATORS = ["_gte", "_lte", "_ne", "_like"] as const;

export default {
  PaginationParams,
  SortParams,
  FullTextSearchParams,
  CustomSearchParams,
  BaseQueryParams,
  FeedbackQueryParams,
  AnalysisQueryParams,
  CasesQueryParams,
  NativeQueryParams,
  DefinitionsQueryParams,
  SettingsQueryParams,
  PaginationInfo,
  ApiResponse,
  PaginatedResponse,
  buildPaginationParams,
  buildSortParams,
  buildFeedbackQuery,
  buildDefinitionsQuery,
  PAGINATION_DEFAULTS,
  SORTABLE_FIELDS,
  RANGE_OPERATORS,
};
