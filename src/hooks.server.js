import { redirect } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    // Verify if path is protected (materias or progreso)
    const protectedPaths = ['/materias', '/progreso', '/cuenta'];
    const isProtectedPath = protectedPaths.some(path => 
        event.url.pathname === path || event.url.pathname.startsWith(`${path}/`)
    );
    
    // Login path should always be accessible
    const isLoginPath = event.url.pathname === '/cuenta/login';
    
    if (isProtectedPath && !isLoginPath) {
        // Check if user is authenticated by looking at session cookie or localStorage
        // For simplicity, we're checking for any user data in localStorage
        // In a real app, you would check a session cookie or JWT token
        const user = event.cookies.get('user');
        
        if (!user) {
            // Redirect to login if not authenticated
            throw redirect(303, '/cuenta/login');
        }
    }
    
    return await resolve(event);
}

// This is optional but can be used to handle errors
/** @type {import('@sveltejs/kit').HandleServerError} */
export function handleError({ error, event }) {
    const errorCode = error && typeof error === 'object' && 'code' in error 
        ? error.code 
        : 'UNKNOWN';
        
    return {
        message: 'Ocurrió un error inesperado. Por favor intenta nuevamente.',
        code: errorCode
    };
}
