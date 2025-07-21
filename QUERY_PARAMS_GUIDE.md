# 📋 Interfaces y Tipos para Query Parameters

Este directorio contiene las interfaces, tipos y utilidades para trabajar con los parámetros de consulta del servidor JSON Server 0.17.

## 🗂️ Archivos incluidos

### 📄 `types/query-params.d.ts`

Definiciones de tipos TypeScript/interfaces para todos los parámetros de consulta disponibles.

### 📄 `examples/usage-examples.js`

Ejemplos prácticos de cómo usar las interfaces tanto en JavaScript como TypeScript.

### 📄 `utils/query-validators.js`

Funciones de validación y helpers para trabajar con los parámetros de consulta.

## 🎯 Interfaces Principales

### **BaseQueryParams**

Parámetros base que todas las rutas pueden aceptar:

```typescript
interface BaseQueryParams {
  _page?: number | string; // Número de página
  _limit?: number | string; // Elementos por página
  _sort?: string; // Campo para ordenar
  _order?: "asc" | "desc"; // Orden de clasificación
  [key: string]: any; // Filtros adicionales
}
```

### **FeedbackQueryParams**

Parámetros específicos para `/feedback`:

```typescript
interface FeedbackQueryParams extends BaseQueryParams {
  status?: "open" | "acknowledged" | "in_progress" | "closed";
  category?: "feature_request" | "positive" | "bug_report" | "improvement";
  userId?: string;
  search?: string; // Búsqueda personalizada
  dateFrom?: string; // Fecha desde (ISO)
  dateTo?: string; // Fecha hasta (ISO)
}
```

### **DefinitionsQueryParams**

Parámetros específicos para `/definitions`:

```typescript
interface DefinitionsQueryParams extends BaseQueryParams {
  category?: "Supply Chain" | "Market Analysis" | "Risk Management" | "Finance";
  q?: string; // Búsqueda full-text
}
```

### **AnalysisQueryParams**

Parámetros específicos para `/cases/analysis`:

```typescript
interface AnalysisQueryParams extends BaseQueryParams {
  name?: string; // Filtrar por nombre
  code?: string; // Filtrar por código
  search?: string; // Búsqueda personalizada
}
```

## 🔧 Funciones de Utilidad

### **Constructores de Query**

```javascript
// Construir query para feedback
const queryString = buildFeedbackQuery({
  status: "open",
  _page: 1,
  _limit: 10,
  _sort: "timestamp",
  _order: "desc",
});

// Construir query para definitions
const queryString = buildDefinitionsQuery({
  category: "Supply Chain",
  _page: 1,
  _limit: 5,
});
```

### **Validadores**

```javascript
// Validar parámetros de paginación
const validatedParams = validatePaginationParams({
  _page: "1", // Se convierte a number
  _limit: "10", // Se convierte a number
});

// Validar parámetros de feedback
const validatedFeedback = validateFeedbackParams({
  status: "open", // ✅ Válido
  category: "positive", // ✅ Válido
  userId: "user123", // ✅ Válido
});
```

## 📖 Ejemplos de Uso

### **JavaScript Básico**

```javascript
// Crear cliente
const client = new JsonServerClient("http://localhost:5000");

// Obtener feedback paginado
const response = await client.getFeedbackPaginated(1, 10, {
  status: "open",
  search: "supply chain",
});

console.log("Datos:", response.data);
console.log("Paginación:", response.pagination);
```

### **Con validación**

```javascript
import {
  buildFeedbackQuery,
  validateFeedbackParams,
} from "./utils/query-validators.js";

try {
  const params = validateFeedbackParams({
    status: "open",
    category: "feature_request",
    _page: 1,
    _limit: 10,
  });

  const queryString = buildFeedbackQuery(params);
  const url = `http://localhost:5000/feedback?${queryString}`;

  const response = await fetch(url);
  const data = await response.json();
} catch (error) {
  console.error("Error de validación:", error.message);
}
```

### **TypeScript**

```typescript
import { FeedbackQueryParams, ApiResponse } from "./types/query-params";

async function getFeedback(params: FeedbackQueryParams): Promise<ApiResponse> {
  const queryString = buildFeedbackQuery(params);
  const response = await fetch(`/feedback?${queryString}`);
  return response.json();
}

// Uso con tipado
const result = await getFeedback({
  status: "open", // ✅ Autocompletado y validación
  _page: 1,
  _limit: 10,
});
```

## 🎯 Casos de Uso Comunes

### **1. Paginación Simple**

```javascript
// Página 1 con 10 elementos
const params = {
  _page: 1,
  _limit: 10,
};

const response = await client.getFeedback(params);
```

### **2. Filtrado por Estado**

```javascript
// Solo feedback abierto
const params = {
  status: "open",
  _sort: "timestamp",
  _order: "desc",
};

const response = await client.getFeedback(params);
```

### **3. Búsqueda de Texto**

```javascript
// Buscar 'supply' en feedback
const params = {
  search: "supply",
  status: "open",
};

const response = await client.getFeedback(params);
```

### **4. Filtros de Fecha**

```javascript
// Feedback del último mes
const params = {
  dateFrom: "2024-01-01",
  dateTo: "2024-01-31",
  _sort: "timestamp",
  _order: "desc",
};

const response = await client.getFeedback(params);
```

### **5. Combinación Compleja**

```javascript
// Búsqueda avanzada con todos los filtros
const params = {
  search: "supply chain",
  status: "open",
  category: "feature_request",
  dateFrom: "2024-01-15",
  _sort: "timestamp",
  _order: "desc",
  _page: 1,
  _limit: 5,
};

const response = await client.getFeedback(params);
```

## 🚨 Validaciones y Restricciones

### **Paginación**

- `_page`: Debe ser ≥ 1
- `_limit`: Debe ser entre 1 y 100

### **Ordenación**

- `_order`: Solo 'asc' o 'desc'
- `_sort`: Solo campos permitidos por endpoint

### **Fechas**

- Formato ISO: 'YYYY-MM-DD' o 'YYYY-MM-DDTHH:mm:ssZ'
- `dateFrom` debe ser anterior a `dateTo`

### **Estados de Feedback**

- Valores válidos: 'open', 'acknowledged', 'in_progress', 'closed'

### **Categorías**

- **Feedback**: 'feature_request', 'positive', 'bug_report', 'improvement'
- **Definitions**: 'Supply Chain', 'Market Analysis', 'Risk Management', 'Finance'

## 🔗 URLs de Ejemplo

```bash
# Paginación básica
GET /feedback?_page=1&_limit=10

# Filtrado por estado
GET /feedback?status=open&_sort=timestamp&_order=desc

# Búsqueda de texto
GET /feedback?search=supply%20chain&status=open

# Filtros de fecha
GET /feedback?dateFrom=2024-01-16&dateTo=2024-01-17

# Definitions por categoría
GET /definitions?category=Supply%20Chain&_page=1&_limit=5

# Búsqueda full-text en definitions
GET /definitions?q=optimization

# Analysis con filtros
GET /cases/analysis?search=supply&_sort=name&_order=asc

# Combinación compleja
GET /feedback?status=open&category=feature_request&search=helpful&_page=1&_limit=5&_sort=timestamp&_order=desc
```

## 📊 Estructura de Respuesta

Todas las respuestas siguen este formato:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "totalCount": 25,
    "totalPages": 3,
    "currentPage": 1,
    "perPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## 🛠️ Integración con Frontend

### **React Hook Ejemplo**

```javascript
import { useState, useEffect } from "react";
import { JsonServerClient } from "./examples/usage-examples.js";

function useFeedback(filters = {}) {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);

  const client = new JsonServerClient();

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const response = await client.getFeedbackPaginated(page, 10, filters);
      setData(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [filters]);

  return { data, pagination, loading, fetchData };
}
```

### **Vue.js Composable Ejemplo**

```javascript
import { ref, reactive, watch } from "vue";
import { JsonServerClient } from "./examples/usage-examples.js";

export function useFeedback(initialFilters = {}) {
  const data = ref([]);
  const pagination = ref(null);
  const loading = ref(false);
  const filters = reactive(initialFilters);

  const client = new JsonServerClient();

  const fetchData = async (page = 1) => {
    loading.value = true;
    try {
      const response = await client.getFeedbackPaginated(page, 10, filters);
      data.value = response.data;
      pagination.value = response.pagination;
    } catch (error) {
      console.error("Error:", error);
    } finally {
      loading.value = false;
    }
  };

  watch(filters, () => fetchData(1), { deep: true });

  return { data, pagination, loading, filters, fetchData };
}
```
