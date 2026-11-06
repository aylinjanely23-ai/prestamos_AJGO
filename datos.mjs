/* ============================================================
 datos.mjs · Préstamos del laboratorio
 Actividad 10 · Guarda los préstamos EN MEMORIA (temporal).
 En la Actividad 11 este archivo se cambia por SQLite.
 ============================================================ */

// ===== SECCIÓN 1 · DATOS EN MEMORIA =====
// Mientras Node esté encendido, aquí viven los préstamos.
// Si detienes el servidor (Ctrl + C), el arreglo se pierde.
const prestamos = [];
let siguienteId = 1;

// ===== SECCIÓN 2 · FUNCIONES QUE USA api.mjs =====
// export: permite que OTRO archivo importe estas funciones.
export function listarPrestamos() {
  return prestamos;
}

export function agregarPrestamo(material, alumno) {
  const prestamo = { id: siguienteId, material: material, alumno: alumno, estado: 'pendiente' };
  siguienteId++;
  prestamos.push(prestamo);
  return prestamo;
}

