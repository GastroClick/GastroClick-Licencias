// ==================================================
// GASTROCLICK
// PANEL DE ADMINISTRACIÓN
// ==================================================

"use strict";


// ==================================================
// CONFIGURACIÓN
// ==================================================

const URL_CLIENTES =
    "../clientes/clientes.json";


// ==================================================
// VARIABLES
// ==================================================

let clientes = [];

let clienteEditando = null;

let clienteEliminar = null;


// ==================================================
// INICIO
// ==================================================

document.addEventListener("DOMContentLoaded", () => {

    inicializarEventos();

    cargarClientes();

});


// ==================================================
// EVENTOS
// ==================================================

function inicializarEventos() {

    // ----------------------------------------------
    // NUEVO CLIENTE
    // ----------------------------------------------

    const btnNuevoCliente =
        document.getElementById("btnNuevoCliente");

    if (btnNuevoCliente) {

        btnNuevoCliente.addEventListener(
            "click",
            abrirModalNuevoCliente
        );

    }


    // ----------------------------------------------
    // CERRAR MODAL
    // ----------------------------------------------

    const btnCerrarModal =
        document.getElementById("btnCerrarModal");

    if (btnCerrarModal) {

        btnCerrarModal.addEventListener(
            "click",
            cerrarModalCliente
        );

    }


    // ----------------------------------------------
    // CANCELAR
    // ----------------------------------------------

    const btnCancelar =
        document.getElementById("btnCancelar");

    if (btnCancelar) {

        btnCancelar.addEventListener(
            "click",
            cerrarModalCliente
        );

    }


    // ----------------------------------------------
    // GUARDAR
    // ----------------------------------------------

    const btnGuardarCliente =
        document.getElementById("btnGuardarCliente");

    if (btnGuardarCliente) {

        btnGuardarCliente.addEventListener(
            "click",
            guardarCliente
        );

    }


    // ----------------------------------------------
    // BUSCAR
    // ----------------------------------------------

    const buscarCliente =
        document.getElementById("buscarCliente");

    if (buscarCliente) {

        buscarCliente.addEventListener(
            "input",
            aplicarFiltros
        );

    }


    // ----------------------------------------------
    // FILTRO ESTADO
    // ----------------------------------------------

    const filtroEstado =
        document.getElementById("filtroEstado");

    if (filtroEstado) {

        filtroEstado.addEventListener(
            "change",
            aplicarFiltros
        );

    }


    // ----------------------------------------------
    // CERRAR MODAL ELIMINAR
    // ----------------------------------------------

    const btnCerrarEliminar =
        document.getElementById("btnCerrarEliminar");

    if (btnCerrarEliminar) {

        btnCerrarEliminar.addEventListener(
            "click",
            cerrarModalEliminar
        );

    }


    const btnCancelarEliminar =
        document.getElementById("btnCancelarEliminar");

    if (btnCancelarEliminar) {

        btnCancelarEliminar.addEventListener(
            "click",
            cerrarModalEliminar
        );

    }


    // ----------------------------------------------
    // CONFIRMAR ELIMINACIÓN
    // ----------------------------------------------

    const btnConfirmarEliminar =
        document.getElementById("btnConfirmarEliminar");

    if (btnConfirmarEliminar) {

        btnConfirmarEliminar.addEventListener(
            "click",
            confirmarEliminar
        );

    }


    // ----------------------------------------------
    // CERRAR MODALES HACIENDO CLICK AFUERA
    // ----------------------------------------------

    const modalCliente =
        document.getElementById("modalCliente");

    if (modalCliente) {

        modalCliente.addEventListener(
            "click",
            (event) => {

                if (event.target === modalCliente) {

                    cerrarModalCliente();

                }

            }
        );

    }


    const modalEliminar =
        document.getElementById("modalEliminar");

    if (modalEliminar) {

        modalEliminar.addEventListener(
            "click",
            (event) => {

                if (event.target === modalEliminar) {

                    cerrarModalEliminar();

                }

            }
        );

    }

}


// ==================================================
// CARGAR CLIENTES
// ==================================================

async function cargarClientes() {

    try {

        const respuesta =
            await fetch(
                URL_CLIENTES + "?t=" + Date.now(),
                {
                    cache: "no-store"
                }
            );


        if (!respuesta.ok) {

            throw new Error(
                "HTTP " + respuesta.status
            );

        }


        const datos =
            await respuesta.json();


        // ------------------------------------------
        // VALIDAR ESTRUCTURA
        // ------------------------------------------

        if (!datos ||
            !Array.isArray(datos.clientes)) {

            throw new Error(
                "El archivo clientes.json no tiene "
                + "la estructura esperada."
            );

        }


        clientes =
            datos.clientes;


        // ------------------------------------------
        // NORMALIZAR DATOS
        // ------------------------------------------

        clientes =
            clientes.map(cliente => ({

                id:
                    String(cliente.id || "").trim(),

                estado:
                    String(
                        cliente.estado || ""
                    ).trim().toUpperCase(),

                vencimiento:
                    String(
                        cliente.vencimiento || ""
                    ).trim()

            }));


        actualizarDashboard();

        aplicarFiltros();


    } catch (error) {

        console.error(
            "Error cargando clientes:",
            error
        );


        mostrarErrorCarga();

    }

}


// ==================================================
// DASHBOARD
// ==================================================

function actualizarDashboard() {

    const hoy =
        new Date();


    const total =
        clientes.length;


    const activos =
        clientes.filter(
            cliente =>
                cliente.estado === "ACTIVA"
        ).length;


    const suspendidos =
        clientes.filter(
            cliente =>
                cliente.estado === "SUSPENDIDA"
        ).length;


    const vencidos =
        clientes.filter(
            cliente =>
                estaVencido(cliente.vencimiento)
        ).length;


    establecerTexto(
        "totalClientes",
        total
    );


    establecerTexto(
        "clientesActivos",
        activos
    );


    establecerTexto(
        "clientesSuspendidos",
        suspendidos
    );


    establecerTexto(
        "clientesVencidos",
        vencidos
    );

}


// ==================================================
// FILTROS
// ==================================================

function aplicarFiltros() {

    const input =
        document.getElementById(
            "buscarCliente"
        );


    const select =
        document.getElementById(
            "filtroEstado"
        );


    const texto =
        input
            ? input.value
                .trim()
                .toLowerCase()
            : "";


    const estado =
        select
            ? select.value
            : "TODOS";


    const filtrados =
        clientes.filter(cliente => {

            // --------------------------------------
            // BUSQUEDA POR ID
            // --------------------------------------

            const coincideBusqueda =
                cliente.id
                    .toLowerCase()
                    .includes(texto);


            // --------------------------------------
            // FILTRO ESTADO
            // --------------------------------------

            const coincideEstado =
                estado === "TODOS"
                ||
                cliente.estado === estado;


            return (
                coincideBusqueda
                &&
                coincideEstado
            );

        });


    renderizarClientes(
        filtrados
    );

}


// ==================================================
// TABLA
// ==================================================

function renderizarClientes(
    lista
) {

    const tabla =
        document.getElementById(
            "tablaClientes"
        );


    if (!tabla) {
        return;
    }


    tabla.innerHTML = "";


    if (lista.length === 0) {

        const fila =
            document.createElement("tr");

        fila.className =
            "empty-row";


        const celda =
            document.createElement("td");

        celda.colSpan = 5;

        celda.textContent =
            "No se encontraron clientes.";


        fila.appendChild(celda);

        tabla.appendChild(fila);

        return;
    }


    lista.forEach(cliente => {

        const fila =
            document.createElement("tr");


        // ------------------------------------------
        // ID
        // ------------------------------------------

        const celdaId =
            document.createElement("td");

        celdaId.className =
            "client-id";

        celdaId.textContent =
            cliente.id;


        // ------------------------------------------
        // ESTADO
        // ------------------------------------------

        const celdaEstado =
            document.createElement("td");


        const badge =
            document.createElement("span");


        badge.className =
            "badge "
            +
            (
                cliente.estado === "ACTIVA"
                    ? "active"
                    : "suspended"
            );


        badge.textContent =
            cliente.estado;


        celdaEstado.appendChild(
            badge
        );


        // ------------------------------------------
        // VENCIMIENTO
        // ------------------------------------------

        const celdaVencimiento =
            document.createElement("td");


        celdaVencimiento.textContent =
            formatearFecha(
                cliente.vencimiento
            );


        // ------------------------------------------
        // SITUACIÓN
        // ------------------------------------------

        const celdaSituacion =
            document.createElement("td");


        const situacion =
            obtenerSituacion(
                cliente
            );


        const situacionSpan =
            document.createElement("span");


        situacionSpan.className =
            "situation "
            +
            situacion.clase;


        situacionSpan.textContent =
            situacion.texto;


        celdaSituacion.appendChild(
            situacionSpan
        );


        // ------------------------------------------
        // ACCIONES
        // ------------------------------------------

        const celdaAcciones =
            document.createElement("td");


        const acciones =
            document.createElement("div");


        acciones.className =
            "table-actions";


        // EDITAR

        const btnEditar =
            document.createElement("button");


        btnEditar.type =
            "button";


        btnEditar.className =
            "action-btn";


        btnEditar.textContent =
            "Editar";


        btnEditar.addEventListener(
            "click",
            () =>
                abrirModalEditarCliente(
                    cliente.id
                )
        );


        // ELIMINAR

        const btnEliminar =
            document.createElement("button");


        btnEliminar.type =
            "button";


        btnEliminar.className =
            "action-btn delete";


        btnEliminar.textContent =
            "Eliminar";


        btnEliminar.addEventListener(
            "click",
            () =>
                abrirModalEliminar(
                    cliente.id
                )
        );


        acciones.appendChild(
            btnEditar
        );


        acciones.appendChild(
            btnEliminar
        );


        celdaAcciones.appendChild(
            acciones
        );


        // ------------------------------------------
        // ARMAR FILA
        // ------------------------------------------

        fila.appendChild(
            celdaId
        );

        fila.appendChild(
            celdaEstado
        );

        fila.appendChild(
            celdaVencimiento
        );

        fila.appendChild(
            celdaSituacion
        );

        fila.appendChild(
            celdaAcciones
        );


        tabla.appendChild(
            fila
        );

    });

}


// ==================================================
// SITUACIÓN
// ==================================================

function obtenerSituacion(
    cliente
) {

    if (
        cliente.estado !== "ACTIVA"
    ) {

        return {

            texto:
                "Suspendida",

            clase:
                "expired"

        };

    }


    if (
        estaVencido(
            cliente.vencimiento
        )
    ) {

        return {

            texto:
                "Vencida",

            clase:
                "expired"

        };

    }


    return {

        texto:
            "Vigente",

        clase:
            "valid"

    };

}


// ==================================================
// FECHA VENCIDA
// ==================================================

function estaVencido(
    fecha
) {

    if (!fecha) {
        return false;
    }


    const fechaVencimiento =
        convertirFecha(
            fecha
        );


    if (!fechaVencimiento) {
        return false;
    }


    const hoy =
        new Date();


    hoy.setHours(
        0,
        0,
        0,
        0
    );


    return (
        fechaVencimiento < hoy
    );

}


// ==================================================
// CONVERTIR FECHA
// ==================================================

function convertirFecha(
    fecha
) {

    const partes =
        fecha.split("-");


    if (
        partes.length !== 3
    ) {

        return null;

    }


    const anio =
        parseInt(
            partes[0],
            10
        );


    const mes =
        parseInt(
            partes[1],
            10
        );


    const dia =
        parseInt(
            partes[2],
            10
        );


    if (
        isNaN(anio)
        ||
        isNaN(mes)
        ||
        isNaN(dia)
    ) {

        return null;

    }


    const resultado =
        new Date(
            anio,
            mes - 1,
            dia
        );


    resultado.setHours(
        0,
        0,
        0,
        0
    );


    return resultado;

}


// ==================================================
// FORMATEAR FECHA
// ==================================================

function formatearFecha(
    fecha
) {

    if (!fecha) {

        return "-";

    }


    const partes =
        fecha.split("-");


    if (
        partes.length !== 3
    ) {

        return fecha;

    }


    return (
        partes[2]
        + "/"
        + partes[1]
        + "/"
        + partes[0]
    );

}


// ==================================================
// NUEVO CLIENTE
// ==================================================

function abrirModalNuevoCliente() {

    clienteEditando =
        null;


    establecerTexto(
        "modalTitulo",
        "Nuevo cliente"
    );


    const inputId =
        document.getElementById(
            "clienteId"
        );


    const estado =
        document.getElementById(
            "clienteEstado"
        );


    const vencimiento =
        document.getElementById(
            "clienteVencimiento"
        );


    if (inputId) {

        inputId.value =
            "";

        inputId.disabled =
            false;

    }


    if (estado) {

        estado.value =
            "ACTIVA";

    }


    if (vencimiento) {

        vencimiento.value =
            "";

    }


    mostrarModal(
        "modalCliente"
    );

}


// ==================================================
// EDITAR CLIENTE
// ==================================================

function abrirModalEditarCliente(
    id
) {

    const cliente =
        clientes.find(
            item =>
                item.id === id
        );


    if (!cliente) {

        mostrarToast(
            "No se encontró el cliente."
        );

        return;

    }


    clienteEditando =
        id;


    establecerTexto(
        "modalTitulo",
        "Editar cliente"
    );


    const inputId =
        document.getElementById(
            "clienteId"
        );


    const estado =
        document.getElementById(
            "clienteEstado"
        );


    const vencimiento =
        document.getElementById(
            "clienteVencimiento"
        );


    if (inputId) {

        inputId.value =
            cliente.id;

        /*
         * El ID no se modifica
         * después de crear el cliente.
         */

        inputId.disabled =
            true;

    }


    if (estado) {

        estado.value =
            cliente.estado;

    }


    if (vencimiento) {

        vencimiento.value =
            cliente.vencimiento;

    }


    mostrarModal(
        "modalCliente"
    );

}


// ==================================================
// GUARDAR CLIENTE
// ==================================================

function guardarCliente() {

    const inputId =
        document.getElementById(
            "clienteId"
        );


    const estado =
        document.getElementById(
            "clienteEstado"
        );


    const vencimiento =
        document.getElementById(
            "clienteVencimiento"
        );


    const id =
        inputId
            ? inputId.value.trim()
            : "";


    const estadoValor =
        estado
            ? estado.value
            : "";


    const vencimientoValor =
        vencimiento
            ? vencimiento.value
            : "";


    // ----------------------------------------------
    // VALIDAR ID
    // ----------------------------------------------

    if (!id) {

        mostrarToast(
            "Ingresá un ID referencial."
        );

        return;

    }


    // ----------------------------------------------
    // VALIDAR ID DUPLICADO
    // ----------------------------------------------

    const existe =
        clientes.some(
            cliente =>
                cliente.id === id
                &&
                cliente.id !== clienteEditando
        );


    if (existe) {

        mostrarToast(
            "Ese ID ya existe."
        );

        return;

    }


    // ----------------------------------------------
    // VALIDAR ESTADO
    // ----------------------------------------------

    if (
        estadoValor !== "ACTIVA"
        &&
        estadoValor !== "SUSPENDIDA"
    ) {

        mostrarToast(
            "Seleccioná un estado válido."
        );

        return;

    }


    // ----------------------------------------------
    // VALIDAR FECHA
    // ----------------------------------------------

    if (!vencimientoValor) {

        mostrarToast(
            "Ingresá una fecha de vencimiento."
        );

        return;

    }


    // ----------------------------------------------
    // ACTUALIZAR CLIENTE
    // ----------------------------------------------

    if (clienteEditando) {

        const indice =
            clientes.findIndex(
                cliente =>
                    cliente.id === clienteEditando
            );


        if (indice !== -1) {

            clientes[indice] = {

                id:
                    clienteEditando,

                estado:
                    estadoValor,

                vencimiento:
                    vencimientoValor

            };

        }


        mostrarToast(
            "Cliente modificado localmente."
        );

    }

    // ----------------------------------------------
    // NUEVO CLIENTE
    // ----------------------------------------------

    else {

        clientes.push({

            id:
                id,

            estado:
                estadoValor,

            vencimiento:
                vencimientoValor

        });


        mostrarToast(
            "Cliente creado localmente."
        );

    }


    actualizarDashboard();

    aplicarFiltros();

    cerrarModalCliente();

}


// ==================================================
// ELIMINAR
// ==================================================

function abrirModalEliminar(
    id
) {

    const cliente =
        clientes.find(
            item =>
                item.id === id
        );


    if (!cliente) {

        return;

    }


    clienteEliminar =
        id;


    establecerTexto(
        "clienteEliminarId",
        id
    );


    mostrarModal(
        "modalEliminar"
    );

}


// ==================================================
// CONFIRMAR ELIMINACIÓN
// ==================================================

function confirmarEliminar() {

    if (!clienteEliminar) {

        return;

    }


    clientes =
        clientes.filter(
            cliente =>
                cliente.id !== clienteEliminar
        );


    mostrarToast(
        "Cliente eliminado localmente."
    );


    clienteEliminar =
        null;


    actualizarDashboard();

    aplicarFiltros();

    cerrarModalEliminar();

}


// ==================================================
// MODAL CLIENTE
// ==================================================

function mostrarModal(
    id
) {

    const modal =
        document.getElementById(
            id
        );


    if (!modal) {

        return;

    }


    modal.hidden =
        false;


    document.body.style.overflow =
        "hidden";

}


// ==================================================
// CERRAR MODAL CLIENTE
// ==================================================

function cerrarModalCliente() {

    const modal =
        document.getElementById(
            "modalCliente"
        );


    if (modal) {

        modal.hidden =
            true;

    }


    document.body.style.overflow =
        "";

}


// ==================================================
// CERRAR MODAL ELIMINAR
// ==================================================

function cerrarModalEliminar() {

    const modal =
        document.getElementById(
            "modalEliminar"
        );


    if (modal) {

        modal.hidden =
            true;

    }


    clienteEliminar =
        null;


    document.body.style.overflow =
        "";

}


// ==================================================
// TOAST
// ==================================================

function mostrarToast(
    mensaje
) {

    const toast =
        document.getElementById(
            "toast"
        );


    const texto =
        document.getElementById(
            "toastMensaje"
        );


    if (!toast || !texto) {

        return;

    }


    texto.textContent =
        mensaje;


    toast.hidden =
        false;


    clearTimeout(
        mostrarToast.timeout
    );


    mostrarToast.timeout =
        setTimeout(
            () => {

                toast.hidden =
                    true;

            },
            3000
        );

}


// ==================================================
// ERROR DE CARGA
// ==================================================

function mostrarErrorCarga() {

    const tabla =
        document.getElementById(
            "tablaClientes"
        );


    if (!tabla) {

        return;

    }


    tabla.innerHTML = "";


    const fila =
        document.createElement("tr");


    fila.className =
        "empty-row";


    const celda =
        document.createElement("td");


    celda.colSpan =
        5;


    celda.textContent =
        "No se pudo cargar clientes.json.";


    fila.appendChild(
        celda
    );


    tabla.appendChild(
        fila
    );


    establecerTexto(
        "totalClientes",
        "—"
    );


    establecerTexto(
        "clientesActivos",
        "—"
    );


    establecerTexto(
        "clientesSuspendidos",
        "—"
    );


    establecerTexto(
        "clientesVencidos",
        "—"
    );

}


// ==================================================
// UTILIDAD TEXTO
// ==================================================

function establecerTexto(
    id,
    texto
) {

    const elemento =
        document.getElementById(
            id
        );


    if (elemento) {

        elemento.textContent =
            texto;

    }

}
