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

---

## 🔐 Acceso Administrativo y Gestión

### ¿Cómo ingresar al panel?
1. Dirígete a la ruta `/login`.
2. Ingresa un correo electrónico válido.
3. Recibirás un **Magic Link** en tu bandeja de entrada. Haz clic en el enlace para ser redirigido automáticamente al panel de `/admin`.

### Gestión de Barberos y Servicios
En esta versión MVP, la gestión de datos maestros se realiza directamente desde el **Panel de Supabase**:

1. **Agregar/Modificar Barberos**:
   - Ve a la tabla `barbers`.
   - Puedes cambiar nombres, bios y enlaces de imágenes (`avatar_url`).
2. **Agregar/Modificar Servicios**:
   - Ve a la tabla `services`.
   - Define el nombre, precio y, muy importante, la **duración en minutos**, ya que esto calcula automáticamente los bloques de tiempo disponibles.
3. **Control de la Agenda**:
   - En `/admin`, cada barbero puede ver los turnos del día, marcarlos como "Completados" o cancelarlos. Esto liberará los espacios en tiempo real en la vista del cliente.

### Personalización para cada Barbero
Si deseas que cada barbero gestione solo su propia agenda o tenga configuraciones específicas:
- **Modificación Técnica**: Se recomienda implementar **Row Level Security (RLS)** en Supabase.
- **Identificación**: Actualmente, el panel muestra todos los turnos. Puedes filtrar la consulta en `src/components/admin/AgendaView.tsx` usando el `auth.uid()` si vinculas la tabla `barbers` con la tabla `auth.users` de Supabase.

### Seguridad del Panel
La ruta `/admin` tiene una protección básica en el cliente (`src/app/admin/page.tsx`). Para una seguridad de nivel producción, puedes implementar un **Middleware** de Next.js que verifique la sesión antes de renderizar cualquier página administrativa.

---

## 🚀 Guía de Despliegue en Vercel

Sigue estos pasos para poner tu barbería online en menos de 5 minutos:

### 1. Preparar el Repositorio
Asegúrate de haber subido todos los cambios a tu repositorio de GitHub.

### 2. Conectar con Vercel
1. Entra a [Vercel](https://vercel.com/) e inicia sesión con GitHub.
2. Haz clic en el botón **"Add New..."** y luego en **"Project"**.
3. Busca tu repositorio de la barbería y haz clic en **"Import"**.

### 3. Configurar Variables de Entorno
En la sección **"Environment Variables"**, debes agregar las siguientes (puedes copiarlas de tu `.env.local`):

| Variable | Valor |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Tu URL de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tu Clave Anónima (Anon Key) |

### 4. Desplegar
1. Haz clic en **"Deploy"**.
2. ¡Listo! Vercel te dará una URL pública para tu aplicación.

### Notas importantes para Producción
- **Supabase Auth**: Recuerda agregar la URL de tu sitio desplegado (ej. `https://tu-barberia.vercel.app`) en la lista de URLs permitidas en el panel de Supabase (**Auth -> URL Configuration -> Redirect URLs**). Esto es esencial para que el Magic Link funcione correctamente.
- **Optimización**: El proyecto ya está configurado para optimizar imágenes y pasar los chequeos de build automáticamente.

---

## 🧪 Guía de Pruebas de Roles y Seguridad (RBAC/RLS)

Para probar que el sistema de roles y las políticas de seguridad funcionan correctamente, sigue estos pasos:

### 1. Preparar Usuarios en Supabase
1. Ve a **Authentication -> Users** en Supabase.
2. Crea dos usuarios nuevos (ej. `admin@test.com` y `barbero@test.com`).
3. Copia el `User ID` (UUID) de cada uno.

### 2. Vincular Usuarios con Barberos
1. Ve a la tabla `barbers` en el **Table Editor**.
2. Para un barbero existente (ej. Juan Pérez), pega el UUID del usuario `admin@test.com` en la columna `user_id` y asegúrate de que su `role` sea `admin`.
3. Para otro barbero, pega el UUID de `barbero@test.com` y ponle el `role` de `barber`.

### 3. Probar las Políticas RLS
- **Como Administrador (`admin@test.com`)**:
  - Logueate en `/login`.
  - En `/admin`, deberías ver **todos** los turnos de la barbería.
  - Deberías tener permisos para marcar cualquier turno como completado.
- **Como Barbero (`barbero@test.com`)**:
  - Logueate en `/login`.
  - En `/admin`, **solo deberías ver tus propios turnos**.
  - Si intentas acceder a datos de otro barbero vía API/Consola, Supabase bloqueará la petición gracias al RLS.
- **Como Cliente (Sin login)**:
  - Ve a `/booking`.
  - Deberías poder ver la disponibilidad (lectura de turnos) y crear una cita nueva (escritura), pero no podrás modificar turnos existentes ni ver datos privados de los barberos.

### 4. Verificar en la UI
El panel de `/admin` mostrará un mensaje de bienvenida personalizado:
- *"Hola, Juan Pérez (Administrador)"*
- *"Hola, Carlos (Barbero)"*

Si un usuario autenticado entra pero **no está vinculado** a ningún registro en la tabla `barbers`, verá un error indicando que no tiene un perfil asignado.
