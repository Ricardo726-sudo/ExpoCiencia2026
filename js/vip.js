document.addEventListener("DOMContentLoaded", async () => {
    const contenedor = document.getElementById("contenedor-invitados");
    if (!contenedor) return;

    try {
        const respuesta = await fetch('../json/listavip.json');
        if (!respuesta.ok) throw new Error("No se pudo cargar la lista de invitados VIP.");
        
        const invitados = await respuesta.json();
        contenedor.innerHTML = "";

        invitados.forEach(inv => {
            const tarjeta = document.createElement("article");
            tarjeta.className = "tarjeta-invitado";

            tarjeta.innerHTML = `
                <div class="invitado-imagen">
                    <img src="${inv.imagen}" alt="Foto de ${inv.nombre}" onerror="this.onerror=null; this.src='../assets/img/portada/stands.png';">
                </div>
                <div class="invitado-info">
                    <h3>${inv.nombre}</h3>
                    <p class="rol-destacado">${inv.rol || inv.especialidad}</p>
                    <p class="descripcion">${inv.perfilProfesional}</p>
                    <div class="badge-especialidad">
                        <span>💡</span> ${inv.especialidad}
                    </div>
                </div>
            `;
            contenedor.appendChild(tarjeta);
        });

    } catch (error) {
        console.error("Error:", error);
        contenedor.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #ef4444;">No se pudieron cargar los invitados VIP en este momento.</p>`;
    }
});