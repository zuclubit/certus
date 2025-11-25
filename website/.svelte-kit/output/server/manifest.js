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
			__memo(() => import('./nodes/1.js'))
		],
		remotes: {
			
		},
		routes: [
			
		],
		prerendered_routes: new Set(["/","/roadmap-ai","/roadmap"]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
