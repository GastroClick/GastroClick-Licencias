"use strict";

// ==================================================
// CONFIGURACIÓN
// ==================================================

const API_URL =
    "https://gastroclick-licencias-api.adm-gastroclick.workers.dev";


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

        crearPantallaLogin();

        inicializarEventos();

        comprobarSesion();

    }
);


// ==================================================
// LOGIN
// ==================================================

function crearPantallaLogin() {

    // Evitar duplicados
    if (
        document.getElementById(
            "pantallaLogin"
        )
    ) {

        return;

    }


    const login =
        document.createElement(
            "div"
        );


    login.id =
        "pantallaLogin";


    login.innerHTML = `

        <div class="login-container">

            <div class="login-card">

                <div class="login-logo">
                    GastroClick
                </div>

                <div class="login-subtitle">
                    Administración
                </div>


                <div class="login-title">
                    Iniciar sesión
                </div>

                <div class="login-description">
                    Acceso al panel de administración
                </div>


                <form id="formLogin">

                    <div class="login-group">

                        <label for="loginUsuario">
                            Usuario
                        </label>

                        <input
                            type="text"
                            id="loginUsuario"
                            autocomplete="username"
                            placeholder="Usuario"
                            required>

                    </div>


                    <div class="login-group">

                        <label for="loginPassword">
                            Contraseña
                        </label>

                        <input
                            type="password"
                            id="loginPassword"
                            autocomplete="current-password"
                            placeholder="Contraseña"
                            required>

                    </div>


                    <div
                        id="loginError"
                        class="login-error"
                        hidden>
                    </div>


                    <button
                        type="submit"
                        id="btnLogin"
                        class="login-button">

                        Iniciar sesión

                    </button>

                </form>


                <div class="login-footer">
                    Sistema de licencias GastroClick
                </div>

            </div>

        </div>

    `;


    document.body.prepend(
        login
    );


    agregarEstilosLogin();


    document
        .getElementById(
            "formLogin"
        )
        ?.addEventListener(
            "submit",
            iniciarSesion
        );

}


// ==================================================
// ESTILOS LOGIN
// ==================================================

function agregarEstilosLogin() {

    if (
        document.getElementById(
            "gastroclickLoginStyles"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "gastroclickLoginStyles";


    style.textContent = `

        #pantallaLogin {

            position: fixed;

            inset: 0;

            z-index: 99999;

            background:
                #f5f7fb;

            display: flex;

            align-items: center;

            justify-content: center;

            padding: 20px;

        }


        .login-container {

            width: 100%;

            max-width: 420px;

        }


        .login-card {

            background: #ffffff;

            border-radius: 18px;

            padding: 40px;

            box-shadow:
                0 20px 50px
                rgba(0,0,0,.10);

            border:
                1px solid #e5e7eb;

        }


        .login-logo {

            font-size: 30px;

            font-weight: 800;

            text-align: center;

            color: #111827;

        }


        .login-subtitle {

            text-align: center;

            color: #6b7280;

            margin-top: 4px;

            font-size: 14px;

        }


        .login-title {

            margin-top: 35px;

            font-size: 24px;

            font-weight: 700;

            color: #111827;

        }


        .login-description {

            margin-top: 6px;

            margin-bottom: 28px;

            color: #6b7280;

            font-size: 14px;

        }


        .login-group {

            margin-bottom: 20px;

        }


        .login-group label {

            display: block;

            margin-bottom: 7px;

            font-size: 14px;

            font-weight: 600;

            color: #374151;

        }


        .login-group input {

            width: 100%;

            box-sizing: border-box;

            padding: 13px 14px;

            border:
                1px solid #d1d5db;

            border-radius: 9px;

            font-size: 15px;

            outline: none;

        }


        .login-group input:focus {

            border-color: #2563eb;

            box-shadow:
                0 0 0 3px
                rgba(37,99,235,.10);

        }


        .login-button {

            width: 100%;

            border: none;

            border-radius: 9px;

            padding: 14px;

            background: #111827;

            color: #ffffff;

            font-size: 15px;

            font-weight: 600;

            cursor: pointer;

        }


        .login-button:hover {

            background: #1f2937;

        }


        .login-button:disabled {

            opacity: .6;

            cursor: wait;

        }


        .login-error {

            background: #fef2f2;

            color: #b91c1c;

            border:
                1px solid #fecaca;

            padding: 11px 12px;

            border-radius: 8px;

            margin-bottom: 16px;

            font-size: 14px;

        }


        .login-footer {

            margin-top: 28px;

            text-align: center;

            color: #9ca3af;

            font-size: 12px;

        }


        #btnCerrarSesion {

            margin-left: 15px;

        }

    `;


    document.head.appendChild(
        style
    );

}


// ==================================================
// COMPROBAR SESIÓN
// ==================================================

async function comprobarSesion() {

    ocultarPanel();


    try {

        const respuesta =
            await fetch(

                API_URL +
                "/session?t=" +
                Date.now(),

                {

                    method:
                        "GET",

                    credentials:
                        "include",

                    cache:
                        "no-store"

                }

            );


        if (
            !respuesta.ok
        ) {

            mostrarLogin();

            return;

        }


        const datos =
            await respuesta.json();


        if (
            datos.autenticado
        ) {

            mostrarPanel();

            cargarClientes();

        } else {

            mostrarLogin();

        }


    } catch (
        error
    ) {

        console.error(
            "Error comprobando sesión:",
            error
        );


        mostrarLogin();

    }

}


// ==================================================
// INICIAR SESIÓN
// ==================================================

async function iniciarSesion(
    event
) {

    event.preventDefault();


    const usuario =
        document.getElementById(
            "loginUsuario"
        )?.value.trim();


    const password =
        document.getElementById(
            "loginPassword"
        )?.value;


    const boton =
        document.getElementById(
            "btnLogin"
        );


    const errorElemento =
        document.getElementById(
            "loginError"
        );


    if (
        !usuario ||
        !password
    ) {

        mostrarErrorLogin(
            "Ingresá usuario y contraseña."
        );

        return;

    }


    if (boton) {

        boton.disabled =
            true;

        boton.textContent =
            "Ingresando...";

    }


    ocultarErrorLogin();


    try {

        const respuesta =
            await fetch(

                API_URL +
                "/login",

                {

                    method:
                        "POST",

                    credentials:
                        "include",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            usuario:
                                usuario,

                            password:
                                password

                        })

                }

            );


        const datos =
            await respuesta.json();


        if (
            !respuesta.ok
        ) {

            throw new Error(

                datos.error ||
                "Usuario o contraseña incorrectos."

            );

        }


        // ==========================================
        // LOGIN CORRECTO
        // ==========================================

        document.getElementById(
            "loginUsuario"
        ).value = "";


        document.getElementById(
            "loginPassword"
        ).value = "";


        mostrarPanel();


        cargarClientes();


    } catch (
        error
    ) {

        console.error(
            "Error de login:",
            error
        );


        mostrarErrorLogin(

            error.message ||
            "No se pudo iniciar sesión."

        );

    } finally {

        if (boton) {

            boton.disabled =
                false;

            boton.textContent =
                "Iniciar sesión";

        }

    }

}


// ==================================================
// CERRAR SESIÓN
// ==================================================

async function cerrarSesion() {

    try {

        await fetch(

            API_URL +
            "/logout",

            {

                method:
                    "POST",

                credentials:
                    "include",

                headers: {

                    "Content-Type":
                        "application/json"

                }

            }

        );

    } catch (
        error
    ) {

        console.error(
            "Error cerrando sesión:",
            error
        );

    }


    clientes = [];

    clienteEditando =
        null;

    clienteEliminar =
        null;


    ocultarPanel();

    mostrarLogin();

}


// ==================================================
// MOSTRAR LOGIN
// ==================================================

function mostrarLogin() {

    const login =
        document.getElementById(
            "pantallaLogin"
        );


    if (login) {

        login.style.display =
            "flex";

    }


    const usuario =
        document.getElementById(
            "loginUsuario"
        );


    if (usuario) {

        setTimeout(
            () => usuario.focus(),
            100
        );

    }

}


// ==================================================
// OCULTAR LOGIN
// ==================================================

function ocultarLogin() {

    const login =
        document.getElementById(
            "pantallaLogin"
        );


    if (login) {

        login.style.display =
            "none";

    }

}


// ==================================================
// MOSTRAR PANEL
// ==================================================

function mostrarPanel() {

    ocultarLogin();


    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    const main =
        document.querySelector(
            ".main-content"
        );


    if (sidebar) {

        sidebar.style.display =
            "";

    }


    if (main) {

        main.style.display =
            "";

    }


    agregarBotonCerrarSesion();

}


// ==================================================
// OCULTAR PANEL
// ==================================================

function ocultarPanel() {

    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    const main =
        document.querySelector(
            ".main-content"
        );


    if (sidebar) {

        sidebar.style.display =
            "none";

    }


    if (main) {

        main.style.display =
            "none";

    }

}


// ==================================================
// BOTÓN CERRAR SESIÓN
// ==================================================

function agregarBotonCerrarSesion() {

    if (
        document.getElementById(
            "btnCerrarSesion"
        )
    ) {

        return;

    }


    const topbar =
        document.querySelector(
            ".topbar"
        );


    if (!topbar) {

        return;

    }


    const estado =
        topbar.querySelector(
            ".connection-status"
        );


    if (!estado) {

        return;

    }


    const boton =
        document.createElement(
            "button"
        );


    boton.id =
        "btnCerrarSesion";


    boton.type =
        "button";


    boton.textContent =
        "Cerrar sesión";


    boton.style.border =
        "1px solid #d1d5db";


    boton.style.background =
        "#ffffff";


    boton.style.color =
        "#374151";


    boton.style.borderRadius =
        "8px";


    boton.style.padding =
        "8px 12px";


    boton.style.cursor =
        "pointer";


    boton.addEventListener(
        "click",
        cerrarSesion
    );


    estado.appendChild(
        boton
    );

}


// ==================================================
// ERROR LOGIN
// ==================================================

function mostrarErrorLogin(
    mensaje
) {

    const elemento =
        document.getElementById(
            "loginError"
        );


    if (!elemento) {

        return;

    }


    elemento.textContent =
        mensaje;


    elemento.hidden =
        false;

}


function ocultarErrorLogin() {

    const elemento =
        document.getElementById(
            "loginError"
        );


    if (elemento) {

        elemento.hidden =
            true;

        elemento.textContent =
            "";

    }

}


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
// PETICIÓN AUTORIZADA
// ==================================================

async function peticionAutorizada(
    url,
    opciones = {}
) {

    const headers = {

        ...(opciones.headers || {}),

        "Content-Type":
            "application/json"

    };


    const respuesta =
        await fetch(

            url,

            {

                ...opciones,

                headers,

                credentials:
                    "include"

            }

        );


    // ==============================================
    // SESIÓN EXPIRADA
    // ==============================================

    if (
        respuesta.status ===
        401
    ) {

        clientes = [];

        ocultarPanel();

        mostrarLogin();

        mostrarErrorLogin(
            "La sesión expiró. Volvé a iniciar sesión."
        );


        throw new Error(
            "SESSION_EXPIRED"
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
            await peticionAutorizada(

                API_URL +
                "/clientes?t=" +
                Date.now(),

                {

                    method:
                        "GET",

                    cache:
                        "no-store"

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


    } catch (
        error
    ) {

        if (
            error.message ===
            "SESSION_EXPIRED"
        ) {

            return;

        }


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


        celda.colSpan =
            5;


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

            Number(
                partes[0]
            ),

            Number(
                partes[1]
            ) - 1,

            Number(
                partes[2]
            )

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
// GENERADOR DE ID
// ==================================================

function generarIdCliente() {

    const caracteres =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";


    function generarBloque() {

        const valores =
            new Uint32Array(4);


        crypto.getRandomValues(
            valores
        );


        let resultado = "";


        for (
            let i = 0;
            i < 4;
            i++
        ) {

            resultado +=
                caracteres[
                    valores[i] %
                    caracteres.length
                ];

        }


        return resultado;

    }


    return (

        "GC-" +
        generarBloque() +
        "-" +
        generarBloque() +
        "-" +
        generarBloque()

    );

}


// ==================================================
// GENERAR ID ÚNICO
// ==================================================

function generarIdClienteUnico() {

    let intentos = 0;


    while (
        intentos < 100
    ) {

        const nuevoId =
            generarIdCliente();


        const existe =
            clientes.some(
                cliente =>
                    cliente.id ===
                    nuevoId
            );


        if (!existe) {

            return nuevoId;

        }


        intentos++;

    }


    throw new Error(
        "No se pudo generar un ID único."
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


    let nuevoId;


    try {

        nuevoId =
            generarIdClienteUnico();

    } catch (
        error
    ) {

        console.error(
            error
        );


        mostrarToast(
            "No se pudo generar el ID del cliente."
        );


        return;

    }


    if (id) {

        id.value =
            nuevoId;


        id.disabled =
            true;


        id.readOnly =
            true;

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


    inputId.readOnly =
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
            "No se pudo generar el ID del cliente."
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
                cliente.id === id &&
                cliente.id !==
                    clienteEditando
        );


    if (
        existe &&
        !clienteEditando
    ) {

        const nuevoId =
            generarIdClienteUnico();


        const inputId =
            document.getElementById(
                "clienteId"
            );


        inputId.value =
            nuevoId;


        mostrarToast(
            "Se generó un nuevo ID automáticamente."
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


    } catch (
        error
    ) {

        if (
            error.message ===
            "SESSION_EXPIRED"
        ) {

            return;

        }


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


    } catch (
        error
    ) {

        if (
            error.message ===
            "SESSION_EXPIRED"
        ) {

            return;

        }


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
        "SESSION_EXPIRED"
    ) {

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


    celda.colSpan =
        5;


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
