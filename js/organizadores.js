async function cargarOrganizadores() {
    try{
        const respuesta = await fetch('../json/listaOrganizadores.json?v=2');
        if (!respuesta.ok) throw new Error("Error al leer el archivo JSON de organizadores");
        const datos = await respuesta.json();
        // Renderizar ambas listas en sus respectivos contenedores
        renderizarTarjetas(datos.autoridades, "contenedor-autoridades", "texto-naranja");
        renderizarTarjetas(datos.coordinadores, "contenedor-coordinadores", "texto-naranja");
        renderizarTarjetas(datos.desarrolladores, "contenedor-desarrolladores", "texto-azul");
    }catch(error){
        console.error("Hubo un problema:", error);
        document.getElementById("contenedor-coordinadores").innerHTML = `<p style="text-align:center; color:red;">No se pudieron cargar los organizadores.</p>`;
    }
}
function renderizarTarjetas(listaPersonas, idContenedor, claseColorTexto) {
    const contenedor = document.getElementById(idContenedor);
    if (!contenedor) return;

    contenedor.innerHTML = "";

    listaPersonas.forEach(persona => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-perfil";

        const icono = claseColorTexto === "texto-naranja" ? "🎓" : "💻";

        tarjeta.innerHTML = `
            <div class="perfil-imagen-circular">
                <img 
                    src="${persona.imagen}" 
                    alt="Foto de ${persona.nombre}" 
                    onerror="this.onerror=null; this.src='../assets/img/portada/stands.png';"
                >
            </div>
            <div class="perfil-info-centrada">
                <h3>${persona.nombre}</h3>
                <span class="perfil-rol-texto ${claseColorTexto}">${persona.rol}</span>
                <span class="perfil-carrera-texto">${persona.carrera}</span>
                <p>${persona.descripcion}</p>
                <div class="icono-inferior">${icono}</div>
            </div>
        `;
        contenedor.appendChild(tarjeta);
    });
}
document.addEventListener("DOMContentLoaded", cargarOrganizadores)