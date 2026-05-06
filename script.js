const tareas = [
    
];
const filtro = document.getElementById('desplegable');
const tablero = document.getElementById('tablero');
function printTareas(filtroEstado = "todo") {
    tablero.innerHTML = "";
    const tareasFiltradas = tareas.filter( t => filtroEstado === "todo" || t.estado === filtroEstado);

    tareasFiltradas.forEach( tarea =>{
        const formatoFecha = new Date(tarea.id).toLocaleDateString('es-ES', {
        day : '2-digit',
        month : 'short'
        });
        const tajeta = `
        <article class="tarjeta-tarea">
                <span class="etiqueta-prioridad ${tarea.prioridad}">${tarea.prioridad}</span>
                <h3>${tarea.titulo}</h3>
                <div class = "selector-estado">
                <label>Estado:</label>
                <select onchange="cambioEstado(${tarea.id}, this.value)">
                    <option value="pendiente" ${tarea.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="proceso" ${tarea.estado === 'proceso' ? 'selected' : ''}>En Proceso</option>
                    <option value="terminado" ${tarea.estado === 'terminado' ? 'selected' : ''}>Terminado</option>
                </select>
                </div>
                
                <p class="descripcion-tarea">${tarea.descripcion}</p>
                <div class="footer-tarjeta">
                    <span class="fecha">${formatoFecha}</span>
                    <button class="btn-eliminar" onclick="eliminarTarea(${tarea.id})">🗑️</button>
                </div>
            </article>
        `;
        tablero.innerHTML += tajeta;
    })

}
function eliminarTarea(idABorrar){
    if(confirm("Estas Seguro de querer eliminar esta tarea")){
        const indice = tareas.findIndex( t => t.id === idABorrar);
        if (indice !== -1){
                tareas.splice(indice, 1)

        }
        printTareas();


    }


}

printTareas();

filtro.addEventListener('change', (e)=> {
const estadoSeleccionado = e.target.value;

printTareas(estadoSeleccionado)

})
const modal = document.getElementById('modal-task');
const btnCerrar =document.getElementById('cerrar-modal');
const btnAbrir = document.getElementById('new-task');
const formulario = document.getElementById('form-tarea');

btnAbrir.onclick = () => modal.classList.remove('hidden-task')
btnCerrar.onclick = () => modal.classList.add('hidden-task');

formulario.addEventListener('submit', (e) => {
    e.preventDefault();

    const nuevaTarea ={
        id : Date.now(),
        titulo : document.getElementById('titulo-task').value,
        descripcion : document.getElementById('descripcion-task').value,
        prioridad : document.getElementById('prioridad-task').value,
        estado : "pendiente"
    }

tareas.push(nuevaTarea);
printTareas();
formulario.reset();
modal.classList.add('hidden-task');
});
function cambioEstado (idTarea, nEstado) {

    const findTarea = tareas.find(t => t.id === idTarea);

    if(findTarea){

        findTarea.estado = nEstado;

    
    const filtroActual = document.getElementById('desplegable').value;
    printTareas(filtroActual);
    }
}
