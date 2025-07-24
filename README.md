# 🛍️ Productos App - Administración de Catálogo

Aplicación web para la gestión de productos, utilizando React y MUI. Permite crear, editar, listar y filtrar productos con persistencia de estado por pestaña y validaciones dinámicas en formularios.

---

## 🚀 Instrucciones para correr el proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/santiagoalvarez99/challengeHCyA.git
cd tu-repo
```

---

### 2. Instalar dependencias

Asegurate de tener [Node.js](https://nodejs.org/) instalado (v22.12.0 recomendado).
Si no lo posee instalado, debe correr los siguientes scripts:
nvm install v22.12.0
nvm use v22.12.0

```bash
npm install
```

---

### 3. Iniciar el backend con JSON Server

El proyecto utiliza `json-server` para simular un backend REST. Si no lo tenés instalado globalmente, podés hacerlo con:

```bash
npm install -g json-server
```

Luego, ejecutá:

```bash
json-server --watch db.json --port 3001
```

Esto levantará un servidor local en `http://localhost:3001` con la data del archivo `db.json`.

````

---

### 4. Levantar el frontend

Con el backend funcionando, corré:

```bash
npm i (para instalar los paquetes necesarios)
npm run dev
````

Esto iniciará la aplicación en modo desarrollo en `http://localhost:5173`.

---

## 📚 Librerías utilizadas

| Paquete               | Descripción                                                     |
| --------------------- | --------------------------------------------------------------- |
| `@mui/x-data-grid`    | Componente de tabla avanzada para React (MUI DataGrid).         |
| `react-hook-form`     | Manejo de formularios de forma eficiente, con validaciones.     |
| `@hookform/resolvers` | Adaptadores para conectar librerías de validación (como `zod`). |
| `zod`                 | Librería de validación de esquemas (tipos y restricciones).     |
| `json-server`         | Simula una API REST rápida para desarrollo local.               |

---

## 🧩 Funcionalidades principales

- 🗂️ Gestión de productos con operaciones CRUD.
- 🧾 Formulario con validaciones en tiempo real.
- 📑 Tabs dinámicos con persistencia de estado.
- 🔎 Filtros encadenados: Supercategoría → Categoría → Subcategoría + Marca.
- 📄 Listado paginado con ordenamiento.
- ✅ Backend simulado con `json-server`.

---

## 🛠️ Scripts útiles

| Script            | Descripción                       |
| ----------------- | --------------------------------- |
| `npm run dev`     | Inicia la app en modo desarrollo. |
| `npm run build`   | Genera la versión optimizada.     |
| `npm run preview` | Previsualiza la build localmente. |
