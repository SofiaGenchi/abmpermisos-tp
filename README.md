# Módulo de Carrito de Compras y Gestión de Productos

Este proyecto extiende la base del sistema existente agregando un módulo de **gestión de productos**, **carrito de compras por usuario** e **historial de compras**, integrados con un sistema de **permisos** para controlar el acceso a cada funcionalidad.

---

## Tecnologías utilizadas

- Node.js + Express
- MongoDB + Mongoose
- Sesiones de Express (autenticación por sesión)
- HTML / CSS / JavaScript vanilla para las vistas principales:
  - `login.html`
  - `register.html`
  - `dashboard.html`
  - `admin.html`

---

## Estructura de datos / Tablas nuevas

### `User`
Extiende la información del usuario para manejar el carrito.

- `username` (String, único)
- `password` (String, hash)
- `role` (String: `'user' | 'admin'`)
- `cart` (Array):
  - `productId` (String)
  - `name` (String)
  - `description` (String)
  - `price` (Number)
  - `quantity` (Number)
- `createdAt` (Date)

🔹 **Relación**:  
Cada usuario tiene su propio carrito (`cart`), aislado del resto de los usuarios.

---

### `Product`
Tabla de productos administrables desde el panel de administración.

- `name` (String, requerido)
- `description` (String, opcional)
- `price` (Number, requerido, `>= 0`)
- `stock` (Number, requerido, `>= 0`)
- `createdAt` (Date)

🔹 **Validaciones clave**:

- No se permiten **precios negativos**.
- No se permite **stock negativo**.

---

### `Permission`
Permisos del sistema asociados a roles.

- `name` (String, único, en minúsculas)
- `description` (String)
- `roles` (Array de String, por ejemplo: `['admin']`, `['user', 'admin']`)
- `createdAt` (Date)

🔹 **Uso**:  
Se utiliza para controlar qué roles pueden:

- Ver productos
- Gestionar productos
- Crear compras
- Ver historial de compras

---

### `Purchase` (Compra)

Registra cada compra realizada por un usuario, junto con sus detalles.

- `user` (ObjectId → `User`)
- `details` (Array de detalles de compra):
  - `product` (ObjectId → `Product`)
  - `name` (String, nombre del producto al momento de la compra)
  - `priceUnit` (Number, precio unitario)
  - `quantity` (Number, cantidad comprada)
  - `subtotal` (Number = `priceUnit * quantity`)
- `total` (Number, suma de subtotales)
- `createdAt` (Date)

🔹 **Relaciones**:

- Un **usuario** puede tener **muchas compras**.
- Una **compra** tiene **muchos detalles**.
- Cada **detalle_compra** pertenece a un **producto**.

---

## Permisos creados y función

Se definen los siguientes permisos recomendados:

- `ver_productos`  
  Permite visualizar el listado de productos.

- `gestionar_productos`  
  Permite **crear, editar y eliminar** productos desde el panel de administración.

- `crear_compra`  
  Permite **finalizar una compra** desde el carrito.

- `ver_compras`  
  Permite ver el **historial de compras** de un usuario.

Estos permisos se almacenan en la colección `permissions` y se asocian a uno o más roles a través del campo `roles`.  
El middleware `requirePermission(name)` verifica, para cada ruta protegida, si el `role` del usuario actual está incluido en los roles habilitados para ese permiso.

---

## Flujo de uso del carrito

### 1. Autenticación

1. El usuario se **registra** en `register.html`:
   - `POST /api/auth/register`
2. El usuario inicia sesión en `login.html`:
   - `POST /api/auth/login`
3. Si el login es exitoso, se guarda la sesión y se redirige a:
   - `dashboard.html` (usuarios)
   - `admin.html` (si el rol es `admin`)

---

### 2. Gestión de productos (solo administradores)

Desde `admin.html`, un usuario con rol `admin` y permiso `gestionar_productos` puede:

- Listar productos existentes:
  - `GET /api/products`
- Crear productos:
  - `POST /api/products`
- Editar productos:
  - `PUT /api/products/:productId`
- Eliminar productos:
  - `DELETE /api/products/:productId`

Se validan:

- `price >= 0`
- `stock >= 0` (a nivel de esquema de Mongoose)

El acceso a estas operaciones se controla con:

- Middleware de rol (`requireAdmin`)
- Middleware de permiso (`requirePermission('gestionar_productos')`)

---

### 3. Agregar productos al carrito

En `dashboard.html`:

1. El usuario ve el listado de productos:
   - `GET /api/products`
2. Cada producto tiene un botón **“Agregar”**:
   - `POST /api/auth/cart`
   - Body: `{ product: { productId } }`

En el backend (`addToCart`):

- Se busca el producto real en base al `productId`.
- Se agrega al carrito del usuario (`User.cart`), o se incrementa la cantidad si ya existe.
- Se devuelve el carrito actualizado.

---

### 4. Modificar y eliminar productos del carrito

Desde la sección **Carrito** en `dashboard.html`:

- Botón **+**: incrementa la cantidad
  - `PUT /api/auth/cart`  
    Body: `{ productId, quantity }`
- Botón **−**: disminuye la cantidad
  - Si la cantidad llega a 0 o menos, se elimina el ítem.
- Botón **Eliminar**: remueve el producto del carrito
  - `DELETE /api/auth/cart`  
    Body: `{ productId }`

El carrito se vuelve a renderizar con el total actualizado.

---

### 5. Finalizar compra

Cuando el usuario tiene productos en el carrito, aparece el botón **“Finalizar compra”** en la sección de carrito.

- Endpoint:
  - `POST /api/auth/cart/checkout`
- Protegido por:
  - `requirePermission('crear_compra')`

En el backend (`checkoutCart`):

1. Se valida que el usuario esté autenticado.
2. Se obtiene el carrito del usuario.
3. Se cargan los productos desde la base de datos.
4. Se valida que:
   - La cantidad pedida no supere el `stock` disponible.
5. Se calcula:
   - `subtotal` por ítem (`priceUnit * quantity`)
   - `total` de la compra (suma de subtotales)
6. Se descuenta el stock de cada producto.
7. Se crea un registro en `Purchase` con todos los detalles.
8. Se vacía el carrito del usuario (`user.cart = []`).
9. Se devuelve un mensaje de confirmación y los datos de la compra.

---

### 6. Ver historial de compras

En la sección **“Mis compras”** de `dashboard.html`:

- Se llama a:
  - `GET /api/purchases/mine`
- Protegido por:
  - `requirePermission('ver_compras')`

El endpoint devuelve todas las compras del usuario autenticado, ordenadas por fecha (más recientes primero), incluyendo:

- `id` de la compra
- `fecha` (`createdAt`)
- `total`
- Detalles:
  - `name`
  - `priceUnit`
  - `quantity`
  - `subtotal`

Estas compras se muestran en tarjetas con la información de cada compra y sus productos asociados.

---

## Resumen

Con este desarrollo se cumple con los siguientes puntos:

- Gestión de productos con validaciones de precio y stock.
- Carrito de compras propio por usuario autenticado.
- Registro y persistencia de compras e ítems de detalle.
- Historial de compras por usuario.
- Integración de permisos (`ver_productos`, `gestionar_productos`, `crear_compra`, `ver_compras`) para restringir el acceso a las acciones críticas del sistema.
