import { writable } from 'svelte/store';

// Verificar si estamos en el navegador antes de acceder a localStorage
const isBrowser = typeof window !== 'undefined';

// Intentar obtener el usuario del localStorage al iniciar la aplicación
const storedUser = isBrowser ? localStorage.getItem('user') : null;
const initialUser = storedUser ? JSON.parse(storedUser) : null;

// Crear la store con el valor inicial
export const user = writable(initialUser);

// Funciones auxiliares para login, logout, etc.
export const login = (userData) => {
    user.set(userData);
    if (isBrowser) {
        localStorage.setItem('user', JSON.stringify(userData));
    }
};

export const logout = () => {
    user.set(null);
    if (isBrowser) {
        localStorage.removeItem('user');
    }
};

export const isAuthenticated = () => {
    let currentUser;
    const unsubscribe = user.subscribe(value => {
        currentUser = value;
    });
    unsubscribe();
    return !!currentUser;
};
