# JSON Server 0.17 - Ejemplos de API

## 🔍 Paginación

### Paginación básica

```bash
# Obtener página 1 con 2 elementos
curl "http://localhost:5000/feedback?_page=1&_limit=2"

# Obtener página 2 con 2 elementos
curl "http://localhost:5000/feedback?_page=2&_limit=1"
```

**Respuesta con paginación:**

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "totalCount": 3,
    "totalPages": 2,
    "currentPage": 1,
    "perPage": 2,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## 🔎 Filtrado y Búsqueda

### Filtrado por campos específicos

```bash
# Filtrar feedback por status
curl "http://localhost:5000/feedback?status=open"

# Filtrar por múltiples campos
curl "http://localhost:5000/feedback?status=open&category=feature_request"

# Filtrar definitions por categoría
curl "http://localhost:5000/definitions?category=Supply%20Chain"
```

### Búsqueda de texto

```bash
# Búsqueda full-text (rutas nativas de JSON Server)
curl "http://localhost:5000/definitions?q=optimization"

# Búsqueda personalizada en cases/analysis
curl "http://localhost:5000/cases/analysis?search=supply"

# Búsqueda en feedback por mensaje
curl "http://localhost:5000/feedback?search=chain"
```

### Filtros de fecha

```bash
# Filtrar feedback por rango de fechas
curl "http://localhost:5000/feedback?dateFrom=2024-01-16&dateTo=2024-01-17"

# Filtrar desde una fecha específica
curl "http://localhost:5000/feedback?dateFrom=2024-01-16"
```

## 📊 Ordenación

### Ordenación simple

```bash
# Ordenar feedback por timestamp (ascendente)
curl "http://localhost:5000/feedback?_sort=timestamp&_order=asc"

# Ordenar por timestamp (descendente)
curl "http://localhost:5000/feedback?_sort=timestamp&_order=desc"

# Ordenar analysis por nombre
curl "http://localhost:5000/cases/analysis?_sort=name&_order=asc"
```

### Ordenación múltiple (solo rutas nativas)

```bash
# Ordenar por categoría y luego por nombre
curl "http://localhost:5000/definitions?_sort=category,name&_order=asc,desc"
```

## 🔢 Operadores de rango (rutas nativas)

```bash
# Mayor que o igual
curl "http://localhost:5000/feedback?id_gte=2"

# Menor que o igual
curl "http://localhost:5000/feedback?id_lte=2"

# Rango específico
curl "http://localhost:5000/feedback?id_gte=1&id_lte=2"

# No igual
curl "http://localhost:5000/feedback?id_ne=1"

# Similar a (like)
curl "http://localhost:5000/feedback?message_like=supply"
```

## 🎯 Combinaciones Avanzadas

### Paginación + Filtrado + Ordenación

```bash
# Buscar feedback abierto, ordenado por fecha, página 1
curl "http://localhost:5000/feedback?status=open&_sort=timestamp&_order=desc&_page=1&_limit=2"

# Buscar analysis con texto, ordenado por nombre
curl "http://localhost:5000/cases/analysis?search=supply&_sort=name&_order=asc&_page=1&_limit=1"

# Definitions con filtro y paginación
curl "http://localhost:5000/definitions?category=Supply%20Chain&_page=1&_limit=1"
```

### Filtros específicos por endpoint

#### Feedback avanzado

```bash
# Por usuario específico
curl "http://localhost:5000/feedback?userId=user123"

# Combinando usuario y status
curl "http://localhost:5000/feedback?userId=user123&status=open"

# Con búsqueda de texto en mensaje
curl "http://localhost:5000/feedback?search=helpful&status=open"
```

#### Cases con filtros personalizados

```bash
# Filtro por tipo de análisis
curl "http://localhost:5000/cases?analysisNameType=Supply"

# Búsqueda general en cases
curl "http://localhost:5000/cases?search=optimization"

# Cases con ordenación
curl "http://localhost:5000/cases?_sort=name&_order=desc"
```

## 📋 Respuestas esperadas

### Con paginación habilitada:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "totalCount": 10,
    "totalPages": 5,
    "currentPage": 1,
    "perPage": 2,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Sin paginación:

```json
{
  "success": true,
  "data": [...]
}
```

## 🚀 Ejemplos de uso en frontend

### JavaScript/Fetch

```javascript
// Paginación con filtros
const fetchFeedback = async (page = 1, status = "", search = "") => {
  const params = new URLSearchParams({
    _page: page,
    _limit: 10,
    _sort: "timestamp",
    _order: "desc",
  });

  if (status) params.append("status", status);
  if (search) params.append("search", search);

  const response = await fetch(`http://localhost:5000/feedback?${params}`);
  return response.json();
};

// Uso
const result = await fetchFeedback(1, "open", "supply");
console.log(result.data); // Los datos
console.log(result.pagination); // Info de paginación
```

### React Hook de ejemplo

```javascript
const usePaginatedFeedback = (filters = {}) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({
      _page: page,
      _limit: 10,
      _sort: "timestamp",
      _order: "desc",
      ...filters,
    });

    try {
      const response = await fetch(`/feedback?${params}`);
      const result = await response.json();
      setData(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  return { data, pagination, loading, fetchData };
};
```

## ⚡ Tips importantes

1. **Headers de paginación**: Además del objeto `pagination` en la respuesta, también se incluyen headers HTTP:

   - `X-Total-Count`: Total de elementos
   - `X-Total-Pages`: Total de páginas
   - `X-Current-Page`: Página actual
   - `X-Per-Page`: Elementos por página

2. **Rutas nativas vs personalizadas**:

   - Rutas nativas (`/definitions`, `/feedback`, `/settings`): Usan todas las funcionalidades de JSON Server
   - Rutas personalizadas (`/cases`, `/cases/analysis`): Usan lógica personalizada implementada

3. **Parámetros de consulta case-sensitive**: Los filtros respetan mayúsculas/minúsculas en el backend, pero la búsqueda de texto es case-insensitive.

4. **Combinación de filtros**: Todos los filtros se pueden combinar usando el operador AND lógico.
