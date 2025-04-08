export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png","logoburrito.png","logoipnburrito.png","logoipnGuia.png","malla.jpg"]),
	mimeTypes: {".png":"image/png",".jpg":"image/jpeg"},
	_: {
		client: {start:"_app/immutable/entry/start.DcrArlm-.js",app:"_app/immutable/entry/app.EUDinZ7J.js",imports:["_app/immutable/entry/start.DcrArlm-.js","_app/immutable/chunks/Ck7i__z5.js","_app/immutable/chunks/DCWnqz8X.js","_app/immutable/chunks/OI41P7y3.js","_app/immutable/entry/app.EUDinZ7J.js","_app/immutable/chunks/DCWnqz8X.js","_app/immutable/chunks/D1u628wu.js","_app/immutable/chunks/jQwxT0nd.js","_app/immutable/chunks/HblrPNlH.js","_app/immutable/chunks/D6bexQwf.js","_app/immutable/chunks/QTOHliyc.js","_app/immutable/chunks/OI41P7y3.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/cuenta",
				pattern: /^\/cuenta\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/examen",
				pattern: /^\/examen\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/materias",
				pattern: /^\/materias\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
