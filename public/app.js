/* ============================================================
   app.js · Préstamos del laboratorio
   Actividad 7 · Primer comportamiento con JavaScript
   ============================================================ */

// ===== SECCIÓN 1 · REFERENCIAS A LA PÁGINA =====
// querySelector busca UN elemento usando un selector CSS (# = id).
const formulario = document.querySelector('#prestamo');
const mensaje = document.querySelector('#mensaje');
const lista = document.querySelector('#registros');
const total = document.querySelector('#total');

// NUEVO (A10) · Elementos del acceso del encargado.
const formularioEntrar = document.querySelector('#entrar');
const avisoAcceso = document.querySelector('#aviso-acceso');
const botonSalir = document.querySelector('#salir');
const seccionAcceso = document.querySelector('#acceso');
const seccionCaptura = document.querySelector('#captura');
const seccionLista = document.querySelector('#lista');

// Comprobación: si ves este texto en la Consola, app.js sí se cargó.
console.log('app.js cargado', formulario);

// ===== SECCIÓN 2 · DATOS EN MEMORIA (Paso 6) =====
// Arreglo vacío. Cada préstamo será un objeto con id, material, alumno y estado.
//const prestamos = [];
// A10: el arreglo es una COPIA de lo que responde el servidor (por eso let).
let prestamos = [];

// ===== SECCIÓN 3 · FUNCIONES (Pasos 5 y 7) =====
// Validación (RF02): recibe un texto YA recortado y responde true o false.
function textoValido(texto) {
  return texto.length >= 2 && texto.length <= 60;
}

// Mensajes: escribe en <p id="mensaje"> con la clase ok (verde) o error (rojo).
//function avisar(texto, tipo) {
// mensaje.textContent = texto;
//mensaje.className = tipo;
// A10: destino permite escribir también en el aviso del acceso.
function avisar(texto, tipo, destino = mensaje) {
  destino.textContent = texto;
  destino.className = tipo;
}

// Renderizado: dibuja en la página lo que hay en el arreglo.
function mostrarPrestamos() {
  lista.replaceChildren();                // borra las filas anteriores

  for (const prestamo of prestamos) {     // recorre el arreglo
    const fila = document.createElement('li');
    const info = document.createElement('span');
    const estado = document.createElement('span');

    info.textContent = `${prestamo.id}. ${prestamo.material} · ${prestamo.alumno}`;
    estado.textContent = prestamo.estado;
    estado.className = 'estado';

    fila.append(info, estado);            // los span van dentro del li
    lista.append(fila);                   // el li va dentro del ul
  }

  total.textContent = `Total de préstamos: ${prestamos.length}`;
}
// NUEVO (A10) · pedir(): envía una petición al servidor y regresa { codigo, cuerpo }.
async function pedir(metodo, ruta, datos) {
  const opciones = { method: metodo, headers: { 'Content-Type': 'application/json' } };
  if (datos !== undefined) {
    opciones.body = JSON.stringify(datos); // el objeto viaja como texto JSON
  }
  const respuesta = await fetch(ruta, opciones);
  const cuerpo = await respuesta.json(); // el texto JSON vuelve a ser objeto
  return { codigo: respuesta.status, cuerpo: cuerpo };
}

// NUEVO (A10) · cargarPrestamos(): pide la lista al servidor y la dibuja.
async function cargarPrestamos() {
  const resultado = await pedir('GET', '/api/prestamos');
  if (resultado.codigo === 401) { // la sesión ya no existe
    mostrarSesion(false);
    return;
  }
  prestamos = resultado.cuerpo.prestamos;
  mostrarPrestamos();
}
// NUEVO (A10) · mostrarSesion(): con sesión se ve la app; sin sesión, solo el acceso.
function mostrarSesion(activa) {
  seccionAcceso.hidden = activa;
  seccionCaptura.hidden = !activa;
  seccionLista.hidden = !activa;
  botonSalir.hidden = !activa;
}

// ===== SECCIÓN 4 · EVENTO SUBMIT (Pasos 3 a 8) =====
// Se ejecuta al pulsar «Guardar préstamo» o al presionar Enter en un campo.
//formulario.addEventListener('submit', (evento) => {
formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();                // NO recargar la página

  // --- 4.1 LEER los campos (Paso 4) ---
  const datos = new FormData(formulario);
  const material = String(datos.get('material')).trim();
  const alumno = String(datos.get('alumno')).trim();

  // --- 4.2 VALIDAR (Paso 5) ---
  if (!textoValido(material) || !textoValido(alumno)) {
    avisar('Escribe material y alumno con 2 a 60 caracteres, sin contar los espacios.', 'error');
    return;                               // DETIENE la función: no se guarda nada
  }

  // --- 4.3 GUARDAR en el arreglo (Paso 6) ---
  // prestamos.push({
  //id: prestamos.length + 1,
  //material: material,
  //alumno: alumno,
  //estado: 'pendiente'                   // todo préstamo nace pendiente
  // });
  // --- 4.3 GUARDAR en el SERVIDOR (A10) ---
  const resultado = await pedir('POST', '/api/prestamos', { material: material, alumno: alumno });
  if (resultado.codigo === 401) {
    mostrarSesion(false);
    avisar('Tu sesión terminó. Vuelve a entrar.', 'error', avisoAcceso);
    return;
  }
  if (resultado.codigo !== 201) {
    avisar(resultado.cuerpo.error, 'error'); // mensaje que escribió el servidor (400)
    return;
  }

  // --- 4.4 MOSTRAR la lista (Paso 7) ---
  //mostrarPrestamos();
  // --- 4.4 MOSTRAR la lista (A10: se vuelve a pedir al servidor) ---
  await cargarPrestamos();

  // --- 4.5 LIMPIAR y avisar (Paso 8) ---
  formulario.reset();                     // limpia los campos
  formulario.elements.material.focus();   // el cursor regresa a Material
  avisar(`Préstamo guardado: ${material} para ${alumno}.`, 'ok');
});
// ===== SECCIÓN 4-A · ACCESO DEL ENCARGADO (A10) =====
// Entrar: envía la clave; si el servidor responde 200, se muestra la aplicación.
formularioEntrar.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const clave = new FormData(formularioEntrar).get('clave');
  const resultado = await pedir('POST', '/api/entrar', { clave: clave });
  formularioEntrar.reset(); // la clave no se queda escrita

  if (resultado.codigo !== 200) {
    avisar(resultado.cuerpo.error, 'error', avisoAcceso); // 401 · Clave incorrecta
    return;
  }
  avisar('', '', avisoAcceso);
  mostrarSesion(true);
  await cargarPrestamos();
});

// Salir: el servidor borra la sesión y la página vuelve al acceso.
botonSalir.addEventListener('click', async () => {
  await pedir('POST', '/api/salir');
  prestamos = [];
  mostrarPrestamos();
  avisar('Sesión cerrada.', 'ok', avisoAcceso);
  mostrarSesion(false);
});

// ===== SECCIÓN 5 · INICIO (Paso 7) =====
// Al abrir la página se dibuja la lista una vez (Total de préstamos: 0).
//mostrarPrestamos();
// A10: al abrir la página se pide la lista al servidor.
//cargarPrestamos();
// A10: al abrir la página se pregunta al servidor si ya hay sesión.
async function iniciar() {
  const resultado = await pedir('GET', '/api/sesion');
  mostrarSesion(resultado.cuerpo.activa);
  if (resultado.cuerpo.activa) {
    await cargarPrestamos();
  }
}

iniciar();
