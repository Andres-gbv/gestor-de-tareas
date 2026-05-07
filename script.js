// ============================================================
//  AUTH  –  Gestión de usuarios con localStorage
// ============================================================

let usuarioActual = null;   // username del usuario logueado
let filtroActual  = "todo"; // filtro activo en la barra lateral

/* ---- helpers de storage ---- */
function getUsuarios() {
    return JSON.parse(localStorage.getItem('taskflow_users') || '{}');
}

function saveUsuarios(usuarios) {
    localStorage.setItem('taskflow_users', JSON.stringify(usuarios));
}

function getTareasUsuario(username) {
    return JSON.parse(localStorage.getItem(`taskflow_tasks_${username}`) || '[]');
}

function saveTareasUsuario(username, tareas) {
    localStorage.setItem(`taskflow_tasks_${username}`, JSON.stringify(tareas));
}

/* ---- tabs login / registro ---- */
function switchTab(tab) {
    document.getElementById('tab-login').classList.toggle('active', tab === 'login');
    document.getElementById('tab-register').classList.toggle('active', tab === 'register');
    document.getElementById('form-login').classList.toggle('hidden', tab !== 'login');
    document.getElementById('form-register').classList.toggle('hidden', tab !== 'register');
}

/* ---- hash simple de contraseña (no es criptografía real, es para uso local) ---- */
function hashSimple(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return String(hash);
}

/* ---- login ---- */
function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('login-user').value.trim().toLowerCase();
    const pass = document.getElementById('login-pass').value;
    const errEl = document.getElementById('login-error');

    const usuarios = getUsuarios();
    if (usuarios[user] && usuarios[user].pass === hashSimple(pass)) {
        errEl.classList.add('hidden');
        loginExitoso(user);
    } else {
        errEl.classList.remove('hidden');
    }
}

/* ---- registro ---- */
function handleRegister(e) {
    e.preventDefault();
    const user  = document.getElementById('reg-user').value.trim().toLowerCase();
    const pass  = document.getElementById('reg-pass').value;
    const pass2 = document.getElementById('reg-pass2').value;
    const errEl = document.getElementById('reg-error');

    if (pass !== pass2) {
        errEl.textContent = 'Las contraseñas no coinciden';
        errEl.classList.remove('hidden');
        return;
    }
    if (user.length < 3) {
        errEl.textContent = 'El usuario debe tener al menos 3 caracteres';
        errEl.classList.remove('hidden');
        return;
    }
    if (pass.length < 4) {
        errEl.textContent = 'La contraseña debe tener al menos 4 caracteres';
        errEl.classList.remove('hidden');
        return;
    }

    const usuarios = getUsuarios();
    if (usuarios[user]) {
        errEl.textContent = 'Ese nombre de usuario ya está en uso';
        errEl.classList.remove('hidden');
        return;
    }

    usuarios[user] = { pass: hashSimple(pass) };
    saveUsuarios(usuarios);
    errEl.classList.add('hidden');
    loginExitoso(user);
}

/* ---- login exitoso: muestra la app ---- */
function loginExitoso(username) {
    usuarioActual = username;
    sessionStorage.setItem('taskflow_session', username);

    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('global-wrapper').classList.remove('hidden');

    // Mostrar nombre de usuario
    const displayName = username.charAt(0).toUpperCase() + username.slice(1);
    document.getElementById('user-name-display').textContent = displayName;
    document.getElementById('user-avatar').textContent = username.charAt(0).toUpperCase();

    printTareas(filtroActual);
    actualizarContadores();
}

/* ---- logout ---- */
function logout() {
    usuarioActual = null;
    sessionStorage.removeItem('taskflow_session');
    document.getElementById('global-wrapper').classList.add('hidden');
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('form-login').reset();
    document.getElementById('form-register').reset();
}

/* ---- persistir sesión mientras la pestaña esté abierta ---- */
window.addEventListener('load', () => {
    const sesion = sessionStorage.getItem('taskflow_session');
    if (sesion && getUsuarios()[sesion]) {
        loginExitoso(sesion);
    }
});

// ============================================================
//  APP  –  Gestión de tareas
// ============================================================

let editando = null;

/* ---- obtener/guardar tareas del usuario actual ---- */
function getTareas() {
    return getTareasUsuario(usuarioActual);
}

function saveTareas(tareas) {
    saveTareasUsuario(usuarioActual, tareas);
}

/* ---- actualiza los contadores del sidebar ---- */
function actualizarContadores() {
    const tareas = getTareas();
    document.getElementById('count-todo').textContent      = tareas.length;
    document.getElementById('count-pendiente').textContent = tareas.filter(t => t.estado === 'pendiente').length;
    document.getElementById('count-proceso').textContent   = tareas.filter(t => t.estado === 'proceso').length;
    document.getElementById('count-terminado').textContent = tareas.filter(t => t.estado === 'terminado').length;
}

/* ---- cambio de filtro desde sidebar ---- */
function setFiltro(filtro) {
    filtroActual = filtro;
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    const idx = ['todo','pendiente','proceso','terminado'].indexOf(filtro);
    document.querySelectorAll('.nav-item')[idx].classList.add('active');

    const titulos = { todo: 'Todas las tareas', pendiente: 'Pendientes', proceso: 'En proceso', terminado: 'Terminadas' };
    document.getElementById('header-title').textContent = titulos[filtro];

    printTareas(filtro);
}

/* ---- renderiza las tarjetas ---- */
function printTareas(filtroEstado = "todo") {
    const tareas = getTareas();
    const tablero = document.getElementById('tablero');
    const empty   = document.getElementById('empty-state');
    tablero.innerHTML = "";

    const filtradas = tareas.filter(t => filtroEstado === "todo" || t.estado === filtroEstado);

    const total = tareas.length;
    const sub = filtroEstado === 'todo'
        ? `${total} tarea${total !== 1 ? 's' : ''} en total`
        : `${filtradas.length} tarea${filtradas.length !== 1 ? 's' : ''}`;
    document.getElementById('header-sub').textContent = sub;

    if (filtradas.length === 0) {
        empty.classList.remove('hidden');
        return;
    }
    empty.classList.add('hidden');

    filtradas.forEach(tarea => {
        const fecha = new Date(tarea.id).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        const estadoLabel = { pendiente: '◯ Pendiente', 
                              proceso: '◑ En proceso',
                              terminado: '● Terminada' };

        const tarjeta = `
        <article class="tarjeta-tarea estado-${tarea.estado}">
            <span class="etiqueta-prioridad ${tarea.prioridad}">${tarea.prioridad}</span>
            <h3>${tarea.titulo}</h3>
            <p class="descripcion-tarea">${tarea.descripcion || '<em style="opacity:.5">Sin descripción</em>'}</p>
            <div class="selector-estado">
                <label>Estado:</label>
                <select onchange="cambioEstado(${tarea.id}, this.value)">
                    <option value="pendiente" ${tarea.estado === 'pendiente' ? 'selected' : ''}>◯ Pendiente</option>
                    <option value="proceso"   ${tarea.estado === 'proceso'   ? 'selected' : ''}>◑ En proceso</option>
                    <option value="terminado" ${tarea.estado === 'terminado' ? 'selected' : ''}>● Terminada</option>
                </select>
            </div>
            <div class="footer-tarjeta">
                <span class="fecha">📅 ${fecha}</span>
                <div class="footer-btns">
                    <button class="btn-editar"   onclick="editandoTarea(${tarea.id})" title="Editar">✏️</button>
                    <button class="btn-eliminar" onclick="eliminarTarea(${tarea.id})" title="Eliminar">🗑️</button>
                </div>
            </div>
        </article>`;
        tablero.innerHTML += tarjeta;
    });
}

/* ---- eliminar ---- */
function eliminarTarea(idABorrar) {
    if (confirm("¿Seguro que quieres eliminar esta tarea?")) {
        const tareas = getTareas();
        const nuevas = tareas.filter(t => t.id !== idABorrar);
        saveTareas(nuevas);
        printTareas(filtroActual);
        actualizarContadores();
    }
}

/* ---- cambio de estado desde la tarjeta ---- */
function cambioEstado(idTarea, nEstado) {
    const tareas = getTareas();
    const t = tareas.find(t => t.id === idTarea);
    if (t) {
        t.estado = nEstado;
        saveTareas(tareas);
        printTareas(filtroActual);
        actualizarContadores();
    }
}

/* ---- editar tarea ---- */
function editandoTarea(id) {
    const tareas = getTareas();
    const tarea  = tareas.find(t => t.id === id);
    if (!tarea) return;

    document.getElementById('titulo-task').value     = tarea.titulo;
    document.getElementById('descripcion-task').value = tarea.descripcion;
    document.getElementById('prioridad-task').value  = tarea.prioridad;
    document.getElementById('modal-titulo').textContent = "Editar tarea";

    editando = id;
    document.getElementById('modal-task').classList.remove('hidden-task');
}

/* ---- modal ---- */
const modal     = document.getElementById('modal-task');
const btnCerrar = document.getElementById('cerrar-modal');
const btnAbrir  = document.getElementById('new-task');
const formulario = document.getElementById('form-tarea');

btnAbrir.onclick  = () => {
    editando = null;
    formulario.reset();
    document.getElementById('modal-titulo').textContent = "Nueva tarea";
    modal.classList.remove('hidden-task');
};
btnCerrar.onclick = () => modal.classList.add('hidden-task');
modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden-task'); });

formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    const tareas = getTareas();

    if (editando !== null) {
        const tarea = tareas.find(t => t.id === editando);
        if (tarea) {
            tarea.titulo      = document.getElementById('titulo-task').value;
            tarea.descripcion = document.getElementById('descripcion-task').value;
            tarea.prioridad   = document.getElementById('prioridad-task').value;
        }
        editando = null;
    } else {
        tareas.push({
            id          : Date.now(),
            titulo      : document.getElementById('titulo-task').value,
            descripcion : document.getElementById('descripcion-task').value,
            prioridad   : document.getElementById('prioridad-task').value,
            estado      : "pendiente"
        });
    }

    saveTareas(tareas);
    printTareas(filtroActual);
    actualizarContadores();
    formulario.reset();
    modal.classList.add('hidden-task');
});
