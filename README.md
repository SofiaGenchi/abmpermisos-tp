# Trabajo Práctica: ABM de Permisos (Backend) - Sofia Genchi

Este proyecto implementa la funcionalidad **ABM (Alta, Baja, Modificación) de Permisos** siguiendo la consigna del trabajo práctico.

La solución utiliza **Node.js, Express y MongoDB (Mongoose)**, según lo permitido. El *frontend* (vistas EJS) se omite, y todas las operaciones se verifican a través de la API RESTful.

---

## 🚀 1. Configuración e Inicio del Proyecto

### 1.1. Prerrequisitos

## ABM Permisos + Carrito (Backend + Front simple)

Pequeña aplicación que implementa registro/ login de usuarios, persistencia de usuarios y carrito en MongoDB, y un CRUD para productos. Incluye una UI estática mínima para login / registro / dashboard y una página administrativa para gestionar productos.

Tecnologías
- Node.js + Express
- MongoDB (Mongoose)
- express-session + connect-mongo para sesiones
- bcrypt para hashing de contraseñas

Características principales
- Registro y login de usuarios (contraseña hasheada con bcrypt).
- Sesiones con cookies (express-session) y almacenamiento en MongoDB.
- Entidad Product con CRUD (API REST).
- Carrito persistente: cada usuario tiene un campo `cart` en su documento con items, cantidad y subtotal.
- Frontend estático en `src/public` con páginas: `login.html`, `register.html`, `dashboard.html`, `admin.html`.
- Interfaz minimalista y responsive (archivo `src/public/style.css`).

Contenido y endpoints principales

- Auth
    - POST /api/auth/register  — registrar usuario (body: { username, password })
    - POST /api/auth/login     — iniciar sesión (body: { username, password })
    - POST /api/auth/logout    — cerrar sesión
    - GET  /api/auth/me        — obtener usuario actual y carrito (requiere sesión)

- Carrito
    - POST   /api/auth/cart    — agregar producto al carrito (body: { product: { productId } })
    - PUT    /api/auth/cart    — actualizar cantidad (body: { productId, quantity })
    - DELETE /api/auth/cart    — eliminar item (body: { productId })

- Productos
    - GET    /api/products           — listar productos (público)
    - POST   /api/products?admin=1   — crear producto (admin -> protegido)
    - PUT    /api/products/:productId?admin=1 — actualizar producto (admin)
    - DELETE /api/products/:productId?admin=1 — eliminar producto (admin)

Notas: la protección admin en esta versión de desarrollo acepta `?admin=1` o `req.session.isAdmin === true`. Esto facilita pruebas pero NO es seguro en producción.

Front-end (estático)
- `src/public/register.html` — formulario de registro.
- `src/public/login.html` — formulario de login.
- `src/public/dashboard.html` — lista productos (cargados desde /api/products), añadir al carrito, ver y modificar carrito.
- `src/public/admin.html` — página administrativa para crear/editar/eliminar productos (visible con `?admin=1`).

Instalación y ejecución (PowerShell / Windows)
1) Abrir terminal en la carpeta `backend`:
```powershell
cd 'c:\Users\oi\Desktop\clase-backend\ABMPermisos-tp\backend'
npm install
```

2) Crear `.env` en `backend/` con al menos:
```
DB_URL=mongodb://...    # tu conexión a MongoDB
SESSION_SECRET=un_valor_secreto
PORT=5000
NODE_ENV=development
```

3) Iniciar el servidor:
```
npm start
```

4) Acceder en el navegador:
- http://localhost:5000/register.html
- http://localhost:5000/login.html
- http://localhost:5000/dashboard.html
- http://localhost:5000/admin.html?admin=1  (panel de administración de productos)

Notas de verificación rápidas
- Tras registrarte e iniciar sesión, `dashboard.html` debe mostrar "Usuario autenticado: <username>" y permitir agregar productos al carrito.
- El carrito se persiste en MongoDB dentro del documento `users`.

Seguridad y recomendaciones
- En producción, reemplazar la comprobación `?admin=1` por roles reales en la base de datos (campo `isAdmin` en `User`) y middleware que valide roles.
- Establecer `SESSION_SECRET` fuerte y no usar valores por defecto.
- Revisar políticas CORS y CSRF antes de desplegar (actualmente CORS está relajado para localhost durante desarrollo).

Archivos importantes
- `index.js` — configuración del servidor, sesiones y rutas.
- `src/config/db.js` — conexión a MongoDB.
- `src/models/User.model.js` — esquema de usuario (username, password, cart).
- `src/models/Product.model.js` — esquema de producto.
- `src/controllers/Auth.controller.js` — lógica de registro, login, carrito.
- `src/controllers/Product.controller.js` — lógica CRUD de productos.
- `src/routes/*.js` — rutas del API.
- `src/public/*` — HTML/CSS/JS del frontend estático.

Próximos pasos sugeridos
- Añadir un endpoint y UI para promover usuarios a administradores (agregar `isAdmin` en User).
- Implementar toasts/animaciones para mejor UX.
- Añadir tests automáticos (supertest/mocha/jest) para endpoints principales.

Licencia / Autor
- Autor: Sofia Genchi, IFTS16 2do Cuatrimestre, Backend, 2025.
