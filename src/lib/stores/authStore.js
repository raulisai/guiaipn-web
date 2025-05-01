import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase';
import { browser } from '$app/environment';

// Crear la store con el valor inicial null (se actualizará después con el estado de la sesión)
export const user = writable(null);

// Inicializa la sesión al cargar el archivo
if (browser) {
    // Obtener la sesión actual al iniciar
    supabase.auth.getSession().then(({ data }) => {
        if (data && data.session) {
            user.set(data.session.user);
        }
    });

    // Configurar el listener de cambios en la autenticación
    supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
            user.set(session.user);
        } else {
            user.set(null);
        }
    });
}

// Función para iniciar sesión con email/password
export const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    
    if (error) {
        if (error.message === 'Email not confirmed') {
            // Lanzar un error más descriptivo que se pueda capturar y manejar en la interfaz de usuario
            throw { 
                code: 'EMAIL_NOT_CONFIRMED',
                message: 'Por favor, verifica tu correo electrónico y confirma tu cuenta antes de iniciar sesión.',
                email
            };
        }
        throw error;
    }
    return data;
};

// Función para reenviar el correo de confirmación
export const resendConfirmationEmail = async (email) => {
    const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email
    });

    if (error) throw error;
    return data;
};

// Función para registrarse con email/password
export const signUpWithEmail = async (email, password, name) => {
    // Primero creamos el usuario
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name
            }
        }
    });
    
    if (error) throw error;
    return data;
};

// Función para iniciar sesión con Google
export const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/auth/callback`
        }
    });
    
    if (error) throw error;
    return data;
};

// Función para cerrar sesión
export const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = () => {
    let currentUser;
    const unsubscribe = user.subscribe(value => {
        currentUser = value;
    });
    unsubscribe();
    return !!currentUser;
};
