/* ============================================================
 api.mjs · Préstamos del laboratorio
 Actividad 10 · Reglas de la API: qué se puede pedir y qué datos se aceptan.
 servidor.mjs solo llama a este archivo cuando YA hay sesión.
 ============================================================ */

// ===== SECCIÓN 1 · MÓDULOS =====
// Las funciones que guardan y consultan los préstamos viven en datos.mjs.
import { listarPrestamos, agregarPrestamo } from './datos.mjs';

// ===== SECCIÓN 2 · REGLAS =====
// RF02: material y alumno con 2 a 60 caracteres, sin contar los espacios externos.
const MINIMO = 2;
const MAXIMO = 60;

// ===== SECCIÓN 3 · FUNCIONES =====
// Responde con JSON: código de estado + el objeto convertido a texto.
// Regresa el código para que servidor.mjs lo escriba en la bitácora.
export function enviarJSON(respuesta, codigo, datos) {
  respuesta.writeHead(codigo, { 'Content-Type': 'application/json; charset=utf-8' });
  respuesta.end(JSON.stringify(datos));
  return codigo;
}

// Lee el cuerpo de la petición (lo que envió fetch) y lo convierte en objeto.
// Si el texto no es JSON válido, regresa un objeto vacío.
export async function leerJSON(peticion) {
  let texto = '';
  for await (const pedazo of peticion) {
    texto += pedazo;
  }
  try {
    return JSON.parse(texto) ?? {};
  } catch {
    return {};
  }
}

// Recorta los espacios. Si el valor no es texto (número, vacío...), regresa ''.
function limpiar(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

// La MISMA regla que usa app.js, pero ahora la revisa el servidor (RNF02).
function textoValido(texto) {
  return texto.length >= MINIMO && texto.length <= MAXIMO;
}

// ===== SECCIÓN 4 · ATENDER LA API =====
// servidor.mjs llama a esta función con cada petición que empieza con /api/
export async function atenderApi(peticion, respuesta, ruta) {

  // --- 4.1 CONSULTAR: GET /api/prestamos (200) ---
  if (ruta === '/api/prestamos' && peticion.method === 'GET') {
    return enviarJSON(respuesta, 200, { prestamos: listarPrestamos() });
  }

  // --- 4.2 REGISTRAR: POST /api/prestamos ---
  if (ruta === '/api/prestamos' && peticion.method === 'POST') {
    const datos = await leerJSON(peticion);
    const material = limpiar(datos.material);
    const alumno = limpiar(datos.alumno);

    // --- 4.3 VALIDAR en el servidor (400) ---
    if (!textoValido(material) || !textoValido(alumno)) {
      return enviarJSON(respuesta, 400, {
        error: 'El servidor rechazó el préstamo: material y alumno deben tener de 2 a 60 caracteres.'
      });
    }
    // --- 4.4 GUARDAR y confirmar (201) ---
    const prestamo = agregarPrestamo(material, alumno);
    return enviarJSON(respuesta, 201, { prestamo: prestamo });
  }

  // --- 4.5 RUTA DESCONOCIDA (404) ---
  return enviarJSON(respuesta, 404, { error: 'Esa ruta de la API no existe.' });
}


