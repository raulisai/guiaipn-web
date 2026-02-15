
import { json } from '@sveltejs/kit';
import { supabase } from '$lib/services/supabase';

/**
 * POST /api/v1/questions/exam/submit
 * Recibe las respuestas del examen, calcula el puntaje y actualiza el progreso del usuario.
 */
export async function POST({ request, locals }) {
    try {
        const body = await request.json();
        const { answers, userId: bodyUserId } = body; // accept userId in body for flexibility, or use auth

        // Intentar obtener usuario de la sesión de Supabase si está disponible en locals (depende de hooks)
        // O usar el del body si no hay auth middleware estricto aun.
        let userId = bodyUserId;

        // Validación básica
        if (!answers || !Array.isArray(answers)) {
            return json({ error: 'Formato de respuestas inválido' }, { status: 400 });
        }

        // 1. Obtener las preguntas correctas de la base de datos
        const questionIds = answers.map(a => a.question_id);

        // Asumimos una tabla 'questions' o 'reactivos' - Ajustar nombre de tabla según esquema real
        // En el frontend se usa 'reactivos' data local, pero en DB debería ser 'questions'
        const { data: dbQuestions, error: qError } = await supabase
            .from('questions')
            .select('id, correct_answer, subject')
            .in('id', questionIds);

        if (qError) {
            console.error('Error fetching questions:', qError);
            return json({ error: 'Error al validar preguntas' }, { status: 500 });
        }

        const dbQuestionsMap = new Map(dbQuestions.map(q => [q.id, q]));

        // 2. Calcular puntaje
        let correctCount = 0;
        const results = [];
        const subjectStats = {}; // { [subject]: { correct: 0, total: 0 } }

        for (const answer of answers) {
            const question = dbQuestionsMap.get(answer.question_id);
            if (!question) {
                results.push({
                    question_id: answer.question_id,
                    status: 'not_found',
                    correct: false
                });
                continue;
            }

            const isCorrect = question.correct_answer === answer.user_answer;
            if (isCorrect) correctCount++;

            // Acumular estadísticas por materia
            const subject = question.subject || 'general';
            if (!subjectStats[subject]) {
                subjectStats[subject] = { correct: 0, total: 0 };
            }
            subjectStats[subject].total++;
            if (isCorrect) subjectStats[subject].correct++;

            results.push({
                question_id: answer.question_id,
                user_answer: answer.user_answer,
                correct_answer: question.correct_answer,
                correct: isCorrect,
                subject: subject
            });
        }

        const score = (correctCount / answers.length) * 100;

        // 3. Actualizar progreso del usuario (si hay userId)
        if (userId) {
            // Actualizar tabla de progreso (ej: user_progress)
            // Estructura asumida: user_id, subject, total_answered, total_correct, mastery_level

            for (const [subject, stats] of Object.entries(subjectStats)) {
                // Primero obtenemos el progreso actual para incrementarlo
                // Usamos upsert para simplificar creación si no existe

                // Nota: Esto es una simplificación. Idealmente usaríamos un RPC de supabase o una transacción
                // Pero para este MVP haremos fetch + upsert o un RPC simple si existiera.
                // Vamos a intentar un upsert calculando valores (con riesgo de race condition bajo en app pequeña)

                const { data: currentProgress } = await supabase
                    .from('user_progress')
                    .select('*')
                    .eq('user_id', userId)
                    .eq('subject', subject)
                    .single();

                const newTotal = (currentProgress?.total_practiced || 0) + stats.total;
                const newCorrect = (currentProgress?.total_correct || 0) + stats.correct;
                const newMastery = (newCorrect / newTotal) * 100;

                await supabase.from('user_progress').upsert({
                    user_id: userId,
                    subject: subject,
                    total_practiced: newTotal,
                    total_correct: newCorrect,
                    mastery_level: newMastery,
                    updated_at: new Date()
                });
            }
        }

        return json({
            score,
            correct_count: correctCount,
            total_questions: answers.length,
            details: results
        });

    } catch (error) {
        console.error('Error en submit exam:', error);
        return json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
