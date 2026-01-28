# Barbería Premium - App de Reservas

Este es el MVP de una aplicación full-stack para la gestión de reservas en una barbería, construida con Next.js, Supabase y Shadcn/UI.

## 🚀 Cómo correr el proyecto de forma local

### 1. Clonar el repositorio e instalar dependencias
```bash
# Instalar las dependencias de Node.js
npm install
```

### 2. Configurar variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto basándote en el ejemplo:
```bash
cp .env.local.example .env.local
```
Completa las variables con tus credenciales de Supabase:
- `NEXT_PUBLIC_SUPABASE_URL`: La URL de tu proyecto Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: La clave anónima (anon key) de tu proyecto.

### 3. Configurar la Base de Datos
1. Ve al panel de control de **Supabase**.
2. Abre el **SQL Editor**.
3. Copia y pega el contenido del archivo `supabase/migrations/initial_schema.sql` y ejecútalo.
   - Esto creará las tablas `barbers`, `services`, `appointments`, habilitará la extensión `btree_gist` para evitar doble reservas y cargará datos de prueba.

### 4. Habilitar Realtime
Asegúrate de que la publicación de Realtime esté activa para la tabla `appointments`. El script SQL ya incluye los comandos para habilitarla, pero puedes verificarlo en el panel de Supabase (Database -> Replication).

### 5. Correr el servidor de desarrollo
```bash
npm run dev
```
La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

## 🛠️ Tecnologías utilizadas
- **Framework**: Next.js (App Router)
- **Estilos**: Tailwind CSS + Shadcn/UI
- **Base de Datos & Auth**: Supabase
- **Estado**: React Query (TanStack Query)
- **Iconos**: Lucide React
- **Fechas**: date-fns

## 📱 Funcionalidades
- **Reserva de turnos**: Flujo multi-paso intuitivo y mobile-first.
- **Prevención de Double-booking**: Lógica robusta a nivel de base de datos (PostgreSQL EXCLUDE constraint).
- **Sincronización en tiempo real**: Los turnos se bloquean instantáneamente para otros usuarios gracias a Supabase Realtime.
- **Panel de Administración**: Acceso protegido para barberos para ver su agenda y marcar servicios como completados.
