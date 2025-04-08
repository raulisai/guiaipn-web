

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/cuenta/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/3.D2Ex81lw.js","_app/immutable/chunks/HblrPNlH.js","_app/immutable/chunks/DCWnqz8X.js","_app/immutable/chunks/C3BAvKjv.js"];
export const stylesheets = [];
export const fonts = [];
