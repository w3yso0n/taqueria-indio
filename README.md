# OrdenEya - Sistema de Pedidos

Sistema de gestión de pedidos para restaurantes construido con Next.js y MySQL.

## Características

- 📱 **Modo Cliente**: Los clientes pueden ver el menú y realizar pedidos
- 👨‍🍳 **Modo Mesero**: Los meseros pueden tomar pedidos para los clientes
- 🏪 **Panel de Cocina**: Vista Kanban para gestionar el estado de los pedidos
- 📊 **Gestión de Productos**: Administración del menú
- 🔄 **Actualizaciones en tiempo real**: Los pedidos se actualizan automáticamente

## Requisitos

- Node.js 18+
- MySQL 5.7+ o MariaDB 10.3+
- pnpm (recomendado) o npm

## Configuración

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd ordeneya
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar la base de datos

Crea una base de datos MySQL y ejecuta el script de schema:

```bash
mysql -u root -p < database/schema.sql
```

O manualmente:

```sql
CREATE DATABASE ordeneya;
USE ordeneya;
-- Luego ejecuta el contenido de database/schema.sql
```

### 4. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y configura tus credenciales:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de MySQL:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_password
DB_DATABASE=ordeneya
```

### 5. Ejecutar el servidor de desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del Proyecto

```
ordeneya/
├── app/
│   ├── api/              # API Routes
│   │   ├── productos/    # Endpoints de productos
│   │   └── pedidos/      # Endpoints de pedidos
│   ├── cliente/          # Página de cliente/mesero
│   ├── negocio/          # Panel de cocina
│   └── page.tsx          # Página principal
├── components/           # Componentes React
│   └── ui/              # Componentes UI (shadcn)
├── lib/
│   ├── db.ts            # Utilidad de conexión a MySQL
│   ├── api.ts           # Cliente API
│   └── utils.ts         # Utilidades
├── database/
│   └── schema.sql       # Schema de base de datos
└── public/              # Archivos estáticos
```

## API Endpoints

### Productos

- `GET /api/productos` - Obtener todos los productos

### Pedidos

- `GET /api/pedidos` - Obtener todos los pedidos con items
- `POST /api/pedidos` - Crear un nuevo pedido
- `PATCH /api/pedidos/:id` - Actualizar estado de un pedido

## Tecnologías

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI, shadcn/ui
- **Animaciones**: Framer Motion
- **Base de Datos**: MySQL con mysql2
- **Fetching**: SWR para cache y revalidación

## Desarrollo

```bash
# Modo desarrollo
pnpm dev

# Build para producción
pnpm build

# Ejecutar producción
pnpm start

# Linting
pnpm lint
```

## PWA

La aplicación es instalable como PWA en dispositivos móviles. Visita la página desde tu móvil y selecciona "Agregar a pantalla de inicio".

## Licencia

MIT
# ordeneYa
# ordeneYa
# taqueria-indio
