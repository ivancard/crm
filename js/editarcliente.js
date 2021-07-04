(function () {
    let idCliente;
    let DB;
    const formulario = document.querySelector("#formulario");

    const nombreInput = document.querySelector("#nombre");
    const emailInput = document.querySelector("#email");
    const telefonoInput = document.querySelector("#telefono");
    const empresaInput = document.querySelector("#empresa");

    document.addEventListener("DOMContentLoaded", () => {
        conectarDB();

        // Actualiza el cliente.
        formulario.addEventListener("submit", actualizarCliente);

        // Obtiene el dato de la URL
        const parametrosURL = new URLSearchParams(window.location.search);
        idCliente = parametrosURL.get("id");

        if (idCliente) {
            setTimeout(() => {
                obtenerCliente(idCliente);
            }, 100);
        }
    });

    function conectarDB() {
        // ABRIR CONEXIÓN EN LA BD:

        let abrirConexion = window.indexedDB.open("crm", 1);

        // si hay un error, lanzarlo
        abrirConexion.onerror = function () {
            console.log("Hubo un error");
        };

        // si todo esta bien, asignar a database el resultado
        abrirConexion.onsuccess = function () {
            // guardamos el resultado
            DB = abrirConexion.result;
        };
    }

    function obtenerCliente(id) {
        const transaction = DB.transaction(["crm"], "readwrite");
        const objectStore = transaction.objectStore("crm");

        var request = objectStore.openCursor();
        request.onsuccess = function (e) {
            var cursor = e.target.result;

            if (cursor) {
                if (cursor.value.id == id) {
                    llenarFormulario(cursor.value);
                }
                cursor.continue();
            } else {
                console.log("No hay mas registros");
            }
        };
    }

    // LLena el formulario.
    function llenarFormulario(datosCliente) {
        const { nombre, email, telefono, empresa } = datosCliente;

        nombreInput.value = nombre;
        emailInput.value = email;
        telefonoInput.value = telefono;
        empresaInput.value = empresa;
    }

    function actualizarCliente(e) {
        e.preventDefault();

        if (
            nombreInput.value === "" ||
            emailInput.value === "" ||
            telefonoInput.value === "" ||
            empresaInput.value === ""
        ) {
            imprimirAlerta("Todos los campos son obligatorios.", "error");
            return;
        }

        // Actualizar cliente.
        const clienteActualizado = {
            nombre: nombreInput.value,
            email: emailInput.value,
            telefono: telefonoInput.value,
            empresa: empresaInput.value,
            id: Number(idCliente),
        };

        // Actualizar en DB.
        const transaction = DB.transaction(["crm"], "readwrite");
        const objectStore = transaction.objectStore("crm");
        objectStore.put(clienteActualizado);

        transaction.oncomplete = () => {
            imprimirAlerta("Editado correctamente.");

            setTimeout(() => {
                window.location.href = "index.html";
            }, 3000);
        };

        transaction.onerror = (err) => {
            imprimirAlerta("Hubo un error", "error");
            console.log(err);
            console.log(clienteActualizado.id);
        };
    }

    function imprimirAlerta(mensaje, tipo) {
        // Crea el div

        const divMensaje = document.createElement("div");
        divMensaje.classList.add(
            "px-4",
            "py-3",
            "rounded",
            "max-w-lg",
            "mx-auto",
            "mt-6",
            "text-center"
        );

        if (tipo === "error") {
            divMensaje.classList.add(
                "bg-red-100",
                "border-red-400",
                "text-red-700"
            );
        } else {
            divMensaje.classList.add(
                "bg-green-100",
                "border-green-400",
                "text-green-700"
            );
        }

        // Mensaje de error
        divMensaje.textContent = mensaje;

        // Insertar en el DOM
        formulario.appendChild(divMensaje);

        // Quitar el alert despues de 3 segundos
        setTimeout(() => {
            divMensaje.remove();
        }, 3000);
    }
})();
