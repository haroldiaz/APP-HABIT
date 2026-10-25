
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "habit-tracker-github";
const THEME_KEY = "habit-tracker-theme";

const obtenerFecha = (fecha = new Date()) => {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
};

const crearId = () => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const obtenerEstadoInicial = () => {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY);

    if (guardado) {
      const datos = JSON.parse(guardado);

      // Formato nuevo: varios hábitos.
      if (Array.isArray(datos)) {
        return datos.map((habito, indice) => ({
          id: habito.id || `habito-${indice}-${crearId()}`,
          nombre: habito.nombre || "Mi hábito",
          completados: Array.isArray(habito.completados)
            ? habito.completados
            : [],
        }));
      }

      if (datos && Array.isArray(datos.habitos)) {
        return datos.habitos.map((habito, indice) => ({
          id: habito.id || `habito-${indice}-${crearId()}`,
          nombre: habito.nombre || "Mi hábito",
          completados: Array.isArray(habito.completados)
            ? habito.completados
            : [],
        }));
      }

      // Migración del formato anterior: un solo hábito.
      if (datos && (datos.nombre || Array.isArray(datos.completados))) {
        return [
          {
            id: crearId(),
            nombre: datos.nombre || "Mi hábito",
            completados: Array.isArray(datos.completados)
              ? datos.completados
              : [],
          },
        ];
      }
    }
  } catch (error) {
    console.error("No se pudieron recuperar los hábitos:", error);
  }

  return [
    {
      id: crearId(),
      nombre: "Mi hábito",
      completados: [],
    },
  ];
};

const obtenerTemaInicial = () => {
  try {
    return localStorage.getItem(THEME_KEY) !== "light";
  } catch {
    return true;
  }
};

const obtenerCalendario = (anio) => {
  const fechas = [];
  const inicio = new Date(anio, 0, 1);
  const fin = new Date(anio, 11, 31);

  const primerDia = new Date(inicio);
  primerDia.setDate(inicio.getDate() - inicio.getDay());

  const ultimoDia = new Date(fin);
  ultimoDia.setDate(fin.getDate() + (6 - fin.getDay()));

  const cursor = new Date(primerDia);

  while (cursor <= ultimoDia) {
    fechas.push(obtenerFecha(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  const semanas = [];

  for (let i = 0; i < fechas.length; i += 7) {
    semanas.push(fechas.slice(i, i + 7));
  }

  const meses = [];
  let mesAnterior = -1;

  semanas.forEach((semana, indice) => {
    const fecha = new Date(`${semana[0]}T12:00:00`);
    const mes = fecha.getMonth();

    if (mes !== mesAnterior) {
      meses.push({
        nombre: fecha.toLocaleDateString("es-CO", {
          month: "short",
        }),
        columna: indice,
      });

      mesAnterior = mes;
    }
  });

  return { semanas, meses };
};

const obtenerRacha = (completados) => {
  const registros = new Set(completados);
  const hoy = obtenerFecha();
  const cursor = new Date(`${hoy}T12:00:00`);

  if (!registros.has(hoy)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let racha = 0;

  while (registros.has(obtenerFecha(cursor))) {
    racha += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return racha;
};

const calcularEstadisticas = (completados, anio) => {
  const fechasDelAnio = completados.filter((fecha) =>
    fecha.startsWith(`${anio}-`)
  );

  const inicio = new Date(anio, 0, 1);
  const fin = new Date(anio, 11, 31);
  const diasDelAnio =
    Math.round((fin - inicio) / (1000 * 60 * 60 * 24)) + 1;

  return {
    total: fechasDelAnio.length,
    porcentaje: Math.round((fechasDelAnio.length / diasDelAnio) * 100),
    racha: obtenerRacha(completados),
  };
};

export default function Habitos() {
  const [habitos, setHabitos] = useState(obtenerEstadoInicial);
  const [tema, setTema] = useState(obtenerTemaInicial);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [nombreEdicion, setNombreEdicion] = useState("");

  const hoy = obtenerFecha();
  const anio = new Date().getFullYear();

  const { semanas, meses } = useMemo(
    () => obtenerCalendario(anio),
    [anio]
  );

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ habitos })
      );
    } catch (error) {
      console.error("No se pudieron guardar los hábitos:", error);
    }
  }, [habitos]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, tema ? "dark" : "light");
    } catch (error) {
      console.error("No se pudo guardar el tema:", error);
    }

    document.documentElement.style.colorScheme = tema ? "dark" : "light";
  }, [tema]);

  const agregarHabito = (evento) => {
    evento.preventDefault();

    const nombre = nuevoNombre.trim();

    if (!nombre) return;

    setHabitos((actuales) => [
      ...actuales,
      {
        id: crearId(),
        nombre,
        completados: [],
      },
    ]);

    setNuevoNombre("");
  };

  const actualizarNombre = (id, nombre) => {
    setHabitos((actuales) =>
      actuales.map((habito) =>
        habito.id === id ? { ...habito, nombre } : habito
      )
    );
  };

  const guardarNombre = (id) => {
    const nombre = nombreEdicion.trim();

    if (nombre) {
      actualizarNombre(id, nombre);
    }

    setEditandoId(null);
    setNombreEdicion("");
  };

  const alternarDia = (id, fecha) => {
    // Solo se permite registrar o desmarcar el día actual.
    if (fecha !== hoy) return;

    setHabitos((actuales) =>
      actuales.map((habito) => {
        if (habito.id !== id) return habito;

        const yaCompletado = habito.completados.includes(fecha);

        return {
          ...habito,
          completados: yaCompletado
            ? habito.completados.filter((dia) => dia !== fecha)
            : [...habito.completados, fecha],
        };
      })
    );
  };

  const eliminarHabito = (id) => {
    const habito = habitos.find((item) => item.id === id);

    if (!habito) return;

    const confirmar = window.confirm(
      `¿Deseas eliminar el hábito "${habito.nombre}" y sus registros?`
    );

    if (!confirmar) return;

    setHabitos((actuales) =>
      actuales.filter((item) => item.id !== id)
    );
  };

  const obtenerNivel = (habito, fecha) => {
    if (!fecha.startsWith(`${anio}-`)) return 0;

    return habito.completados.includes(fecha) ? 4 : 0;
  };

  return (
    <div className={`gh-page ${tema ? "gh-dark" : "gh-light"}`}>
      <style>{`
        .gh-page {
          --bg: #09090b;
          --panel: #111113;
          --panel-hover: #18181b;
          --border: #27272a;
          --text: #fafafa;
          --muted: #a1a1aa;
          --subtle: #71717a;
          --green-1: #0e4429;
          --green-2: #006d32;
          --green-3: #26a641;
          --green-4: #39d353;
          --today: #facc15;
          min-height: 100%;
          width: 100%;
          box-sizing: border-box;
          padding: 28px;
          background: var(--bg);
          color: var(--text);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
          transition: background 0.2s ease, color 0.2s ease;
        }

        .gh-page *,
        .gh-page *::before,
        .gh-page *::after {
          box-sizing: border-box;
        }

        .gh-light {
          --bg: #f8fafc;
          --panel: #ffffff;
          --panel-hover: #f4f4f5;
          --border: #e4e4e7;
          --text: #18181b;
          --muted: #52525b;
          --subtle: #71717a;
          --green-1: #d1fae5;
          --green-2: #86efac;
          --green-3: #22c55e;
          --green-4: #15803d;
          --today: #ca8a04;
        }

        .gh-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        .gh-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
        }

        .gh-title {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .gh-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: var(--panel);
          font-size: 22px;
        }

        .gh-heading {
          margin: 0;
          font-size: 22px;
          font-weight: 650;
          letter-spacing: -0.6px;
        }

        .gh-subtitle {
          margin: 5px 0 0;
          color: var(--muted);
          font-size: 13px;
        }

        .gh-theme-button,
        .gh-button,
        .gh-icon-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid var(--border);
          border-radius: 9px;
          background: var(--panel);
          color: var(--text);
          font-family: inherit;
          font-size: 13px;
          font-weight: 550;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease;
        }

        .gh-theme-button {
          min-height: 38px;
          padding: 0 12px;
          white-space: nowrap;
        }

        .gh-button {
          min-height: 38px;
          padding: 0 14px;
          background: var(--text);
          color: var(--bg);
          border-color: var(--text);
        }

        .gh-icon-button {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          color: var(--muted);
          font-size: 17px;
        }

        .gh-theme-button:hover,
        .gh-icon-button:hover {
          background: var(--panel-hover);
          border-color: var(--muted);
        }

        .gh-button:hover {
          opacity: 0.85;
        }

        .gh-theme-button:focus-visible,
        .gh-button:focus-visible,
        .gh-icon-button:focus-visible,
        .gh-input:focus-visible,
        .gh-cell:focus-visible {
          outline: 2px solid var(--green-3);
          outline-offset: 3px;
        }

        .gh-create-panel {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 18px;
          margin-bottom: 20px;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: var(--panel);
        }

        .gh-create-copy h2 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
        }

        .gh-create-copy p {
          margin: 5px 0 0;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.5;
        }

        .gh-create-form {
          display: flex;
          align-items: center;
          gap: 8px;
          width: min(100%, 390px);
        }

        .gh-input {
          width: 100%;
          min-width: 0;
          height: 38px;
          padding: 0 11px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--bg);
          color: var(--text);
          font: inherit;
          font-size: 13px;
          outline: none;
          transition: border-color 0.15s ease;
        }

        .gh-input:focus {
          border-color: var(--green-3);
        }

        .gh-input::placeholder {
          color: var(--subtle);
        }

        .gh-section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin: 0 0 12px;
        }

        .gh-section-heading h2 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
        }

        .gh-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 25px;
          height: 24px;
          padding: 0 7px;
          border: 1px solid var(--border);
          border-radius: 7px;
          color: var(--muted);
          font-size: 12px;
        }

        .gh-habits {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .gh-card {
          min-width: 0;
          padding: 20px;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: var(--panel);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.025);
        }

        .gh-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }

        .gh-habit-info {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          min-width: 0;
          flex: 1;
        }

        .gh-habit-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          border: 1px solid var(--border);
          border-radius: 9px;
          background: var(--bg);
          font-size: 17px;
        }

        .gh-habit-title-area {
          flex: 1;
          min-width: 0;
        }

        .gh-habit-title {
          margin: 0;
          overflow-wrap: anywhere;
          font-size: 15px;
          font-weight: 600;
          line-height: 1.5;
        }

        .gh-habit-description {
          margin: 4px 0 0;
          color: var(--muted);
          font-size: 12px;
        }

        .gh-edit-form {
          display: flex;
          gap: 6px;
          max-width: 420px;
        }

        .gh-edit-form .gh-input {
          height: 34px;
        }

        .gh-small-button {
          min-width: 34px;
          height: 34px;
          padding: 0 9px;
          border: 1px solid var(--border);
          border-radius: 7px;
          background: var(--panel);
          color: var(--text);
          font: inherit;
          font-size: 12px;
          cursor: pointer;
        }

        .gh-small-button:hover {
          background: var(--panel-hover);
        }

        .gh-card-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        .gh-calendar-panel {
          padding: 15px;
          border: 1px solid var(--border);
          border-radius: 9px;
          background: var(--bg);
        }

        .gh-calendar-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }

        .gh-calendar-year {
          font-size: 12px;
          font-weight: 600;
        }

        .gh-calendar-hint {
          color: var(--muted);
          font-size: 11px;
        }

        .gh-calendar-scroll {
          width: 100%;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }

        .gh-calendar-inner {
          width: max-content;
          min-width: 100%;
        }

        .gh-months {
          display: grid;
          grid-auto-columns: 13px;
          grid-auto-flow: column;
          column-gap: 4px;
          height: 19px;
          margin-left: 30px;
          color: var(--muted);
          font-size: 10px;
        }

        .gh-month-label {
          white-space: nowrap;
        }

        .gh-calendar-body {
          display: flex;
          align-items: flex-start;
          gap: 7px;
        }

        .gh-weekdays {
          display: grid;
          grid-template-rows: repeat(7, 13px);
          gap: 4px;
          width: 23px;
          flex-shrink: 0;
          color: var(--muted);
          font-size: 9px;
          line-height: 13px;
          text-align: right;
        }

        .gh-weeks {
          display: flex;
          gap: 4px;
        }

        .gh-week {
          display: grid;
          grid-template-rows: repeat(7, 13px);
          gap: 4px;
        }

        .gh-cell {
          display: block;
          width: 13px;
          height: 13px;
          padding: 0;
          border: 1px solid rgba(128, 128, 128, 0.12);
          border-radius: 3px;
          background: var(--panel-hover);
          cursor: default;
          transition: transform 0.1s ease, border-color 0.1s ease;
        }

        .gh-cell[data-level="1"] {
          background: var(--green-1);
        }

        .gh-cell[data-level="2"] {
          background: var(--green-2);
        }

        .gh-cell[data-level="3"] {
          background: var(--green-3);
        }

        .gh-cell[data-level="4"] {
          background: var(--green-4);
        }

        .gh-cell.gh-today {
          border: 1px solid var(--today);
        }

        .gh-cell.gh-clickable {
          cursor: pointer;
        }

        .gh-cell.gh-clickable:hover {
          transform: scale(1.22);
          border-color: var(--text);
        }

        .gh-cell:disabled {
          opacity: 1;
        }

        .gh-cell:disabled:not(.gh-clickable) {
          cursor: default;
        }

        .gh-legend {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 5px;
          margin-top: 13px;
          color: var(--muted);
          font-size: 10px;
        }

        .gh-legend .gh-cell {
          flex-shrink: 0;
        }

        .gh-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-top: 14px;
        }

        .gh-stat {
          min-width: 0;
          padding: 13px;
          border: 1px solid var(--border);
          border-radius: 9px;
          background: var(--bg);
        }

        .gh-stat-label {
          color: var(--muted);
          font-size: 11px;
        }

        .gh-stat-value {
          display: block;
          margin-top: 7px;
          overflow-wrap: anywhere;
          font-size: 20px;
          font-weight: 650;
          letter-spacing: -0.5px;
        }

        .gh-stat-detail {
          display: block;
          margin-top: 3px;
          color: var(--muted);
          font-size: 10px;
        }

        .gh-today-action {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid var(--border);
        }

        .gh-today-copy {
          min-width: 0;
        }

        .gh-today-copy strong {
          display: block;
          font-size: 12px;
          font-weight: 600;
        }

        .gh-today-copy span {
          display: block;
          margin-top: 4px;
          color: var(--muted);
          font-size: 11px;
        }

        .gh-complete-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          min-height: 36px;
          padding: 0 12px;
          border: 1px solid var(--green-3);
          border-radius: 8px;
          background: var(--green-3);
          color: #fff;
          font: inherit;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
        }

        .gh-complete-button.gh-completed {
          border-color: var(--border);
          background: var(--panel);
          color: var(--text);
        }

        .gh-complete-button:hover {
          opacity: 0.85;
        }

        .gh-empty {
          padding: 42px 20px;
          border: 1px dashed var(--border);
          border-radius: 12px;
          text-align: center;
        }

        .gh-empty-icon {
          margin-bottom: 12px;
          font-size: 28px;
        }

        .gh-empty h3 {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
        }

        .gh-empty p {
          margin: 7px 0 0;
          color: var(--muted);
          font-size: 12px;
        }

        .gh-footer {
          margin-top: 22px;
          color: var(--muted);
          font-size: 11px;
          text-align: center;
        }

        @media (max-width: 760px) {
          .gh-page {
            padding: 16px;
          }

          .gh-header {
            align-items: flex-start;
          }

          .gh-heading {
            font-size: 19px;
          }

          .gh-create-panel {
            align-items: stretch;
            flex-direction: column;
          }

          .gh-create-form {
            width: 100%;
          }

          .gh-card {
            padding: 14px;
          }

          .gh-calendar-panel {
            padding: 11px;
          }
        }

        @media (max-width: 480px) {
          .gh-page {
            padding: 12px;
          }

          .gh-logo {
            width: 36px;
            height: 36px;
          }

          .gh-heading {
            font-size: 17px;
          }

          .gh-subtitle {
            font-size: 11px;
          }

          .gh-theme-button {
            width: 38px;
            padding: 0;
            font-size: 16px;
          }

          .gh-theme-label {
            display: none;
          }

          .gh-card-header {
            gap: 8px;
          }

          .gh-card-actions {
            gap: 3px;
          }

          .gh-stats {
            gap: 6px;
          }

          .gh-stat {
            padding: 9px;
          }

          .gh-stat-value {
            font-size: 17px;
          }

          .gh-calendar-hint {
            display: none;
          }

          .gh-today-action {
            align-items: flex-start;
            flex-direction: column;
          }

          .gh-complete-button {
            width: 100%;
          }
        }
      `}</style>

      <div className="gh-container">
        <header className="gh-header">
          <div className="gh-title">
            <div className="gh-logo" aria-hidden="true">
              ◷
            </div>

            <div>
              <h1 className="gh-heading">Seguimiento de hábitos</h1>
              <p className="gh-subtitle">
                Un día a la vez. Un hábito a la vez.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="gh-theme-button"
            onClick={() => setTema((actual) => !actual)}
            aria-label={
              tema ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
            }
          >
            <span aria-hidden="true">{tema ? "☀" : "☾"}</span>
            <span className="gh-theme-label">
              {tema ? "Modo claro" : "Modo oscuro"}
            </span>
          </button>
        </header>

        <section className="gh-create-panel">
          <div className="gh-create-copy">
            <h2>Mis hábitos</h2>
            <p>
              Cada hábito tiene su propio calendario y sus propios registros.
            </p>
          </div>

          <form className="gh-create-form" onSubmit={agregarHabito}>
            <input
              className="gh-input"
              type="text"
              value={nuevoNombre}
              onChange={(evento) => setNuevoNombre(evento.target.value)}
              placeholder="Ej. Leer 20 minutos..."
              maxLength={80}
              aria-label="Nombre del nuevo hábito"
            />

            <button className="gh-button" type="submit">
              <span aria-hidden="true">+</span>
              Crear hábito
            </button>
          </form>
        </section>

        <div className="gh-section-heading">
          <h2>Tu seguimiento</h2>
          <span className="gh-count">{habitos.length}</span>
        </div>

        {habitos.length === 0 ? (
          <div className="gh-empty">
            <div className="gh-empty-icon" aria-hidden="true">
              ◷
            </div>
            <h3>Aún no tienes hábitos</h3>
            <p>
              Crea tu primer hábito para comenzar a registrar tu progreso.
            </p>
          </div>
        ) : (
          <div className="gh-habits">
            {habitos.map((habito) => {
              const estadisticas = calcularEstadisticas(
                habito.completados,
                anio
              );

              const completadoHoy = habito.completados.includes(hoy);

              return (
                <article className="gh-card" key={habito.id}>
                  <div className="gh-card-header">
                    <div className="gh-habit-info">
                      <div className="gh-habit-icon" aria-hidden="true">
                        ✓
                      </div>

                      <div className="gh-habit-title-area">
                        {editandoId === habito.id ? (
                          <form
                            className="gh-edit-form"
                            onSubmit={(evento) => {
                              evento.preventDefault();
                              guardarNombre(habito.id);
                            }}
                          >
                            <input
                              className="gh-input"
                              value={nombreEdicion}
                              onChange={(evento) =>
                                setNombreEdicion(evento.target.value)
                              }
                              maxLength={80}
                              autoFocus
                              aria-label="Editar nombre del hábito"
                            />

                            <button
                              className="gh-small-button"
                              type="submit"
                              title="Guardar nombre"
                            >
                              Guardar
                            </button>

                            <button
                              className="gh-small-button"
                              type="button"
                              onClick={() => {
                                setEditandoId(null);
                                setNombreEdicion("");
                              }}
                              title="Cancelar edición"
                            >
                              ×
                            </button>
                          </form>
                        ) : (
                          <>
                            <h3 className="gh-habit-title">
                              {habito.nombre}
                            </h3>
                            <p className="gh-habit-description">
                              Seguimiento de {anio}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="gh-card-actions">
                      {editandoId !== habito.id && (
                        <button
                          type="button"
                          className="gh-icon-button"
                          title="Editar nombre"
                          aria-label={`Editar ${habito.nombre}`}
                          onClick={() => {
                            setEditandoId(habito.id);
                            setNombreEdicion(habito.nombre);
                          }}
                        >
                          ✎
                        </button>
                      )}

                      <button
                        type="button"
                        className="gh-icon-button"
                        title="Eliminar hábito"
                        aria-label={`Eliminar ${habito.nombre}`}
                        onClick={() => eliminarHabito(habito.id)}
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  <div className="gh-calendar-panel">
                    <div className="gh-calendar-top">
                      <span className="gh-calendar-year">{anio}</span>
                      <span className="gh-calendar-hint">
                        Selecciona el cuadro de hoy para registrar el hábito
                      </span>
                    </div>

                    <div className="gh-calendar-scroll">
                      <div className="gh-calendar-inner">
                        <div className="gh-months">
                          {meses.map((mes) => (
                            <span
                              key={`${habito.id}-${mes.nombre}-${mes.columna}`}
                              className="gh-month-label"
                              style={{
                                gridColumnStart: mes.columna + 1,
                              }}
                            >
                              {mes.nombre}
                            </span>
                          ))}
                        </div>

                        <div className="gh-calendar-body">
                          <div className="gh-weekdays" aria-hidden="true">
                            <span />
                            <span>Lun</span>
                            <span />
                            <span>Mié</span>
                            <span />
                            <span>Vie</span>
                            <span />
                          </div>

                          <div className="gh-weeks">
                            {semanas.map((semana, indiceSemana) => (
                              <div
                                className="gh-week"
                                key={`${habito.id}-semana-${indiceSemana}`}
                              >
                                {semana.map((fecha) => {
                                  const esHoy = fecha === hoy;
                                  const esDelAnio = fecha.startsWith(
                                    `${anio}-`
                                  );
                                  const nivel = obtenerNivel(habito, fecha);
                                  const esCompletado =
                                    habito.completados.includes(fecha);

                                  return (
                                    <button
                                      type="button"
                                      key={fecha}
                                      className={[
                                        "gh-cell",
                                        esHoy ? "gh-today" : "",
                                        esHoy ? "gh-clickable" : "",
                                      ]
                                        .filter(Boolean)
                                        .join(" ")}
                                      data-level={nivel}
                                      disabled={!esHoy || !esDelAnio}
                                      title={`${fecha}${
                                        esCompletado
                                          ? " · Completado"
                                          : esHoy
                                            ? " · Haz clic para registrar"
                                            : ""
                                      }`}
                                      aria-label={`${fecha}${
                                        esCompletado
                                          ? ", hábito completado"
                                          : esHoy
                                            ? ", registrar hábito de hoy"
                                            : ""
                                      }`}
                                      onClick={() =>
                                        alternarDia(habito.id, fecha)
                                      }
                                    />
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="gh-legend">
                      <span>Menos</span>
                      {[0, 1, 2, 3, 4].map((nivel) => (
                        <span
                          key={nivel}
                          className="gh-cell"
                          data-level={nivel}
                          aria-hidden="true"
                        />
                      ))}
                      <span>Más</span>
                    </div>
                  </div>

                  <div className="gh-stats">
                    <div className="gh-stat">
                      <span className="gh-stat-label">
                        Días completados
                      </span>
                      <strong className="gh-stat-value">
                        {estadisticas.total}
                      </strong>
                      <span className="gh-stat-detail">
                        Durante {anio}
                      </span>
                    </div>

                    <div className="gh-stat">
                      <span className="gh-stat-label">
                        Constancia anual
                      </span>
                      <strong className="gh-stat-value">
                        {estadisticas.porcentaje}%
                      </strong>
                      <span className="gh-stat-detail">
                        Días registrados del año
                      </span>
                    </div>

                    <div className="gh-stat">
                      <span className="gh-stat-label">Racha actual</span>
                      <strong className="gh-stat-value">
                        {estadisticas.racha}
                      </strong>
                      <span className="gh-stat-detail">
                        {estadisticas.racha === 1 ? "día seguido" : "días seguidos"}
                      </span>
                    </div>
                  </div>

                  <div className="gh-today-action">
                    <div className="gh-today-copy">
                      <strong>
                        {completadoHoy
                          ? "Hábito completado hoy"
                          : "¿Completaste este hábito hoy?"}
                      </strong>
                      <span>
                        {new Date().toLocaleDateString("es-CO", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`gh-complete-button ${
                        completadoHoy ? "gh-completed" : ""
                      }`}
                      onClick={() => alternarDia(habito.id, hoy)}
                    >
                      <span aria-hidden="true">
                        {completadoHoy ? "✓" : "+"}
                      </span>
                      {completadoHoy
                        ? "Desmarcar hoy"
                        : "Completar hoy"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <footer className="gh-footer">
          Tus hábitos se guardan automáticamente en este navegador.
        </footer>
      </div>
    </div>
  );
}
