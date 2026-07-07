# Planificador Presupuestario 📊

Este proyecto es un **Planificador Presupuestario** que consta de una aplicación web moderna (Frontend) y un servidor de API REST con persistencia de datos local (Backend).

La aplicación permite gestionar transacciones financieras (ingresos, gastos obligatorios/necesidades y gastos deseados/deseos), categorizarlas, especificar su frecuencia y realizar el seguimiento de los montos para optimizar la planificación de finanzas personales.

---

## 🛠️ Stack Tecnológico y Especificaciones

### Frontend
- **Framework:** React 19 (con React Compiler habilitado para optimizar el renderizado de componentes)
- **Herramienta de construcción:** Vite 8
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS v4 (mediante `@tailwindcss/vite` para compilación en tiempo de construcción rápida y optimizada)
- **Gráficos:** Recharts (para diagramas y analíticas visuales de presupuestos y balances)
- **Iconos:** Lucide React
- **Gestor de paquetes:** pnpm

### Backend
- **Framework:** Express v5
- **Lenguaje:** TypeScript
- **Entorno de ejecución y transpilación en desarrollo:** `ts-node-dev` (recarga automática al detectar cambios en el código)
- **Base de Datos:** SQLite a través del driver síncrono de alto rendimiento `better-sqlite3`
- **CORS:** Habilitado para permitir la comunicación cruzada con el frontend
- **Gestor de paquetes:** pnpm

---

## 🚀 Características y Funcionalidades

### Frontend (Interfaz de Usuario)
- **Dashboard Interactivo:** Preparado para visualizar gráficos financieros usando [Recharts](https://recharts.org/) (análisis de ingresos vs. gastos, distribución de presupuesto, etc.).
- **Diseño Moderno y Responsivo:** Estructurado utilizando Tailwind CSS v4 para ofrecer una excelente visualización tanto en móviles como en computadoras de escritorio.
- **Interactividad en tiempo real:** Navegación fluida y componentes reactivos.

### Backend (Servicio API REST)
- **Persistencia SQLite:** Genera automáticamente el archivo de base de datos `finanzas.db` y la tabla `transactions` en el inicio del servidor si no existen.
- **Gestión de Transacciones:** Endpoints listos para listar, crear y eliminar registros financieros de manera ágil.
- **Validaciones Integradas:** Validación de campos obligatorios en el servidor para asegurar la calidad de la información ingresada.

---

## 📁 Estructura del Proyecto

La estructura principal del repositorio se divide en los siguientes módulos:

- **Módulo Backend:** [backend/](file:///home/ved/projects/planificador_presupuestario/backend)
  - Servidor y controladores: [backend/src/index.ts](file:///home/ved/projects/planificador_presupuestario/backend/src/index.ts)
  - Configuración e inicialización de BD: [backend/src/config/db.ts](file:///home/ved/projects/planificador_presupuestario/backend/src/config/db.ts)
  - Configuración de dependencias: [backend/package.json](file:///home/ved/projects/planificador_presupuestario/backend/package.json)
- **Módulo Frontend:** [frontend/](file:///home/ved/projects/planificador_presupuestario/frontend)
  - Componente principal: [frontend/src/App.tsx](file:///home/ved/projects/planificador_presupuestario/frontend/src/App.tsx)
  - Configuración de estilos y Tailwind: [frontend/src/index.css](file:///home/ved/projects/planificador_presupuestario/frontend/src/index.css)
  - Configuración de Vite y Bundler: [frontend/vite.config.ts](file:///home/ved/projects/planificador_presupuestario/frontend/vite.config.ts)
  - Configuración de dependencias: [frontend/package.json](file:///home/ved/projects/planificador_presupuestario/frontend/package.json)

```text
planificador_presupuestario/
├── backend/                  # Servidor de API Express + TypeScript
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts         # Configuración y esquema de la BD SQLite
│   │   └── index.ts          # Servidor principal y definición de Endpoints
│   ├── package.json
│   ├── pnpm-lock.yaml
│   └── tsconfig.json
├── frontend/                 # Aplicación Cliente React + Vite
│   ├── src/
│   │   ├── assets/           # Recursos visuales y logos
│   │   ├── App.tsx           # Componente principal de la interfaz
│   │   ├── index.css         # Configuración y estilos CSS globales con Tailwind
│   │   └── main.tsx          # Punto de entrada de la aplicación React
│   ├── package.json
│   ├── pnpm-lock.yaml
│   └── vite.config.ts        # Configuración de Vite con React Compiler y Tailwind
└── README.md                 # Este archivo de documentación
```

---

## ⚡ Guía de Instalación y Configuración (Desarrollo)

### Requisitos Previos
Asegúrate de tener instalado en tu sistema:
- **Node.js** (versión 18 o superior recomendada)
- **pnpm** (gestor de paquetes preferido en el proyecto)

---

### Paso 1: Levantar el Backend 🔌

1. Navega al directorio del backend:
   ```bash
   cd backend
   ```
2. Instala las dependencias necesarias:
   ```bash
   pnpm install
   ```
3. Inicia el servidor en modo desarrollo:
   ```bash
   pnpm dev
   ```
   *El servidor se ejecutará en **http://localhost:3001** y creará automáticamente el archivo de base de datos `backend/finanzas.db`.*

---

### Paso 2: Levantar el Frontend 💻

1. Abre una nueva terminal en la raíz del proyecto y navega al directorio del frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias necesarias:
   ```bash
   pnpm install
   ```
3. Inicia la aplicación en modo desarrollo:
   ```bash
   pnpm dev
   ```
   *La aplicación se ejecutará por defecto en **http://localhost:5173**.*

---

## 🗄️ Modelo de Datos (Base de Datos)

La base de datos SQLite contiene la tabla `transactions` con la siguiente estructura:

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `INTEGER` | Clave primaria autoincremental |
| `type` | `TEXT` | Tipo de transacción: `'Income'` (Ingreso), `'Needs'` (Necesidades/Gastos Obligatorios), `'Wants'` (Deseos/Gastos Opcionales) |
| `category` | `TEXT` | Categoría (ej. `'Business'`, `'Rent'`, `'Dining out'`) |
| `date` | `TEXT` | Fecha de la transacción en formato `YYYY-MM-DD` (opcional, para transacciones puntuales) |
| `frequency` | `TEXT` | Frecuencia de la transacción: `'Every Month'`, `'Every Week'`, `'Once'` |
| `term` | `TEXT` | Año de vigencia (ej. `'2024'`, `'2026'`) |
| `amount` | `REAL` | Monto de la transacción (Numérico decimal) |
| `notes` | `TEXT` | Comentarios o detalles adicionales (opcional) |

---

## 📡 Detalle de la API (Endpoints)

El servidor backend expone los siguientes endpoints HTTP en `http://localhost:3001`:

### 1. Obtener todas las transacciones
- **Método:** `GET`
- **Ruta:** `/api/transactions`
- **Respuesta exitosa (`200 OK`):**
  ```json
  [
    {
      "id": 1,
      "type": "Income",
      "category": "Salary",
      "date": "2026-07-01",
      "frequency": "Every Month",
      "term": "2026",
      "amount": 2500.0,
      "notes": "Nómina mensual principal"
    }
  ]
  ```

### 2. Crear una nueva transacción
- **Método:** `POST`
- **Ruta:** `api/transaction` *(Nota: la definición actual en el código no contiene el prefijo `/` inicial en Express)*
- **Cuerpo de la petición (JSON):**
  ```json
  {
    "type": "Needs",
    "category": "Rent",
    "date": "2026-07-05",
    "frequency": "Every Month",
    "term": "2026",
    "amount": 800.0,
    "notes": "Pago mensual del alquiler"
  }
  ```
- **Campos Obligatorios:** `type`, `category`, `frequency`, `amount`
- **Respuesta exitosa (`201 Created`):** Devuelve la transacción creada incluyendo su nuevo `id`.

### 3. Eliminar una transacción
- **Método:** `DELETE`
- **Ruta:** `/api/transactions/:id`
- **Respuesta exitosa (`200 OK`):**
  ```json
  {
    "message": "Transacción eliminada con éxito."
  }
  ```
- **Error (`404 Not Found`):** Si el ID de transacción no existe en la base de datos.
