import { writable } from 'svelte/store';
import { supabase } from '$lib/services';
import { browser } from '$app/environment';
import { authAPI } from '$lib/api';
import { PUBLIC_SOCKET_URL } from '$env/static/public';

const BACKEND_URL = PUBLIC_SOCKET_URL;

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

    // Si el login fue exitoso, verificar/inicializar el perfil
    // (por si es la primera vez que inicia sesión después de confirmar el email)
    if (data.session) {
        try {
            // Primero intentar obtener el perfil existente
            let profile = null;
            try {
                profile = await getUserProfile();
                console.log('✅ Perfil encontrado - Usuario existente');
            } catch (profileError) {
                // Si el perfil no existe (404), crearlo
                if (profileError.status === 404) {
                    console.log('⚠️ Perfil no encontrado - Creando perfil nuevo');
                    await initializeUserProfile();
                    console.log('✅ Perfil creado exitosamente');
                } else {
                    throw profileError;
                }
            }
        } catch (profileError) {
            console.error('⚠️ Error al verificar perfil:', profileError);
            // No lanzar error, el perfil se puede crear después
        }
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

    console.log('📧 Usuario registrado:', { 
        email, 
        hasSession: !!data.session,
        needsConfirmation: !data.session 
    });

    // Si el usuario se creó exitosamente y la sesión está activa
    // (depende de si Supabase requiere confirmación de email)
    if (data.session) {
        console.log('✅ Sesión activa - Inicializando perfil inmediatamente');
        try {
            // Inicializar el perfil en el backend
            await initializeUserProfile();
        } catch (profileError) {
            console.error('❌ Error al inicializar perfil después del registro:', profileError);
            // No lanzar error, el perfil se puede crear después
        }
    } else {
        console.log('📬 Se requiere confirmación de email - El perfil se creará al confirmar');
    }
    
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

/**
 * Inicializa el perfil del usuario en el backend Flask
 * Se debe llamar después del primer login con Google OAuth o registro
 * @returns {Promise<{profile: object, isNewUser: boolean, progressInitialized: number}>}
 */
export const initializeUserProfile = async () => {
    try {
        // Obtener la sesión actual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
            throw new Error('No hay sesión activa');
        }

        const token = session.access_token;

        // Llamar al endpoint de inicialización
        const response = await authAPI.initialize(token);

        // Determinar si es un usuario nuevo basado en la respuesta
        const isNewUser = response.message === 'Perfil inicializado exitosamente';

        return {
            profile: response.profile,
            isNewUser,
            progressInitialized: response.progress_initialized || 0
        };
    } catch (error) {
        console.error('Error al inicializar perfil:', error);
        throw error;
    }
};

/**
 * Obtiene el perfil completo del usuario desde el backend
 * @returns {Promise<object>}
 */
export const getUserProfile = async () => {
    try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
            throw new Error('No hay sesión activa');
        }

        const token = session.access_token;
        const profile = await authAPI.getProfile(token);

        return profile;
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        throw error;
    }
};

/**
 * Obtiene el token JWT actual del usuario
 * @returns {Promise<string|null>}
 */
export const getToken = async () => {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
            return null;
        }

        return session.access_token;
    } catch (error) {
        console.error('Error al obtener token:', error);
        return null;
    }
};

/**
 * Función helper para hacer peticiones autenticadas con el token JWT
 * Maneja automáticamente el token, headers y CORS
 * 
 * @param {string} url - URL completa o endpoint relativo (ej: '/payments/checkout-session')
 * @param {RequestInit} options - Opciones de fetch (method, body, headers, etc.)
 * @param {string} [tokenOverride] - Token opcional para override (si no se pasa, se obtiene automáticamente)
 * @returns {Promise<Response>}
 * 
 * @example
 * // Uso básico con endpoint relativo
 * const response = await authenticatedFetch('/payments/checkout-session', {
 *   method: 'POST',
 *   body: JSON.stringify({ plan: 'premium' })
 * });
 * 
 * @example
 * // Uso con URL completa
 * const response = await authenticatedFetch('http://localhost:5000/api/v1/payments/checkout-session', {
 *   method: 'POST',
 *   body: JSON.stringify({ plan: 'premium' })
 * });
 */
export const authenticatedFetch = async (url, options = {}, tokenOverride = null) => {
    // Obtener el token (usar override si se proporciona, sino obtener de la sesión)
    const token = tokenOverride || await getToken();
    
    if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicia sesión.');
    }

    // Determinar la URL completa
    // Si la URL ya tiene http/https, usarla tal cual
    // Si es relativa (empieza con /), agregar el BACKEND_URL
    const fullUrl = url.startsWith('http') 
        ? url 
        : `${BACKEND_URL}/api/v1${url}`;

    // Combinar headers existentes con el Authorization header
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token}`);
    
    // Agregar headers estándar requeridos por el backend
    if (!headers.has('accept')) {
        headers.set('accept', '*/*');
    }
    if (!headers.has('accept-language')) {
        headers.set('accept-language', 'es-419,es;q=0.5');
    }
    
    // Agregar origin si estamos en el navegador
    if (browser && !headers.has('origin')) {
        headers.set('origin', window.location.origin);
    }
    
    // Solo agregar Content-Type si no está ya definido y hay body
    if (!headers.has('Content-Type') && options.body) {
        headers.set('Content-Type', 'application/json');
    }

    // Realizar la petición
    return fetch(fullUrl, {
        ...options,
        headers,
        credentials: 'omit', // No enviar cookies (usamos JWT)
    });
};
