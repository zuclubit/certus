export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {start:"_app/immutable/entry/start.DnSuLKx9.js",app:"_app/immutable/entry/app.C28tpGyz.js",imports:["_app/immutable/entry/start.DnSuLKx9.js","_app/immutable/chunks/PLQrDtYt.js","_app/immutable/chunks/1cyo-tcB.js","_app/immutable/chunks/DJXi2U-Z.js","_app/immutable/entry/app.C28tpGyz.js","_app/immutable/chunks/1cyo-tcB.js","_app/immutable/chunks/CHY_ATJx.js","_app/immutable/chunks/CEiRxeSZ.js","_app/immutable/chunks/DJXi2U-Z.js","_app/immutable/chunks/avoX66I1.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/roadmap-ai",
				pattern: /^\/roadmap-ai\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/roadmap",
				pattern: /^\/roadmap\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
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
