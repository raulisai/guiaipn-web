

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/materias/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.BmvkzKl2.js","_app/immutable/chunks/HblrPNlH.js","_app/immutable/chunks/DCWnqz8X.js","_app/immutable/chunks/C3BAvKjv.js"];
export const stylesheets = ["_app/immutable/assets/5.C8vkUQEj.css"];
export const fonts = [];
