export const load = async ({ locals, depends }) => {
    // Esta línea le dice a SvelteKit que esta función de carga
    // depende de la autenticación de Supabase
    depends('supabase:auth');

    const { supabaseServerClient } = locals;

    // Obtener la sesión actual
    const { data: { session } } = await supabaseServerClient.auth.getSession();

    // Obtener más información del usuario si está autenticado
    let profile = null;
    if (session) {
        // Aquí puedes obtener datos adicionales del usuario desde tu BD
        // Por ejemplo, su perfil completo
        const { data } = await supabaseServerClient
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
        
        profile = data;
    }

    return {
        session,
        user: session?.user || null,
        profile
    };
};
