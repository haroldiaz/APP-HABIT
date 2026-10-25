# Habit Tracker

Aplicación web para el seguimiento de hábitos personales, diseñada para registrar el progreso diario, mantener la constancia y visualizar los avances mediante una interfaz moderna inspirada en el mapa de contribuciones de GitHub.

## Descripción del proyecto

**Habit Tracker** es una aplicación que permite realizar el seguimiento de un hábito a lo largo del tiempo mediante un calendario de actividad. Cada día representa una oportunidad para registrar el progreso y construir una rutina constante.

El proyecto busca ofrecer una experiencia visual sencilla, intuitiva y organizada, con una interfaz moderna que facilita la consulta del historial y la identificación de patrones de constancia.

## Funcionalidades

- **Seguimiento de hábitos:** registrar el cumplimiento de un hábito.
- **Calendario de actividad:** visualizar el progreso diario mediante una cuadrícula de contribuciones.
- **Historial de actividad:** consultar los días en los que se ha registrado progreso.
- **Interfaz moderna:** diseño minimalista inspirado en GitHub.
- **Modo oscuro:** presentación adaptada a una estética oscura.
- **Visualización del progreso:** identificar patrones de constancia a lo largo del tiempo.

> Las funcionalidades disponibles dependen de la implementación actual del proyecto.

## Tecnologías utilizadas

| Tecnología | Descripción |
|---|---|
| React | Construcción de interfaces mediante componentes reutilizables. |
| Vite | Herramienta de desarrollo y compilación para aplicaciones frontend. |
| JavaScript | Lógica e interactividad de la aplicación. |
| HTML5 | Estructura de la interfaz. |
| CSS3 | Estilos, diseño adaptable y presentación visual. |
| npm | Instalación y administración de dependencias. |

## Requisitos previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/)
- npm, incluido con Node.js.
- [Visual Studio Code](https://code.visualstudio.com/) (recomendado).

Puedes verificar las versiones desde una terminal:

```bash
node -v
npm -v
```

## Instalación

### 1. Clonar el repositorio

Si el proyecto está alojado en GitHub:

```bash
git clone URL_DEL_REPOSITORIO
```

Entra en la carpeta del proyecto:

```bash
cd HABIT
```

Si ya tienes el proyecto descargado en tu equipo, abre directamente su carpeta en Visual Studio Code.

### 2. Instalar las dependencias

```bash
npm install
```

Si PowerShell bloquea el comando `npm`, puedes utilizar:

```powershell
npm.cmd install
```

### 3. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Si PowerShell bloquea la ejecución de `npm`, utiliza:

```powershell
npm.cmd run dev
```

Vite mostrará una dirección local similar a esta:

```text
http://localhost:5173/
```

Abre esa dirección en tu navegador para utilizar la aplicación.

## Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo. |
| `npm run build` | Genera la versión optimizada para producción. |
| `npm run preview` | Permite previsualizar la compilación de producción. |
| `npm install` | Instala las dependencias del proyecto. |

## Estructura del proyecto

La estructura puede variar según la organización actual del código.

```text
HABIT/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── App.jsx
│   ├── main.jsx
│   └── ...
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

## Ejecución para producción

Para generar los archivos optimizados:

```bash
npm run build
```

Vite generará la carpeta `dist/`, que contiene los archivos listos para desplegar en un servicio de hosting compatible con aplicaciones frontend estáticas.

Para comprobar la compilación localmente:

```bash
npm run preview
```

## Objetivo del proyecto

El objetivo de Habit Tracker es facilitar el desarrollo de hábitos mediante el seguimiento visual del progreso y una experiencia de usuario clara.

Además, el proyecto sirve como práctica de desarrollo frontend con React, organización de componentes, estilos CSS y herramientas modernas del ecosistema JavaScript.

## Estado del proyecto

**En desarrollo.**

Las funcionalidades y características pueden ampliarse a medida que evolucione la aplicación.

---

Desarrollado como proyecto personal de aprendizaje y práctica de desarrollo web con React y Vite.
