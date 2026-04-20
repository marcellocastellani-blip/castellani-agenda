import { useState, useEffect } from "react";

const ACCENT = "#c9a84c";
const PROJECT_COLORS = ["#c9a84c", "#6eb5a0", "#c47070", "#8b7fc7"];
const STATUSES = ["todo", "doing", "done"];
const STATUS_LABELS = { todo: "Pendiente", doing: "En curso", done: "Listo" };
const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const DAYS_SHORT = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

const DEFAULT_PROJECTS = [
  { id: "p1", name: "Ohne Rotkohl", color: "#c9a84c" },
  { id: "p2", name: "Arte & Pintura", color: "#6eb5a0" },
  { id: "p3", name: "Personal", color: "#c47070" },
];

const genId = () => Math.random().toString(36).substr(2, 9);
const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";

function getTodayIndex() {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}
function getCurrentWeekDates() {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--color-border-secondary);border-radius:2px}
button{cursor:pointer;border:none;background:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:inherit;color:inherit;padding:0}
input,textarea,select{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;color:var(--color-text-primary)}
select option{background:var(--color-background-secondary)}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{transform:translateY(8px);opacity:0}to{transform:translateY(0);opacity:1}}
`;

const label = (txt) => (
  <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.14em", color: "var(--color-text-tertiary)", fontFamily: F, marginBottom: 6, textTransform: "uppercase" }}>{txt}</p>
);

function ProgressRing({ progress, size = 48, stroke = 2.5, color = "#c9a84c" }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(progress, 100) / 100) * circ;
  const c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="var(--color-border-tertiary)" strokeWidth={stroke} />
      <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${c} ${c})`}
        style={{ transition: "stroke-dasharray 0.5s ease" }} />
      <text x={c} y={c + 4} textAnchor="middle" fill="var(--color-text-primary)"
        fontSize={10} fontFamily="'Helvetica Neue',Helvetica,Arial,sans-serif" fontWeight="500">
        {Math.round(progress)}%
      </text>
    </svg>
  );
}

function TaskCard({ task, project, isExpanded, isFocused, onToggleExpand, onToggleFocus, onAdvance, onRegress, onEdit, compact = false }) {
  const isDone = task.status === "done";
  const color = project?.color || ACCENT;
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: "var(--color-background-secondary)", border: `0.5px solid ${hov ? "var(--color-border-secondary)" : "var(--color-border-tertiary)"}`, borderRadius: "var(--border-radius-md)", padding: compact ? "9px 11px" : "10px 13px", marginBottom: 6, opacity: isDone ? 0.5 : 1, transition: "border-color 0.15s, opacity 0.2s" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <button onClick={onToggleFocus} title={isFocused ? "Quitar del foco" : "Añadir al foco"}
          style={{ color: isFocused ? ACCENT : "var(--color-text-tertiary)", fontSize: 13, lineHeight: 1, marginTop: 1, flexShrink: 0, transition: "color 0.15s" }}>
          {isFocused ? "★" : "☆"}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p onClick={task.notes ? onToggleExpand : undefined}
            style={{ fontSize: compact ? 12 : 13, fontWeight: 400, lineHeight: 1.4, textDecoration: isDone ? "line-through" : "none", color: isDone ? "var(--color-text-tertiary)" : "var(--color-text-primary)", cursor: task.notes ? "pointer" : "default", wordBreak: "break-word", userSelect: "none", fontFamily: F }}>
            {task.title}
            {task.notes && <span style={{ color: "var(--color-text-tertiary)", marginLeft: 4, fontSize: 9 }}>{isExpanded ? "▲" : "▼"}</span>}
          </p>
          {isExpanded && task.notes && (
            <p style={{ color: "var(--color-text-secondary)", fontSize: 12, marginTop: 7, lineHeight: 1.6, paddingLeft: 10, borderLeft: `2px solid ${color}40`, fontFamily: F, fontWeight: 300 }}>
              {task.notes}
            </p>
          )}
          {!compact && project && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: color }} />
              <span style={{ fontSize: 10, color: "var(--color-text-tertiary)", fontFamily: F, fontWeight: 400, letterSpacing: "0.04em" }}>{project.name}</span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 1, flexShrink: 0 }}>
          {task.status !== "todo" && (
            <button onClick={onRegress} title="Atrás" style={{ color: "var(--color-text-tertiary)", fontSize: 14, padding: "2px 4px", lineHeight: 1 }}>‹</button>
          )}
          {task.status !== "done" && (
            <button onClick={onAdvance} title="Avanzar" style={{ color: task.status === "doing" ? color : "var(--color-text-tertiary)", fontSize: 14, padding: "2px 4px", lineHeight: 1 }}>›</button>
          )}
          <button onClick={onEdit} title="Editar" style={{ color: "var(--color-text-tertiary)", fontSize: 11, padding: "2px 5px", lineHeight: 1 }}>✎</button>
        </div>
      </div>
    </div>
  );
}

function Modal({ modal, projects, onAddTask, onUpdateTask, onDeleteTask, onAddProject, onUpdateProject, onDeleteProject, onClose }) {
  const isTask = modal.mode === "addTask" || modal.mode === "editTask";
  const [title, setTitle] = useState(modal.task?.title || "");
  const [notes, setNotes] = useState(modal.task?.notes || "");
  const [status, setStatus] = useState(modal.task?.status || modal.defaultStatus || "todo");
  const [projectId, setProjectId] = useState(modal.task?.projectId || modal.projectId || projects[0]?.id || "");
  const [weekDay, setWeekDay] = useState(modal.task?.weekDay ?? modal.defaultWeekDay ?? -1);
  const [projName, setProjName] = useState(modal.project?.name || "");
  const [projColor, setProjColor] = useState(modal.project?.color || PROJECT_COLORS[0]);
  const [confirm, setConfirm] = useState(false);

  const iS = { width: "100%", background: "var(--color-background-tertiary)", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", padding: "9px 11px", color: "var(--color-text-primary)", outline: "none", fontSize: 13, fontFamily: F, fontWeight: 400 };
  const TITLES = { addTask: "NUEVA TAREA", editTask: "EDITAR TAREA", addProject: "NUEVO PROYECTO", editProject: "EDITAR PROYECTO" };

  const handleSubmit = () => {
    const wd = parseInt(weekDay);
    const wdVal = wd >= 0 ? wd : null;
    if (modal.mode === "addTask" && title.trim()) onAddTask(title.trim(), notes.trim(), status, projectId, wdVal);
    else if (modal.mode === "editTask" && title.trim()) { onUpdateTask(modal.task.id, { title: title.trim(), notes: notes.trim(), status, projectId, weekDay: wdVal }); onClose(); }
    else if (modal.mode === "addProject" && projName.trim()) onAddProject(projName.trim(), projColor);
    else if (modal.mode === "editProject" && projName.trim()) onUpdateProject(modal.project.id, { name: projName.trim(), color: projColor });
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20, animation: "fadeIn 0.15s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-lg)", padding: 28, width: "100%", maxWidth: 460, animation: "slideUp 0.18s ease", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.14em", color: "var(--color-text-primary)", fontFamily: F }}>{TITLES[modal.mode]}</p>
          <button onClick={onClose} style={{ color: "var(--color-text-tertiary)", fontSize: 20, lineHeight: 1, fontWeight: 300 }}>×</button>
        </div>

        {isTask && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>{label("Tarea")}<input value={title} onChange={e => setTitle(e.target.value)} placeholder="¿Qué hay que hacer?" style={iS} autoFocus onKeyDown={e => e.key === "Enter" && handleSubmit()} /></div>
            <div>{label("Notas")}<textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ideas, contexto, referencias..." style={{ ...iS, minHeight: 76, resize: "vertical" }} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>{label("Estado")}<select value={status} onChange={e => setStatus(e.target.value)} style={iS}>{STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}</select></div>
              <div>{label("Día")}<select value={weekDay} onChange={e => setWeekDay(e.target.value)} style={iS}><option value={-1}>Sin planificar</option>{DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}</select></div>
            </div>
            {projects.length > 1 && (
              <div>{label("Proyecto")}<select value={projectId} onChange={e => setProjectId(e.target.value)} style={iS}>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              {modal.mode === "editTask" && (
                <button onClick={() => confirm ? onDeleteTask(modal.task.id) : setConfirm(true)}
                  style={{ padding: "9px 14px", border: `0.5px solid ${confirm ? "#c47070" : "var(--color-border-secondary)"}`, borderRadius: "var(--border-radius-md)", color: confirm ? "#c47070" : "var(--color-text-secondary)", fontSize: 12, fontFamily: F, transition: "all 0.2s" }}>
                  {confirm ? "¿Confirmar?" : "Eliminar"}
                </button>
              )}
              <button onClick={handleSubmit} disabled={!title.trim()} style={{ flex: 1, background: ACCENT, color: "#000", fontWeight: 600, padding: "9px 20px", borderRadius: "var(--border-radius-md)", fontSize: 11, letterSpacing: "0.1em", opacity: title.trim() ? 1 : 0.35, cursor: title.trim() ? "pointer" : "not-allowed", fontFamily: F, border: "none", textTransform: "uppercase" }}>
                {modal.mode === "addTask" ? "Añadir" : "Guardar"}
              </button>
            </div>
          </div>
        )}

        {!isTask && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>{label("Nombre")}<input value={projName} onChange={e => setProjName(e.target.value)} placeholder="Nombre del proyecto" style={iS} autoFocus onKeyDown={e => e.key === "Enter" && handleSubmit()} /></div>
            <div>
              {label("Color")}
              <div style={{ display: "flex", gap: 10 }}>
                {PROJECT_COLORS.map(c => (
                  <button key={c} onClick={() => setProjColor(c)} style={{ width: 26, height: 26, borderRadius: "50%", background: c, border: projColor === c ? "2.5px solid var(--color-text-primary)" : "2.5px solid transparent", transition: "border 0.15s" }} />
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              {modal.mode === "editProject" && (
                <button onClick={() => confirm ? onDeleteProject(modal.project.id) : setConfirm(true)}
                  style={{ padding: "9px 14px", border: `0.5px solid ${confirm ? "#c47070" : "var(--color-border-secondary)"}`, borderRadius: "var(--border-radius-md)", color: confirm ? "#c47070" : "var(--color-text-secondary)", fontSize: 12, fontFamily: F, transition: "all 0.2s" }}>
                  {confirm ? "¿Confirmar?" : "Eliminar"}
                </button>
              )}
              <button onClick={handleSubmit} disabled={!projName.trim()} style={{ flex: 1, background: ACCENT, color: "#000", fontWeight: 600, padding: "9px 20px", borderRadius: "var(--border-radius-md)", fontSize: 11, letterSpacing: "0.1em", opacity: projName.trim() ? 1 : 0.35, cursor: projName.trim() ? "pointer" : "not-allowed", fontFamily: F, border: "none", textTransform: "uppercase" }}>
                {modal.mode === "addProject" ? "Crear" : "Guardar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [tasks, setTasks] = useState([]);
  const [activeProject, setActiveProject] = useState("p1");
  const [focusIds, setFocusIds] = useState([]);
  const [modal, setModal] = useState(null);
  const [expandedTask, setExpandedTask] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("hoy");

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("foco-planner-v2");
        if (r) {
          const d = JSON.parse(r.value);
          if (d.projects?.length) setProjects(d.projects);
          if (d.tasks) setTasks(d.tasks);
          if (d.focusIds) setFocusIds(d.focusIds);
          if (d.activeProject) setActiveProject(d.activeProject);
        }
      } catch {}
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        await window.storage.set("foco-planner-v2", JSON.stringify({ projects, tasks, focusIds, activeProject }));
      } catch {}
    })();
  }, [projects, tasks, focusIds, activeProject, loaded]);

  const addTask = (title, notes, status, projectId, weekDay) => {
    setTasks(prev => [...prev, { id: genId(), title, notes, status, projectId, weekDay: weekDay ?? null, createdAt: Date.now() }]);
    setModal(null);
  };
  const updateTask = (id, u) => setTasks(prev => prev.map(t => t.id === id ? { ...t, ...u } : t));
  const deleteTask = (id) => { setTasks(p => p.filter(t => t.id !== id)); setFocusIds(p => p.filter(f => f !== id)); if (expandedTask === id) setExpandedTask(null); setModal(null); };
  const advanceStatus = (task) => { const i = STATUSES.indexOf(task.status); if (i < STATUSES.length - 1) updateTask(task.id, { status: STATUSES[i + 1] }); };
  const regressStatus = (task) => { const i = STATUSES.indexOf(task.status); if (i > 0) updateTask(task.id, { status: STATUSES[i - 1] }); };
  const toggleFocus = (id) => setFocusIds(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  const addProject = (name, color) => { const p = { id: genId(), name, color }; setProjects(prev => [...prev, p]); setActiveProject(p.id); setModal(null); };
  const updateProject = (id, u) => { setProjects(p => p.map(x => x.id === id ? { ...x, ...u } : x)); setModal(null); };
  const deleteProject = (id) => {
    const rest = projects.filter(p => p.id !== id);
    if (!rest.length) return;
    const gone = tasks.filter(t => t.projectId === id).map(t => t.id);
    setProjects(rest); setTasks(p => p.filter(t => t.projectId !== id)); setFocusIds(p => p.filter(f => !gone.includes(f))); setActiveProject(rest[0]?.id || ""); setModal(null);
  };

  const projectTasks = tasks.filter(t => t.projectId === activeProject);
  const getProgress = (pid) => { const pts = tasks.filter(t => t.projectId === pid); return pts.length ? Math.round(pts.filter(t => t.status === "done").length / pts.length * 100) : 0; };
  const overall = tasks.length ? Math.round(tasks.filter(t => t.status === "done").length / tasks.length * 100) : 0;
  const todayRaw = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  const todayStr = todayRaw.charAt(0).toUpperCase() + todayRaw.slice(1);
  const activeProj = projects.find(p => p.id === activeProject);
  const todayIdx = getTodayIndex();
  const weekDates = getCurrentWeekDates();
  const focusTasks = focusIds.map(id => tasks.find(t => t.id === id)).filter(Boolean);
  const todayScheduled = tasks.filter(t => t.weekDay === todayIdx && !focusIds.includes(t.id));

  const cp = (task) => ({
    task, project: projects.find(p => p.id === task.projectId),
    isExpanded: expandedTask === task.id, isFocused: focusIds.includes(task.id),
    onToggleExpand: () => setExpandedTask(expandedTask === task.id ? null : task.id),
    onToggleFocus: () => toggleFocus(task.id),
    onAdvance: () => advanceStatus(task), onRegress: () => regressStatus(task),
    onEdit: () => setModal({ mode: "editTask", task }),
  });

  if (!loaded) return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: "100vh", background: "var(--color-background-tertiary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: F, color: "var(--color-text-tertiary)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase" }}>Cargando</span>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <div style={{ background: "var(--color-background-tertiary)", minHeight: "100vh", color: "var(--color-text-primary)", fontFamily: F }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 20px 60px" }}>

          {/* HEADER */}
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--color-text-primary)", fontFamily: F, textTransform: "uppercase", lineHeight: 1 }}>FOCO</h1>
              <p style={{ color: "var(--color-text-tertiary)", fontSize: 11, marginTop: 6, letterSpacing: "0.08em", fontWeight: 400, fontFamily: F }}>{todayStr}</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <ProgressRing progress={overall} size={52} />
              <p style={{ color: "var(--color-text-tertiary)", fontSize: 9, marginTop: 4, letterSpacing: "0.14em", fontFamily: F, fontWeight: 500 }}>GLOBAL</p>
            </div>
          </header>

          {/* NAV */}
          <nav style={{ display: "flex", gap: 0, marginBottom: 36, borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
            {[["hoy", "HOY"], ["semana", "SEMANA"], ["proyectos", "PROYECTOS"]].map(([v, lbl]) => (
              <button key={v} onClick={() => setView(v)} style={{ fontFamily: F, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: view === v ? "var(--color-text-primary)" : "var(--color-text-tertiary)", padding: "8px 20px", background: "none", borderBottom: view === v ? `2px solid ${ACCENT}` : "2px solid transparent", marginBottom: -1, transition: "all 0.2s" }}>
                {lbl}
              </button>
            ))}
          </nav>

          {/* ─── HOY ─── */}
          {view === "hoy" && (
            <div>
              <section style={{ marginBottom: 40 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.14em", color: "var(--color-text-primary)", fontFamily: F, textTransform: "uppercase" }}>FOCO DEL DÍA</h2>
                    <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 3, fontFamily: F, fontWeight: 400 }}>Tareas marcadas con ★ — sin límite</p>
                  </div>
                  <button onClick={() => setModal({ mode: "addTask", defaultStatus: "todo", projectId: activeProject })}
                    style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", color: "var(--color-text-secondary)", padding: "6px 12px", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", fontFamily: F, textTransform: "uppercase" }}>
                    + Añadir
                  </button>
                </div>
                {focusTasks.length === 0 ? (
                  <div style={{ border: "0.5px dashed var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", padding: "22px 20px", color: "var(--color-text-tertiary)", fontSize: 12, textAlign: "center", fontFamily: F, fontWeight: 400 }}>
                    Marca tareas con ★ para fijarlas aquí
                  </div>
                ) : (
                  focusTasks.map(t => <TaskCard key={t.id} {...cp(t)} />)
                )}
              </section>

              {todayScheduled.length > 0 && (
                <section>
                  <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: 28, marginBottom: 16 }}>
                    <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.14em", color: "var(--color-text-primary)", fontFamily: F, textTransform: "uppercase" }}>PLANIFICADO HOY</h2>
                    <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 3, fontFamily: F }}>Asignado a {DAYS[todayIdx]}</p>
                  </div>
                  {todayScheduled.map(t => <TaskCard key={t.id} {...cp(t)} />)}
                </section>
              )}

              {focusTasks.length === 0 && todayScheduled.length === 0 && (
                <p style={{ color: "var(--color-text-tertiary)", fontSize: 11, marginTop: 6, fontFamily: F }}>
                  Planifica tu semana en{" "}
                  <button onClick={() => setView("semana")} style={{ color: ACCENT, fontFamily: F, fontSize: 11, textDecoration: "underline", cursor: "pointer" }}>Semana →</button>
                </p>
              )}
            </div>
          )}

          {/* ─── SEMANA ─── */}
          {view === "semana" && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.14em", color: "var(--color-text-primary)", fontFamily: F, textTransform: "uppercase" }}>PLANNER SEMANAL</h2>
                <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 3, fontFamily: F }}>
                  Semana del {weekDates[0].toLocaleDateString("es-ES", { day: "numeric", month: "long" })}
                </p>
              </div>

              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12 }}>
                {DAYS.map((dayName, i) => {
                  const isToday = i === todayIdx;
                  const dayDate = weekDates[i];
                  const dayTasks = tasks.filter(t => t.weekDay === i);
                  const donePct = dayTasks.length ? Math.round(dayTasks.filter(t => t.status === "done").length / dayTasks.length * 100) : 0;
                  return (
                    <div key={i} style={{ minWidth: 145, flex: 1 }}>
                      <div style={{ padding: "10px 11px", marginBottom: 8, background: isToday ? ACCENT + "15" : "var(--color-background-secondary)", border: `0.5px solid ${isToday ? ACCENT + "50" : "var(--color-border-tertiary)"}`, borderRadius: "var(--border-radius-md)" }}>
                        <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.14em", color: isToday ? ACCENT : "var(--color-text-tertiary)", fontFamily: F }}>{DAYS_SHORT[i]}</p>
                        <p style={{ fontSize: 22, fontWeight: isToday ? 700 : 300, color: isToday ? ACCENT : "var(--color-text-primary)", fontFamily: F, lineHeight: 1.15, marginTop: 1 }}>{dayDate.getDate()}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 7 }}>
                          <div style={{ flex: 1, height: 1.5, background: "var(--color-border-tertiary)", borderRadius: 1, overflow: "hidden" }}>
                            <div style={{ width: `${donePct}%`, height: "100%", background: isToday ? ACCENT : "#5a9e7a", borderRadius: 1, transition: "width 0.4s" }} />
                          </div>
                          <span style={{ fontSize: 9, color: "var(--color-text-tertiary)", fontFamily: F, fontWeight: 500 }}>{dayTasks.length}</span>
                        </div>
                      </div>
                      {dayTasks.length === 0 && (
                        <div style={{ border: "0.5px dashed var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", padding: "12px 8px", color: "var(--color-text-tertiary)", textAlign: "center", fontSize: 11, fontFamily: F, marginBottom: 6 }}>—</div>
                      )}
                      {dayTasks.map(t => <TaskCard key={t.id} {...cp(t)} compact />)}
                      <button
                        onClick={() => setModal({ mode: "addTask", defaultStatus: "todo", projectId: activeProject, defaultWeekDay: i })}
                        style={{ width: "100%", padding: "7px 8px", border: "0.5px dashed var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", color: "var(--color-text-tertiary)", fontSize: 11, fontFamily: F, fontWeight: 500, letterSpacing: "0.06em", transition: "all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--color-border-secondary)"; e.currentTarget.style.color = "var(--color-text-secondary)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-border-tertiary)"; e.currentTarget.style.color = "var(--color-text-tertiary)"; }}>
                        + AÑADIR
                      </button>
                    </div>
                  );
                })}
              </div>

              {(() => {
                const unscheduled = tasks.filter(t => t.weekDay === null || t.weekDay === undefined);
                if (!unscheduled.length) return null;
                return (
                  <div style={{ marginTop: 32, paddingTop: 24, borderTop: "0.5px solid var(--color-border-tertiary)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <h3 style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", color: "var(--color-text-primary)", fontFamily: F, textTransform: "uppercase" }}>SIN PLANIFICAR</h3>
                      <span style={{ fontSize: 10, color: "var(--color-text-tertiary)", fontFamily: F }}>{unscheduled.length} tareas</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 0 }}>
                      {unscheduled.map(t => <TaskCard key={t.id} {...cp(t)} />)}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ─── PROYECTOS ─── */}
          {view === "proyectos" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.14em", color: "var(--color-text-primary)", fontFamily: F, textTransform: "uppercase" }}>PROYECTOS</h2>
                {projects.length < 4 && (
                  <button onClick={() => setModal({ mode: "addProject" })}
                    style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", color: "var(--color-text-secondary)", padding: "6px 12px", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", fontFamily: F, textTransform: "uppercase" }}>
                    + Nuevo
                  </button>
                )}
              </div>

              {/* Project tabs */}
              <div style={{ display: "flex", gap: 6, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }}>
                {projects.map(proj => {
                  const isActive = proj.id === activeProject;
                  const pct = getProgress(proj.id);
                  return (
                    <button key={proj.id} onClick={() => setActiveProject(proj.id)} style={{ padding: "10px 14px", borderRadius: "var(--border-radius-md)", background: isActive ? proj.color + "15" : "var(--color-background-secondary)", border: `0.5px solid ${isActive ? proj.color + "60" : "var(--color-border-tertiary)"}`, color: isActive ? proj.color : "var(--color-text-secondary)", transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, minWidth: 120, flexShrink: 0, cursor: "pointer" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", whiteSpace: "nowrap", fontFamily: F, textTransform: "uppercase" }}>{proj.name}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, width: "100%" }}>
                        <div style={{ flex: 1, height: 1.5, background: "var(--color-border-tertiary)", borderRadius: 1, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: proj.color, borderRadius: 1, transition: "width 0.4s" }} />
                        </div>
                        <span style={{ fontSize: 9, fontFamily: F, fontWeight: 500 }}>{pct}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active project header */}
              {activeProj && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 16, borderBottom: "0.5px solid var(--color-border-tertiary)", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 2.5, height: 24, background: activeProj.color, borderRadius: 1 }} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", color: "var(--color-text-primary)", fontFamily: F, textTransform: "uppercase" }}>{activeProj.name}</p>
                      <p style={{ fontSize: 10, color: "var(--color-text-tertiary)", marginTop: 2, fontFamily: F }}>
                        {tasks.filter(t => t.projectId === activeProject && t.status === "done").length} / {projectTasks.length} completadas
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <ProgressRing progress={getProgress(activeProject)} size={44} color={activeProj.color} />
                    <button onClick={() => setModal({ mode: "editProject", project: activeProj })}
                      style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.1em", color: "var(--color-text-secondary)", padding: "5px 10px", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", fontFamily: F, textTransform: "uppercase" }}>
                      Editar
                    </button>
                  </div>
                </div>
              )}

              {/* Kanban */}
              <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 12 }}>
                {STATUSES.map(status => {
                  const colTasks = projectTasks.filter(t => t.status === status);
                  const colColor = status === "doing" ? (activeProj?.color || ACCENT) : status === "done" ? "#5a9e7a" : "var(--color-border-secondary)";
                  return (
                    <div key={status} style={{ minWidth: 250, flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 10, borderBottom: `1.5px solid ${colColor}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", color: colColor, fontFamily: F }}>
                            {STATUS_LABELS[status].toUpperCase()}
                          </span>
                          <span style={{ background: "var(--color-background-secondary)", color: "var(--color-text-tertiary)", borderRadius: 10, padding: "1px 7px", fontSize: 10, fontFamily: F, fontWeight: 500 }}>
                            {colTasks.length}
                          </span>
                        </div>
                        <button onClick={() => setModal({ mode: "addTask", defaultStatus: status, projectId: activeProject })}
                          style={{ color: "var(--color-text-tertiary)", fontSize: 18, lineHeight: 1, padding: "0 4px" }}>+</button>
                      </div>
                      {colTasks.length === 0 && (
                        <div style={{ border: "0.5px dashed var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", padding: "14px 12px", color: "var(--color-text-tertiary)", textAlign: "center", fontSize: 11, fontFamily: F }}>—</div>
                      )}
                      {colTasks.map(t => <TaskCard key={t.id} {...cp(t)} />)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {modal && (
          <Modal modal={modal} projects={projects}
            onAddTask={addTask} onUpdateTask={updateTask} onDeleteTask={deleteTask}
            onAddProject={addProject} onUpdateProject={updateProject} onDeleteProject={deleteProject}
            onClose={() => setModal(null)} />
        )}
      </div>
    </>
  );
}
