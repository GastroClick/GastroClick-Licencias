"use strict";

// ==================================================
// CONFIGURACIÓN
// ==================================================

const API_URL =
    "https://gastroclick-licencias-api.adm-gastroclick.workers.dev";

const STORAGE_KEY =
    "gastroclick_admin_key";


// ==================================================
// VARIABLES
// ==================================================

let clientes = [];

let clienteEditando = null;

let clienteEliminar = null;


// ==================================================
// INICIO
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        inicializarEventos();

        cargarClientes();

    }
);


// ==================================================
// EVENTOS
// ==================================================

function inicializarEventos() {

    document
        .getElementById("btnNuevoCliente")
        ?.addEventListener(
            "click",
            abrirModalNuevoCliente
        );


    document
        .getElementById("btnCerrarModal")
        ?.addEventListener(
            "click",
            cerrarModalCliente
        );


    document
        .getElementById("btnCancelar")
        ?.addEventListener(
            "click",
            cerrarModalCliente
        );


    document
        .getElementById("btnGuardarCliente")
        ?.addEventListener(
            "click",
            guardarCliente
        );


    document
        .getElementById("buscarCliente")
        ?.addEventListener(
            "input",
            aplicarFiltros
        );


    document
        .getElementById("filtroEstado")
        ?.addEventListener(
            "change",
            aplicarFiltros
        );


    document
        .getElementById("btnCerrarEliminar")
        ?.addEventListener(
            "click",
            cerrarModalEliminar
        );


    document
        .getElementById("btnCancelarEliminar")
        ?.addEventListener(
            "click",
            cerrarModalEliminar
        );


    document
        .getElementById("btnConfirmarEliminar")
        ?.addEventListener(
            "click",
            confirmarEliminar
        );


    document
        .getElementById("modalCliente")
        ?.addEventListener(
            "click",
            event => {

                if (
                    event.target.id ===
                    "modalCliente"
                ) {

                    cerrarModalCliente();

                }

            }
        );


    document
        .getElementById("modalEliminar")
        ?.addEventListener(
            "click",
            event => {

                if (
                    event.target.id ===
                    "modalEliminar"
                ) {

                    cerrarModalEliminar();

                }

            }
        );

}


// ==================================================
// OBTENER ADMIN KEY
// ==================================================

function obtenerAdminKey() {

    let key =
        sessionStorage.getItem(
            STORAGE_KEY
        );


    if (key) {

        return key;

    }


    key =
        window.prompt(
            "Ingrese la clave de administración:"
        );


    if (
        !key ||
        !key.trim()
    ) {

        return null;

    }


    key =
        key.trim();


    sessionStorage.setItem(
        STORAGE_KEY,
        key
    );


    return key;

}


// ==================================================
// PETICIÓN AUTORIZADA
// ==================================================

async function peticionAutorizada(
    url,
    opciones = {}
) {

    const adminKey =
        obtenerAdminKey();


    if (!adminKey) {

        throw new Error(
            "ADMIN_KEY_REQUIRED"
        );

    }


    const headers = {

        ...(opciones.headers || {}),

        "Authorization":
            "Bearer " + adminKey,

        "Content-Type":
            "application/json"

    };


    const respuesta =
        await fetch(
            url,
            {
                ...opciones,
                headers
            }
        );


    if (
        respuesta.status === 401
    ) {

        sessionStorage.removeItem(
            STORAGE_KEY
        );


        throw new Error(
            "ADMIN_KEY_INVALID"
        );

    }


    return respuesta;

}


// ==================================================
// CARGAR CLIENTES
// ==================================================

async function cargarClientes() {

    try {

        const respuesta =
            await fetch(
                API_URL +
                "/clientes?t=" +
                Date.now(),
                {
                    cache: "no-store"
                }
            );


        if (!respuesta.ok) {

            throw new Error(
                "HTTP " +
                respuesta.status
            );

        }


        const datos =
            await respuesta.json();


        if (
            !datos ||
            !Array.isArray(
                datos.clientes
            )
        ) {

            throw new Error(
                "Respuesta inválida."
            );

        }


        clientes =
            datos.clientes.map(
                cliente => ({

                    id:
                        String(
                            cliente.id || ""
                        ).trim(),

                    estado:
                        String(
                            cliente.estado || ""
                        )
                        .trim()
                        .toUpperCase(),

                    vencimiento:
                        String(
                            cliente.vencimiento || ""
                        ).trim()

                })
            );


        actualizarDashboard();

        aplicarFiltros();


        establecerConexion(
            true
        );


    } catch (error) {

        console.error(
            "Error:",
            error
        );


        establecerConexion(
            false
        );


        mostrarErrorCarga();

    }

}


// ==================================================
// INDICADOR CONEXIÓN
// ==================================================

function establecerConexion(
    conectado
) {

    const elemento =
        document.querySelector(
            ".connection-status"
        );


    if (!elemento) {

        return;

    }


    const punto =
        elemento.querySelector(
            ".status-dot"
        );


    const texto =
        elemento.querySelector(
            "span:last-child"
        );


    if (conectado) {

        if (punto) {

            punto.style.background =
                "#16a34a";

        }

        if (texto) {

            texto.textContent =
                "Conectado";

        }

    } else {

        if (punto) {

            punto.style.background =
                "#dc2626";

        }

        if (texto) {

            texto.textContent =
                "Sin conexión";

        }

    }

}


// ==================================================
// DASHBOARD
// ==================================================

function actualizarDashboard() {

    const activos =
        clientes.filter(
            cliente =>
                cliente.estado ===
                "ACTIVA"
        ).length;


    const suspendidos =
        clientes.filter(
            cliente =>
                cliente.estado ===
                "SUSPENDIDA"
        ).length;


    const vencidos =
        clientes.filter(
            cliente =>
                estaVencido(
                    cliente.vencimiento
                )
        ).length;


    establecerTexto(
        "totalClientes",
        clientes.length
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

    const texto =
        (
            document.getElementById(
                "buscarCliente"
            )?.value || ""
        )
        .trim()
        .toLowerCase();


    const estado =
        document.getElementById(
            "filtroEstado"
        )?.value ||
        "TODOS";


    const filtrados =
        clientes.filter(
            cliente => {

                const coincideTexto =
                    cliente.id
                        .toLowerCase()
                        .includes(
                            texto
                        );


                const coincideEstado =
                    estado === "TODOS"
                    ||
                    cliente.estado ===
                    estado;


                return (
                    coincideTexto &&
                    coincideEstado
                );

            }
        );


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


    if (
        lista.length === 0
    ) {

        const fila =
            document.createElement(
                "tr"
            );

        fila.className =
            "empty-row";


        const celda =
            document.createElement(
                "td"
            );

        celda.colSpan = 5;

        celda.textContent =
            "No se encontraron clientes.";


        fila.appendChild(
            celda
        );

        tabla.appendChild(
            fila
        );

        return;

    }


    lista.forEach(
        cliente => {

            const fila =
                document.createElement(
                    "tr"
                );


            // ID

            const celdaId =
                document.createElement(
                    "td"
                );

            celdaId.className =
                "client-id";

            celdaId.textContent =
                cliente.id;


            // ESTADO

            const celdaEstado =
                document.createElement(
                    "td"
                );


            const badge =
                document.createElement(
                    "span"
                );


            badge.className =
                "badge " +
                (
                    cliente.estado ===
                    "ACTIVA"
                        ? "active"
                        : "suspended"
                );


            badge.textContent =
                cliente.estado;


            celdaEstado.appendChild(
                badge
            );


            // VENCIMIENTO

            const celdaVencimiento =
                document.createElement(
                    "td"
                );


            celdaVencimiento.textContent =
                formatearFecha(
                    cliente.vencimiento
                );


            // SITUACIÓN

            const celdaSituacion =
                document.createElement(
                    "td"
                );


            const situacion =
                obtenerSituacion(
                    cliente
                );


            const situacionSpan =
                document.createElement(
                    "span"
                );


            situacionSpan.className =
                "situation " +
                situacion.clase;


            situacionSpan.textContent =
                situacion.texto;


            celdaSituacion.appendChild(
                situacionSpan
            );


            // ACCIONES

            const celdaAcciones =
                document.createElement(
                    "td"
                );


            const acciones =
                document.createElement(
                    "div"
                );


            acciones.className =
                "table-actions";


            const btnEditar =
                document.createElement(
                    "button"
                );


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


            const btnEliminar =
                document.createElement(
                    "button"
                );


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

        }
    );

}


// ==================================================
// SITUACIÓN
// ==================================================

function obtenerSituacion(
    cliente
) {

    if (
        cliente.estado !==
        "ACTIVA"
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
        fechaVencimiento <
        hoy
    );

}


// ==================================================
// FECHA
// ==================================================

function convertirFecha(
    fecha
) {

    if (!fecha) {

        return null;

    }


    const partes =
        fecha.split("-");


    if (
        partes.length !== 3
    ) {

        return null;

    }


    const resultado =
        new Date(
            Number(partes[0]),
            Number(partes[1]) - 1,
            Number(partes[2])
        );


    resultado.setHours(
        0,
        0,
        0,
        0
    );


    return resultado;

}


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
        partes[2] +
        "/" +
        partes[1] +
        "/" +
        partes[0]
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


    const id =
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


    if (id) {

        id.value = "";

        id.disabled =
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
            "Cliente no encontrado."
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


    inputId.value =
        cliente.id;

    inputId.disabled =
        true;


    estado.value =
        cliente.estado;


    vencimiento.value =
        cliente.vencimiento;


    mostrarModal(
        "modalCliente"
    );

}


// ==================================================
// GUARDAR
// ==================================================

async function guardarCliente() {

    const id =
        document.getElementById(
            "clienteId"
        )?.value.trim();


    const estado =
        document.getElementById(
            "clienteEstado"
        )?.value;


    const vencimiento =
        document.getElementById(
            "clienteVencimiento"
        )?.value;


    if (!id) {

        mostrarToast(
            "Ingresá un ID referencial."
        );

        return;

    }


    if (!vencimiento) {

        mostrarToast(
            "Ingresá una fecha de vencimiento."
        );

        return;

    }


    const existe =
        clientes.some(
            cliente =>
                cliente.id === id
                &&
                cliente.id !==
                clienteEditando
        );


    if (
        existe &&
        !clienteEditando
    ) {

        mostrarToast(
            "Ese ID ya existe."
        );

        return;

    }


    const boton =
        document.getElementById(
            "btnGuardarCliente"
        );


    boton.disabled =
        true;


    boton.textContent =
        "Guardando...";


    try {

        let respuesta;


        // ==========================================
        // MODIFICAR
        // ==========================================

        if (clienteEditando) {

            respuesta =
                await peticionAutorizada(
                    API_URL +
                    "/clientes/" +
                    encodeURIComponent(
                        clienteEditando
                    ),
                    {

                        method:
                            "PUT",

                        body:
                            JSON.stringify({

                                estado:
                                    estado,

                                vencimiento:
                                    vencimiento

                            })

                    }
                );

        }

        // ==========================================
        // CREAR
        // ==========================================

        else {

            respuesta =
                await peticionAutorizada(
                    API_URL +
                    "/clientes",
                    {

                        method:
                            "POST",

                        body:
                            JSON.stringify({

                                id:
                                    id,

                                estado:
                                    estado,

                                vencimiento:
                                    vencimiento

                            })

                    }
                );

        }


        const datos =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                datos.error ||
                "No se pudo guardar."
            );

        }


        cerrarModalCliente();


        mostrarToast(
            datos.mensaje ||
            "Guardado correctamente."
        );


        await cargarClientes();


    } catch (error) {

        manejarError(
            error
        );


    } finally {

        boton.disabled =
            false;

        boton.textContent =
            "Guardar cliente";

    }

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

async function confirmarEliminar() {

    if (!clienteEliminar) {

        return;

    }


    const id =
        clienteEliminar;


    const boton =
        document.getElementById(
            "btnConfirmarEliminar"
        );


    boton.disabled =
        true;


    boton.textContent =
        "Eliminando...";


    try {

        const respuesta =
            await peticionAutorizada(
                API_URL +
                "/clientes/" +
                encodeURIComponent(
                    id
                ),
                {

                    method:
                        "DELETE"

                }
            );


        const datos =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                datos.error ||
                "No se pudo eliminar."
            );

        }


        cerrarModalEliminar();


        mostrarToast(
            datos.mensaje ||
            "Cliente eliminado."
        );


        await cargarClientes();


    } catch (error) {

        manejarError(
            error
        );


    } finally {

        boton.disabled =
            false;

        boton.textContent =
            "Eliminar";

    }

}


// ==================================================
// MODALES
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


function cerrarModalCliente() {

    const modal =
        document.getElementById(
            "modalCliente"
        );


    if (modal) {

        modal.hidden =
            true;

    }


    clienteEditando =
        null;


    document.body.style.overflow =
        "";

}


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
// ERRORES
// ==================================================

function manejarError(
    error
) {

    console.error(
        error
    );


    if (
        error.message ===
        "ADMIN_KEY_REQUIRED"
    ) {

        mostrarToast(
            "Operación cancelada."
        );

        return;

    }


    if (
        error.message ===
        "ADMIN_KEY_INVALID"
    ) {

        mostrarToast(
            "Clave de administración incorrecta."
        );

        return;

    }


    mostrarToast(
        error.message ||
        "Ocurrió un error."
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
        document.createElement(
            "tr"
        );


    fila.className =
        "empty-row";


    const celda =
        document.createElement(
            "td"
        );


    celda.colSpan = 5;


    celda.textContent =
        "No se pudieron cargar las licencias.";


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
            3500
        );

}


// ==================================================
// UTILIDAD
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
