/**
 * Re-exporta datos estáticos
 * TODO: Reorganizar reactivos.js en carpetas por materia
 */

// Por ahora re-exportamos el archivo original
export { reactivos } from '../reactivos.js';

// Configuración de materias
export const MATERIAS_CONFIG = [
	{
		id: 'matematicas',
		nombre: 'Matemáticas',
		color: 'blue',
		icono: '📐',
		descripcion: 'Álgebra, Geometría, Trigonometría y Cálculo'
	},
	{
		id: 'fisica',
		nombre: 'Física',
		color: 'green',
		icono: '⚛️',
		descripcion: 'Mecánica, Termodinámica, Electricidad y Magnetismo'
	},
	{
		id: 'quimica',
		nombre: 'Química',
		color: 'red',
		icono: '🧪',
		descripcion: 'Química Orgánica, Inorgánica y Analítica'
	},
	{
		id: 'biologia',
		nombre: 'Biología',
		color: 'purple',
		icono: '🧬',
		descripcion: 'Biología Celular, Genética y Ecología'
	},
	{
		id: 'historia',
		nombre: 'Historia',
		color: 'yellow',
		icono: '📚',
		descripcion: 'Historia de México y Universal'
	},
	{
		id: 'geografia',
		nombre: 'Geografía',
		color: 'teal',
		icono: '🌍',
		descripcion: 'Geografía Física y Humana'
	},
	{
		id: 'literatura',
		nombre: 'Literatura',
		color: 'pink',
		icono: '📖',
		descripcion: 'Literatura Española y Latinoamericana'
	},
	{
		id: 'ingles',
		nombre: 'Inglés',
		color: 'indigo',
		icono: '🇬🇧',
		descripcion: 'Gramática, Vocabulario y Comprensión'
	}
];
