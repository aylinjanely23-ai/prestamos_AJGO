/* ============================================================  datos.mjs · Préstamos del laboratorio
 Actividad 11 · Guarda los préstamos en una base de datos SQLite.
 La base vive en datos/prestamos.sqlite, FUERA de public.============================================================ */
// ===== SECCIÓN 1 · MÓDULOS =====
import { DatabaseSync } from 'node:sqlite'; // SQLite ya viene incluido en Node 24
import { mkdirSync } from 'node:fs'; // crea carpetas
import path from 'node:path'; // arma rutas de carpetas

// ===== SECCIÓN 2 · CONEXIÓN Y TABLA =====
// La carpeta datos está junto a servidor.mjs, NO dentro de public.
const CARPETA_DATOS = path.join(import.meta.dirname, 'datos');
mkdirSync(CARPETA_DATOS, { recursive: true }); // si ya existe, no pasa nada

// Abre la base (si el archivo no existe, SQLite lo crea vacío).
const db = new DatabaseSync(path.join(CARPETA_DATOS, 'prestamos.sqlite'));

// Crea la tabla UNA vez. Las restricciones protegen los datos aunque falle el código.
db.exec(`
 CREATE TABLE IF NOT EXISTS prestamos (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 material TEXT NOT NULL CHECK (length(material) BETWEEN 2 AND 60),
 alumno TEXT NOT NULL CHECK (length(alumno) BETWEEN 2 AND 60),
 estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'devuelto'))
 )
 `);
// ===== SECCIÓN 3 · CONSULTAS PREPARADAS =====
// Los signos ? son PARÁMETROS: SQLite pone ahí los datos de forma segura.
const consultaListar = db.prepare('SELECT id, material, alumno, estado FROM prestamos ORDER BY id');
const consultaInsertar = db.prepare('INSERT INTO prestamos (material, alumno) VALUES (?, ?)');
const consultaPorId = db.prepare('SELECT id, material, alumno, estado FROM prestamos WHERE id = ?');

// ===== SECCIÓN 4 · FUNCIONES QUE USA api.mjs =====
// Mismos nombres que en la Actividad 10: api.mjs no se entera del cambio.
export function listarPrestamos() {
  return consultaListar.all(); // SELECT: regresa un arreglo de objetos
}
export function agregarPrestamo(material, alumno) {
  const resultado = consultaInsertar.run(material, alumno); // INSERT
  return consultaPorId.get(resultado.lastInsertRowid); // el préstamo recién creado
}
