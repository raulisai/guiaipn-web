import { redirect } from '@sveltejs/kit';

// Esta función se ejecuta en el servidor antes de cargar la página
export const load = async ({ url, locals, cookies }) => {
    const code = url.searchParams.get('code');
    
    if (code) {
        // Intercambiar el código temporal por una sesión permanente
        const supabaseServerClient = locals.supabaseServerClient;
        await supabaseServerClient.auth.exchangeCodeForSession(code);
    }
    
    // Redirigir a la página principal
    throw redirect(303, '/');
};
