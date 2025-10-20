// Esta función se ejecuta en el servidor antes de cargar la página
export const load = async ({ url, locals }) => {
    const code = url.searchParams.get('code');
    
    if (code && locals.supabaseServerClient) {
        // Intercambiar el código temporal por una sesión permanente
        await locals.supabaseServerClient.auth.exchangeCodeForSession(code);
    }
    
    // No redirigir aquí - dejar que el componente cliente maneje la lógica
    return {};
};
