(function () {
    let DB;

    const listadoClientes = document.querySelector("#listado-clientes");
    const formulario = document.querySelector("#formulario");

    document.addEventListener("DOMContentLoaded", () => {
        crearDB();

        if (window.indexedDB.open("crm", 1)) {
            obtenerClientes();
        }

        listadoClientes.addEventListener("click", eliminarRegistro);
    });

    //Crea la base de datos de IndexedDB
    function crearDB() {
        const crearDB = window.indexedDB.open("crm", 1);

        crearDB.onerror = function () {
            console.log("Hubo un error");
        };

        crearDB.onsuccess = function () {
            DB = crearDB.result;
            //console.log("DB Creada");
        };

        crearDB.onupgradeneeded = function (e) {
            const db = e.target.result;

            const objectStore = db.createObjectStore("crm", {
                keyPath: "id",
                autoIncrement: true,
            });

            objectStore.createIndex("nombre", "nombre", { unique: false });
            objectStore.createIndex("email", "email", { unique: true });
            objectStore.createIndex("telefono", "telefono", { unique: false });
            objectStore.createIndex("empresa", "empresa", { unique: false });
            objectStore.createIndex("id", "id", { unique: true });

            console.log("DB Lista y creada");
        };
    }

    function obtenerClientes() {
        let abrirConexion = window.indexedDB.open("crm", 1);

        abrirConexion.onerror = () => {
            console.log("Hubo un error");
        };

        abrirConexion.onsuccess = () => {
            DB = abrirConexion.result;

            const objectStore = DB.transaction("crm").objectStore("crm");

            objectStore.openCursor().onsuccess = function (e) {
                const cursor = e.target.result;

                if (cursor) {
                    const { nombre, empresa, email, telefono, id } =
                        cursor.value;

                    listadoClientes.innerHTML += ` 
                        <tr>
                            <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                <p class="text-sm leading-5 font-medium text-gray-700 text-lg  font-bold"> ${nombre} </p>
                                <p class="text-sm leading-10 text-gray-700"> ${email} </p>
                            </td>
                            <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200 ">
                                <p class="text-gray-700">${telefono}</p>
                            </td>
                            <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200  leading-5 text-gray-700">    
                                <p class="text-gray-600">${empresa}</p>
                            </td>
                            <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-sm leading-5">
                                <a href="editar-cliente.html?id=${id}" class="text-teal-600 hover:text-teal-900 mr-5">Editar</a>
                                <a href="#" data-cliente="${id}" class="text-red-600 hover:text-red-900 eliminar">Eliminar</a>
                            </td>
                        </tr>
                        `;

                    cursor.continue();
                } else {
                    console.log("No hay mas registros");
                }
            };
        };
    }

    function eliminarRegistro(e) {
        if (e.target.classList.contains("eliminar")) {
            const idEliminar = Number(e.target.dataset.cliente);

            const confirmar = confirm("Deseas eliminar este cliente");

            if (confirmar);
            {
                const transaction = DB.transaction(["crm"], "readwrite");
                const objectStore = transaction.objectStore("crm");

                objectStore.delete(idEliminar);

                transaction.oncomplete = () => {
                    console.log("Cliente eliminado.");

                    e.target.parentElement.parentElement.remove();
                };

                transaction.onerror = () => {
                    console.log("Error al eliminar el cliente.");
                };
            }
        }
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
