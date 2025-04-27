import { createClient } from '@supabase/supabase-js';
import { redirect } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    // Crear un cliente Supabase para cada solicitud
    event.locals.supabase = createClient(
        PUBLIC_SUPABASE_URL,
        PUBLIC_SUPABASE_ANON_KEY,
        {
            auth: {
                autoRefreshToken: false, // SvelteKit maneja el ciclo de vida de la request
                persistSession: false    // Evitamos que Supabase use localStorage
            }
        }
    );

    // Crear un cliente de Supabase que use cookies para autenticación
    event.locals.supabaseServerClient = createClient(
        PUBLIC_SUPABASE_URL,
        PUBLIC_SUPABASE_ANON_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: true,
                detectSessionInUrl: false // No detectar la sesión en la URL, lo manejamos manualmente
            },
            global: {
                headers: {
                    cookie: event.request.headers.get('cookie') || ''
                }
            }
        }
    );

    // Obtener la sesión del usuario actual
    const {
        data: { session }
    } = await event.locals.supabaseServerClient.auth.getSession();
    event.locals.session = session;

    // Verificar rutas protegidas
    const protectedPaths = ['/materias', '/progreso', '/cuenta'];
    const isProtectedPath = protectedPaths.some(path => 
        event.url.pathname === path || event.url.pathname.startsWith(`${path}/`)
    );
    
    // Login path should always be accessible
    const isLoginPath = event.url.pathname === '/cuenta/login';
    
    if (isProtectedPath && !isLoginPath) {
        // Verificar si el usuario está autenticado
        if (!session) {
            // Redireccionar al login si no está autenticado
            throw redirect(303, '/cuenta/login');
        }
    }
    
    // Resolver la request
    const response = await resolve(event, {
        transformPageChunk: ({ html }) => html
    });

    // Enviar las cookies de la sesión al cliente
    return response;
}

// Manejo de errores
/** @type {import('@sveltejs/kit').HandleServerError} */
export function handleError({ error, event }) {
    const errorId = crypto.randomUUID();
    console.error(`Error ID ${errorId}:`, error);
    
    // Create a standard Error object that matches the expected return type
    const customError = new Error('Ocurrió un error inesperado. Por favor intenta nuevamente.');
    // Add the ID as a property to the error object
    /** @type {any} */ (customError).id = errorId;
    
    return customError;
}
