// Array para almacenar los productos en el carrito
let carrito = [];

// Cargar el carrito desde localStorage al iniciar
function cargarCarrito() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
    }
    actualizarCarrito(); // Actualizar la vista del carrito si existe
}

// Guardar el carrito en localStorage
function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Función para agregar productos al carrito
function agregarAlCarrito(producto) {
    const item = carrito.find(item => item.id === producto.id);
    if (item) {
        item.cantidad += 1;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }
    const user = auth.currentUser;
    if (user) {
        guardarCarrito(user.uid);
    }
    actualizarCarrito();
}

// Función para eliminar productos del carrito
function eliminarDelCarrito(productoId) {
    carrito = carrito.filter(item => item.id !== productoId);
    guardarCarrito(); // Guardar el carrito en localStorage
    actualizarCarrito(); // Actualizar la vista del carrito
}

// Función para actualizar la vista del carrito
function actualizarCarrito() {
    const carritoGrid = document.getElementById('carrito-grid');
    if (carritoGrid) {
        carritoGrid.innerHTML = '';
        carrito.forEach(producto => {
            const productoHTML = `
                <div class="producto-carrito">
                    <img src="${producto.imagen}" alt="${producto.nombre}">
                    <h3>${producto.nombre}</h3>
                    <p>${producto.descripcion}</p>
                    <p>Precio: $${producto.precio} (${producto.cantidad}x)</p>
                    <button class="btn-eliminar" onclick="eliminarDelCarrito(${producto.id})">Eliminar</button>
                </div>
            `;
            carritoGrid.innerHTML += productoHTML;
        });
    }
}

// Función para finalizar la compra
function finalizarCompra() {
    if (carrito.length === 0) {
        alert('Tu carrito está vacío. Añade productos antes de finalizar la compra.');
        return;
    }
    const mensaje = `Hola, estoy interesado en los siguientes productos:\n${carrito.map(p => `- ${p.cantidad}x ${p.nombre} - $${p.precio * p.cantidad}`).join('\n')}`;
    const urlWhatsApp = `https://wa.me/TU_NUMERO_DE_WHATSAPP?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, '_blank');
}

// Función para cargar detalles del producto
function cargarDetallesProducto(producto) {
    const nombreProducto = document.getElementById('nombre-producto');
    const descripcionProducto = document.getElementById('descripcion-producto');
    const precioProducto = document.getElementById('precio-producto');
    const btnAgregarCarrito = document.getElementById('btn-agregar-carrito');

    if (nombreProducto && descripcionProducto && precioProducto && btnAgregarCarrito) {
        nombreProducto.textContent = producto.nombre;
        descripcionProducto.textContent = producto.descripcion;
        precioProducto.textContent = producto.precio;

        // Configurar el botón para agregar al carrito
        btnAgregarCarrito.onclick = () => agregarAlCarrito(producto);
    }
}

// Cargar productos desde el archivo JSON
fetch('productos.json')
    .then(response => response.json())
    .then(data => {
        const productosGrid = document.getElementById('productos-grid');
        const cuadrosGrid = document.getElementById('cuadros-grid');
        const mueblesGrid = document.getElementById('muebles-grid');

        data.forEach(producto => {
            const productoHTML = `
                <div class="producto">
                    <a href="detalles.html?id=${producto.id}">
                        <img src="${producto.imagen}" alt="${producto.nombre}">
                        <h3>${producto.nombre}</h3>
                    </a>
                    <p>${producto.descripcion}</p>
                    <p>Precio: $${producto.precio}</p>
                    <button class="btn" onclick="agregarAlCarrito(${JSON.stringify(producto)})">Añadir al carrito</button>
                </div>
            `;

            // Mostrar en la página de productos
            if (productosGrid) {
                productosGrid.innerHTML += productoHTML;
            }

            // Mostrar en la página de cuadros
            if (cuadrosGrid && producto.categoria === 'cuadro') {
                cuadrosGrid.innerHTML += productoHTML;
            }

            // Mostrar en la página de muebles
            if (mueblesGrid && producto.categoria === 'mueble') {
                mueblesGrid.innerHTML += productoHTML;
            }
        });

        // Cargar detalles del producto si estamos en la página de detalles
        const urlParams = new URLSearchParams(window.location.search);
        const productoId = urlParams.get('id');
        if (productoId) {
            const producto = data.find(p => p.id == productoId);
            if (producto) {
                cargarDetallesProducto(producto);
            }
        }
    })
    .catch(error => console.error('Error al cargar los productos:', error));

// Evento para el botón de WhatsApp en la página del carrito
document.getElementById('whatsappButton')?.addEventListener('click', finalizarCompra);

// Cargar el carrito al iniciar la página
cargarCarrito();













// Configuración de Firebase
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_AUTH_DOMAIN",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_STORAGE_BUCKET",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID"
};

// Inicializar Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore(); // Para Firestore (base de datos)








// Iniciar sesión con Google
document.getElementById('googleLogin')?.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            console.log("Usuario autenticado:", user);
            window.location.href = "index.html"; // Redirigir a la página principal
        })
        .catch((error) => {
            console.error("Error al iniciar sesión:", error);
        });
});

// Verificar si el usuario está autenticado
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("Usuario autenticado:", user);
        // Cargar el carrito del usuario desde Firestore
        cargarCarrito(user.uid);
    } else {
        console.log("Usuario no autenticado");
        // Redirigir a la página de inicio de sesión
        window.location.href = "login.html";
    }
});



// Guardar el carrito en Firestore
function guardarCarrito(userId) {
    db.collection('carritos').doc(userId).set({
        productos: carrito
    })
    .then(() => {
        console.log("Carrito guardado en Firestore");
    })
    .catch((error) => {
        console.error("Error al guardar el carrito:", error);
    });
}

// Cargar el carrito desde Firestore
function cargarCarrito(userId) {
    db.collection('carritos').doc(userId).get()
        .then((doc) => {
            if (doc.exists) {
                carrito = doc.data().productos;
                actualizarCarrito();
            } else {
                console.log("No hay carrito guardado para este usuario");
            }
        })
        .catch((error) => {
            console.error("Error al cargar el carrito:", error);
        });
}