// Variables globales para paginación y datos
let proyectosStands = [];
let paginaActual = 1;
const proyectosPorPagina = 6;

// ==================== 1. CONEXIÓN AL JSON ====================
async function cargarDatosDesdeJSON() {
    try {
        const respuesta = await fetch('../json/listaStands.json'); 
        if (!respuesta.ok) throw new Error("Error al leer el archivo JSON");
        
        proyectosStands = await respuesta.json();
        aplicarFiltros(); 
    } catch (error) {
        console.error("Hubo un problema:", error);
        document.getElementById("contenedor-stands").innerHTML = 
            `<p style="grid-column: 1/-1; text-align: center; color: #ef4444; padding: 40px;">
                No se pudieron cargar los proyectos. Intenta recargar la página.
             </p>`;
    }
}

// ==================== 2. RENDERIZADO DE LAS TARJETAS CON PAGINACIÓN ====================
function cargarStands(lista) {
    const contenedor = document.getElementById("contenedor-stands");
    const contenedorPaginacion = document.getElementById("paginacion-cont");
    if (!contenedor) return;

    contenedor.innerHTML = "";
    if (contenedorPaginacion) contenedorPaginacion.innerHTML = "";

    if (lista.length === 0) {
        contenedor.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 40px;">No se encontraron proyectos con los filtros seleccionados.</p>`;
        return;
    }

    const totalPaginas = Math.ceil(lista.length / proyectosPorPagina);
    if (paginaActual > totalPaginas) paginaActual = 1;

    const inicio = (paginaActual - 1) * proyectosPorPagina;
    const fin = inicio + proyectosPorPagina;
    const proyectosPaginaActual = lista.slice(inicio, fin);

    proyectosPaginaActual.forEach(stand => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-stand";

        tarjeta.innerHTML = `
            <div class="stand-imagen">
                <img 
                    src="${stand.imagen}" 
                    alt="${stand.titulo}" 
                    onerror="this.onerror=null; this.src='../assets/img/portada/stands.png';"
                >
            </div>
            <div class="stand-cuerpo">
                <h3>${stand.titulo}</h3>
                <span class="badge-categoria">${stand.categoriaNombre}</span>
                <p>${stand.descripcion}</p>
                <div class="stand-acciones">
                    <button class="boton boton-principal btn-stand" onclick="verProyecto(${stand.id})">Ver proyecto</button>
                    <button class="boton boton-secundario btn-qr" onclick="verQR(${stand.id})">Ver QR</button>
                </div>
            </div>
        `;
        contenedor.appendChild(tarjeta);
    });

    if (totalPaginas > 1 && contenedorPaginacion) {
        contenedorPaginacion.innerHTML = `
            <button class="btn-paginacion" onclick="cambiarPagina(${paginaActual - 1})" ${paginaActual === 1 ? 'disabled' : ''}>
                &larr; Anterior
            </button>
            <span class="info-paginacion">Página ${paginaActual} de ${totalPaginas}</span>
            <button class="btn-paginacion" onclick="cambiarPagina(${paginaActual + 1})" ${paginaActual === totalPaginas ? 'disabled' : ''}>
                Siguiente &rarr;
            </button>
        `;
    }
}

function cambiarPagina(nuevaPagina) {
    paginaActual = nuevaPagina;
    aplicarFiltros(false);
    window.scrollTo({ top: 400, behavior: 'smooth' });
}

function normalizar(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// ==================== 3. FILTRADO ====================
function aplicarFiltros(resetearPagina = true) {
    if (resetearPagina) {
        paginaActual = 1; // Solo se reinicia a 1 cuando el usuario busca o filtra manualmente
    }
    
    const textoIngresado = normalizar(document.getElementById("input-buscar")?.value || "");
    const categoria = document.getElementById("select-categoria")?.value || "todas";
    const area = document.getElementById("select-area")?.value || "todas";
    const orden = document.getElementById("select-orden")?.value || "recientes";

    let resultados = proyectosStands.filter(stand => {
        const tituloNormalizado = normalizar(stand.titulo || "");
        const descripcionNormalizada = normalizar(stand.descripcion || "");

        const coincideTexto = tituloNormalizado.includes(textoIngresado) || 
                              descripcionNormalizada.includes(textoIngresado);
                              
        const coincideCategoria = categoria === "todas" || stand.categoria === categoria;
        const coincideArea = area === "todas" || stand.area === area;

        return coincideTexto && coincideCategoria && coincideArea;
    });

    if (orden === "az") {
        resultados.sort((a, b) => a.titulo.localeCompare(b.titulo));
    } else if (orden === "antiguos") {
        resultados.sort((a, b) => a.id - b.id);
    } else if (orden === "recientes") {
        resultados.sort((a, b) => b.id - a.id);
    }

    cargarStands(resultados);
}
// ==================== 4. MODALES ====================
function verProyecto(id) {
    const proyecto = proyectosStands.find(stand => stand.id === id);
    if (!proyecto) return;

    const modalDatos = document.getElementById("modal-datos");
    const areaTexto = proyecto.area ? proyecto.area.replace(/-/g, ' ').toUpperCase() : "ÁREA NO ESPECIFICADA";

    const objGen = proyecto.objetivoGeneral || "Objetivo general no especificado.";
    const objEsp = proyecto.objetivosEspecificos ? proyecto.objetivosEspecificos.map(o => `<li><span class="icono-lista">🟡</span> ${o}</li>`).join('') : "<li>Sin objetivos específicos.</li>";
    const des = proyecto.desarrollo || proyecto.descripcion;
    const res = proyecto.resultados || "Resultados pendientes o en proceso.";
    const integrantes = proyecto.integrantes ? proyecto.integrantes.map(i => `<div class="integrante-caja">👤 ${i}</div>`).join('') : `<div class="integrante-caja">👤 Sin asignar</div>`;
    
    // Validamos si existen anexos para renderizar la sección de forma condicional
    const tieneAnexos = proyecto.anexos && proyecto.anexos.length > 0;
    const seccionAnexos = tieneAnexos ? `
        <h3 class="titulo-seccion" style="margin-top:20px;">🖼️ ANEXOS (GALERÍA)</h3>
        <div class="lista-anexos">
            ${proyecto.anexos.map(a => `
                <div class="anexo-caja">
                    <img src="${a.img}" alt="${a.titulo || 'Vista del proyecto'}" onerror="this.onerror=null; this.src='../assets/img/portada/stands.png';">
                    <div class="anexo-titulo">${a.titulo || 'Vista del proyecto'}</div>
                </div>
            `).join('')}
        </div>
    ` : '';

    const problema = proyecto.problema || "Problema no especificado.";
    const ubicacion = proyecto.ubicacion || "Ubicación por confirmar.";
    
    const botonRepo = proyecto.enlaceRepo 
        ? `<a href="${proyecto.enlaceRepo}" target="_blank" style="background-color: #0b2345; color: #ffffff; padding: 12px; border-radius: 8px; text-align: center; display: block; text-decoration: none; font-weight: bold; margin-bottom: 20px; border: 2px solid #0b2345;">💻 Ver Repositorio</a>` 
        : "";
 
    modalDatos.innerHTML = `
        <div class="modal-cabecera">
            <span class="badge-area-amarillo">${areaTexto}</span>
            <h2 class="modal-titulo-principal">${proyecto.titulo}</h2>
        </div>

        <div class="modal-cuerpo-grid">
            <div class="col-izq">
                <h3 class="titulo-seccion">🎯 CONTEXTO Y OBJETIVOS</h3>
                <div class="caja-azul" style="margin-bottom: 15px;">
                    <strong>Problema Abordado</strong>
                    <p>${problema}</p>
                </div>
                <div class="caja-azul">
                    <strong>Objetivo General</strong>
                    <p>${objGen}</p>
                </div>
                <div class="objetivos-especificos">
                    <strong>Objetivos Específicos</strong>
                    <ul>${objEsp}</ul>
                </div>
                <h3 class="titulo-seccion">⚙️ DESARROLLO Y METODOLOGÍA</h3>
                <p class="texto-normal">${des}</p>
                <h3 class="titulo-seccion">📊 RESULTADOS</h3>
                <div class="caja-verde">
                    <p>${res}</p>
                </div>
            </div>
            
            <div class="col-der">
                <h3 class="titulo-seccion">📍 UBICACIÓN</h3>
                <p style="font-weight: bold; color: #0b2345; background-color: #f1f5f9; padding: 10px; border-radius: 6px;">${ubicacion}</p>
                <h3 class="titulo-seccion" style="margin-top:20px;">👥 INTEGRANTES</h3>
                <div class="lista-integrantes">${integrantes}</div>
                ${botonRepo}
                ${seccionAnexos}
            </div>
        </div>
    `;

    document.getElementById("modal-proyecto").classList.add("activo");
}

function cerrarModal() {
    document.getElementById("modal-proyecto").classList.remove("activo");
}

window.addEventListener("click", function(event) {
    const modal = document.getElementById("modal-proyecto");
    if (event.target === modal) cerrarModal();
});

function verQR(id) {
   const proyecto = proyectosStands.find(stand => stand.id === id);
    if (!proyecto) return;

    const modalDatosQR = document.getElementById("modal-datos-qr");
    const urlBase = window.location.href.split('?')[0];
    const urlProyectoUnica = `${urlBase}?id=${proyecto.id}`;
    const textoQR = encodeURIComponent(urlProyectoUnica);
    const urlQR = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${textoQR}&color=0b2345`;
    
    modalDatosQR.innerHTML = `
        <h3 class="qr-titulo">Código QR del Proyecto</h3>
        <p class="qr-subtitulo">${proyecto.titulo}</p>
        <div class="qr-caja-imagen">
            <img src="${urlQR}" alt="QR de ${proyecto.titulo}">
        </div>
        <span class="badge-area-amarillo" style="margin-top: 15px;">Stand N° ${proyecto.id}</span>
    `;
    document.getElementById("modal-qr").classList.add("activo");
}

function cerrarModalQR() {
    document.getElementById("modal-qr").classList.remove("activo");
}

window.addEventListener("click", function(event) {
    const modalQR = document.getElementById("modal-qr");
    if (event.target === modalQR) cerrarModalQR();
});

// ==================== 5. EVENTOS INICIALES ====================
document.addEventListener("DOMContentLoaded", () => {
    cargarDatosDesdeJSON();

    document.getElementById("input-buscar")?.addEventListener("input", aplicarFiltros);
    document.getElementById("select-categoria")?.addEventListener("change", aplicarFiltros);
    document.getElementById("select-area")?.addEventListener("change", aplicarFiltros);
    document.getElementById("select-orden")?.addEventListener("change", aplicarFiltros);
});
// ==================== 6. AUTO-ABRIR MODAL DESDE QR ====================
window.addEventListener("DOMContentLoaded", () => {
    
    const urlParams = new URLSearchParams(window.location.search);
    const idProyectoQR = urlParams.get('id');

    if (idProyectoQR) {
        
        const verificarDatos = setInterval(() => {
            if (proyectosStands.length > 0) {
                clearInterval(verificarDatos);
                verProyecto(parseInt(idProyectoQR));
            }
        }, 100);
    }
});