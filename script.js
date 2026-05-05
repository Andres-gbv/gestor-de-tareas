const tareas = [
    { 
        id: 1, 
        titulo: "Diseñar Sidebar", 
        descripcion: "Crear los iconos y el menú lateral con fondo oscuro.", 
        estado: "terminado", 
        prioridad: "baja" 
    },
    { 
        id: 2, 
        titulo: "Arreglar Grid", 
        descripcion: "Corregir el solapamiento de las columnas en el wrapper global.", 
        estado: "proceso", 
        prioridad: "urgente" 
    }
];
const filtro = document.getElementById('desplegable');
const tablero = document.getElementById('tablero');
function printTareas(filtroEstado = "todo") {
    tablero.innerHTML = "";
    const tareasFiltradas = tareas.filter( t => filtroEstado === "todo" || t.estado === filtroEstado);
    tareasFiltradas.forEach( tarea =>{
        const tajeta = `
        <article class="tarjeta-tarea">
                <span class="etiqueta-prioridad ${tarea.prioridad}">${tarea.prioridad}</span>
                <h3>${tarea.titulo}</h3>
                <p>Estado: ${tarea.estado}</p>
                <p class="descripcion-tarea">${tarea.descripcion}</p>
                <div class="footer-tarjeta">
                    <span class="fecha">05 May</span>
                    <button class="btn-eliminar">🗑️</button>
                </div>
            </article>
        `;
        tablero.innerHTML += tajeta;
    })

}
printTareas();

filtro.addEventListener('change', (e)=> {
const estadoSeleccionado = e.target.value;

printTareas(estadoSeleccionado)

})