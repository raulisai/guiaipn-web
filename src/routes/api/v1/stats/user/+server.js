
import { json } from '@sveltejs/kit';
import { supabase } from '$lib/services/supabase';

/**
 * GET /api/v1/stats/user
 * Obtiene las estadísticas del usuario y sus áreas más débiles.
 * Crea el registro de usuario si no existe (implícito en la lógica de manejo de stats vacíos).
 */
export async function GET({ url, locals }) {
    try {
        const userId = url.searchParams.get('userId'); // O obtener de locals.session

        if (!userId) {
            return json({ error: 'User ID requerido' }, { status: 400 });
        }

        // Consultar progreso
        const { data: progressData, error } = await supabase
            .from('user_progress')
            .select('subject, mastery_level, total_practiced')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching user stats:', error);
            // Si el error es que la tabla no existe, podríamos manejarlo, pero asumiremos que existe.
            return json({ error: 'Error al obtener estadísticas' }, { status: 500 });
        }

        // Si no hay datos, devolvemos estructura vacía (el usuario es "nuevo" en stats)
        const stats = progressData || [];

        // Formatear respuesta
        const mastery_levels = {};
        stats.forEach(item => {
            mastery_levels[item.subject] = item.mastery_level;
        });

        // Calcular materias más débiles (menor mastery, pero con al menos un intento to avoid noise?)
        // El prompt dice "weakest_subjects"
        const weakest_subjects = [...stats]
            .sort((a, b) => a.mastery_level - b.mastery_level)
            .map(item => ({
                subject: item.subject,
                mastery: item.mastery_level,
                total_practiced: item.total_practiced
            }))
            .slice(0, 3); // Top 3 más débiles

        return json({
            mastery_levels,
            weakest_subjects
        });

    } catch (error) {
        console.error('Error en user stats:', error);
        return json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
