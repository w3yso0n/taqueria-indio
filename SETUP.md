# Guía de Configuración - OrdenEya

## Pasos para configurar la base de datos

### 1. Crear la base de datos

Abre tu cliente MySQL (MySQL Workbench, phpMyAdmin, o terminal) y ejecuta:

```sql
CREATE DATABASE ordeneya;
```

### 2. Importar el schema

Desde la terminal, ejecuta:

```bash
mysql -u root -p ordeneya < database/schema.sql
```

O si prefieres hacerlo manualmente, copia y pega el contenido de `database/schema.sql` en tu cliente MySQL.

### 3. Configurar variables de entorno

Edita el archivo `.env` en la raíz del proyecto con tus credenciales:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_password_aqui
DB_DATABASE=ordeneya
```

> **Nota**: El archivo `.env` ya existe en el proyecto. Solo necesitas actualizarlo con tus credenciales.

### 4. Verificar la conexión

El servidor Next.js se conectará automáticamente a la base de datos cuando hagas una petición a las API routes.

Para verificar que todo funciona:

1. Asegúrate de que el servidor de desarrollo esté corriendo:
   ```bash
   pnpm dev
   ```

2. Abre tu navegador en `http://localhost:3000/cliente`

3. Si ves los productos del menú, ¡la conexión fue exitosa! 🎉

## Estructura de la base de datos

### Tabla: productos
- `id`: ID único del producto
- `nombre`: Nombre del producto
- `precio`: Precio del producto
- `imagen`: URL de la imagen (opcional)

### Tabla: pedidos
- `id`: ID único del pedido
- `clienteNombre`: Nombre del cliente
- `tipo`: Tipo de pedido (LOCAL, PARA_LLEVAR, etc.)
- `estado`: Estado actual (RECIBIDO, PREPARANDO, LISTO, ENTREGADO)
- `total`: Total del pedido

### Tabla: pedido_items
- `id`: ID único del item
- `pedidoId`: Referencia al pedido
- `productoId`: Referencia al producto
- `cantidad`: Cantidad del producto
- `precioUnitario`: Precio al momento de la orden
- `notas`: Notas especiales (opcional)

## Datos de ejemplo

El schema incluye 6 productos de ejemplo:
- Tacos al Pastor - $45.00
- Quesadillas - $35.00
- Enchiladas - $55.00
- Pozole - $65.00
- Torta Cubana - $50.00
- Agua de Horchata - $20.00

## Solución de problemas

### Error: "Access denied for user"
- Verifica que el usuario y contraseña en `.env` sean correctos
- Asegúrate de que el usuario tenga permisos en la base de datos

### Error: "Unknown database"
- Verifica que la base de datos `ordeneya` exista
- Ejecuta: `CREATE DATABASE ordeneya;`

### Error: "Table doesn't exist"
- Asegúrate de haber ejecutado el script `database/schema.sql`
- Verifica que estés en la base de datos correcta

### Los productos no se cargan
- Abre la consola del navegador (F12) y busca errores
- Verifica que el servidor de desarrollo esté corriendo
- Revisa los logs del servidor en la terminal
