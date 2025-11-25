import * as universal from '../entries/pages/_layout.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.-AXeiskk.js","_app/immutable/chunks/CEiRxeSZ.js","_app/immutable/chunks/1cyo-tcB.js","_app/immutable/chunks/fHHdNfH8.js","_app/immutable/chunks/r4hz4f3q.js"];
export const stylesheets = ["_app/immutable/assets/0.N-di3Jr4.css"];
export const fonts = [];
