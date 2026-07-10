# Planificador Presupuestario 📊

Este proyecto es un **Planificador Presupuestario** que consta de una aplicación web moderna (Frontend) y un servidor de API REST con persistencia de datos local (Backend).

La aplicación permite gestionar transacciones financieras (ingresos, gastos obligatorios/necesidades y gastos deseados/deseos), categorizarlas y planificarlas tanto a nivel de presupuesto como en el libro diario real. Está diseñada con blindaje multimoneda, lo que facilita el seguimiento de montos en divisa estable (USD) e inflación local (Bs/Arg/etc.) con conversión en tiempo real.

---

## 🛠️ Stack Tecnológico y Especificaciones

### Frontend
- **Framework:** React 19 (con React Compiler habilitado para optimizar el renderizado)
- **Herramienta de construcción:** Vite 8
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS v4 (mediante `@tailwindcss/vite` para compilación rápida)
- **Gráficos:** Recharts (para diagramas y analíticas visuales de presupuestos y balances)
- **Iconos:** Lucide React
- **Gestor de paquetes:** pnpm

### Backend
- **Framework:** Express v5
- **Lenguaje:** TypeScript
- **Entorno de ejecución en desarrollo:** `ts-node-dev` (recarga automática)
- **Base de Datos:** SQLite a través del driver síncrono de alto rendimiento `better-sqlite3`
- **CORS:** Habilitado para comunicación cruzada
- **Gestor de paquetes:** pnpm

---

## 🚀 Características y Funcionalidades

### Frontend (Interfaz de Usuario)
- **Dashboard Multimoneda:** Permite ver y alternar entre los modos de **Planificación** (Presupuestos en USD) y **Diario Ejecutado** (Gastos reales en USD o Moneda Local).
- **Mesa de Control:** Gráficos interactivos de barra (Recharts) que muestran la desviación entre el presupuesto Planificado y la ejecución Real.
- **Alertas de Salud Financiera:** Muestra indicadores de porcentaje de consumo sobre el presupuesto de gastos vitales (Needs) y del ingreso ejecutado.
- **Panel de Configuración:** Configuración dinámica de categorías (conceptos), tipo de divisa por defecto y tasa base de cambio del día.
- **Estructura Modularizada:** Componentes separados para mejorar el mantenimiento:
  - Modales de transacciones y configuración.
  - Tablas analíticas y paneles de analítica visual.

### Backend (Servicio API REST)
- **Persistencia SQLite:** Crea la base de datos `backend/finanzas.db` y la tabla `transactions` automáticamente.
- **Operaciones CRUD:** Endpoints para listar, registrar y eliminar registros financieros de manera ágil.
- **Validación Integrada:** Comprobación rigurosa de campos requeridos.

---

## 📁 Estructura del Proyecto

El repositorio cuenta con la siguiente estructura modular:

- **Módulo Backend:** [backend/](file:///home/ved/projects/planificador_presupuestario/backend)
  - Servidor y controladores: [backend/src/index.ts](file:///home/ved/projects/planificador_presupuestario/backend/src/index.ts)
  - Configuración e inicialización de BD: [backend/src/config/db.ts](file:///home/ved/projects/planificador_presupuestario/backend/src/config/db.ts)
- **Módulo Frontend:** [frontend/](file:///home/ved/projects/planificador_presupuestario/frontend)
  - Modales del Sistema: [frontend/src/components/Modals.tsx](file:///home/ved/projects/planificador_presupuestario/frontend/src/components/Modals.tsx)
  - Dashboard y analíticas: [frontend/src/components/Dashboard.tsx](file:///home/ved/projects/planificador_presupuestario/frontend/src/components/Dashboard.tsx)
  - Tabla de registros: [frontend/src/components/TransactionTable.tsx](file:///home/ved/projects/planificador_presupuestario/frontend/src/components/TransactionTable.tsx)
  - Componente principal: [frontend/src/App.tsx](file:///home/ved/projects/planificador_presupuestario/frontend/src/App.tsx)
  - Definición de tipos: [frontend/src/types.ts](file:///home/ved/projects/planificador_presupuestario/frontend/src/types.ts)

```text
planificador_presupuestario/
├── backend/                  # Servidor de API Express + TypeScript
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts         # Configuración y esquema de la BD SQLite
│   │   └── index.ts          # Servidor principal y definición de Endpoints
│   ├── package.json
│   ├── tsconfig.json
│   └── finanzas.db           # SQLite DB (generado automáticamente)
├── frontend/                 # Aplicación Cliente React + Vite
│   ├── src/
│   │   ├── components/       # Componentes React Modulares
│   │   │   ├── Dashboard.tsx # Paneles gráficos de analítica
│   │   │   ├── Modals.tsx    # Modal de transacciones y configuración
│   │   │   └── TransactionTable.tsx # Listado de transacciones
│   │   ├── hooks/
│   │   │   └── useTransactions.ts # Custom Hook para interactuar con la API
│   │   ├── App.tsx           # Layout principal y estados de vista
│   │   ├── index.css         # Configuración global de estilos
│   │   ├── types.ts          # Tipos y contratos del dominio
│   │   └── main.tsx          # Entrada de la app
│   ├── package.json
│   └── vite.config.ts
└── README.md                 # Este archivo de documentación
```

---

## ⚡ Guía de Instalación y Configuración

### Requisitos Previos
- **Node.js** (v18 o superior)
- **pnpm** (gestor recomendado)

---

### Paso 1: Levantar el Backend 🔌

1. Ingresa a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Instala dependencias:
   ```bash
   pnpm install
   ```
3. Ejecuta en modo desarrollo:
   ```bash
   pnpm dev
   ```
   *Servidor corriendo en **http://localhost:3001**.*

---

### Paso 2: Levantar el Frontend 💻

1. Entra a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instala dependencias:
   ```bash
   pnpm install
   ```
3. Ejecuta la aplicación:
   ```bash
   pnpm dev
   ```
   *Aplicación disponible en **http://localhost:5173**.*

---

## 🗄️ Modelo de Datos (Base de Datos)

La base de datos SQLite contiene la tabla `transactions` con la siguiente estructura adaptada a un entorno multimoneda:

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `INTEGER` | Clave primaria autoincremental |
| `mode` | `TEXT` | Modo de visualización: `'planning'` (Presupuesto) o `'actual'` (Libro diario real) |
| `type` | `TEXT` | Tipo: `'Income'` (Ingreso), `'Needs'` (Necesidades/Obligatorios), `'Wants'` (Deseos/Ocio) |
| `category` | `TEXT` | Categoría/Concepto (ej. `'Alquiler'`, `'Salario'`, `'Supermercado'`) |
| `date` | `TEXT` | Fecha del registro en formato `YYYY-MM-DD` |
| `frequency` | `TEXT` | Periodicidad: `'Every Month'`, `'Every Week'`, `'Once'` |
| `amount_stable` | `REAL` | Monto base de referencia de la app en Moneda Fuerte (USD) |
| `amount_local` | `REAL` | Monto en Moneda Local inflacionaria (opcional) |
| `currency` | `TEXT` | Moneda original del registro: `'USD'` o `'LOCAL'` |
| `exchange_rate` | `REAL` | Tasa de cambio del día (opcional) |
| `notes` | `TEXT` | Comentarios adicionales |

---

## 📡 Detalle de la API (Endpoints)

### 1. Obtener todas las transacciones
- **Método:** `GET`
- **Ruta:** `/api/transactions`
- **Respuesta (`200 OK`):** Lista completa de transacciones.

### 2. Registrar transacción
- **Método:** `POST`
- **Ruta:** `/api/transactions`
- **Cuerpo (JSON):**
  ```json
  {
    "mode": "actual",
    "type": "Needs",
    "category": "Supermercado",
    "date": "2026-07-10",
    "frequency": "Once",
    "amount_stable": 35.5,
    "amount_local": 1615.25,
    "currency": "LOCAL",
    "exchange_rate": 45.5,
    "notes": "Compra semanal"
  }
  ```
- **Campos Obligatorios:** `mode`, `type`, `category`, `frequency`, `amount_stable`, `currency`.

### 3. Eliminar transacción
- **Método:** `DELETE`
- **Ruta:** `/api/transactions/:id`
- **Respuesta (`200 OK`):** Mensaje de confirmación.
