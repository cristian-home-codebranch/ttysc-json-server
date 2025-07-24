# JSON Server con Autenticación Básica

Este servidor mock JSON incluye autenticación básica HTTP para proteger todos los endpoints.

## 🔐 Credenciales de Acceso

```
Username: admin  | Password: password123
Username: user   | Password: mypassword
Username: demo   | Password: demo123
```

## 🚀 Inicio Rápido

1. Instalar dependencias:

```bash
npm install
```

2. Iniciar el servidor:

```bash
npm start
```

3. Acceder a los endpoints con autenticación:

### Con cURL:

```bash
curl -u admin:password123 http://localhost:5000/cases
curl -u user:mypassword http://localhost:5000/feedback
```

### Con JavaScript (fetch):

```javascript
const response = await fetch("http://localhost:5000/cases", {
  headers: {
    Authorization: "Basic " + btoa("admin:password123"),
  },
});
```

### Con Postman:

1. Ir a la pestaña "Authorization"
2. Seleccionar "Basic Auth"
3. Ingresar username y password

## 📝 Notas de Seguridad

- En producción, usar HTTPS siempre
- Cambiar las credenciales por defecto
- Considerar usar tokens JWT para mayor seguridad
- Los usuarios están actualmente almacenados en memoria (cambiar por base de datos en producción)

## 🛠 Personalización

Para cambiar los usuarios, editar el archivo `auth.js`:

```javascript
const users = {
  tu_usuario: "tu_password",
  otro_usuario: "otra_password",
};
```
