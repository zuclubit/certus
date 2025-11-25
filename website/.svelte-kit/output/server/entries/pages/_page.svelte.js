import { w as sanitize_props, x as spread_props, v as slot, y as attr_style, z as attr_class, F as ensure_array_like, G as attr, J as stringify, K as clsx, N as head } from "../../chunks/index.js";
import { I as Icon, S as Shield, C as Chevron_down, a as Circle_check_big, T as Trending_up, b as Clock, D as Database, c as Server } from "../../chunks/trending-up.js";
import { A as Arrow_right, T as Trending_down, S as Sparkles } from "../../chunks/trending-down.js";
import { k as escape_html } from "../../chunks/context.js";
import { U as Users, A as Activity, T as Target, C as Calendar, L as Layers } from "../../chunks/users.js";
function Arrow_down($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["path", { "d": "M12 5v14" }],
    ["path", { "d": "m19 12-7 7-7-7" }]
  ];
  Icon($$renderer, spread_props([
    { name: "arrow-down" },
    $$sanitized_props,
    {
      /**
       * @component @name ArrowDown
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTIgNXYxNCIgLz4KICA8cGF0aCBkPSJtMTkgMTItNyA3LTctNyIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/arrow-down
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Award($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"
      }
    ],
    ["circle", { "cx": "12", "cy": "8", "r": "6" }]
  ];
  Icon($$renderer, spread_props([
    { name: "award" },
    $$sanitized_props,
    {
      /**
       * @component @name Award
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMTUuNDc3IDEyLjg5IDEuNTE1IDguNTI2YS41LjUgMCAwIDEtLjgxLjQ3bC0zLjU4LTIuNjg3YTEgMSAwIDAgMC0xLjE5NyAwbC0zLjU4NiAyLjY4NmEuNS41IDAgMCAxLS44MS0uNDY5bDEuNTE0LTguNTI2IiAvPgogIDxjaXJjbGUgY3g9IjEyIiBjeT0iOCIgcj0iNiIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/award
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Building_2($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["path", { "d": "M10 12h4" }],
    ["path", { "d": "M10 8h4" }],
    ["path", { "d": "M14 21v-3a2 2 0 0 0-4 0v3" }],
    [
      "path",
      {
        "d": "M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"
      }
    ],
    ["path", { "d": "M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" }]
  ];
  Icon($$renderer, spread_props([
    { name: "building-2" },
    $$sanitized_props,
    {
      /**
       * @component @name Building2
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTAgMTJoNCIgLz4KICA8cGF0aCBkPSJNMTAgOGg0IiAvPgogIDxwYXRoIGQ9Ik0xNCAyMXYtM2EyIDIgMCAwIDAtNCAwdjMiIC8+CiAgPHBhdGggZD0iTTYgMTBINGEyIDIgMCAwIDAtMiAydjdhMiAyIDAgMCAwIDIgMmgxNmEyIDIgMCAwIDAgMi0yVjlhMiAyIDAgMCAwLTItMmgtMiIgLz4KICA8cGF0aCBkPSJNNiAyMVY1YTIgMiAwIDAgMSAyLTJoOGEyIDIgMCAwIDEgMiAydjE2IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/building-2
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Calculator($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "rect",
      { "width": "16", "height": "20", "x": "4", "y": "2", "rx": "2" }
    ],
    ["line", { "x1": "8", "x2": "16", "y1": "6", "y2": "6" }],
    ["line", { "x1": "16", "x2": "16", "y1": "14", "y2": "18" }],
    ["path", { "d": "M16 10h.01" }],
    ["path", { "d": "M12 10h.01" }],
    ["path", { "d": "M8 10h.01" }],
    ["path", { "d": "M12 14h.01" }],
    ["path", { "d": "M8 14h.01" }],
    ["path", { "d": "M12 18h.01" }],
    ["path", { "d": "M8 18h.01" }]
  ];
  Icon($$renderer, spread_props([
    { name: "calculator" },
    $$sanitized_props,
    {
      /**
       * @component @name Calculator
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iMjAiIHg9IjQiIHk9IjIiIHJ4PSIyIiAvPgogIDxsaW5lIHgxPSI4IiB4Mj0iMTYiIHkxPSI2IiB5Mj0iNiIgLz4KICA8bGluZSB4MT0iMTYiIHgyPSIxNiIgeTE9IjE0IiB5Mj0iMTgiIC8+CiAgPHBhdGggZD0iTTE2IDEwaC4wMSIgLz4KICA8cGF0aCBkPSJNMTIgMTBoLjAxIiAvPgogIDxwYXRoIGQ9Ik04IDEwaC4wMSIgLz4KICA8cGF0aCBkPSJNMTIgMTRoLjAxIiAvPgogIDxwYXRoIGQ9Ik04IDE0aC4wMSIgLz4KICA8cGF0aCBkPSJNMTIgMThoLjAxIiAvPgogIDxwYXRoIGQ9Ik04IDE4aC4wMSIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/calculator
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Chart_column($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["path", { "d": "M3 3v16a2 2 0 0 0 2 2h16" }],
    ["path", { "d": "M18 17V9" }],
    ["path", { "d": "M13 17V5" }],
    ["path", { "d": "M8 17v-3" }]
  ];
  Icon($$renderer, spread_props([
    { name: "chart-column" },
    $$sanitized_props,
    {
      /**
       * @component @name ChartColumn
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMyAzdjE2YTIgMiAwIDAgMCAyIDJoMTYiIC8+CiAgPHBhdGggZD0iTTE4IDE3VjkiIC8+CiAgPHBhdGggZD0iTTEzIDE3VjUiIC8+CiAgPHBhdGggZD0iTTggMTd2LTMiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/chart-column
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Check($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [["path", { "d": "M20 6 9 17l-5-5" }]];
  Icon($$renderer, spread_props([
    { name: "check" },
    $$sanitized_props,
    {
      /**
       * @component @name Check
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjAgNiA5IDE3bC01LTUiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/check
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Chevron_right($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [["path", { "d": "m9 18 6-6-6-6" }]];
  Icon($$renderer, spread_props([
    { name: "chevron-right" },
    $$sanitized_props,
    {
      /**
       * @component @name ChevronRight
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtOSAxOCA2LTYtNi02IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/chevron-right
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Circle_alert($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["circle", { "cx": "12", "cy": "12", "r": "10" }],
    ["line", { "x1": "12", "x2": "12", "y1": "8", "y2": "12" }],
    [
      "line",
      { "x1": "12", "x2": "12.01", "y1": "16", "y2": "16" }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "circle-alert" },
    $$sanitized_props,
    {
      /**
       * @component @name CircleAlert
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgLz4KICA8bGluZSB4MT0iMTIiIHgyPSIxMiIgeTE9IjgiIHkyPSIxMiIgLz4KICA8bGluZSB4MT0iMTIiIHgyPSIxMi4wMSIgeTE9IjE2IiB5Mj0iMTYiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/circle-alert
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Circle_check($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["circle", { "cx": "12", "cy": "12", "r": "10" }],
    ["path", { "d": "m9 12 2 2 4-4" }]
  ];
  Icon($$renderer, spread_props([
    { name: "circle-check" },
    $$sanitized_props,
    {
      /**
       * @component @name CircleCheck
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgLz4KICA8cGF0aCBkPSJtOSAxMiAyIDIgNC00IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/circle-check
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Circle_play($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z"
      }
    ],
    ["circle", { "cx": "12", "cy": "12", "r": "10" }]
  ];
  Icon($$renderer, spread_props([
    { name: "circle-play" },
    $$sanitized_props,
    {
      /**
       * @component @name CirclePlay
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNOSA5LjAwM2ExIDEgMCAwIDEgMS41MTctLjg1OWw0Ljk5NyAyLjk5N2ExIDEgMCAwIDEgMCAxLjcxOGwtNC45OTcgMi45OTdBMSAxIDAgMCAxIDkgMTQuOTk2eiIgLz4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/circle-play
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Cloud($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      { "d": "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "cloud" },
    $$sanitized_props,
    {
      /**
       * @component @name Cloud
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTcuNSAxOUg5YTcgNyAwIDEgMSA2LjcxLTloMS43OWE0LjUgNC41IDAgMSAxIDAgOVoiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/cloud
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Code($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["path", { "d": "m16 18 6-6-6-6" }],
    ["path", { "d": "m8 6-6 6 6 6" }]
  ];
  Icon($$renderer, spread_props([
    { name: "code" },
    $$sanitized_props,
    {
      /**
       * @component @name Code
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMTYgMTggNi02LTYtNiIgLz4KICA8cGF0aCBkPSJtOCA2LTYgNiA2IDYiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/code
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Cpu($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["path", { "d": "M12 20v2" }],
    ["path", { "d": "M12 2v2" }],
    ["path", { "d": "M17 20v2" }],
    ["path", { "d": "M17 2v2" }],
    ["path", { "d": "M2 12h2" }],
    ["path", { "d": "M2 17h2" }],
    ["path", { "d": "M2 7h2" }],
    ["path", { "d": "M20 12h2" }],
    ["path", { "d": "M20 17h2" }],
    ["path", { "d": "M20 7h2" }],
    ["path", { "d": "M7 20v2" }],
    ["path", { "d": "M7 2v2" }],
    [
      "rect",
      { "x": "4", "y": "4", "width": "16", "height": "16", "rx": "2" }
    ],
    [
      "rect",
      { "x": "8", "y": "8", "width": "8", "height": "8", "rx": "1" }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "cpu" },
    $$sanitized_props,
    {
      /**
       * @component @name Cpu
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTIgMjB2MiIgLz4KICA8cGF0aCBkPSJNMTIgMnYyIiAvPgogIDxwYXRoIGQ9Ik0xNyAyMHYyIiAvPgogIDxwYXRoIGQ9Ik0xNyAydjIiIC8+CiAgPHBhdGggZD0iTTIgMTJoMiIgLz4KICA8cGF0aCBkPSJNMiAxN2gyIiAvPgogIDxwYXRoIGQ9Ik0yIDdoMiIgLz4KICA8cGF0aCBkPSJNMjAgMTJoMiIgLz4KICA8cGF0aCBkPSJNMjAgMTdoMiIgLz4KICA8cGF0aCBkPSJNMjAgN2gyIiAvPgogIDxwYXRoIGQ9Ik03IDIwdjIiIC8+CiAgPHBhdGggZD0iTTcgMnYyIiAvPgogIDxyZWN0IHg9IjQiIHk9IjQiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgcng9IjIiIC8+CiAgPHJlY3QgeD0iOCIgeT0iOCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgcng9IjEiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/cpu
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Dollar_sign($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["line", { "x1": "12", "x2": "12", "y1": "2", "y2": "22" }],
    [
      "path",
      { "d": "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "dollar-sign" },
    $$sanitized_props,
    {
      /**
       * @component @name DollarSign
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8bGluZSB4MT0iMTIiIHgyPSIxMiIgeTE9IjIiIHkyPSIyMiIgLz4KICA8cGF0aCBkPSJNMTcgNUg5LjVhMy41IDMuNSAwIDAgMCAwIDdoNWEzLjUgMy41IDAgMCAxIDAgN0g2IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/dollar-sign
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Download($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["path", { "d": "M12 15V3" }],
    ["path", { "d": "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }],
    ["path", { "d": "m7 10 5 5 5-5" }]
  ];
  Icon($$renderer, spread_props([
    { name: "download" },
    $$sanitized_props,
    {
      /**
       * @component @name Download
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTIgMTVWMyIgLz4KICA8cGF0aCBkPSJNMjEgMTV2NGEyIDIgMCAwIDEtMiAySDVhMiAyIDAgMCAxLTItMnYtNCIgLz4KICA8cGF0aCBkPSJtNyAxMCA1IDUgNS01IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/download
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function External_link($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["path", { "d": "M15 3h6v6" }],
    ["path", { "d": "M10 14 21 3" }],
    [
      "path",
      {
        "d": "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
      }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "external-link" },
    $$sanitized_props,
    {
      /**
       * @component @name ExternalLink
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTUgM2g2djYiIC8+CiAgPHBhdGggZD0iTTEwIDE0IDIxIDMiIC8+CiAgPHBhdGggZD0iTTE4IDEzdjZhMiAyIDAgMCAxLTIgMkg1YTIgMiAwIDAgMS0yLTJWOGEyIDIgMCAwIDEgMi0yaDYiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/external-link
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Eye($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
      }
    ],
    ["circle", { "cx": "12", "cy": "12", "r": "3" }]
  ];
  Icon($$renderer, spread_props([
    { name: "eye" },
    $$sanitized_props,
    {
      /**
       * @component @name Eye
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMi4wNjIgMTIuMzQ4YTEgMSAwIDAgMSAwLS42OTYgMTAuNzUgMTAuNzUgMCAwIDEgMTkuODc2IDAgMSAxIDAgMCAxIDAgLjY5NiAxMC43NSAxMC43NSAwIDAgMS0xOS44NzYgMCIgLz4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIzIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/eye
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function File_check($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"
      }
    ],
    ["path", { "d": "M14 2v5a1 1 0 0 0 1 1h5" }],
    ["path", { "d": "m9 15 2 2 4-4" }]
  ];
  Icon($$renderer, spread_props([
    { name: "file-check" },
    $$sanitized_props,
    {
      /**
       * @component @name FileCheck
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNNiAyMmEyIDIgMCAwIDEtMi0yVjRhMiAyIDAgMCAxIDItMmg4YTIuNCAyLjQgMCAwIDEgMS43MDQuNzA2bDMuNTg4IDMuNTg4QTIuNCAyLjQgMCAwIDEgMjAgOHYxMmEyIDIgMCAwIDEtMiAyeiIgLz4KICA8cGF0aCBkPSJNMTQgMnY1YTEgMSAwIDAgMCAxIDFoNSIgLz4KICA8cGF0aCBkPSJtOSAxNSAyIDIgNC00IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/file-check
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function File_text($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"
      }
    ],
    ["path", { "d": "M14 2v5a1 1 0 0 0 1 1h5" }],
    ["path", { "d": "M10 9H8" }],
    ["path", { "d": "M16 13H8" }],
    ["path", { "d": "M16 17H8" }]
  ];
  Icon($$renderer, spread_props([
    { name: "file-text" },
    $$sanitized_props,
    {
      /**
       * @component @name FileText
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNNiAyMmEyIDIgMCAwIDEtMi0yVjRhMiAyIDAgMCAxIDItMmg4YTIuNCAyLjQgMCAwIDEgMS43MDQuNzA2bDMuNTg4IDMuNTg4QTIuNCAyLjQgMCAwIDEgMjAgOHYxMmEyIDIgMCAwIDEtMiAyeiIgLz4KICA8cGF0aCBkPSJNMTQgMnY1YTEgMSAwIDAgMCAxIDFoNSIgLz4KICA8cGF0aCBkPSJNMTAgOUg4IiAvPgogIDxwYXRoIGQ9Ik0xNiAxM0g4IiAvPgogIDxwYXRoIGQ9Ik0xNiAxN0g4IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/file-text
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function File_x($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"
      }
    ],
    ["path", { "d": "M14 2v5a1 1 0 0 0 1 1h5" }],
    ["path", { "d": "m14.5 12.5-5 5" }],
    ["path", { "d": "m9.5 12.5 5 5" }]
  ];
  Icon($$renderer, spread_props([
    { name: "file-x" },
    $$sanitized_props,
    {
      /**
       * @component @name FileX
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNNiAyMmEyIDIgMCAwIDEtMi0yVjRhMiAyIDAgMCAxIDItMmg4YTIuNCAyLjQgMCAwIDEgMS43MDQuNzA2bDMuNTg4IDMuNTg4QTIuNCAyLjQgMCAwIDEgMjAgOHYxMmEyIDIgMCAwIDEtMiAyeiIgLz4KICA8cGF0aCBkPSJNMTQgMnY1YTEgMSAwIDAgMCAxIDFoNSIgLz4KICA8cGF0aCBkPSJtMTQuNSAxMi41LTUgNSIgLz4KICA8cGF0aCBkPSJtOS41IDEyLjUgNSA1IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/file-x
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Gauge($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["path", { "d": "m12 14 4-4" }],
    ["path", { "d": "M3.34 19a10 10 0 1 1 17.32 0" }]
  ];
  Icon($$renderer, spread_props([
    { name: "gauge" },
    $$sanitized_props,
    {
      /**
       * @component @name Gauge
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMTIgMTQgNC00IiAvPgogIDxwYXRoIGQ9Ik0zLjM0IDE5YTEwIDEwIDAgMSAxIDE3LjMyIDAiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/gauge
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Github($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
      }
    ],
    ["path", { "d": "M9 18c-4.51 2-5-2-7-2" }]
  ];
  Icon($$renderer, spread_props([
    { name: "github" },
    $$sanitized_props,
    {
      /**
       * @component @name Github
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTUgMjJ2LTRhNC44IDQuOCAwIDAgMC0xLTMuNWMzIDAgNi0yIDYtNS41LjA4LTEuMjUtLjI3LTIuNDgtMS0zLjUuMjgtMS4xNS4yOC0yLjM1IDAtMy41IDAgMC0xIDAtMyAxLjUtMi42NC0uNS01LjM2LS41LTggMEM2IDIgNSAyIDUgMmMtLjMgMS4xNS0uMyAyLjM1IDAgMy41QTUuNDAzIDUuNDAzIDAgMCAwIDQgOWMwIDMuNSAzIDUuNSA2IDUuNS0uMzkuNDktLjY4IDEuMDUtLjg1IDEuNjUtLjE3LjYtLjIyIDEuMjMtLjE1IDEuODV2NCIgLz4KICA8cGF0aCBkPSJNOSAxOGMtNC41MSAyLTUtMi03LTIiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/github
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       * @deprecated Brand icons have been deprecated and are due to be removed, please refer to https://github.com/lucide-icons/lucide/issues/670. We recommend using https://simpleicons.org/?q=github instead. This icon will be removed in v1.0
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Globe($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["circle", { "cx": "12", "cy": "12", "r": "10" }],
    [
      "path",
      { "d": "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" }
    ],
    ["path", { "d": "M2 12h20" }]
  ];
  Icon($$renderer, spread_props([
    { name: "globe" },
    $$sanitized_props,
    {
      /**
       * @component @name Globe
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgLz4KICA8cGF0aCBkPSJNMTIgMmExNC41IDE0LjUgMCAwIDAgMCAyMCAxNC41IDE0LjUgMCAwIDAgMC0yMCIgLz4KICA8cGF0aCBkPSJNMiAxMmgyMCIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/globe
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Hard_drive($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["line", { "x1": "22", "x2": "2", "y1": "12", "y2": "12" }],
    [
      "path",
      {
        "d": "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"
      }
    ],
    ["line", { "x1": "6", "x2": "6.01", "y1": "16", "y2": "16" }],
    [
      "line",
      { "x1": "10", "x2": "10.01", "y1": "16", "y2": "16" }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "hard-drive" },
    $$sanitized_props,
    {
      /**
       * @component @name HardDrive
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8bGluZSB4MT0iMjIiIHgyPSIyIiB5MT0iMTIiIHkyPSIxMiIgLz4KICA8cGF0aCBkPSJNNS40NSA1LjExIDIgMTJ2NmEyIDIgMCAwIDAgMiAyaDE2YTIgMiAwIDAgMCAyLTJ2LTZsLTMuNDUtNi44OUEyIDIgMCAwIDAgMTYuNzYgNEg3LjI0YTIgMiAwIDAgMC0xLjc5IDEuMTF6IiAvPgogIDxsaW5lIHgxPSI2IiB4Mj0iNi4wMSIgeTE9IjE2IiB5Mj0iMTYiIC8+CiAgPGxpbmUgeDE9IjEwIiB4Mj0iMTAuMDEiIHkxPSIxNiIgeTI9IjE2IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/hard-drive
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Headphones($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"
      }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "headphones" },
    $$sanitized_props,
    {
      /**
       * @component @name Headphones
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMyAxNGgzYTIgMiAwIDAgMSAyIDJ2M2EyIDIgMCAwIDEtMiAySDVhMiAyIDAgMCAxLTItMnYtN2E5IDkgMCAwIDEgMTggMHY3YTIgMiAwIDAgMS0yIDJoLTFhMiAyIDAgMCAxLTItMnYtM2EyIDIgMCAwIDEgMi0yaDMiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/headphones
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Info($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["circle", { "cx": "12", "cy": "12", "r": "10" }],
    ["path", { "d": "M12 16v-4" }],
    ["path", { "d": "M12 8h.01" }]
  ];
  Icon($$renderer, spread_props([
    { name: "info" },
    $$sanitized_props,
    {
      /**
       * @component @name Info
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIgLz4KICA8cGF0aCBkPSJNMTIgMTZ2LTQiIC8+CiAgPHBhdGggZD0iTTEyIDhoLjAxIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/info
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Linkedin($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
      }
    ],
    ["rect", { "width": "4", "height": "12", "x": "2", "y": "9" }],
    ["circle", { "cx": "4", "cy": "4", "r": "2" }]
  ];
  Icon($$renderer, spread_props([
    { name: "linkedin" },
    $$sanitized_props,
    {
      /**
       * @component @name Linkedin
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTYgOGE2IDYgMCAwIDEgNiA2djdoLTR2LTdhMiAyIDAgMCAwLTItMiAyIDIgMCAwIDAtMiAydjdoLTR2LTdhNiA2IDAgMCAxIDYtNnoiIC8+CiAgPHJlY3Qgd2lkdGg9IjQiIGhlaWdodD0iMTIiIHg9IjIiIHk9IjkiIC8+CiAgPGNpcmNsZSBjeD0iNCIgY3k9IjQiIHI9IjIiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/linkedin
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       * @deprecated Brand icons have been deprecated and are due to be removed, please refer to https://github.com/lucide-icons/lucide/issues/670. We recommend using https://simpleicons.org/?q=linkedin instead. This icon will be removed in v1.0
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Lock($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "rect",
      {
        "width": "18",
        "height": "11",
        "x": "3",
        "y": "11",
        "rx": "2",
        "ry": "2"
      }
    ],
    ["path", { "d": "M7 11V7a5 5 0 0 1 10 0v4" }]
  ];
  Icon($$renderer, spread_props([
    { name: "lock" },
    $$sanitized_props,
    {
      /**
       * @component @name Lock
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTEiIHg9IjMiIHk9IjExIiByeD0iMiIgcnk9IjIiIC8+CiAgPHBhdGggZD0iTTcgMTFWN2E1IDUgMCAwIDEgMTAgMHY0IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/lock
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Mail($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["path", { "d": "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" }],
    [
      "rect",
      { "x": "2", "y": "4", "width": "20", "height": "16", "rx": "2" }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "mail" },
    $$sanitized_props,
    {
      /**
       * @component @name Mail
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMjIgNy04Ljk5MSA1LjcyN2EyIDIgMCAwIDEtMi4wMDkgMEwyIDciIC8+CiAgPHJlY3QgeD0iMiIgeT0iNCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjE2IiByeD0iMiIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/mail
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Map_pin($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
      }
    ],
    ["circle", { "cx": "12", "cy": "10", "r": "3" }]
  ];
  Icon($$renderer, spread_props([
    { name: "map-pin" },
    $$sanitized_props,
    {
      /**
       * @component @name MapPin
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjAgMTBjMCA0Ljk5My01LjUzOSAxMC4xOTMtNy4zOTkgMTEuNzk5YTEgMSAwIDAgMS0xLjIwMiAwQzkuNTM5IDIwLjE5MyA0IDE0Ljk5MyA0IDEwYTggOCAwIDAgMSAxNiAwIiAvPgogIDxjaXJjbGUgY3g9IjEyIiBjeT0iMTAiIHI9IjMiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/map-pin
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Menu($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["path", { "d": "M4 5h16" }],
    ["path", { "d": "M4 12h16" }],
    ["path", { "d": "M4 19h16" }]
  ];
  Icon($$renderer, spread_props([
    { name: "menu" },
    $$sanitized_props,
    {
      /**
       * @component @name Menu
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNNCA1aDE2IiAvPgogIDxwYXRoIGQ9Ik00IDEyaDE2IiAvPgogIDxwYXRoIGQ9Ik00IDE5aDE2IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/menu
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Message_square($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"
      }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "message-square" },
    $$sanitized_props,
    {
      /**
       * @component @name MessageSquare
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjIgMTdhMiAyIDAgMCAxLTIgMkg2LjgyOGEyIDIgMCAwIDAtMS40MTQuNTg2bC0yLjIwMiAyLjIwMkEuNzEuNzEgMCAwIDEgMiAyMS4yODZWNWEyIDIgMCAwIDEgMi0yaDE2YTIgMiAwIDAgMSAyIDJ6IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/message-square
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Phone($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"
      }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "phone" },
    $$sanitized_props,
    {
      /**
       * @component @name Phone
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTMuODMyIDE2LjU2OGExIDEgMCAwIDAgMS4yMTMtLjMwM2wuMzU1LS40NjVBMiAyIDAgMCAxIDE3IDE1aDNhMiAyIDAgMCAxIDIgMnYzYTIgMiAwIDAgMS0yIDJBMTggMTggMCAwIDEgMiA0YTIgMiAwIDAgMSAyLTJoM2EyIDIgMCAwIDEgMiAydjNhMiAyIDAgMCAxLS44IDEuNmwtLjQ2OC4zNTFhMSAxIDAgMCAwLS4yOTIgMS4yMzMgMTQgMTQgMCAwIDAgNi4zOTIgNi4zODQiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/phone
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Send($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"
      }
    ],
    ["path", { "d": "m21.854 2.147-10.94 10.939" }]
  ];
  Icon($$renderer, spread_props([
    { name: "send" },
    $$sanitized_props,
    {
      /**
       * @component @name Send
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTQuNTM2IDIxLjY4NmEuNS41IDAgMCAwIC45MzctLjAyNGw2LjUtMTlhLjQ5Ni40OTYgMCAwIDAtLjYzNS0uNjM1bC0xOSA2LjVhLjUuNSAwIDAgMC0uMDI0LjkzN2w3LjkzIDMuMThhMiAyIDAgMCAxIDEuMTEyIDEuMTF6IiAvPgogIDxwYXRoIGQ9Im0yMS44NTQgMi4xNDctMTAuOTQgMTAuOTM5IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/send
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Star($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
      }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "star" },
    $$sanitized_props,
    {
      /**
       * @component @name Star
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTEuNTI1IDIuMjk1YS41My41MyAwIDAgMSAuOTUgMGwyLjMxIDQuNjc5YTIuMTIzIDIuMTIzIDAgMCAwIDEuNTk1IDEuMTZsNS4xNjYuNzU2YS41My41MyAwIDAgMSAuMjk0LjkwNGwtMy43MzYgMy42MzhhMi4xMjMgMi4xMjMgMCAwIDAtLjYxMSAxLjg3OGwuODgyIDUuMTRhLjUzLjUzIDAgMCAxLS43NzEuNTZsLTQuNjE4LTIuNDI4YTIuMTIyIDIuMTIyIDAgMCAwLTEuOTczIDBMNi4zOTYgMjEuMDFhLjUzLjUzIDAgMCAxLS43Ny0uNTZsLjg4MS01LjEzOWEyLjEyMiAyLjEyMiAwIDAgMC0uNjExLTEuODc5TDIuMTYgOS43OTVhLjUzLjUzIDAgMCAxIC4yOTQtLjkwNmw1LjE2NS0uNzU1YTIuMTIyIDIuMTIyIDAgMCAwIDEuNTk3LTEuMTZ6IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/star
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Triangle_alert($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"
      }
    ],
    ["path", { "d": "M12 9v4" }],
    ["path", { "d": "M12 17h.01" }]
  ];
  Icon($$renderer, spread_props([
    { name: "triangle-alert" },
    $$sanitized_props,
    {
      /**
       * @component @name TriangleAlert
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMjEuNzMgMTgtOC0xNGEyIDIgMCAwIDAtMy40OCAwbC04IDE0QTIgMiAwIDAgMCA0IDIxaDE2YTIgMiAwIDAgMCAxLjczLTMiIC8+CiAgPHBhdGggZD0iTTEyIDl2NCIgLz4KICA8cGF0aCBkPSJNMTIgMTdoLjAxIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/triangle-alert
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Twitter($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"
      }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "twitter" },
    $$sanitized_props,
    {
      /**
       * @component @name Twitter
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjIgNHMtLjcgMi4xLTIgMy40YzEuNiAxMC05LjQgMTcuMy0xOCAxMS42IDIuMi4xIDQuNC0uNiA2LTJDMyAxNS41LjUgOS42IDMgNWMyLjIgMi42IDUuNiA0LjEgOSA0LS45LTQuMiA0LTYuNiA3LTMuOCAxLjEgMCAzLTEuMiAzLTEuMnoiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/twitter
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       * @deprecated Brand icons have been deprecated and are due to be removed, please refer to https://github.com/lucide-icons/lucide/issues/670. We recommend using https://simpleicons.org/?q=twitter instead. This icon will be removed in v1.0
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Upload($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["path", { "d": "M12 3v12" }],
    ["path", { "d": "m17 8-5-5-5 5" }],
    ["path", { "d": "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }]
  ];
  Icon($$renderer, spread_props([
    { name: "upload" },
    $$sanitized_props,
    {
      /**
       * @component @name Upload
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTIgM3YxMiIgLz4KICA8cGF0aCBkPSJtMTcgOC01LTUtNSA1IiAvPgogIDxwYXRoIGQ9Ik0yMSAxNXY0YTIgMiAwIDAgMS0yIDJINWEyIDIgMCAwIDEtMi0ydi00IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/upload
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Video($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"
      }
    ],
    [
      "rect",
      { "x": "2", "y": "6", "width": "14", "height": "12", "rx": "2" }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "video" },
    $$sanitized_props,
    {
      /**
       * @component @name Video
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMTYgMTMgNS4yMjMgMy40ODJhLjUuNSAwIDAgMCAuNzc3LS40MTZWNy44N2EuNS41IDAgMCAwLS43NTItLjQzMkwxNiAxMC41IiAvPgogIDxyZWN0IHg9IjIiIHk9IjYiIHdpZHRoPSIxNCIgaGVpZ2h0PSIxMiIgcng9IjIiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/video
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function X($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["path", { "d": "M18 6 6 18" }],
    ["path", { "d": "m6 6 12 12" }]
  ];
  Icon($$renderer, spread_props([
    { name: "x" },
    $$sanitized_props,
    {
      /**
       * @component @name X
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTggNiA2IDE4IiAvPgogIDxwYXRoIGQ9Im02IDYgMTIgMTIiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/x
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Zap($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
      }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "zap" },
    $$sanitized_props,
    {
      /**
       * @component @name Zap
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNNCAxNGExIDEgMCAwIDEtLjc4LTEuNjNsOS45LTEwLjJhLjUuNSAwIDAgMSAuODYuNDZsLTEuOTIgNi4wMkExIDEgMCAwIDAgMTMgMTBoN2ExIDEgMCAwIDEgLjc4IDEuNjNsLTkuOSAxMC4yYS41LjUgMCAwIDEtLjg2LS40NmwxLjkyLTYuMDJBMSAxIDAgMCAwIDExIDE0eiIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/zap
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Header($$renderer) {
  let isScrolled = false;
  let activeDropdown = null;
  let scrollProgress = 0;
  const menuItems = [
    {
      label: "Producto",
      href: "#features",
      dropdown: [
        {
          icon: Circle_check_big,
          title: "Validaciones",
          description: "37 validadores automáticos",
          href: "#features"
        },
        {
          icon: Zap,
          title: "Performance",
          description: "Procesamiento en tiempo real",
          href: "#how-it-works"
        },
        {
          icon: Chart_column,
          title: "Analytics",
          description: "Dashboards y reportes",
          href: "#features"
        }
      ]
    },
    {
      label: "Seguridad",
      href: "#security",
      dropdown: [
        {
          icon: Shield,
          title: "Compliance",
          description: "SOC 2, ISO 27001",
          href: "#security"
        },
        {
          icon: Lock,
          title: "Encriptación",
          description: "TLS 1.3 y AES-256",
          href: "#security"
        },
        {
          icon: File_check,
          title: "Auditoría",
          description: "Event sourcing completo",
          href: "#security"
        }
      ]
    },
    {
      label: "Cobertura",
      href: "#countries",
      dropdown: [
        {
          icon: Globe,
          title: "México",
          description: "2 AFOREs activas",
          href: "#countries"
        },
        {
          icon: Globe,
          title: "Latam",
          description: "Chile, Colombia, Perú",
          href: "#countries"
        }
      ]
    },
    { label: "Precios", href: "#pricing", dropdown: null }
  ];
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      const scrolled = window.scrollY;
      isScrolled = scrolled > 20;
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      scrollProgress = winScroll / height * 100;
    });
  }
  $$renderer.push(`<div class="fixed top-0 left-0 right-0 h-1 bg-neutral-100 z-[60]"><div class="h-full bg-gradient-to-r from-primary via-primary-dark to-primary transition-all duration-300 svelte-1elxaub"${attr_style(`width: ${stringify(scrollProgress)}%`)}></div></div> <header class="fixed top-1 left-0 right-0 z-50 transition-all duration-500 ease-out svelte-1elxaub"><nav${attr_class(
    `container-custom mx-auto transition-all duration-500 ${stringify(isScrolled ? "bg-white/80 backdrop-blur-xl shadow-lg border border-neutral-200/50 rounded-2xl mt-2" : "bg-white/60 backdrop-blur-md rounded-2xl")}`,
    "svelte-1elxaub"
  )}><div class="flex items-center justify-between px-6 py-4"><a href="/" class="flex items-center gap-3 group"><div class="relative w-11 h-11 bg-gradient-to-br from-primary via-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 svelte-1elxaub"><div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div> `);
  Shield($$renderer, { class: "w-6 h-6 text-white relative z-10" });
  $$renderer.push(`<!----></div> <div class="flex flex-col"><span class="text-2xl font-bold bg-gradient-to-r from-primary-dark to-primary bg-clip-text text-transparent">Hergon</span> <span class="text-[10px] text-neutral-500 font-medium tracking-wider uppercase -mt-1">Compliance Platform</span></div></a> <div class="hidden lg:flex items-center gap-1"><!--[-->`);
  const each_array = ensure_array_like(menuItems);
  for (let index = 0, $$length = each_array.length; index < $$length; index++) {
    let item = each_array[index];
    $$renderer.push(`<div class="relative" role="presentation">`);
    if (item.dropdown) {
      $$renderer.push("<!--[-->");
      $$renderer.push(`<button class="px-4 py-2 rounded-lg text-neutral-700 hover:text-primary font-medium transition-all duration-200 flex items-center gap-1 group hover:bg-primary/5 svelte-1elxaub">${escape_html(item.label)} `);
      Chevron_down($$renderer, {
        class: `w-4 h-4 transition-transform duration-200 ${stringify(activeDropdown === index ? "rotate-180" : "")}`
      });
      $$renderer.push(`<!----></button> `);
      if (activeDropdown === index) {
        $$renderer.push("<!--[-->");
        $$renderer.push(`<div class="absolute top-full left-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-neutral-200/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 svelte-1elxaub" role="menu"><div class="p-2"><!--[-->`);
        const each_array_1 = ensure_array_like(item.dropdown);
        for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
          let subItem = each_array_1[$$index];
          const Icon2 = subItem.icon;
          $$renderer.push(`<a${attr("href", subItem.href)} class="flex items-start gap-4 p-4 rounded-xl hover:bg-primary/5 transition-all duration-200 group svelte-1elxaub"><div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors"><!---->`);
          Icon2($$renderer, { class: "w-5 h-5 text-primary" });
          $$renderer.push(`<!----></div> <div class="flex-1"><div class="font-semibold text-neutral-900 group-hover:text-primary transition-colors">${escape_html(subItem.title)}</div> <div class="text-sm text-neutral-600 mt-0.5">${escape_html(subItem.description)}</div></div> `);
          Arrow_right($$renderer, {
            class: "w-4 h-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-2 group-hover:translate-x-0"
          });
          $$renderer.push(`<!----></a>`);
        }
        $$renderer.push(`<!--]--></div></div>`);
      } else {
        $$renderer.push("<!--[!-->");
      }
      $$renderer.push(`<!--]-->`);
    } else {
      $$renderer.push("<!--[!-->");
      $$renderer.push(`<a${attr("href", item.href)} class="px-4 py-2 rounded-lg text-neutral-700 hover:text-primary font-medium transition-all duration-200 hover:bg-primary/5 svelte-1elxaub">${escape_html(item.label)}</a>`);
    }
    $$renderer.push(`<!--]--></div>`);
  }
  $$renderer.push(`<!--]--></div> <div class="hidden lg:flex items-center gap-3"><a href="#contact" class="px-5 py-2.5 rounded-xl text-neutral-700 font-medium hover:bg-neutral-100 transition-all duration-200 svelte-1elxaub">Contactar</a> <a href="#contact" class="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2 group svelte-1elxaub">Demo Gratuita `);
  Arrow_right($$renderer, {
    class: "w-4 h-4 group-hover:translate-x-1 transition-transform"
  });
  $$renderer.push(`<!----></a></div> <button class="lg:hidden p-2.5 rounded-xl hover:bg-neutral-100 transition-colors text-neutral-700" aria-label="Toggle menu">`);
  {
    $$renderer.push("<!--[!-->");
    Menu($$renderer, { class: "w-6 h-6" });
  }
  $$renderer.push(`<!--]--></button></div></nav></header> `);
  {
    $$renderer.push("<!--[!-->");
  }
  $$renderer.push(`<!--]-->`);
}
function HeroSection($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let filesProcessed = 0;
    let validationRate = 0;
    let responseTime = 0;
    const trustBadges = [
      { icon: Shield, label: "SOC 2", status: "En proceso" },
      { icon: Award, label: "ISO 27001", status: "En proceso" },
      { icon: Circle_check_big, label: "CONSAR", status: "Certificado" }
    ];
    const stats = [
      { value: "99.9%", label: "Uptime SLA", icon: Trending_up },
      { value: "<3s", label: "Response Time", icon: Clock },
      { value: "30+", label: "Validaciones", icon: File_check },
      { value: "10K+", label: "Archivos/Mes", icon: Users }
    ];
    $$renderer2.push(`<section class="relative min-h-[70vh] flex items-center overflow-hidden pt-24 pb-12 px-4 md:px-8 svelte-tibptj"><div class="absolute inset-0 bg-gradient-to-br from-neutral-50 via-white to-primary/5 svelte-tibptj"></div> <div class="absolute inset-0 opacity-[0.03] svelte-tibptj" style="background-image: radial-gradient(circle at 1px 1px, rgb(0 102 255) 1px, transparent 0); background-size: 40px 40px;"></div> <div class="absolute top-20 right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse svelte-tibptj"></div> <div class="absolute bottom-20 left-20 w-96 h-96 bg-primary-dark/10 rounded-full blur-3xl animate-pulse delay-1000 svelte-tibptj"></div> <div class="container-custom relative z-10 svelte-tibptj"><div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center svelte-tibptj"><div${attr_class(`space-y-8 ${stringify("opacity-0")}`, "svelte-tibptj")}><div class="space-y-4 svelte-tibptj"><h1 class="text-5xl md:text-6xl lg:text-7xl font-bold text-primary-dark leading-[1.1] svelte-tibptj">Compliance <span class="block bg-gradient-to-r from-primary via-primary-dark to-primary bg-clip-text text-transparent svelte-tibptj">Automatizado</span> para AFOREs</h1> <p class="text-xl md:text-2xl text-neutral-600 leading-relaxed max-w-2xl svelte-tibptj">Valide archivos regulatorios en <span class="font-bold text-primary svelte-tibptj">&lt;3 segundos</span> con trazabilidad completa y disponibilidad garantizada. Cumplimiento CONSAR automatizado.</p></div> <div class="flex flex-col sm:flex-row gap-4 svelte-tibptj"><a href="#contact" class="group relative px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 overflow-hidden svelte-tibptj"><div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 svelte-tibptj"></div> <span class="relative z-10 svelte-tibptj">Solicitar Demo Gratuita</span> `);
    Arrow_right($$renderer2, {
      class: "w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform"
    });
    $$renderer2.push(`<!----></a> <a href="#how-it-works" class="px-8 py-4 bg-white border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-3 shadow-lg svelte-tibptj">Ver Cómo Funciona `);
    Zap($$renderer2, { class: "w-5 h-5" });
    $$renderer2.push(`<!----></a></div> <div class="pt-4 svelte-tibptj"><p class="text-sm text-neutral-500 font-medium mb-3 svelte-tibptj">CERTIFICACIONES Y COMPLIANCE</p> <div class="flex flex-wrap gap-4 svelte-tibptj"><!--[-->`);
    const each_array = ensure_array_like(trustBadges);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let badge = each_array[$$index];
      const BadgeIcon = badge.icon;
      $$renderer2.push(`<div class="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg shadow-sm hover:shadow-md transition-shadow svelte-tibptj"><!---->`);
      BadgeIcon($$renderer2, { class: "w-5 h-5 text-primary" });
      $$renderer2.push(`<!----> <div class="text-left svelte-tibptj"><div class="text-sm font-semibold text-neutral-900 svelte-tibptj">${escape_html(badge.label)}</div> <div${attr_class(`text-xs ${stringify(badge.status === "Certificado" ? "text-success" : "text-primary")}`, "svelte-tibptj")}>${escape_html(badge.status)}</div></div></div>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 svelte-tibptj"><!--[-->`);
    const each_array_1 = ensure_array_like(stats);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let stat = each_array_1[$$index_1];
      const StatIcon = stat.icon;
      $$renderer2.push(`<div class="p-4 bg-gradient-to-br from-white to-neutral-50 border border-neutral-200 rounded-xl shadow-sm hover:shadow-md transition-all hover:scale-105 svelte-tibptj"><!---->`);
      StatIcon($$renderer2, { class: "w-6 h-6 text-primary mb-2" });
      $$renderer2.push(`<!----> <div class="text-2xl font-bold text-primary-dark svelte-tibptj">${escape_html(stat.value)}</div> <div class="text-xs text-neutral-600 mt-1 svelte-tibptj">${escape_html(stat.label)}</div></div>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div${attr_class(`relative ${stringify("opacity-0")}`, "svelte-tibptj")}><div class="absolute -top-8 -left-8 w-24 h-24 bg-success/20 rounded-2xl backdrop-blur-sm border border-success/30 flex items-center justify-center shadow-xl animate-float svelte-tibptj">`);
    Circle_check_big($$renderer2, { class: "w-12 h-12 text-success" });
    $$renderer2.push(`<!----></div> <div class="absolute -bottom-8 -right-8 w-20 h-20 bg-primary/20 rounded-2xl backdrop-blur-sm border border-primary/30 flex items-center justify-center shadow-xl animate-float delay-500 svelte-tibptj">`);
    Shield($$renderer2, { class: "w-10 h-10 text-primary" });
    $$renderer2.push(`<!----></div> <div class="relative bg-gradient-to-br from-primary via-primary to-primary-dark rounded-3xl p-1 shadow-2xl svelte-tibptj"><div class="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark rounded-3xl blur-xl opacity-50 svelte-tibptj"></div> <div class="relative bg-white rounded-3xl p-6 md:p-8 space-y-6 svelte-tibptj"><div class="flex items-center justify-between pb-4 border-b border-neutral-200 svelte-tibptj"><div class="flex items-center gap-3 svelte-tibptj"><div class="w-3 h-3 bg-success rounded-full animate-pulse shadow-lg shadow-success/50 svelte-tibptj"></div> <span class="font-mono text-sm font-semibold text-neutral-900 svelte-tibptj">Sistema Activo</span></div> <div class="flex gap-2 svelte-tibptj"><div class="w-3 h-3 rounded-full bg-warning svelte-tibptj"></div> <div class="w-3 h-3 rounded-full bg-success svelte-tibptj"></div> <div class="w-3 h-3 rounded-full bg-primary svelte-tibptj"></div></div></div> <div class="space-y-3 svelte-tibptj"><div class="flex items-baseline justify-between svelte-tibptj"><span class="text-sm font-medium text-neutral-600 svelte-tibptj">Archivos Procesados Hoy</span> <div class="flex items-baseline gap-1 svelte-tibptj"><span class="text-4xl font-bold text-primary font-mono svelte-tibptj">${escape_html(filesProcessed)}</span> `);
    Trending_up($$renderer2, { class: "w-5 h-5 text-success mb-1" });
    $$renderer2.push(`<!----></div></div> <div class="relative h-3 bg-neutral-100 rounded-full overflow-hidden svelte-tibptj"><div class="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-1000 shadow-lg svelte-tibptj"${attr_style(`width: ${stringify(filesProcessed / 124 * 100)}%`)}></div> <div class="absolute inset-y-0 left-0 bg-gradient-to-r from-white/40 to-transparent rounded-full svelte-tibptj"${attr_style(`width: ${stringify(filesProcessed / 124 * 100)}%`)}></div></div></div> <div class="grid grid-cols-3 gap-4 svelte-tibptj"><div class="p-4 bg-gradient-to-br from-success/10 to-success/5 rounded-xl border border-success/20 svelte-tibptj"><div class="text-3xl font-bold text-success font-mono svelte-tibptj">${escape_html(validationRate)}%</div> <div class="text-xs text-neutral-600 mt-1 svelte-tibptj">Válidos</div> <div class="flex items-center gap-1 mt-2 svelte-tibptj"><div class="flex-1 h-1 bg-success/20 rounded-full svelte-tibptj"><div class="h-1 bg-success rounded-full transition-all duration-1000 svelte-tibptj"${attr_style(`width: ${stringify(validationRate)}%`)}></div></div></div></div> <div class="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 svelte-tibptj"><div class="text-3xl font-bold text-primary font-mono svelte-tibptj">${escape_html(responseTime)}s</div> <div class="text-xs text-neutral-600 mt-1 svelte-tibptj">Promedio</div> <div class="flex items-center gap-1 mt-2 svelte-tibptj">`);
    Clock($$renderer2, { class: "w-3 h-3 text-primary" });
    $$renderer2.push(`<!----> <span class="text-xs text-primary font-medium svelte-tibptj">Tiempo Real</span></div></div> <div class="p-4 bg-gradient-to-br from-warning/10 to-warning/5 rounded-xl border border-warning/20 svelte-tibptj"><div class="text-3xl font-bold text-warning font-mono svelte-tibptj">${escape_html(100 - validationRate)}%</div> <div class="text-xs text-neutral-600 mt-1 svelte-tibptj">Errores</div> <div class="flex items-center gap-1 mt-2 svelte-tibptj"><div class="flex-1 h-1 bg-warning/20 rounded-full svelte-tibptj"><div class="h-1 bg-warning rounded-full transition-all duration-1000 svelte-tibptj"${attr_style(`width: ${stringify(100 - validationRate)}%`)}></div></div></div></div></div> <div class="space-y-2 svelte-tibptj"><p class="text-xs font-semibold text-neutral-500 uppercase tracking-wider svelte-tibptj">Actividad Reciente</p> <div class="space-y-2 svelte-tibptj"><!--[-->`);
    const each_array_2 = ensure_array_like([
      { file: "AFORE_MX_001.csv", status: "success", time: "2m" },
      { file: "AFORE_MX_002.csv", status: "success", time: "5m" },
      { file: "AFORE_MX_003.csv", status: "warning", time: "8m" }
    ]);
    for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
      let activity = each_array_2[$$index_2];
      $$renderer2.push(`<div class="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors svelte-tibptj"><div class="flex items-center gap-3 svelte-tibptj"><div${attr_class(`w-2 h-2 rounded-full ${stringify(activity.status === "success" ? "bg-success" : "bg-warning")}`, "svelte-tibptj")}></div> <span class="text-sm font-mono text-neutral-700 svelte-tibptj">${escape_html(activity.file)}</span></div> <span class="text-xs text-neutral-500 svelte-tibptj">${escape_html(activity.time)}</span></div>`);
    }
    $$renderer2.push(`<!--]--></div></div></div></div></div></div></div></section>`);
  });
}
function ProblemSolutionSection($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let activeTab = "problem";
    const problemStats = [
      {
        icon: Clock,
        value: "48h",
        label: "Tiempo de validación",
        color: "warning",
        trend: "down"
      },
      {
        icon: Triangle_alert,
        value: "37%",
        label: "Tasa de error humano",
        color: "danger",
        trend: "down"
      },
      {
        icon: File_x,
        value: "$180K",
        label: "Costo anual operativo",
        color: "danger",
        trend: "down"
      },
      {
        icon: Trending_down,
        value: "0%",
        label: "Trazabilidad completa",
        color: "danger",
        trend: "down"
      }
    ];
    const problems = [
      {
        icon: Clock,
        title: "Procesos Manuales Lentos",
        description: "La validación manual de archivos regulatorios toma entre 24-48 horas por lote, creando cuellos de botella operativos.",
        impact: "Retrasos en reportes a CONSAR y riesgo de multas regulatorias"
      },
      {
        icon: Triangle_alert,
        title: "Alta Tasa de Error Humano",
        description: "Validaciones manuales tienen hasta 37% de error, especialmente en archivos con miles de registros y reglas complejas.",
        impact: "Rechazos de la CONSAR y reproceso costoso de archivos"
      },
      {
        icon: File_x,
        title: "Falta de Trazabilidad",
        description: "Sin event sourcing, es imposible reconstruir el estado histórico o auditar quién modificó qué y cuándo.",
        impact: "Incumplimiento de normativa de auditoría de 7 años"
      },
      {
        icon: Users,
        title: "Escalabilidad Limitada",
        description: "Crecer el equipo de validación es costoso y lento. No hay forma de procesar picos de 10K+ archivos/mes.",
        impact: "Costos operativos crecen linealmente con el volumen"
      }
    ];
    $$renderer2.push(`<section class="relative py-24 px-4 md:px-8 overflow-hidden bg-gradient-to-b from-white to-neutral-50"><div class="absolute inset-0 opacity-[0.03]"><div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div></div> <div class="container-custom relative z-10"><div${attr_class(`text-center mb-16 ${stringify("opacity-0")}`, "svelte-6fk6wl")}><div class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-warning/10 to-danger/10 border border-warning/20 rounded-full text-sm font-medium text-warning mb-4">`);
    Triangle_alert($$renderer2, { class: "w-4 h-4" });
    $$renderer2.push(`<!----> El costo de la validación manual</div> <h2 class="text-4xl md:text-5xl font-bold text-primary-dark mb-4">De Proceso Manual a <span class="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">Automatización Enterprise</span></h2> <p class="text-xl text-neutral-600 max-w-3xl mx-auto">Transforme 48 horas de validación manual en 3 segundos automatizados, con trazabilidad
				completa y 99.9% de precisión.</p></div> <div${attr_class(`flex justify-center mb-12 ${stringify("opacity-0")}`, "svelte-6fk6wl")}><div class="inline-flex bg-white rounded-2xl p-2 shadow-lg border border-neutral-200" role="tablist"><button${attr_class(`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${stringify(
      "bg-gradient-to-r from-warning/10 to-danger/10 text-warning shadow-md"
    )}`)} role="tab"${attr("aria-selected", activeTab === "problem")}><div class="flex items-center gap-2">`);
    X($$renderer2, { class: "w-5 h-5" });
    $$renderer2.push(`<!----> <span>El Problema</span></div></button> <button${attr_class(`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${stringify("text-neutral-600 hover:text-neutral-900")}`)} role="tab"${attr("aria-selected", activeTab === "solution")}><div class="flex items-center gap-2">`);
    Circle_check_big($$renderer2, { class: "w-5 h-5" });
    $$renderer2.push(`<!----> <span>La Solución</span></div></button></div></div> <div${attr_class(`mb-16 ${stringify("opacity-0")}`, "svelte-6fk6wl")}><div class="grid md:grid-cols-4 gap-6">`);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(problemStats);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let stat = each_array[$$index];
        const StatIcon = stat.icon;
        $$renderer2.push(`<div class="relative group p-6 bg-gradient-to-br from-white to-neutral-50 rounded-2xl border-2 border-danger/20 shadow-lg hover:shadow-xl transition-all duration-300"><div class="absolute inset-0 bg-gradient-to-br from-danger/5 to-warning/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div> <div class="relative"><div class="flex items-center justify-between mb-3"><div class="w-12 h-12 bg-danger/10 rounded-xl flex items-center justify-center"><!---->`);
        StatIcon($$renderer2, { class: "w-6 h-6 text-danger" });
        $$renderer2.push(`<!----></div> `);
        Trending_down($$renderer2, { class: "w-5 h-5 text-danger" });
        $$renderer2.push(`<!----></div> <div class="text-3xl font-bold text-danger mb-1">${escape_html(stat.value)}</div> <div class="text-sm text-neutral-600">${escape_html(stat.label)}</div></div></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></div> <div${attr_class(`space-y-6 ${stringify("opacity-0")}`, "svelte-6fk6wl")}>`);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<!--[-->`);
      const each_array_2 = ensure_array_like(problems);
      for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
        let problem = each_array_2[index];
        const ProblemIcon = problem.icon;
        $$renderer2.push(`<div class="group relative bg-white rounded-2xl p-8 border-2 border-neutral-200 hover:border-danger/30 shadow-lg hover:shadow-xl transition-all duration-300"${attr_style(`animation-delay: ${stringify(index * 100)}ms`)}><div class="absolute top-6 right-6 w-12 h-12 bg-danger/10 rounded-full flex items-center justify-center">`);
        X($$renderer2, { class: "w-6 h-6 text-danger" });
        $$renderer2.push(`<!----></div> <div class="flex gap-6 pr-16"><div class="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-danger/20 to-warning/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><!---->`);
        ProblemIcon($$renderer2, { class: "w-8 h-8 text-danger" });
        $$renderer2.push(`<!----></div> <div class="flex-1"><h3 class="text-2xl font-bold text-neutral-900 mb-3 group-hover:text-danger transition-colors">${escape_html(problem.title)}</h3> <p class="text-lg text-neutral-700 mb-4 leading-relaxed">${escape_html(problem.description)}</p> <div class="flex items-start gap-3 p-4 bg-danger/5 border-l-4 border-danger rounded-lg">`);
        Triangle_alert($$renderer2, { class: "w-5 h-5 text-danger flex-shrink-0 mt-0.5" });
        $$renderer2.push(`<!----> <div><p class="text-sm font-semibold text-danger mb-1">Impacto Real:</p> <p class="text-sm text-neutral-700">${escape_html(problem.impact)}</p></div></div></div></div></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div> <div${attr_class(`mt-16 text-center ${stringify("opacity-0")}`, "svelte-6fk6wl")}><div class="inline-block p-8 bg-gradient-to-br from-primary/5 to-success/5 rounded-2xl border border-primary/20"><p class="text-lg text-neutral-700 mb-6 max-w-2xl">`);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`¿Le suena familiar? <span class="font-bold text-primary">Más de 100 AFOREs</span> en Latinoamérica
						enfrentan estos desafíos diariamente.`);
    }
    $$renderer2.push(`<!--]--></p> <a href="#contact" class="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">`);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`Ver la Solución`);
    }
    $$renderer2.push(`<!--]--> `);
    Arrow_right($$renderer2, {
      class: "w-5 h-5 group-hover:translate-x-1 transition-transform"
    });
    $$renderer2.push(`<!----></a></div></div></div></section>`);
  });
}
function FeaturesSection($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let activeCategory = "all";
    const categories = [
      { id: "all", label: "Todas", icon: Sparkles },
      { id: "validation", label: "Validación", icon: Circle_check_big },
      { id: "infrastructure", label: "Infraestructura", icon: Cloud },
      { id: "security", label: "Seguridad", icon: Shield }
    ];
    const features = [
      {
        category: "validation",
        icon: Circle_check_big,
        badge: "Core",
        title: "Validación Automática Inteligente",
        description: "Sistema de validación con 30+ reglas base configurables que verifica cumplimiento CONSAR, estructura de archivos y detecta inconsistencias automáticamente. Se adapta a las necesidades específicas de su AFORE.",
        specs: [
          { label: "Validadores base", value: "30+", unit: "reglas" },
          { label: "Tiempo de ejecución", value: "<3", unit: "segundos" },
          { label: "Precisión", value: "99.9", unit: "%" },
          { label: "Concurrencia", value: "100", unit: "archivos" }
        ],
        techStack: [
          "Validación Automática",
          "Reglas de Negocio",
          "Detección Inteligente"
        ],
        highlights: [
          "Valida CSV, Excel y archivos de texto",
          "Reglas CONSAR actualizadas 2026",
          "Detecta errores e inconsistencias",
          "Sugerencias de corrección automáticas"
        ]
      },
      {
        category: "validation",
        icon: Zap,
        badge: "Performance",
        title: "Resultados Instantáneos",
        description: "Sistema que procesa sus archivos de forma inmediata y crece automáticamente con su volumen de operaciones, garantizando tiempos de respuesta consistentes sin importar la carga.",
        specs: [
          { label: "Latencia p95", value: "2.8", unit: "seg" },
          { label: "Latencia p99", value: "3.2", unit: "seg" },
          { label: "Throughput", value: "10K", unit: "archivos/mes" },
          { label: "Auto-scaling", value: "0-100", unit: "instancias" }
        ],
        techStack: ["Procesamiento Rápido", "Cola de Trabajo", "Optimización"],
        highlights: [
          "Procesa múltiples archivos simultáneamente",
          "Sistema resiliente ante fallos",
          "Optimización automática de resultados",
          "Protección contra interrupciones"
        ]
      },
      {
        category: "security",
        icon: Lock,
        badge: "Enterprise",
        title: "Trazabilidad Total & Auditoría",
        description: "Registro inmutable de todas las operaciones que permite reconstruir el histórico completo de actividades y cumplir con los requisitos de auditoría CONSAR de 7+ años.",
        specs: [
          { label: "Retención", value: "7+", unit: "años" },
          { label: "Eventos/día", value: "50K", unit: "eventos" },
          { label: "Almacenamiento", value: "Inmutable", unit: "" },
          { label: "Replay time", value: "<1", unit: "min" }
        ],
        techStack: [
          "Registro Permanente",
          "Almacenamiento Seguro",
          "Auditoría Completa"
        ],
        highlights: [
          "Registros que nunca se pueden modificar",
          "Consulte histórico de cualquier momento",
          "Sepa quién hizo qué y cuándo",
          "Cumplimiento CONSAR de 7+ años"
        ]
      },
      {
        category: "infrastructure",
        icon: Globe,
        badge: "Multi-Region",
        title: "Expansión Latinoamericana",
        description: "Sistema diseñado para operar en múltiples países, con soporte específico para las regulaciones de cada mercado, permitiendo expansión rápida y eficiente.",
        specs: [
          { label: "Países soportados", value: "4", unit: "países" },
          { label: "AFOREs activas", value: "2", unit: "clientes" },
          { label: "Reglas por país", value: "30+", unit: "validaciones" },
          { label: "Deployment", value: "Multi", unit: "region" }
        ],
        techStack: [
          "Aislamiento por Cliente",
          "Configuración Flexible",
          "Multi-idioma"
        ],
        highlights: [
          "México: CONSAR compliance completo",
          "Chile: SuperPensiones (roadmap Q2)",
          "Colombia: SuperFinanciera (roadmap Q3)",
          "Perú: SBS (roadmap Q4)"
        ]
      },
      {
        category: "validation",
        icon: Chart_column,
        badge: "Analytics",
        title: "Reportes e Inteligencia de Negocio",
        description: "Tableros de control en tiempo real con métricas operativas clave, análisis de tendencias y alertas tempranas basadas en su histórico de operaciones.",
        specs: [
          { label: "Actualización", value: "Real", unit: "time" },
          { label: "Métricas", value: "50+", unit: "KPIs" },
          { label: "Retención datos", value: "365", unit: "días" },
          { label: "Exportación", value: "CSV/Excel", unit: "" }
        ],
        techStack: [
          "Business Intelligence",
          "Cloud Analytics",
          "Custom Dashboards"
        ],
        highlights: [
          "Panel ejecutivo actualizado en tiempo real",
          "Identifique tendencias y anomalías",
          "Alertas tempranas de posibles problemas",
          "Reportes personalizados para su AFORE"
        ]
      },
      {
        category: "security",
        icon: Shield,
        badge: "Compliance",
        title: "Seguridad Bancaria",
        description: "Protección de múltiples capas con encriptación total de datos, aislamiento completo entre clientes y cumplimiento de estándares internacionales de seguridad.",
        specs: [
          { label: "Encriptación", value: "AES-256", unit: "" },
          { label: "TLS", value: "1.3", unit: "protocol" },
          { label: "Key rotation", value: "90", unit: "días" },
          { label: "Pen testing", value: "Trimestral", unit: "" }
        ],
        techStack: [
          "Gestión de Claves",
          "Inicio de Sesión Único",
          "Aislamiento de Datos"
        ],
        highlights: [
          "Certificación SOC 2 (en proceso Q2 2026)",
          "Certificación ISO 27001 (en proceso Q4 2026)",
          "Sus datos completamente aislados",
          "Pruebas de seguridad trimestrales"
        ]
      },
      {
        category: "infrastructure",
        icon: Cloud,
        badge: "Cloud Native",
        title: "Infraestructura Confiable",
        description: "Infraestructura en la nube con alta disponibilidad (99.9%), recuperación automática ante desastres y capacidad de crecimiento sin límites.",
        specs: [
          { label: "Uptime SLA", value: "99.9", unit: "%" },
          { label: "RPO", value: "<1", unit: "hora" },
          { label: "RTO", value: "<4", unit: "horas" },
          { label: "Backups", value: "Diario", unit: "" }
        ],
        techStack: [
          "Servicios en la Nube",
          "Base de Datos",
          "Procesamiento Automático"
        ],
        highlights: [
          "Operación en múltiples regiones",
          "Crece automáticamente según demanda",
          "Recuperación automática ante fallas",
          "99.9% disponibilidad garantizada"
        ]
      },
      {
        category: "infrastructure",
        icon: Database,
        badge: "Data",
        title: "Respaldo y Protección de Datos",
        description: "Almacenamiento seguro en la nube con respaldos automáticos diarios, encriptación y retención de datos según normativa CONSAR.",
        specs: [
          { label: "Retención", value: "7+", unit: "años" },
          { label: "Backup", value: "Diario", unit: "" },
          { label: "Encriptación", value: "AES-256", unit: "" },
          { label: "Redundancia", value: "Multi", unit: "región" }
        ],
        techStack: [
          "Almacenamiento Seguro",
          "Respaldos Automáticos",
          "Encriptación de Datos"
        ],
        highlights: [
          "Sus datos completamente separados",
          "Respaldos automáticos encriptados",
          "Retención de 7+ años (normativa CONSAR)",
          "Recuperación garantizada ante desastres"
        ]
      }
    ];
    let filteredFeatures = features;
    $$renderer2.push(`<section id="features" class="relative py-24 px-4 md:px-8 bg-gradient-to-b from-neutral-50 to-white overflow-hidden"><div class="absolute inset-0 opacity-[0.02]"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgb(0 102 255) 1px, transparent 0); background-size: 40px 40px;"></div></div> <div class="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div> <div class="absolute bottom-0 left-0 w-96 h-96 bg-success/10 rounded-full blur-3xl"></div> <div class="container-custom relative z-10"><div${attr_class(`text-center mb-16 ${stringify("opacity-0")}`, "svelte-qt5iw6")}><div class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-success/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-4">`);
    Sparkles($$renderer2, { class: "w-4 h-4" });
    $$renderer2.push(`<!----> Características Enterprise</div> <h2 class="text-4xl md:text-5xl font-bold text-primary-dark mb-4">Plataforma Completa para <span class="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">Compliance Automatizado</span></h2> <p class="text-xl text-neutral-600 max-w-3xl mx-auto">8 módulos core diseñados para instituciones financieras que requieren máxima seguridad,
				trazabilidad y cumplimiento normativo garantizado.</p></div> <div${attr_class(`flex justify-center mb-12 ${stringify("opacity-0")}`, "svelte-qt5iw6")}><div class="inline-flex flex-wrap gap-3 p-2 bg-white rounded-2xl shadow-lg border border-neutral-200"><!--[-->`);
    const each_array = ensure_array_like(categories);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let category = each_array[$$index];
      const CategoryIcon = category.icon;
      $$renderer2.push(`<button${attr_class(`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${stringify(activeCategory === category.id ? "bg-gradient-to-r from-primary to-primary-dark text-white shadow-md scale-105" : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50")}`)}><!---->`);
      CategoryIcon($$renderer2, { class: "w-5 h-5" });
      $$renderer2.push(`<!----> <span>${escape_html(category.label)}</span> `);
      if (category.id === "all") {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span class="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">${escape_html(features.length)}</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<span class="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">${escape_html(features.filter((f) => f.category === category.id).length)}</span>`);
      }
      $$renderer2.push(`<!--]--></button>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div${attr_class(`grid md:grid-cols-2 gap-8 ${stringify("opacity-0")}`, "svelte-qt5iw6")}><!--[-->`);
    const each_array_1 = ensure_array_like(filteredFeatures);
    for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
      let feature = each_array_1[index];
      const FeatureIcon = feature.icon;
      $$renderer2.push(`<div class="group relative bg-white rounded-3xl p-8 border-2 border-neutral-200 hover:border-primary/30 shadow-lg hover:shadow-2xl transition-all duration-500"${attr_style(`animation-delay: ${stringify(index * 50)}ms`)}><div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-success/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div> <div class="relative"><div class="flex items-start justify-between mb-6"><div class="flex items-center gap-4"><div class="w-16 h-16 bg-gradient-to-br from-primary/20 to-success/20 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"><!---->`);
      FeatureIcon($$renderer2, { class: "w-8 h-8 text-primary" });
      $$renderer2.push(`<!----></div> <div><div class="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-2">${escape_html(feature.badge)}</div> <h3 class="text-2xl font-bold text-neutral-900 group-hover:text-primary transition-colors">${escape_html(feature.title)}</h3></div></div></div> <p class="text-neutral-600 leading-relaxed mb-6">${escape_html(feature.description)}</p> <div class="grid grid-cols-2 gap-4 mb-6 p-4 bg-neutral-50 rounded-xl"><!--[-->`);
      const each_array_2 = ensure_array_like(feature.specs);
      for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
        let spec = each_array_2[$$index_1];
        $$renderer2.push(`<div class="text-center"><div class="text-2xl font-bold text-primary mb-1">${escape_html(spec.value)}<span class="text-sm text-neutral-500 ml-1">${escape_html(spec.unit)}</span></div> <div class="text-xs text-neutral-600">${escape_html(spec.label)}</div></div>`);
      }
      $$renderer2.push(`<!--]--></div> <div class="mb-6"><div class="flex items-center gap-2 mb-3">`);
      Code($$renderer2, { class: "w-4 h-4 text-neutral-500" });
      $$renderer2.push(`<!----> <span class="text-sm font-semibold text-neutral-700">Stack Tecnológico:</span></div> <div class="flex flex-wrap gap-2"><!--[-->`);
      const each_array_3 = ensure_array_like(feature.techStack);
      for (let $$index_2 = 0, $$length2 = each_array_3.length; $$index_2 < $$length2; $$index_2++) {
        let tech = each_array_3[$$index_2];
        $$renderer2.push(`<span class="px-3 py-1 bg-gradient-to-r from-neutral-100 to-neutral-50 border border-neutral-200 text-neutral-700 text-xs font-mono rounded-lg">${escape_html(tech)}</span>`);
      }
      $$renderer2.push(`<!--]--></div></div> <div><div class="flex items-center gap-2 mb-3">`);
      Sparkles($$renderer2, { class: "w-4 h-4 text-success" });
      $$renderer2.push(`<!----> <span class="text-sm font-semibold text-neutral-700">Características Clave:</span></div> <ul class="space-y-2"><!--[-->`);
      const each_array_4 = ensure_array_like(feature.highlights);
      for (let $$index_3 = 0, $$length2 = each_array_4.length; $$index_3 < $$length2; $$index_3++) {
        let highlight = each_array_4[$$index_3];
        $$renderer2.push(`<li class="flex items-start gap-2 text-sm text-neutral-600">`);
        Circle_check_big($$renderer2, { class: "w-4 h-4 text-success flex-shrink-0 mt-0.5" });
        $$renderer2.push(`<!----> <span>${escape_html(highlight)}</span></li>`);
      }
      $$renderer2.push(`<!--]--></ul></div> <div class="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0"><div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center">`);
      Arrow_right($$renderer2, { class: "w-5 h-5 text-white" });
      $$renderer2.push(`<!----></div></div></div></div>`);
    }
    $$renderer2.push(`<!--]--></div> <div${attr_class(`mt-16 ${stringify("opacity-0")}`, "svelte-qt5iw6")}><div class="grid md:grid-cols-4 gap-6"><div class="text-center p-6 bg-gradient-to-br from-white to-neutral-50 rounded-2xl border border-neutral-200 shadow-md"><div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">`);
    Cpu($$renderer2, { class: "w-6 h-6 text-primary" });
    $$renderer2.push(`<!----></div> <div class="text-3xl font-bold text-primary mb-1">37</div> <div class="text-sm text-neutral-600">Validadores Activos</div></div> <div class="text-center p-6 bg-gradient-to-br from-white to-neutral-50 rounded-2xl border border-neutral-200 shadow-md"><div class="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-4">`);
    Activity($$renderer2, { class: "w-6 h-6 text-success" });
    $$renderer2.push(`<!----></div> <div class="text-3xl font-bold text-success mb-1">99.9%</div> <div class="text-sm text-neutral-600">Precisión Garantizada</div></div> <div class="text-center p-6 bg-gradient-to-br from-white to-neutral-50 rounded-2xl border border-neutral-200 shadow-md"><div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">`);
    Server($$renderer2, { class: "w-6 h-6 text-primary" });
    $$renderer2.push(`<!----></div> <div class="text-3xl font-bold text-primary mb-1">&lt;3s</div> <div class="text-sm text-neutral-600">Tiempo de Respuesta</div></div> <div class="text-center p-6 bg-gradient-to-br from-white to-neutral-50 rounded-2xl border border-neutral-200 shadow-md"><div class="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-4">`);
    Hard_drive($$renderer2, { class: "w-6 h-6 text-success" });
    $$renderer2.push(`<!----></div> <div class="text-3xl font-bold text-success mb-1">7+</div> <div class="text-sm text-neutral-600">Años Retención</div></div></div></div> <div${attr_class(`mt-12 text-center ${stringify("opacity-0")}`, "svelte-qt5iw6")}><a href="#contact" class="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"><span>Ver Demo de Plataforma Completa</span> `);
    Arrow_right($$renderer2, {
      class: "w-5 h-5 group-hover:translate-x-1 transition-transform"
    });
    $$renderer2.push(`<!----></a></div></div></section>`);
  });
}
function HowItWorksSection($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let activeStep = 0;
    const steps = [
      {
        id: 0,
        number: "01",
        title: "Carga de Archivos",
        icon: Upload,
        color: "primary",
        description: "Suba sus archivos regulatorios de forma segura mediante nuestra interfaz web o integración automática. Soportamos todos los formatos requeridos por CONSAR.",
        details: {
          methods: [
            {
              name: "API REST",
              endpoint: "POST /api/v1/files/upload",
              auth: "OAuth 2.0 + JWT"
            },
            {
              name: "Web Upload",
              description: "Drag & drop interface",
              maxSize: "100MB"
            },
            {
              name: "SFTP",
              description: "Batch upload nocturno",
              schedule: "Automatizado"
            }
          ],
          formats: ["CSV", "Excel (.xlsx)", "XML", "Fixed-width text"],
          validation: "Validación de formato previo a procesamiento",
          encryption: "TLS 1.3 en tránsito, AES-256 en reposo"
        },
        metrics: [
          { label: "Max file size", value: "100MB", icon: File_text },
          { label: "Concurrent uploads", value: "100", icon: Upload },
          { label: "Upload speed", value: "~5s", icon: Trending_up }
        ],
        codeExample: `POST /api/v1/files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "file": <binary>,
  "afore_id": "AFORE_001",
  "file_type": "CONSAR_LAYOUT_01",
  "metadata": {
    "period": "2026-01",
    "fund_id": "F001"
  }
}`
      },
      {
        id: 1,
        number: "02",
        title: "Validación Paralela",
        icon: Zap,
        color: "warning",
        description: "Más de 30 validaciones se ejecutan simultáneamente, verificando la estructura del archivo, datos y cumplimiento normativo en segundos. El sistema se adapta a nuevas regulaciones de forma automática.",
        details: {
          validators: [
            {
              category: "Estructural",
              count: 12,
              description: "Formato, columnas, tipos de dato"
            },
            {
              category: "Negocio",
              count: 18,
              description: "Reglas CONSAR, rangos válidos, coherencia"
            },
            {
              category: "Anomalías",
              count: 7,
              description: "Detección ML de patrones inusuales"
            }
          ],
          architecture: "Sistema en la nube con procesamiento simultáneo",
          scaling: "Crece automáticamente según su demanda",
          errorHandling: "Reintentos automáticos y protección contra errores"
        },
        metrics: [
          { label: "Validadores base", value: "30+", icon: Cpu },
          { label: "Ejecución paralela", value: "100%", icon: Activity },
          { label: "Latencia p95", value: "2.8s", icon: Clock }
        ],
        codeExample: `// Sistema de validación automática
Ejecuta validaciones en paralelo:
- Estructura del archivo (formato y columnas)
- Reglas de negocio CONSAR
- Detección de inconsistencias

Resultado en tiempo real:
✓ 34 validaciones exitosas
✗ 1 error detectado
⚡ Tiempo total: 2.4 segundos`
      },
      {
        id: 2,
        number: "03",
        title: "Generación de Resultados",
        icon: File_check,
        color: "success",
        description: "Reporte detallado con errores identificados, sugerencias de corrección automáticas, y certificación de cumplimiento listo para envío a CONSAR.",
        details: {
          reportTypes: [
            {
              name: "Reporte Ejecutivo",
              format: "PDF",
              content: "Resumen de validación + métricas"
            },
            {
              name: "Reporte Técnico",
              format: "Excel",
              content: "Errores detallados línea por línea"
            },
            {
              name: "Certificado Compliance",
              format: "PDF firmado",
              content: "Validación CONSAR oficial"
            },
            {
              name: "API Response",
              format: "JSON",
              content: "Integración programática"
            }
          ],
          features: [
            "Identificación exacta de errores (línea, columna)",
            "Sugerencias de corrección automáticas",
            "Histórico de validaciones previas",
            "Comparativa con períodos anteriores"
          ]
        },
        metrics: [
          { label: "Tiempo reporte", value: "<1s", icon: Clock },
          { label: "Formatos export", value: "4", icon: Download },
          { label: "Retención", value: "7 años", icon: Database }
        ],
        codeExample: `// Respuesta JSON de validación
{
  "file_id": "f_abc123",
  "status": "completed",
  "validation": {
    "passed": true,
    "score": 98.5,
    "errors": [
      {
        "line": 145,
        "column": "fecha_nacimiento",
        "error": "Formato inválido",
        "suggestion": "Usar YYYY-MM-DD"
      }
    ],
    "warnings": 3,
    "processing_time": "2.4s"
  },
  "reports": {
    "executive_pdf": "/reports/exec_abc123.pdf",
    "technical_xlsx": "/reports/tech_abc123.xlsx",
    "certificate": "/reports/cert_abc123.pdf"
  }
}`
      },
      {
        id: 3,
        number: "04",
        title: "Envío y Trazabilidad",
        icon: Send,
        color: "primary",
        description: "Event sourcing inmutable registra cada operación para auditoría completa. Envío automático a CONSAR con tracking de estado en tiempo real.",
        details: {
          eventSourcing: [
            "Cada evento almacenado inmutablemente",
            "Reconstrucción de estado en cualquier momento",
            "Auditoría completa con usuario/timestamp",
            "Retención 7+ años cumplimiento CONSAR"
          ],
          integrations: [
            { name: "CONSAR API", status: "Activo", protocol: "SOAP/REST" },
            {
              name: "Email notifications",
              status: "Configurable",
              format: "HTML + PDF"
            },
            {
              name: "Webhook callbacks",
              status: "Opcional",
              format: "JSON"
            },
            {
              name: "Dashboard real-time",
              status: "Incluido",
              tech: "WebSocket"
            }
          ],
          tracking: "Estado en tiempo real con notificaciones push"
        },
        metrics: [
          { label: "Eventos/día", value: "50K", icon: Activity },
          { label: "Retención", value: "7+ años", icon: Shield },
          { label: "Uptime SLA", value: "99.9%", icon: Trending_up }
        ],
        codeExample: `// Event Sourcing - Evento inmutable
{
  "event_id": "evt_xyz789",
  "event_type": "FILE_VALIDATED",
  "timestamp": "2026-01-20T10:30:45Z",
  "user_id": "user_123",
  "afore_id": "AFORE_001",
  "payload": {
    "file_id": "f_abc123",
    "validation_result": "passed",
    "score": 98.5
  },
  "metadata": {
    "ip": "192.168.1.1",
    "user_agent": "Hergon Client v1.0"
  }
}

// Envío automático a CONSAR
await consarAPI.submitFile({
  file: validatedFile,
  certificate: complianceCert,
  tracking_id: "track_xyz"
});`
      }
    ];
    $$renderer2.push(`<section id="how-it-works" class="relative py-24 px-4 md:px-8 bg-gradient-to-b from-white via-neutral-50 to-white overflow-hidden"><div class="absolute inset-0 opacity-[0.02]"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgb(0 102 255) 1px, transparent 0); background-size: 40px 40px;"></div></div> <div class="container-custom relative z-10"><div${attr_class(
      `text-center mb-16 ${stringify(
        // Cleanup on component destroy
        "opacity-0"
      )}`,
      "svelte-15zojh2"
    )}><div class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-success/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-4">`);
    Activity($$renderer2, { class: "w-4 h-4" });
    $$renderer2.push(`<!----> Proceso Automatizado</div> <h2 class="text-4xl md:text-5xl font-bold text-primary-dark mb-4">De Archivo a <span class="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">Certificación CONSAR</span> en 3 Segundos</h2> <p class="text-xl text-neutral-600 max-w-3xl mx-auto">4 pasos automatizados con event sourcing, validación paralela, y trazabilidad completa.
				Cada operación auditada y certificada.</p></div> <div${attr_class(`flex justify-center mb-12 ${stringify("opacity-0")}`, "svelte-15zojh2")}><button class="flex items-center gap-2 px-6 py-3 bg-white border-2 border-primary/20 rounded-xl hover:border-primary/40 transition-all shadow-md hover:shadow-lg">`);
    Circle_play($$renderer2, {
      class: `w-5 h-5 ${stringify("text-primary")}`
    });
    $$renderer2.push(`<!----> <span class="font-semibold text-neutral-700">${escape_html("Iniciar Auto-play")}</span></button></div> <div${attr_class(`mb-16 ${stringify("opacity-0")}`, "svelte-15zojh2")}><div class="relative flex items-center justify-between max-w-4xl mx-auto"><div class="absolute top-1/2 left-0 right-0 h-1 bg-neutral-200 -translate-y-1/2 rounded-full"></div> <div class="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-primary to-success -translate-y-1/2 rounded-full transition-all duration-500"${attr_style(`width: ${stringify(activeStep / (steps.length - 1) * 100)}%`)}></div> <!--[-->`);
    const each_array = ensure_array_like(steps);
    for (let index = 0, $$length = each_array.length; index < $$length; index++) {
      let step = each_array[index];
      const StepIcon = step.icon;
      $$renderer2.push(`<button${attr_class(`relative z-10 group flex flex-col items-center gap-2 transition-all ${stringify(index <= activeStep ? "scale-110" : "")}`)}><div${attr_class(`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${stringify(index <= activeStep ? "bg-gradient-to-br from-primary to-success border-white shadow-xl" : "bg-white border-neutral-300 group-hover:border-primary/30")}`)}><!---->`);
      StepIcon($$renderer2, {
        class: `w-7 h-7 ${stringify(index <= activeStep ? "text-white" : "text-neutral-400 group-hover:text-primary")}`
      });
      $$renderer2.push(`<!----></div> <span${attr_class(`text-sm font-semibold ${stringify(index <= activeStep ? "text-primary" : "text-neutral-400")} hidden md:block`)}>${escape_html(step.number)}</span></button>`);
    }
    $$renderer2.push(`<!--]--></div></div> <!--[-->`);
    const each_array_1 = ensure_array_like(steps);
    for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
      let step = each_array_1[index];
      if (activeStep === index) {
        $$renderer2.push("<!--[-->");
        const StepIcon = step.icon;
        $$renderer2.push(`<div class="animate-fade-in-up svelte-15zojh2"><div${attr_class(`grid lg:grid-cols-2 gap-12 items-start bg-white rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-${stringify(step.color)}/20`, "svelte-15zojh2")}><div class="space-y-8"><div><div${attr_class(`inline-flex items-center gap-3 px-4 py-2 bg-${stringify(step.color)}/10 rounded-full mb-4`, "svelte-15zojh2")}><span${attr_class(`text-3xl font-bold text-${stringify(step.color)}`, "svelte-15zojh2")}>${escape_html(step.number)}</span> <div${attr_class(`w-1 h-6 bg-${stringify(step.color)}/30 rounded-full`, "svelte-15zojh2")}></div> <!---->`);
        StepIcon($$renderer2, { class: `w-6 h-6 text-${stringify(step.color)}` });
        $$renderer2.push(`<!----></div> <h3 class="text-4xl font-bold text-neutral-900 mb-4">${escape_html(step.title)}</h3> <p class="text-lg text-neutral-600 leading-relaxed">${escape_html(step.description)}</p></div> <div class="grid grid-cols-3 gap-4"><!--[-->`);
        const each_array_2 = ensure_array_like(step.metrics);
        for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
          let metric = each_array_2[$$index_1];
          const MetricIcon = metric.icon;
          $$renderer2.push(`<div${attr_class(`p-4 bg-gradient-to-br from-${stringify(step.color)}/5 to-${stringify(step.color)}/10 rounded-xl border border-${stringify(step.color)}/20`, "svelte-15zojh2")}><!---->`);
          MetricIcon($$renderer2, { class: `w-6 h-6 text-${stringify(step.color)} mb-2` });
          $$renderer2.push(`<!----> <div${attr_class(`text-2xl font-bold text-${stringify(step.color)} mb-1`, "svelte-15zojh2")}>${escape_html(metric.value)}</div> <div class="text-xs text-neutral-600">${escape_html(metric.label)}</div></div>`);
        }
        $$renderer2.push(`<!--]--></div> <div class="space-y-6">`);
        if (step.details.methods) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div><h4 class="font-semibold text-neutral-900 mb-3 flex items-center gap-2">`);
          Upload($$renderer2, { class: `w-5 h-5 text-${stringify(step.color)}` });
          $$renderer2.push(`<!----> Métodos de Carga</h4> <div class="space-y-2"><!--[-->`);
          const each_array_3 = ensure_array_like(step.details.methods);
          for (let $$index_2 = 0, $$length2 = each_array_3.length; $$index_2 < $$length2; $$index_2++) {
            let method = each_array_3[$$index_2];
            $$renderer2.push(`<div${attr_class(`p-3 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-${stringify(step.color)}/30 transition-colors`, "svelte-15zojh2")}><div class="font-semibold text-neutral-900 text-sm">${escape_html(method.name)}</div> <div class="text-xs text-neutral-600">${escape_html(method.endpoint || method.description || "")} `);
            if (method.auth) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`• ${escape_html(method.auth)}`);
            } else {
              $$renderer2.push("<!--[!-->");
            }
            $$renderer2.push(`<!--]--> `);
            if (method.maxSize) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`• Max: ${escape_html(method.maxSize)}`);
            } else {
              $$renderer2.push("<!--[!-->");
            }
            $$renderer2.push(`<!--]--></div></div>`);
          }
          $$renderer2.push(`<!--]--></div></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> `);
        if (step.details.validators) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div><h4 class="font-semibold text-neutral-900 mb-3 flex items-center gap-2">`);
          Cpu($$renderer2, { class: `w-5 h-5 text-${stringify(step.color)}` });
          $$renderer2.push(`<!----> Categorías de Validación</h4> <div class="space-y-2"><!--[-->`);
          const each_array_4 = ensure_array_like(step.details.validators);
          for (let $$index_3 = 0, $$length2 = each_array_4.length; $$index_3 < $$length2; $$index_3++) {
            let validator = each_array_4[$$index_3];
            $$renderer2.push(`<div${attr_class(`p-3 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-${stringify(step.color)}/30 transition-colors`, "svelte-15zojh2")}><div class="flex items-center justify-between mb-1"><span class="font-semibold text-neutral-900 text-sm">${escape_html(validator.category)}</span> <span${attr_class(`px-2 py-0.5 bg-${stringify(step.color)}/10 text-${stringify(step.color)} text-xs font-bold rounded-full`, "svelte-15zojh2")}>${escape_html(validator.count)} reglas</span></div> <div class="text-xs text-neutral-600">${escape_html(validator.description)}</div></div>`);
          }
          $$renderer2.push(`<!--]--></div></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> `);
        if (step.details.reportTypes) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div><h4 class="font-semibold text-neutral-900 mb-3 flex items-center gap-2">`);
          File_check($$renderer2, { class: `w-5 h-5 text-${stringify(step.color)}` });
          $$renderer2.push(`<!----> Tipos de Reporte</h4> <div class="grid grid-cols-2 gap-2"><!--[-->`);
          const each_array_5 = ensure_array_like(step.details.reportTypes);
          for (let $$index_4 = 0, $$length2 = each_array_5.length; $$index_4 < $$length2; $$index_4++) {
            let report = each_array_5[$$index_4];
            $$renderer2.push(`<div${attr_class(`p-3 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-${stringify(step.color)}/30 transition-colors`, "svelte-15zojh2")}><div class="font-semibold text-neutral-900 text-sm">${escape_html(report.name)}</div> <div${attr_class(`text-xs text-${stringify(step.color)} font-medium`, "svelte-15zojh2")}>${escape_html(report.format)}</div></div>`);
          }
          $$renderer2.push(`<!--]--></div></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> `);
        if (step.details.eventSourcing) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div><h4 class="font-semibold text-neutral-900 mb-3 flex items-center gap-2">`);
          Database($$renderer2, { class: `w-5 h-5 text-${stringify(step.color)}` });
          $$renderer2.push(`<!----> Event Sourcing</h4> <ul class="space-y-2"><!--[-->`);
          const each_array_6 = ensure_array_like(step.details.eventSourcing);
          for (let $$index_5 = 0, $$length2 = each_array_6.length; $$index_5 < $$length2; $$index_5++) {
            let feature = each_array_6[$$index_5];
            $$renderer2.push(`<li class="flex items-start gap-2 text-sm text-neutral-600">`);
            Circle_check_big($$renderer2, {
              class: `w-4 h-4 text-${stringify(step.color)} flex-shrink-0 mt-0.5`
            });
            $$renderer2.push(`<!----> <span>${escape_html(feature)}</span></li>`);
          }
          $$renderer2.push(`<!--]--></ul></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div></div> <div class="space-y-6"><div><h4 class="font-semibold text-neutral-900 mb-3 flex items-center gap-2">`);
        Code($$renderer2, { class: `w-5 h-5 text-${stringify(step.color)}` });
        $$renderer2.push(`<!----> Ejemplo Técnico</h4> <div class="relative"><pre${attr_class(`p-6 bg-neutral-900 text-neutral-100 rounded-2xl overflow-x-auto text-sm leading-relaxed font-mono border-2 border-${stringify(step.color)}/30 shadow-xl`, "svelte-15zojh2")}><code class="svelte-15zojh2">${escape_html(step.codeExample)}</code></pre> <div${attr_class(`absolute top-4 right-4 px-3 py-1 bg-${stringify(step.color)}/20 backdrop-blur-sm text-${stringify(step.color)} text-xs font-semibold rounded-full`, "svelte-15zojh2")}>`);
        if (index === 0) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`REST API`);
        } else {
          $$renderer2.push("<!--[!-->");
          if (index === 1) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`JavaScript`);
          } else {
            $$renderer2.push("<!--[!-->");
            if (index === 2) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`JSON Response`);
            } else {
              $$renderer2.push("<!--[!-->");
              $$renderer2.push(`Event Store`);
            }
            $$renderer2.push(`<!--]-->`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]--></div></div></div> <div${attr_class(`p-6 bg-gradient-to-br from-${stringify(step.color)}/5 to-${stringify(step.color)}/10 rounded-2xl border border-${stringify(step.color)}/20`, "svelte-15zojh2")}><div class="flex items-start gap-3">`);
        Circle_alert($$renderer2, {
          class: `w-6 h-6 text-${stringify(step.color)} flex-shrink-0 mt-1`
        });
        $$renderer2.push(`<!----> <div><h5 class="font-semibold text-neutral-900 mb-2">Nota Técnica</h5> <p class="text-sm text-neutral-600 leading-relaxed">`);
        if (index === 0) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`Los archivos son validados preliminarmente al momento de carga para detectar
												problemas de formato antes del procesamiento completo.`);
        } else {
          $$renderer2.push("<!--[!-->");
          if (index === 1) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`El procesamiento paralelo permite validar archivos grandes en segundos,
												escalando automáticamente según la carga.`);
          } else {
            $$renderer2.push("<!--[!-->");
            if (index === 2) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`Todos los reportes incluyen links directos a la documentación CONSAR
												relevante para cada error detectado.`);
            } else {
              $$renderer2.push("<!--[!-->");
              $$renderer2.push(`Cada evento es criptográficamente firmado y almacenado inmutablemente,
												garantizando integridad para auditorías.`);
            }
            $$renderer2.push(`<!--]-->`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]--></p></div></div></div></div></div> <div class="flex justify-center gap-4 mt-8"><button class="px-6 py-3 bg-white border-2 border-neutral-200 rounded-xl hover:border-primary/40 transition-all font-semibold text-neutral-700 flex items-center gap-2 shadow-md hover:shadow-lg">`);
        Arrow_right($$renderer2, { class: "w-5 h-5 rotate-180" });
        $$renderer2.push(`<!----> Anterior</button> <button class="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105">Siguiente `);
        Arrow_right($$renderer2, { class: "w-5 h-5" });
        $$renderer2.push(`<!----></button></div></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--> <div${attr_class(`mt-16 text-center ${stringify("opacity-0")}`, "svelte-15zojh2")}><div class="inline-block p-8 bg-gradient-to-br from-primary/5 to-success/5 rounded-2xl border border-primary/20"><p class="text-lg text-neutral-700 mb-6 max-w-2xl"><span class="font-bold text-primary">100% automatizado</span> - Sin intervención manual.
					De archivo cargado a certificado CONSAR en menos de 3 segundos.</p> <a href="#contact" class="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"><span>Ver Demo en Vivo del Proceso</span> `);
    Arrow_right($$renderer2, {
      class: "w-5 h-5 group-hover:translate-x-1 transition-transform"
    });
    $$renderer2.push(`<!----></a></div></div></div></section>`);
  });
}
function MetricsSection($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let activeMetricIndex = 0;
    let uptimeValue = 0;
    let responseTime = 0;
    let filesPerMonth = 0;
    const keyMetrics = [
      {
        icon: Trending_up,
        label: "Uptime SLA",
        value: "99.9%",
        description: "Disponibilidad garantizada",
        detail: "Solo 8.76 horas de downtime al año",
        color: "success",
        comparison: { before: "95%", after: "99.9%", improvement: "+5%" }
      },
      {
        icon: Clock,
        label: "Response Time",
        value: "<3s",
        description: "Latencia p95",
        detail: "2.8s promedio de procesamiento",
        color: "primary",
        comparison: { before: "48h", after: "<3s", improvement: "99.9%" }
      },
      {
        icon: Circle_check_big,
        label: "Validaciones",
        value: "37",
        description: "Reglas automatizadas",
        detail: "Cobertura completa CONSAR 2026",
        color: "warning",
        comparison: { before: "12", after: "37", improvement: "+208%" }
      },
      {
        icon: Activity,
        label: "Archivos/Mes",
        value: "10K+",
        description: "Throughput mensual",
        detail: "Escalable a 100K+ con auto-scaling",
        color: "primary",
        comparison: { before: "500", after: "10K+", improvement: "+1900%" }
      }
    ];
    const impactMetrics = [
      {
        category: "Eficiencia Operativa",
        icon: Zap,
        metrics: [
          {
            name: "Reducción de tiempo",
            before: "48 horas",
            after: "<3 segundos",
            saving: "99.9%",
            icon: Clock
          },
          {
            name: "Archivos procesados",
            before: "500/mes",
            after: "10K+/mes",
            saving: "+1900%",
            icon: Activity
          },
          {
            name: "Personal requerido",
            before: "5 FTE",
            after: "1 FTE",
            saving: "80%",
            icon: Users
          }
        ]
      },
      {
        category: "Calidad y Precisión",
        icon: Target,
        metrics: [
          {
            name: "Tasa de error",
            before: "37%",
            after: "0.1%",
            saving: "99.7%",
            icon: Circle_alert
          },
          {
            name: "Precisión validación",
            before: "63%",
            after: "99.9%",
            saving: "+58%",
            icon: Circle_check_big
          },
          {
            name: "Rechazos CONSAR",
            before: "23/mes",
            after: "0.2/mes",
            saving: "99%",
            icon: Shield
          }
        ]
      },
      {
        category: "Costos y ROI",
        icon: Dollar_sign,
        metrics: [
          {
            name: "Costo anual",
            before: "$180K",
            after: "$25K",
            saving: "86%",
            icon: Dollar_sign
          },
          {
            name: "Costo por archivo",
            before: "$360",
            after: "$2.50",
            saving: "99.3%",
            icon: Chart_column
          },
          {
            name: "ROI año 1",
            before: "N/A",
            after: "520%",
            saving: "Positivo",
            icon: Trending_up
          }
        ]
      }
    ];
    const achievements = [
      {
        icon: Award,
        title: "2 AFOREs Activas",
        description: "En producción en México",
        stat: "100%",
        label: "Satisfacción cliente"
      },
      {
        icon: Shield,
        title: "Certificación CONSAR",
        description: "Compliance verificado",
        stat: "37/37",
        label: "Validaciones activas"
      },
      {
        icon: Activity,
        title: "50K+ Eventos/Día",
        description: "Event sourcing en producción",
        stat: "7+",
        label: "Años retención"
      },
      {
        icon: Gauge,
        title: "Performance SLA",
        description: "99.9% uptime garantizado",
        stat: "<3s",
        label: "Response time p95"
      }
    ];
    $$renderer2.push(`<section class="relative py-24 px-4 md:px-8 bg-gradient-to-br from-primary-dark via-primary to-primary-dark text-white overflow-hidden"><div class="absolute inset-0 opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 50px 50px;"></div></div> <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div> <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-success/10 rounded-full blur-3xl"></div> <div class="container-custom relative z-10"><div${attr_class(`text-center mb-16 ${stringify("opacity-0")}`, "svelte-vxd9cw")}><div class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium mb-4">`);
    Chart_column($$renderer2, { class: "w-4 h-4" });
    $$renderer2.push(`<!----> Impacto Medible y Verificable</div> <h2 class="text-4xl md:text-5xl font-bold mb-4">Números que <span class="bg-gradient-to-r from-success to-warning bg-clip-text text-transparent">Demuestran Resultados</span></h2> <p class="text-xl text-white/80 max-w-3xl mx-auto">Métricas reales de AFOREs en producción. Reducción de costos del 86%, eliminación de
				errores del 99.7%, y ROI del 520% en el primer año.</p></div> <div${attr_class(`mb-20 ${stringify("opacity-0")}`, "svelte-vxd9cw")}><div class="grid md:grid-cols-4 gap-6"><!--[-->`);
    const each_array = ensure_array_like(keyMetrics);
    for (let index = 0, $$length = each_array.length; index < $$length; index++) {
      let metric = each_array[index];
      const MetricIcon = metric.icon;
      $$renderer2.push(`<div${attr_class(`relative group p-8 bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl hover:bg-white/15 transition-all duration-500 ${stringify(activeMetricIndex === index ? "scale-105 shadow-2xl shadow-white/20 border-white/40" : "")}`)}>`);
      if (activeMetricIndex === index) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div${attr_class(`absolute inset-0 bg-gradient-to-br from-${stringify(metric.color)}/20 to-transparent rounded-3xl`, "svelte-vxd9cw")}></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <div class="relative"><div class="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><!---->`);
      MetricIcon($$renderer2, { class: "w-8 h-8 text-white" });
      $$renderer2.push(`<!----></div> <div class="text-5xl font-bold mb-2 font-mono">`);
      if (index === 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`${escape_html(uptimeValue.toFixed(1))}%`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (index === 1) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`&lt;${escape_html(responseTime.toFixed(1))}s`);
        } else {
          $$renderer2.push("<!--[!-->");
          if (index === 2) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`${escape_html(metric.value)}`);
          } else {
            $$renderer2.push("<!--[!-->");
            $$renderer2.push(`${escape_html(Math.floor(filesPerMonth / 1e3))}K+`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></div> <div class="text-sm text-white/60 mb-1">${escape_html(metric.label)}</div> <div class="text-lg font-semibold mb-4">${escape_html(metric.description)}</div> <div class="text-sm text-white/70 mb-4">${escape_html(metric.detail)}</div> <div class="pt-4 border-t border-white/10"><div class="flex items-center justify-between text-xs"><div class="text-white/60">Antes: <span class="font-mono">${escape_html(metric.comparison.before)}</span></div> <div class="flex items-center gap-1 text-success">`);
      Trending_up($$renderer2, { class: "w-3 h-3" });
      $$renderer2.push(`<!----> <span class="font-bold">${escape_html(metric.comparison.improvement)}</span></div></div></div></div></div>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div${attr_class(`mb-20 ${stringify("opacity-0")}`, "svelte-vxd9cw")}><h3 class="text-3xl font-bold text-center mb-12">Impacto Detallado por Categoría</h3> <div class="grid lg:grid-cols-3 gap-8"><!--[-->`);
    const each_array_1 = ensure_array_like(impactMetrics);
    for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
      let category = each_array_1[$$index_2];
      const CategoryIcon = category.icon;
      $$renderer2.push(`<div class="p-8 bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl hover:bg-white/15 transition-all duration-300"><div class="flex items-center gap-3 mb-8"><div class="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center"><!---->`);
      CategoryIcon($$renderer2, { class: "w-6 h-6 text-white" });
      $$renderer2.push(`<!----></div> <h4 class="text-xl font-bold">${escape_html(category.category)}</h4></div> <div class="space-y-6"><!--[-->`);
      const each_array_2 = ensure_array_like(category.metrics);
      for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
        let metric = each_array_2[$$index_1];
        const Icon2 = metric.icon;
        $$renderer2.push(`<div class="group/metric"><div class="flex items-center gap-2 mb-3"><!---->`);
        Icon2($$renderer2, { class: "w-4 h-4 text-white/70" });
        $$renderer2.push(`<!----> <div class="text-sm font-semibold text-white/80">${escape_html(metric.name)}</div></div> <div class="space-y-2 mb-2"><div class="flex items-center gap-3"><span class="text-xs text-white/50 w-16">Antes:</span> <div class="flex-1 relative"><div class="h-8 bg-danger/30 rounded-lg flex items-center px-3"><span class="text-sm font-mono text-white/80">${escape_html(metric.before)}</span></div></div></div> <div class="flex items-center gap-3"><span class="text-xs text-white/50 w-16">Después:</span> <div class="flex-1 relative"><div class="h-8 bg-success/40 rounded-lg flex items-center justify-between px-3"><span class="text-sm font-mono font-semibold">${escape_html(metric.after)}</span> <div class="flex items-center gap-1 px-2 py-0.5 bg-success/30 rounded-full">`);
        Arrow_down($$renderer2, { class: "w-3 h-3" });
        $$renderer2.push(`<!----> <span class="text-xs font-bold">${escape_html(metric.saving)}</span></div></div></div></div></div></div>`);
      }
      $$renderer2.push(`<!--]--></div></div>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div${attr_class(`mb-12 ${stringify("opacity-0")}`, "svelte-vxd9cw")}><h3 class="text-3xl font-bold text-center mb-12">Logros y Certificaciones</h3> <div class="grid md:grid-cols-4 gap-6"><!--[-->`);
    const each_array_3 = ensure_array_like(achievements);
    for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
      let achievement = each_array_3[$$index_3];
      const Icon2 = achievement.icon;
      $$renderer2.push(`<div class="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300 group"><div class="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><!---->`);
      Icon2($$renderer2, { class: "w-6 h-6 text-white" });
      $$renderer2.push(`<!----></div> <div class="text-3xl font-bold mb-2 font-mono">${escape_html(achievement.stat)}</div> <div class="text-xs text-white/60 mb-2">${escape_html(achievement.label)}</div> <div class="text-sm font-semibold mb-1">${escape_html(achievement.title)}</div> <div class="text-xs text-white/70">${escape_html(achievement.description)}</div></div>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div${attr_class(`text-center ${stringify("opacity-0")}`, "svelte-vxd9cw")}><div class="inline-block p-8 bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl"><div class="flex flex-wrap items-center justify-center gap-8 mb-6"><div class="text-center"><div class="text-sm text-white/60 mb-2">Inversión Anual</div> <div class="text-4xl font-bold text-danger">$25K</div></div> `);
    Arrow_right($$renderer2, { class: "w-8 h-8 text-white/40" });
    $$renderer2.push(`<!----> <div class="text-center"><div class="text-sm text-white/60 mb-2">Ahorro Anual</div> <div class="text-4xl font-bold text-success">$155K</div></div> <div class="w-px h-16 bg-white/20 hidden sm:block"></div> <div class="text-center"><div class="text-sm text-white/60 mb-2">ROI Año 1</div> <div class="text-5xl font-bold text-warning">520%</div></div></div> <p class="text-white/80 mb-6 max-w-2xl">Cálculo basado en AFORE con <span class="font-bold">10,000 archivos/mes</span>.
					Incluye reducción de personal, eliminación de multas, y automatización completa.</p> <a href="#contact" class="inline-flex items-center gap-3 px-8 py-4 bg-white text-primary-dark font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"><span>Calcular ROI para tu AFORE</span> `);
    Arrow_right($$renderer2, {
      class: "w-5 h-5 group-hover:translate-x-1 transition-transform"
    });
    $$renderer2.push(`<!----></a></div></div></div></section>`);
  });
}
function SecurityComplianceSection($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let activeLayer = 0;
    let activeCert = 0;
    const securityLayers = [
      {
        id: 0,
        name: "Network Security",
        icon: Shield,
        color: "primary",
        features: [
          "TLS 1.3 encryption en tránsito",
          "Protección DDoS multi-cloud",
          "Web Application Firewall (WAF)",
          "IP whitelisting configurable",
          "Rate limiting por tenant"
        ],
        specs: {
          "Encryption": "TLS 1.3",
          "DDoS Protection": "Enterprise",
          "WAF Rules": "50+ reglas",
          "Latency": "+2ms overhead"
        }
      },
      {
        id: 1,
        name: "Application Security",
        icon: Code,
        color: "success",
        features: [
          "OAuth 2.0 + JWT authentication",
          "SSO enterprise integration",
          "Multi-factor authentication (MFA)",
          "Session management seguro",
          "CSRF & XSS protection"
        ],
        specs: {
          "Auth Protocol": "OAuth 2.0",
          "Token Expiry": "1 hora",
          "MFA": "TOTP/SMS",
          "Password Policy": "NIST 800-63"
        }
      },
      {
        id: 2,
        name: "Data Security",
        icon: Database,
        color: "warning",
        features: [
          "AES-256 encryption en reposo",
          "Gestión de claves enterprise",
          "Key rotation automático (90 días)",
          "Backup encriptado diario",
          "Data masking en logs"
        ],
        specs: {
          "Encryption": "AES-256-GCM",
          "Key Management": "Enterprise HSM",
          "Rotation": "90 días",
          "Backup": "Diario encriptado"
        }
      },
      {
        id: 3,
        name: "Access Control",
        icon: Lock,
        color: "danger",
        features: [
          "Row-Level Security (RLS) por tenant",
          "Role-Based Access Control (RBAC)",
          "Least privilege principle",
          "Audit log de todos los accesos",
          "Segregación de funciones"
        ],
        specs: {
          "Model": "RBAC + RLS",
          "Roles": "5 niveles",
          "Audit": "100% accesos",
          "Isolation": "Tenant-level"
        }
      }
    ];
    const certifications = [
      {
        name: "SOC 2 Type I",
        status: "En Proceso",
        progress: 75,
        date: "Q2 2026",
        quarter: "Q2",
        year: "2026",
        icon: Award,
        description: "Seguridad, disponibilidad, integridad de procesamiento",
        details: [
          "Auditoría externa en curso",
          "Controles implementados: 85/100",
          "Documentación: 90% completa",
          "Auditor: Firma Big 4"
        ],
        color: "primary"
      },
      {
        name: "ISO 27001",
        status: "En Proceso",
        progress: 45,
        date: "Q4 2026",
        quarter: "Q4",
        year: "2026",
        icon: Shield,
        description: "Sistema de gestión de seguridad de la información",
        details: [
          "Gap analysis completado",
          "Políticas definidas: 60/80",
          "Certificación programada: Dic 2026",
          "Certificadora: BSI Group"
        ],
        color: "success"
      },
      {
        name: "Penetration Testing",
        status: "Activo",
        progress: 100,
        date: "Trimestral",
        quarter: "Q1-Q4",
        year: "2026",
        icon: Target,
        description: "Testing de seguridad por firma especializada",
        details: [
          "Última prueba: Enero 2026",
          "Vulnerabilidades críticas: 0",
          "Vulnerabilidades medias: 2 (resueltas)",
          "Próxima prueba: Abril 2026"
        ],
        color: "warning"
      },
      {
        name: "CONSAR Compliance",
        status: "Certificado",
        progress: 100,
        date: "2026",
        quarter: "Activo",
        year: "2026",
        icon: Circle_check_big,
        description: "Cumplimiento normativo CONSAR México",
        details: [
          "30+ validaciones base (extensibles)",
          "Event sourcing 7+ años",
          "Auditoría completa disponible",
          "Certificado vigente"
        ],
        color: "success"
      }
    ];
    const complianceFeatures = [
      {
        category: "Event Sourcing & Auditoría",
        icon: File_check,
        items: [
          {
            name: "Inmutabilidad garantizada",
            description: "Append-only event store con hash chain verification",
            status: "implemented"
          },
          {
            name: "Reconstrucción de estado",
            description: "Replay de eventos en cualquier punto temporal",
            status: "implemented"
          },
          {
            name: "Retención 7+ años",
            description: "Cumplimiento CONSAR con archivado automático",
            status: "implemented"
          },
          {
            name: "Audit trail completo",
            description: "Usuario, timestamp, IP, user-agent en cada evento",
            status: "implemented"
          }
        ]
      },
      {
        category: "Multi-Tenancy & Isolation",
        icon: Layers,
        items: [
          {
            name: "Row-Level Security",
            description: "Aislamiento completo por AFORE",
            status: "implemented"
          },
          {
            name: "Tenant ID en cada query",
            description: "Imposible acceder a datos de otro tenant",
            status: "implemented"
          },
          {
            name: "Recursos dedicados",
            description: "Instancias serverless por tenant en alta carga",
            status: "implemented"
          },
          {
            name: "Segregación de backups",
            description: "Backups separados por tenant con encriptación única",
            status: "implemented"
          }
        ]
      },
      {
        category: "Monitoring & Incident Response",
        icon: Activity,
        items: [
          {
            name: "Monitoring 24/7",
            description: "Observabilidad cloud enterprise",
            status: "implemented"
          },
          {
            name: "Alertas automáticas",
            description: "PagerDuty integration para incidentes críticos",
            status: "implemented"
          },
          {
            name: "Incident response plan",
            description: "Proceso documentado con RTO < 4h, RPO < 1h",
            status: "implemented"
          },
          {
            name: "Post-mortem públicos",
            description: "Transparencia total en incidentes (para clientes)",
            status: "planned"
          }
        ]
      }
    ];
    const penetrationResults = {
      lastTest: "Enero 2026",
      firm: "CyberSecurity Partners",
      duration: "2 semanas",
      scope: "API, Web App, Infrastructure",
      findings: { critical: 0, high: 0, medium: 2, low: 5, info: 12 },
      resolved: { medium: 2 }
    };
    $$renderer2.push(`<section id="security" class="relative py-24 px-4 md:px-8 bg-gradient-to-b from-white via-neutral-50 to-white overflow-hidden"><div class="absolute inset-0 opacity-[0.02]"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgb(0 102 255) 1px, transparent 0); background-size: 40px 40px;"></div></div> <div class="container-custom relative z-10"><div${attr_class(`text-center mb-16 ${stringify("opacity-0")}`, "svelte-1jeav2s")}><div class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-success/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-4">`);
    Shield($$renderer2, { class: "w-4 h-4" });
    $$renderer2.push(`<!----> Seguridad y Compliance Enterprise</div> <h2 class="text-4xl md:text-5xl font-bold text-primary-dark mb-4">Arquitectura de Seguridad <span class="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">Multi-Capa</span></h2> <p class="text-xl text-neutral-600 max-w-3xl mx-auto">4 capas de seguridad, certificaciones enterprise, y cumplimiento normativo garantizado
				para instituciones financieras.</p></div> <div${attr_class(`mb-20 ${stringify("opacity-0")}`, "svelte-1jeav2s")}><h3 class="text-2xl font-bold text-center text-neutral-900 mb-8">Capas de Seguridad Implementadas</h3> <div class="flex flex-wrap justify-center gap-4 mb-12"><!--[-->`);
    const each_array = ensure_array_like(securityLayers);
    for (let index = 0, $$length = each_array.length; index < $$length; index++) {
      let layer = each_array[index];
      const LayerIcon = layer.icon;
      $$renderer2.push(`<button${attr_class(`px-6 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-3 ${stringify(activeLayer === index ? "bg-gradient-to-r from-primary to-primary-dark text-white shadow-xl scale-105" : "bg-white border-2 border-neutral-200 text-neutral-700 hover:border-primary/30")}`)}><!---->`);
      LayerIcon($$renderer2, { class: "w-5 h-5" });
      $$renderer2.push(`<!----> <span>${escape_html(layer.name)}</span></button>`);
    }
    $$renderer2.push(`<!--]--></div> <!--[-->`);
    const each_array_1 = ensure_array_like(securityLayers);
    for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
      let layer = each_array_1[index];
      if (activeLayer === index) {
        $$renderer2.push("<!--[-->");
        const LayerIcon = layer.icon;
        $$renderer2.push(`<div class="animate-fade-in-up svelte-1jeav2s"><div${attr_class(`grid lg:grid-cols-2 gap-12 bg-white rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-${stringify(layer.color)}/20`, "svelte-1jeav2s")}><div><div${attr_class(`w-20 h-20 bg-gradient-to-br from-${stringify(layer.color)}/20 to-${stringify(layer.color)}/10 rounded-2xl flex items-center justify-center mb-6`, "svelte-1jeav2s")}><!---->`);
        LayerIcon($$renderer2, { class: `w-10 h-10 text-${stringify(layer.color)}` });
        $$renderer2.push(`<!----></div> <h4 class="text-3xl font-bold text-neutral-900 mb-6">${escape_html(layer.name)}</h4> <ul class="space-y-4"><!--[-->`);
        const each_array_2 = ensure_array_like(layer.features);
        for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
          let feature = each_array_2[$$index_1];
          $$renderer2.push(`<li class="flex items-start gap-3">`);
          Circle_check_big($$renderer2, {
            class: `w-5 h-5 text-${stringify(layer.color)} flex-shrink-0 mt-0.5`
          });
          $$renderer2.push(`<!----> <span class="text-neutral-700">${escape_html(feature)}</span></li>`);
        }
        $$renderer2.push(`<!--]--></ul></div> <div><h5 class="font-semibold text-neutral-900 mb-6 flex items-center gap-2">`);
        Code($$renderer2, { class: `w-5 h-5 text-${stringify(layer.color)}` });
        $$renderer2.push(`<!----> Especificaciones Técnicas</h5> <div class="space-y-4"><!--[-->`);
        const each_array_3 = ensure_array_like(Object.entries(layer.specs));
        for (let $$index_2 = 0, $$length2 = each_array_3.length; $$index_2 < $$length2; $$index_2++) {
          let [key, value] = each_array_3[$$index_2];
          $$renderer2.push(`<div class="p-4 bg-gradient-to-br from-neutral-50 to-white border border-neutral-200 rounded-xl"><div class="text-sm text-neutral-500 mb-1">${escape_html(key)}</div> <div${attr_class(`text-lg font-bold text-${stringify(layer.color)}`, "svelte-1jeav2s")}>${escape_html(value)}</div></div>`);
        }
        $$renderer2.push(`<!--]--></div> <div${attr_class(`mt-8 p-6 bg-${stringify(layer.color)}/5 border border-${stringify(layer.color)}/20 rounded-xl`, "svelte-1jeav2s")}><div class="flex items-center gap-2 mb-2">`);
        Eye($$renderer2, { class: `w-5 h-5 text-${stringify(layer.color)}` });
        $$renderer2.push(`<!----> <span class="font-semibold text-neutral-900">Capa ${escape_html(index + 1)} de 4</span></div> <p class="text-sm text-neutral-600">Seguridad en profundidad (Defense in Depth) - Múltiples capas redundantes
										garantizan protección incluso si una capa falla.</p></div></div></div></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div> <div${attr_class(`mb-20 ${stringify("opacity-0")}`, "svelte-1jeav2s")}><h3 class="text-2xl font-bold text-center text-neutral-900 mb-12">Roadmap de Certificaciones</h3> <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6"><!--[-->`);
    const each_array_4 = ensure_array_like(certifications);
    for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
      let cert = each_array_4[$$index_4];
      const CertIcon = cert.icon;
      $$renderer2.push(`<button${attr_class(
        `p-6 bg-white border-2 rounded-2xl transition-all duration-300 text-left ${stringify(activeCert === certifications.indexOf(cert) ? "border-" + cert.color + "/40 shadow-xl scale-105" : "border-neutral-200 hover:border-" + cert.color + "/30")}`,
        "svelte-1jeav2s"
      )}><div class="flex items-center justify-between mb-4"><div${attr_class(`w-12 h-12 bg-${stringify(cert.color)}/10 rounded-xl flex items-center justify-center`, "svelte-1jeav2s")}><!---->`);
      CertIcon($$renderer2, { class: `w-6 h-6 text-${stringify(cert.color)}` });
      $$renderer2.push(`<!----></div> <span${attr_class(`px-3 py-1 bg-${stringify(cert.color)}/10 text-${stringify(cert.color)} text-xs font-bold rounded-full`, "svelte-1jeav2s")}>${escape_html(cert.status)}</span></div> <h4 class="font-bold text-neutral-900 mb-2">${escape_html(cert.name)}</h4> <p class="text-sm text-neutral-600 mb-4">${escape_html(cert.description)}</p> <div class="mb-2"><div class="flex items-center justify-between text-xs mb-1"><span class="text-neutral-500">Progreso</span> <span${attr_class(`font-bold text-${stringify(cert.color)}`, "svelte-1jeav2s")}>${escape_html(cert.progress)}%</span></div> <div class="h-2 bg-neutral-100 rounded-full overflow-hidden"><div${attr_class(`h-full bg-${stringify(cert.color)} transition-all duration-1000`, "svelte-1jeav2s")}${attr_style(`width: ${stringify(cert.progress)}%`)}></div></div></div> <div class="flex items-center gap-2 text-xs text-neutral-500">`);
      Calendar($$renderer2, { class: "w-3 h-3" });
      $$renderer2.push(`<!----> ${escape_html(cert.date)}</div></button>`);
    }
    $$renderer2.push(`<!--]--></div> <!--[-->`);
    const each_array_5 = ensure_array_like(certifications);
    for (let index = 0, $$length = each_array_5.length; index < $$length; index++) {
      let cert = each_array_5[index];
      if (activeCert === index) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="mt-8 animate-fade-in-up svelte-1jeav2s"><div${attr_class(`p-8 bg-gradient-to-br from-${stringify(cert.color)}/5 to-white border-2 border-${stringify(cert.color)}/20 rounded-3xl`, "svelte-1jeav2s")}><h4 class="text-2xl font-bold text-neutral-900 mb-6">Detalles: ${escape_html(cert.name)}</h4> <div class="grid md:grid-cols-2 gap-6"><!--[-->`);
        const each_array_6 = ensure_array_like(cert.details);
        for (let $$index_5 = 0, $$length2 = each_array_6.length; $$index_5 < $$length2; $$index_5++) {
          let detail = each_array_6[$$index_5];
          $$renderer2.push(`<div class="flex items-start gap-3">`);
          Circle_check_big($$renderer2, {
            class: `w-5 h-5 text-${stringify(cert.color)} flex-shrink-0 mt-0.5`
          });
          $$renderer2.push(`<!----> <span class="text-neutral-700">${escape_html(detail)}</span></div>`);
        }
        $$renderer2.push(`<!--]--></div></div></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div> <div${attr_class(`mb-20 ${stringify("opacity-0")}`, "svelte-1jeav2s")}><h3 class="text-2xl font-bold text-center text-neutral-900 mb-12">Características de Compliance</h3> <div class="grid lg:grid-cols-3 gap-8"><!--[-->`);
    const each_array_7 = ensure_array_like(complianceFeatures);
    for (let $$index_8 = 0, $$length = each_array_7.length; $$index_8 < $$length; $$index_8++) {
      let category = each_array_7[$$index_8];
      const CategoryIcon = category.icon;
      $$renderer2.push(`<div class="p-8 bg-white border-2 border-neutral-200 rounded-3xl hover:border-primary/30 hover:shadow-xl transition-all duration-300"><div class="flex items-center gap-3 mb-6"><div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center"><!---->`);
      CategoryIcon($$renderer2, { class: "w-6 h-6 text-primary" });
      $$renderer2.push(`<!----></div> <h4 class="font-bold text-neutral-900">${escape_html(category.category)}</h4></div> <div class="space-y-4"><!--[-->`);
      const each_array_8 = ensure_array_like(category.items);
      for (let $$index_7 = 0, $$length2 = each_array_8.length; $$index_7 < $$length2; $$index_7++) {
        let item = each_array_8[$$index_7];
        $$renderer2.push(`<div class="group"><div class="flex items-start gap-3 mb-2"><div${attr_class(`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${stringify(item.status === "implemented" ? "border-success bg-success" : "border-neutral-300 bg-white")}`)}>`);
        if (item.status === "implemented") {
          $$renderer2.push("<!--[-->");
          Circle_check_big($$renderer2, { class: "w-3 h-3 text-white" });
        } else {
          $$renderer2.push("<!--[!-->");
          Clock($$renderer2, { class: "w-3 h-3 text-neutral-400" });
        }
        $$renderer2.push(`<!--]--></div> <div class="flex-1"><div class="font-semibold text-neutral-900 text-sm mb-1">${escape_html(item.name)}</div> <div class="text-xs text-neutral-600">${escape_html(item.description)}</div></div></div></div>`);
      }
      $$renderer2.push(`<!--]--></div></div>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div${attr_class(`mb-12 ${stringify("opacity-0")}`, "svelte-1jeav2s")}><h3 class="text-2xl font-bold text-center text-neutral-900 mb-8">Resultados Penetration Testing</h3> <div class="max-w-4xl mx-auto p-8 bg-gradient-to-br from-white to-neutral-50 border-2 border-neutral-200 rounded-3xl"><div class="grid md:grid-cols-4 gap-6 mb-8"><div class="text-center"><div class="text-sm text-neutral-500 mb-2">Última Prueba</div> <div class="font-bold text-neutral-900">${escape_html(penetrationResults.lastTest)}</div></div> <div class="text-center"><div class="text-sm text-neutral-500 mb-2">Firma</div> <div class="font-bold text-neutral-900">${escape_html(penetrationResults.firm)}</div></div> <div class="text-center"><div class="text-sm text-neutral-500 mb-2">Duración</div> <div class="font-bold text-neutral-900">${escape_html(penetrationResults.duration)}</div></div> <div class="text-center"><div class="text-sm text-neutral-500 mb-2">Alcance</div> <div class="font-bold text-neutral-900 text-sm">${escape_html(penetrationResults.scope)}</div></div></div> <div class="grid grid-cols-5 gap-4"><div class="text-center p-4 bg-danger/5 border border-danger/20 rounded-xl"><div class="text-3xl font-bold text-danger mb-1">${escape_html(penetrationResults.findings.critical)}</div> <div class="text-xs text-neutral-600">Críticas</div></div> <div class="text-center p-4 bg-warning/5 border border-warning/20 rounded-xl"><div class="text-3xl font-bold text-warning mb-1">${escape_html(penetrationResults.findings.high)}</div> <div class="text-xs text-neutral-600">Altas</div></div> <div class="text-center p-4 bg-primary/5 border border-primary/20 rounded-xl"><div class="text-3xl font-bold text-primary mb-1">${escape_html(penetrationResults.findings.medium)}</div> <div class="text-xs text-neutral-600">Medias</div></div> <div class="text-center p-4 bg-success/5 border border-success/20 rounded-xl"><div class="text-3xl font-bold text-success mb-1">${escape_html(penetrationResults.findings.low)}</div> <div class="text-xs text-neutral-600">Bajas</div></div> <div class="text-center p-4 bg-neutral-100 border border-neutral-200 rounded-xl"><div class="text-3xl font-bold text-neutral-600 mb-1">${escape_html(penetrationResults.findings.info)}</div> <div class="text-xs text-neutral-600">Info</div></div></div> <div class="mt-6 p-4 bg-success/10 border border-success/30 rounded-xl flex items-start gap-3">`);
    Circle_check_big($$renderer2, { class: "w-6 h-6 text-success flex-shrink-0 mt-0.5" });
    $$renderer2.push(`<!----> <div><div class="font-semibold text-success mb-1">Estado: Seguro</div> <div class="text-sm text-neutral-700">${escape_html(penetrationResults.resolved.medium)}/${escape_html(penetrationResults.findings.medium)} vulnerabilidades
							medias resueltas. Próxima prueba programada para Abril 2026.</div></div></div></div></div> <div${attr_class(`text-center ${stringify("opacity-0")}`, "svelte-1jeav2s")}><div class="inline-block p-8 bg-gradient-to-br from-primary/5 to-success/5 rounded-2xl border border-primary/20"><p class="text-lg text-neutral-700 mb-6 max-w-2xl">¿Necesita documentación de seguridad completa para su comité de riesgos? <span class="font-bold text-primary">Descargue nuestro Security Whitepaper.</span></p> <a href="#contact" class="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">`);
    Download($$renderer2, { class: "w-5 h-5" });
    $$renderer2.push(`<!----> <span>Descargar Security Whitepaper</span> `);
    Arrow_right($$renderer2, {
      class: "w-5 h-5 group-hover:translate-x-1 transition-transform"
    });
    $$renderer2.push(`<!----></a></div></div></div></section>`);
  });
}
function LatinAmericaSection($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let activeCountry = "mexico";
    const countries = [
      {
        id: "mexico",
        name: "México",
        flag: "🇲🇽",
        status: "active",
        statusLabel: "Activo en Producción",
        regulator: {
          name: "CONSAR",
          fullName: "Comisión Nacional del Sistema de Ahorro para el Retiro",
          website: "www.consar.gob.mx"
        },
        metrics: {
          afores: 2,
          aforeNames: ["AFORE Principal", "AFORE XXX"],
          filesPerMonth: "10,000+",
          validations: 37,
          uptime: "99.9%",
          goLiveDate: "Enero 2024"
        },
        marketInfo: {
          totalAfores: 10,
          marketSize: "4.2M trabajadores",
          regulatoryComplexity: "Alta",
          participants: "68M cuentas"
        },
        regulations: [
          {
            category: "Archivos Obligatorios",
            icon: File_text,
            items: [
              {
                name: "Archivo de Aportaciones",
                frequency: "Bimestral",
                format: "CSV/TXT"
              },
              {
                name: "Archivo de Traspasos",
                frequency: "Mensual",
                format: "CSV/TXT"
              },
              {
                name: "Archivo de Retiros",
                frequency: "Mensual",
                format: "CSV/TXT"
              },
              {
                name: "Archivo de Pensiones",
                frequency: "Mensual",
                format: "CSV/TXT"
              }
            ]
          },
          {
            category: "Validaciones Críticas",
            icon: Shield,
            items: [
              {
                name: "Estructura de campos",
                count: "12 validadores",
                priority: "Crítica"
              },
              {
                name: "Formato de datos",
                count: "8 validadores",
                priority: "Alta"
              },
              {
                name: "Reglas de negocio",
                count: "10 validadores",
                priority: "Crítica"
              },
              {
                name: "Integridad referencial",
                count: "7 validadores",
                priority: "Media"
              }
            ]
          },
          {
            category: "Reportes Regulatorios",
            icon: Chart_column,
            items: [
              {
                name: "Reporte de Cumplimiento",
                frequency: "Mensual",
                automated: true
              },
              {
                name: "Estadísticas de Validación",
                frequency: "Semanal",
                automated: true
              },
              {
                name: "Auditoría de Operaciones",
                frequency: "Trimestral",
                automated: true
              },
              {
                name: "Incidencias y Resoluciones",
                frequency: "Mensual",
                automated: true
              }
            ]
          }
        ],
        roadmap: [
          {
            phase: "Fase 1 - Validación Core",
            status: "completed",
            date: "Q4 2023",
            items: [
              "30+ validaciones base CONSAR",
              "API REST v1",
              "Dashboard básico"
            ]
          },
          {
            phase: "Fase 2 - Producción",
            status: "completed",
            date: "Q1 2024",
            items: ["2 AFOREs activas", "Event sourcing", "SLA 99.9%"]
          },
          {
            phase: "Fase 3 - Escala",
            status: "in_progress",
            date: "Q2 2026",
            items: ["Auto-scaling", "ML predictions", "Advanced analytics"]
          },
          {
            phase: "Fase 4 - Expansión",
            status: "planned",
            date: "Q3 2026",
            items: ["5+ AFOREs", "White-label", "Custom validations"]
          }
        ],
        features: [
          "Validaciones CONSAR 2026 completas",
          "Integración con PROCESAR",
          "Soporte multi-fondo (Básica, Ahorro, etc.)",
          "Reportes regulatorios automatizados",
          "Auditoría completa 7+ años",
          "SLA 99.9% garantizado"
        ]
      },
      {
        id: "chile",
        name: "Chile",
        flag: "🇨🇱",
        status: "development",
        statusLabel: "En Desarrollo",
        regulator: {
          name: "SuperPensiones",
          fullName: "Superintendencia de Pensiones",
          website: "www.spensiones.cl"
        },
        metrics: {
          afores: 0,
          aforeNames: [],
          filesPerMonth: "Próximamente",
          validations: 28,
          uptime: "N/A",
          goLiveDate: "Q3 2026"
        },
        marketInfo: {
          totalAfores: 6,
          marketSize: "2.8M trabajadores",
          regulatoryComplexity: "Media-Alta",
          participants: "11M afiliados"
        },
        regulations: [
          {
            category: "Archivos Obligatorios",
            icon: File_text,
            items: [
              {
                name: "Archivo de Cotizaciones",
                frequency: "Mensual",
                format: "CSV/XML"
              },
              {
                name: "Archivo de Traspasos AFP",
                frequency: "Mensual",
                format: "CSV/XML"
              },
              {
                name: "Archivo de Pensiones",
                frequency: "Mensual",
                format: "CSV/XML"
              }
            ]
          },
          {
            category: "Validaciones Adaptadas",
            icon: Shield,
            items: [
              {
                name: "Estructura específica AFP",
                count: "10 validadores",
                priority: "Crítica"
              },
              {
                name: "Formato datos chilenos",
                count: "6 validadores",
                priority: "Alta"
              },
              {
                name: "Reglas SuperPensiones",
                count: "8 validadores",
                priority: "Crítica"
              },
              {
                name: "Validación RUT",
                count: "4 validadores",
                priority: "Alta"
              }
            ]
          }
        ],
        roadmap: [
          {
            phase: "Fase 1 - Investigación",
            status: "completed",
            date: "Q2 2024",
            items: [
              "Análisis regulatorio",
              "Mapeo de validaciones",
              "Diseño arquitectura"
            ]
          },
          {
            phase: "Fase 2 - Desarrollo",
            status: "in_progress",
            date: "Q2 2026",
            items: [
              "28 validaciones AFP",
              "Adaptación API",
              "Testing regulatorio"
            ]
          },
          {
            phase: "Fase 3 - Piloto",
            status: "planned",
            date: "Q3 2026",
            items: ["1 AFP piloto", "Certificación SuperPensiones", "Go-live"]
          },
          {
            phase: "Fase 4 - Expansión",
            status: "planned",
            date: "Q4 2026",
            items: ["3+ AFPs", "Optimizaciones", "Full compliance"]
          }
        ],
        features: [
          "Validaciones SuperPensiones en desarrollo",
          "Formato RUT chileno nativo",
          "Integración con sistema AFP",
          "Multifondo (A, B, C, D, E)",
          "Roadmap Q3 2026",
          "Arquitectura cloud-native"
        ]
      },
      {
        id: "colombia",
        name: "Colombia",
        flag: "🇨🇴",
        status: "planning",
        statusLabel: "En Planificación",
        regulator: {
          name: "SuperFinanciera",
          fullName: "Superintendencia Financiera de Colombia",
          website: "www.superfinanciera.gov.co"
        },
        metrics: {
          afores: 0,
          aforeNames: [],
          filesPerMonth: "Roadmap 2026",
          validations: 0,
          uptime: "N/A",
          goLiveDate: "Q4 2026"
        },
        marketInfo: {
          totalAfores: 4,
          marketSize: "1.9M trabajadores",
          regulatoryComplexity: "Media",
          participants: "16M afiliados"
        },
        regulations: [
          {
            category: "Regulación Identificada",
            icon: File_text,
            items: [
              {
                name: "Archivo de Aportes",
                frequency: "Mensual",
                format: "Por definir"
              },
              {
                name: "Archivo de Traslados",
                frequency: "Mensual",
                format: "Por definir"
              },
              {
                name: "Normativa SuperFinanciera",
                frequency: "Variable",
                format: "En análisis"
              }
            ]
          },
          {
            category: "Validaciones Estimadas",
            icon: Shield,
            items: [
              {
                name: "Estructura de datos",
                count: "Por estimar",
                priority: "Crítica"
              },
              {
                name: "Formato colombiano",
                count: "Por estimar",
                priority: "Alta"
              },
              {
                name: "Reglas regulatorias",
                count: "Por estimar",
                priority: "Crítica"
              }
            ]
          }
        ],
        roadmap: [
          {
            phase: "Fase 1 - Análisis",
            status: "planned",
            date: "Q2 2026",
            items: [
              "Estudio regulatorio",
              "Partnership local",
              "Definición scope"
            ]
          },
          {
            phase: "Fase 2 - Desarrollo",
            status: "planned",
            date: "Q3 2026",
            items: [
              "Validaciones colombianas",
              "Adaptación plataforma",
              "Testing"
            ]
          },
          {
            phase: "Fase 3 - Piloto",
            status: "planned",
            date: "Q4 2026",
            items: ["1 fondo piloto", "Certificación", "Lanzamiento"]
          },
          {
            phase: "Fase 4 - Crecimiento",
            status: "planned",
            date: "Q1 2026",
            items: ["Expansión mercado", "Múltiples fondos", "Optimización"]
          }
        ],
        features: [
          "Análisis regulatorio en progreso",
          "Partnership estratégico en desarrollo",
          "Arquitectura multi-país lista",
          "Roadmap Q4 2026 estimado",
          "Soporte SuperFinanciera planeado",
          "Escalabilidad garantizada"
        ]
      },
      {
        id: "peru",
        name: "Perú",
        flag: "🇵🇪",
        status: "planning",
        statusLabel: "En Planificación",
        regulator: {
          name: "SBS",
          fullName: "Superintendencia de Banca, Seguros y AFP",
          website: "www.sbs.gob.pe"
        },
        metrics: {
          afores: 0,
          aforeNames: [],
          filesPerMonth: "Roadmap 2026",
          validations: 0,
          uptime: "N/A",
          goLiveDate: "Q2 2026"
        },
        marketInfo: {
          totalAfores: 4,
          marketSize: "1.5M trabajadores",
          regulatoryComplexity: "Media",
          participants: "7M afiliados"
        },
        regulations: [
          {
            category: "Marco Regulatorio",
            icon: File_text,
            items: [
              {
                name: "Normativa SBS",
                frequency: "Variable",
                format: "En investigación"
              },
              {
                name: "Archivos AFP",
                frequency: "Por definir",
                format: "En investigación"
              },
              {
                name: "Reportes requeridos",
                frequency: "Por definir",
                format: "En investigación"
              }
            ]
          },
          {
            category: "Validaciones Futuras",
            icon: Shield,
            items: [
              {
                name: "Reglas SBS",
                count: "Por definir",
                priority: "Crítica"
              },
              {
                name: "Formato peruano",
                count: "Por definir",
                priority: "Alta"
              },
              {
                name: "Compliance AFP",
                count: "Por definir",
                priority: "Media"
              }
            ]
          }
        ],
        roadmap: [
          {
            phase: "Fase 1 - Investigación",
            status: "planned",
            date: "Q4 2026",
            items: ["Análisis SBS", "Contacto regulador", "Estudio de mercado"]
          },
          {
            phase: "Fase 2 - Diseño",
            status: "planned",
            date: "Q1 2026",
            items: [
              "Mapeo validaciones",
              "Arquitectura AFP",
              "Plan implementación"
            ]
          },
          {
            phase: "Fase 3 - Desarrollo",
            status: "planned",
            date: "Q2 2026",
            items: ["Build validaciones", "Testing", "Certificación"]
          },
          {
            phase: "Fase 4 - Lanzamiento",
            status: "planned",
            date: "Q3 2026",
            items: ["Piloto AFP", "Go-live", "Soporte"]
          }
        ],
        features: [
          "Roadmap 2026 planificado",
          "Arquitectura escalable lista",
          "Experiencia multi-país aplicable",
          "Investigación regulatoria pendiente",
          "Partnership estratégico futuro",
          "Compliance SBS en diseño"
        ]
      }
    ];
    const getStatusColor = (status) => {
      switch (status) {
        case "active":
          return "success";
        case "development":
          return "primary";
        case "planning":
          return "warning";
        default:
          return "neutral";
      }
    };
    const selectedCountry = countries.find((c) => c.id === activeCountry);
    $$renderer2.push(`<section class="relative py-24 px-4 md:px-8 bg-gradient-to-br from-neutral-50 via-white to-neutral-50 overflow-hidden"><div class="absolute inset-0 opacity-5"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 2px 2px, #0066FF 1px, transparent 0); background-size: 40px 40px;"></div></div> <div class="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl"></div> <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-success/5 rounded-full blur-3xl"></div> <div class="container-custom relative z-10"><div${attr_class(`text-center mb-16 ${stringify("opacity-0")}`, "svelte-z9tax9")}><div class="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-4">`);
    Globe($$renderer2, { class: "w-4 h-4" });
    $$renderer2.push(`<!----> Expansión Latinoamericana</div> <h2 class="text-4xl md:text-5xl font-bold text-primary-dark mb-4">Cobertura <span class="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">Regional Completa</span></h2> <p class="text-xl text-neutral-600 max-w-3xl mx-auto">Comenzamos en México con 2 AFOREs activas. Expandiéndonos a Chile, Colombia y Perú con
				validaciones específicas por país y expertise regulatorio comprobado.</p></div> <div${attr_class(`mb-12 ${stringify("opacity-0")}`, "svelte-z9tax9")}><div class="grid md:grid-cols-4 gap-4"><!--[-->`);
    const each_array = ensure_array_like(countries);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let country = each_array[$$index];
      const statusColor = getStatusColor(country.status);
      $$renderer2.push(`<button${attr_class(
        `relative p-6 bg-white border-2 rounded-2xl transition-all duration-300 text-left group hover:shadow-xl hover:-translate-y-1 ${stringify(activeCountry === country.id ? `border-${statusColor} shadow-lg shadow-${statusColor}/20` : "border-neutral-200 hover:border-neutral-300")}`,
        "svelte-z9tax9"
      )}>`);
      if (activeCountry === country.id) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div${attr_class(`absolute inset-0 bg-gradient-to-br from-${stringify(statusColor)}/5 to-transparent rounded-2xl`, "svelte-z9tax9")}></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <div class="relative"><div class="flex items-start justify-between mb-3"><span class="text-5xl">${escape_html(country.flag)}</span> <span${attr_class(`px-2 py-1 bg-${stringify(statusColor)}/10 text-${stringify(statusColor)} text-xs font-semibold rounded-full`, "svelte-z9tax9")}>${escape_html(country.status === "active" ? "Activo" : country.status === "development" ? "En Desarrollo" : "Planeado")}</span></div> <h3 class="text-xl font-bold text-primary-dark mb-1">${escape_html(country.name)}</h3> <p class="text-sm text-neutral-600 mb-3">${escape_html(country.regulator.name)}</p> <div class="space-y-2">`);
      if (country.status === "active") {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="flex items-center gap-2 text-sm">`);
        Building_2($$renderer2, { class: "w-4 h-4 text-success" });
        $$renderer2.push(`<!----> <span class="text-neutral-700"><strong>${escape_html(country.metrics.afores)}</strong> AFOREs activas</span></div> <div class="flex items-center gap-2 text-sm">`);
        Shield($$renderer2, { class: "w-4 h-4 text-success" });
        $$renderer2.push(`<!----> <span class="text-neutral-700"><strong>${escape_html(country.metrics.validations)}</strong> validaciones</span></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (country.status === "development") {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="flex items-center gap-2 text-sm">`);
          Clock($$renderer2, { class: "w-4 h-4 text-primary" });
          $$renderer2.push(`<!----> <span class="text-neutral-700">Go-live ${escape_html(country.metrics.goLiveDate)}</span></div> <div class="flex items-center gap-2 text-sm">`);
          Activity($$renderer2, { class: "w-4 h-4 text-primary" });
          $$renderer2.push(`<!----> <span class="text-neutral-700">${escape_html(country.metrics.validations)} validaciones en desarrollo</span></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<div class="flex items-center gap-2 text-sm">`);
          Target($$renderer2, { class: "w-4 h-4 text-warning" });
          $$renderer2.push(`<!----> <span class="text-neutral-700">Roadmap ${escape_html(country.metrics.goLiveDate)}</span></div> <div class="flex items-center gap-2 text-sm">`);
          Map_pin($$renderer2, { class: "w-4 h-4 text-warning" });
          $$renderer2.push(`<!----> <span class="text-neutral-700">${escape_html(country.marketInfo.totalAfores)} AFPs/AFOREs</span></div>`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></div> `);
      if (activeCountry === country.id) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="absolute -bottom-4 left-1/2 -translate-x-1/2"><div${attr_class(`w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-${stringify(statusColor)}`, "svelte-z9tax9")}></div></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div></button>`);
    }
    $$renderer2.push(`<!--]--></div></div> `);
    if (selectedCountry) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr_class(`mb-12 ${stringify("opacity-0")}`, "svelte-z9tax9")}><div class="flex gap-2 mb-8 border-b border-neutral-200"><button${attr_class(`px-6 py-3 font-semibold transition-all duration-300 border-b-2 ${stringify(
        "border-primary text-primary"
      )}`)}>Resumen General</button> <button${attr_class(`px-6 py-3 font-semibold transition-all duration-300 border-b-2 ${stringify("border-transparent text-neutral-600 hover:text-primary")}`)}>Marco Regulatorio</button> <button${attr_class(`px-6 py-3 font-semibold transition-all duration-300 border-b-2 ${stringify("border-transparent text-neutral-600 hover:text-primary")}`)}>Roadmap</button></div> <div class="min-h-[500px]">`);
      {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="grid lg:grid-cols-2 gap-8"><div class="space-y-6"><div class="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm"><div class="flex items-start gap-4 mb-4"><div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">`);
        Shield($$renderer2, { class: "w-6 h-6 text-primary" });
        $$renderer2.push(`<!----></div> <div class="flex-1"><h4 class="text-sm text-neutral-600 mb-1">Regulador</h4> <h3 class="text-xl font-bold text-primary-dark">${escape_html(selectedCountry.regulator.name)}</h3> <p class="text-sm text-neutral-600 mt-1">${escape_html(selectedCountry.regulator.fullName)}</p></div></div> <div class="pt-4 border-t border-neutral-200"><a${attr("href", `https://${stringify(selectedCountry.regulator.website)}`)} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium">`);
        Globe($$renderer2, { class: "w-4 h-4" });
        $$renderer2.push(`<!----> ${escape_html(selectedCountry.regulator.website)} `);
        Arrow_right($$renderer2, { class: "w-4 h-4" });
        $$renderer2.push(`<!----></a></div></div> <div class="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm"><div class="flex items-center gap-3 mb-6"><div class="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">`);
        Chart_column($$renderer2, { class: "w-5 h-5 text-success" });
        $$renderer2.push(`<!----></div> <h3 class="text-lg font-bold text-primary-dark">Información de Mercado</h3></div> <div class="grid grid-cols-2 gap-4"><div class="p-4 bg-neutral-50 rounded-xl"><div class="text-2xl font-bold text-primary-dark mb-1">${escape_html(selectedCountry.marketInfo.totalAfores)}</div> <div class="text-xs text-neutral-600">AFPs/AFOREs</div></div> <div class="p-4 bg-neutral-50 rounded-xl"><div class="text-2xl font-bold text-primary-dark mb-1">${escape_html(selectedCountry.marketInfo.marketSize)}</div> <div class="text-xs text-neutral-600">Trabajadores</div></div> <div class="p-4 bg-neutral-50 rounded-xl"><div class="text-2xl font-bold text-primary-dark mb-1">${escape_html(selectedCountry.marketInfo.participants)}</div> <div class="text-xs text-neutral-600">Participantes</div></div> <div class="p-4 bg-neutral-50 rounded-xl"><div class="text-sm font-bold text-primary-dark mb-1">${escape_html(selectedCountry.marketInfo.regulatoryComplexity)}</div> <div class="text-xs text-neutral-600">Complejidad</div></div></div></div> <div class="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm"><div class="flex items-center gap-3 mb-6"><div${attr_class(`w-10 h-10 bg-${stringify(getStatusColor(selectedCountry.status))}/10 rounded-xl flex items-center justify-center`, "svelte-z9tax9")}>`);
        if (selectedCountry.status === "active") {
          $$renderer2.push("<!--[-->");
          Circle_check($$renderer2, { class: "w-5 h-5 text-success" });
        } else {
          $$renderer2.push("<!--[!-->");
          if (selectedCountry.status === "development") {
            $$renderer2.push("<!--[-->");
            Zap($$renderer2, { class: "w-5 h-5 text-primary" });
          } else {
            $$renderer2.push("<!--[!-->");
            Clock($$renderer2, { class: "w-5 h-5 text-warning" });
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]--></div> <div><h3 class="text-lg font-bold text-primary-dark">Estado Actual</h3> <p class="text-sm text-neutral-600">${escape_html(selectedCountry.statusLabel)}</p></div></div> <div class="space-y-3"><div class="flex items-center justify-between"><span class="text-sm text-neutral-600">AFOREs/AFPs:</span> <span class="font-semibold text-primary-dark">${escape_html(selectedCountry.metrics.afores || "Próximamente")}</span></div> <div class="flex items-center justify-between"><span class="text-sm text-neutral-600">Validaciones:</span> <span class="font-semibold text-primary-dark">${escape_html(selectedCountry.metrics.validations || "En desarrollo")}</span></div> <div class="flex items-center justify-between"><span class="text-sm text-neutral-600">Archivos/Mes:</span> <span class="font-semibold text-primary-dark">${escape_html(selectedCountry.metrics.filesPerMonth)}</span></div> `);
        if (selectedCountry.status === "active") {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="flex items-center justify-between"><span class="text-sm text-neutral-600">Uptime:</span> <span class="font-semibold text-success">${escape_html(selectedCountry.metrics.uptime)}</span></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> <div class="flex items-center justify-between pt-3 border-t border-neutral-200"><span class="text-sm text-neutral-600">Go-Live:</span> <span class="font-semibold text-primary">${escape_html(selectedCountry.metrics.goLiveDate)}</span></div></div></div></div> <div class="space-y-6"><div class="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm"><div class="flex items-center gap-3 mb-6"><div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">`);
        Award($$renderer2, { class: "w-5 h-5 text-primary" });
        $$renderer2.push(`<!----></div> <h3 class="text-lg font-bold text-primary-dark">Características y Capacidades</h3></div> <ul class="space-y-3"><!--[-->`);
        const each_array_1 = ensure_array_like(selectedCountry.features);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let feature = each_array_1[$$index_1];
          $$renderer2.push(`<li class="flex items-start gap-3 group"><div class="flex-shrink-0 mt-0.5">`);
          Circle_check($$renderer2, {
            class: "w-5 h-5 text-success group-hover:scale-110 transition-transform"
          });
          $$renderer2.push(`<!----></div> <span class="text-neutral-700">${escape_html(feature)}</span></li>`);
        }
        $$renderer2.push(`<!--]--></ul></div> `);
        if (selectedCountry.status === "active" && selectedCountry.metrics.aforeNames.length > 0) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="p-6 bg-gradient-to-br from-success/10 to-primary/10 border border-success/20 rounded-2xl"><div class="flex items-center gap-3 mb-4"><div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">`);
          Building_2($$renderer2, { class: "w-5 h-5 text-success" });
          $$renderer2.push(`<!----></div> <h3 class="text-lg font-bold text-primary-dark">AFOREs en Producción</h3></div> <div class="space-y-2"><!--[-->`);
          const each_array_2 = ensure_array_like(selectedCountry.metrics.aforeNames);
          for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
            let afore = each_array_2[$$index_2];
            $$renderer2.push(`<div class="p-3 bg-white rounded-xl flex items-center justify-between"><span class="font-semibold text-neutral-900">${escape_html(afore)}</span> <span class="px-2 py-1 bg-success/10 text-success text-xs font-semibold rounded-full">Activo</span></div>`);
          }
          $$renderer2.push(`<!--]--></div></div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> <div class="p-6 bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl"><h3 class="text-xl font-bold mb-2">${escape_html(selectedCountry.status === "active" ? "¿Listo para unirse?" : selectedCountry.status === "development" ? "¿Interesado en el piloto?" : "¿Quiere ser el primero?")}</h3> <p class="text-white/90 mb-4">${escape_html(selectedCountry.status === "active" ? "Únase a las AFOREs que ya confían en Hergon en " + selectedCountry.name : selectedCountry.status === "development" ? "Sea parte del programa piloto en " + selectedCountry.name : "Regístrese para actualizaciones sobre " + selectedCountry.name)}</p> <a href="#contact" class="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-neutral-100 transition-all duration-300 hover:scale-105 group"><span>Contactar Ahora</span> `);
        Arrow_right($$renderer2, {
          class: "w-5 h-5 group-hover:translate-x-1 transition-transform"
        });
        $$renderer2.push(`<!----></a></div></div></div>`);
      }
      $$renderer2.push(`<!--]--> `);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div${attr_class(`mt-16 ${stringify("opacity-0")}`, "svelte-z9tax9")}><div class="p-8 bg-gradient-to-br from-primary-dark via-primary to-primary-dark text-white rounded-3xl"><h3 class="text-2xl font-bold text-center mb-8">Hergon en Latinoamérica</h3> <div class="grid md:grid-cols-4 gap-6"><div class="text-center"><div class="text-4xl font-bold mb-2">4</div> <div class="text-white/80">Países en Roadmap</div></div> <div class="text-center"><div class="text-4xl font-bold mb-2">2</div> <div class="text-white/80">AFOREs Activas</div></div> <div class="text-center"><div class="text-4xl font-bold mb-2">37+</div> <div class="text-white/80">Validaciones Totales</div></div> <div class="text-center"><div class="text-4xl font-bold mb-2">10.3M</div> <div class="text-white/80">Trabajadores Potenciales</div></div></div></div></div></div></section>`);
  });
}
function PricingSection($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let selectedTier = null;
    let fondos = 5;
    let archivosPerMonth = 500;
    let currentStaff = 3;
    let currentErrorRate = 25;
    let calculatedSavings = {
      staffSavings: 0,
      timeSavings: 0,
      errorSavings: 0,
      totalAnnualSavings: 0,
      roi: 0,
      paybackMonths: 0
    };
    const pricingTiers = [
      {
        id: "starter",
        name: "Starter",
        tagline: "Para AFOREs en crecimiento",
        badge: null,
        monthlyPrice: 750,
        annualPrice: 7500,
        priceUnit: "por fondo",
        description: "Perfecto para AFOREs con hasta 5 fondos que buscan automatizar su validación",
        maxFunds: 5,
        filesPerMonth: "5,000",
        recommended: false,
        features: [
          {
            category: "Validación",
            items: [
              { name: "30+ validaciones base CONSAR", included: true },
              { name: "Validación en tiempo real (<3s)", included: true },
              { name: "Formatos CSV, Excel, TXT", included: true },
              {
                name: "Validaciones personalizadas configurables",
                included: false
              },
              { name: "Machine Learning predictions", included: false }
            ]
          },
          {
            category: "Infraestructura",
            items: [
              { name: "API REST completa", included: true },
              { name: "Webhooks para eventos", included: true },
              { name: "SLA 99.9% uptime", included: true },
              { name: "Auto-scaling", included: true },
              { name: "Dedicated infrastructure", included: false }
            ]
          },
          {
            category: "Reportes & Analytics",
            items: [
              { name: "Dashboard en tiempo real", included: true },
              { name: "Reportes de cumplimiento", included: true },
              { name: "Exportación CSV/Excel/PDF", included: true },
              { name: "Análisis predictivo", included: false },
              { name: "Custom dashboards", included: false }
            ]
          },
          {
            category: "Soporte & SLA",
            items: [
              { name: "Soporte por email", included: true },
              { name: "Documentación completa", included: true },
              { name: "Response time: 24 horas", included: true },
              { name: "Soporte telefónico 24/7", included: false },
              { name: "Technical account manager", included: false }
            ]
          },
          {
            category: "Seguridad & Compliance",
            items: [
              { name: "Encriptación TLS 1.3", included: true },
              { name: "Multi-tenancy con RLS", included: true },
              { name: "Auditoría completa (7+ años)", included: true },
              { name: "SSO/SAML integration", included: false },
              { name: "Custom security policies", included: false }
            ]
          }
        ],
        highlights: [
          "Ideal para empezar rápido",
          "Sin costos de setup",
          "Escalable según crezca",
          "ROI típico: 400%+"
        ],
        cta: "Comenzar Ahora",
        ctaType: "primary"
      },
      {
        id: "professional",
        name: "Professional",
        tagline: "Para AFOREs establecidas",
        badge: "Más Popular",
        monthlyPrice: 1500,
        annualPrice: 15e3,
        priceUnit: "por fondo",
        description: "Para AFOREs medianas que necesitan capacidades avanzadas y soporte prioritario",
        maxFunds: 15,
        filesPerMonth: "20,000",
        recommended: true,
        features: [
          {
            category: "Validación",
            items: [
              { name: "30+ validaciones base CONSAR", included: true },
              { name: "Validación en tiempo real (<3s)", included: true },
              { name: "Formatos CSV, Excel, TXT", included: true },
              {
                name: "Validaciones personalizadas configurables",
                included: true,
                detail: "Hasta 10 reglas custom"
              },
              {
                name: "Machine Learning predictions",
                included: true,
                detail: "Detección anomalías"
              }
            ]
          },
          {
            category: "Infraestructura",
            items: [
              { name: "API REST completa", included: true },
              { name: "Webhooks para eventos", included: true },
              { name: "SLA 99.9% uptime", included: true },
              { name: "Auto-scaling", included: true },
              {
                name: "Dedicated infrastructure",
                included: true,
                detail: "Pool dedicado"
              }
            ]
          },
          {
            category: "Reportes & Analytics",
            items: [
              { name: "Dashboard en tiempo real", included: true },
              { name: "Reportes de cumplimiento", included: true },
              { name: "Exportación CSV/Excel/PDF", included: true },
              {
                name: "Análisis predictivo",
                included: true,
                detail: "Tendencias y forecasting"
              },
              {
                name: "Custom dashboards",
                included: true,
                detail: "Hasta 5 dashboards"
              }
            ]
          },
          {
            category: "Soporte & SLA",
            items: [
              { name: "Soporte por email", included: true },
              { name: "Documentación completa", included: true },
              {
                name: "Response time: 24 horas",
                included: true,
                detail: "4 horas para críticos"
              },
              { name: "Soporte telefónico 24/7", included: true },
              { name: "Technical account manager", included: false }
            ]
          },
          {
            category: "Seguridad & Compliance",
            items: [
              { name: "Encriptación TLS 1.3", included: true },
              { name: "Multi-tenancy con RLS", included: true },
              { name: "Auditoría completa (7+ años)", included: true },
              { name: "SSO/SAML integration", included: true },
              { name: "Custom security policies", included: true }
            ]
          }
        ],
        highlights: [
          "Validaciones personalizadas",
          "Soporte telefónico 24/7",
          "ML predictions incluido",
          "ROI típico: 520%+"
        ],
        cta: "Comenzar Ahora",
        ctaType: "primary"
      },
      {
        id: "enterprise",
        name: "Enterprise",
        tagline: "Para grupos financieros",
        badge: "Más Completo",
        monthlyPrice: null,
        annualPrice: null,
        priceUnit: "contactar",
        description: "Solución completa para AFOREs grandes o grupos con múltiples entidades",
        maxFunds: "Ilimitado",
        filesPerMonth: "100K+",
        recommended: false,
        features: [
          {
            category: "Validación",
            items: [
              { name: "30+ validaciones base CONSAR", included: true },
              { name: "Validación en tiempo real (<3s)", included: true },
              { name: "Formatos CSV, Excel, TXT", included: true },
              {
                name: "Validaciones personalizadas configurables",
                included: true,
                detail: "Ilimitadas"
              },
              {
                name: "Machine Learning predictions",
                included: true,
                detail: "Modelos custom"
              }
            ]
          },
          {
            category: "Infraestructura",
            items: [
              { name: "API REST completa", included: true },
              { name: "Webhooks para eventos", included: true },
              {
                name: "SLA 99.95% uptime",
                included: true,
                detail: "Con penalizaciones"
              },
              { name: "Auto-scaling", included: true },
              {
                name: "Dedicated infrastructure",
                included: true,
                detail: "Cluster dedicado"
              }
            ]
          },
          {
            category: "Reportes & Analytics",
            items: [
              { name: "Dashboard en tiempo real", included: true },
              { name: "Reportes de cumplimiento", included: true },
              { name: "Exportación CSV/Excel/PDF", included: true },
              {
                name: "Análisis predictivo",
                included: true,
                detail: "Advanced analytics"
              },
              {
                name: "Custom dashboards",
                included: true,
                detail: "Ilimitados"
              }
            ]
          },
          {
            category: "Soporte & SLA",
            items: [
              { name: "Soporte por email", included: true },
              { name: "Documentación completa", included: true },
              {
                name: "Response time: 24 horas",
                included: true,
                detail: "1 hora para críticos"
              },
              { name: "Soporte telefónico 24/7", included: true },
              {
                name: "Technical account manager",
                included: true,
                detail: "Dedicado"
              }
            ]
          },
          {
            category: "Seguridad & Compliance",
            items: [
              { name: "Encriptación TLS 1.3", included: true },
              { name: "Multi-tenancy con RLS", included: true },
              { name: "Auditoría completa (7+ años)", included: true },
              { name: "SSO/SAML integration", included: true },
              {
                name: "Custom security policies",
                included: true,
                detail: "Completamente customizable"
              }
            ]
          }
        ],
        highlights: [
          "Account manager dedicado",
          "Capacitación on-site",
          "Consultoría regulatoria",
          "SLA 99.95% con penalizaciones",
          "Integración personalizada",
          "Soporte 1 hora críticos"
        ],
        cta: "Contactar Ventas",
        ctaType: "outline"
      }
    ];
    const addOns = [
      {
        id: "advanced-ml",
        name: "Advanced ML Analytics",
        icon: Sparkles,
        description: "Modelos de machine learning personalizados para predicción de errores y optimización",
        price: 2500,
        priceUnit: "/mes",
        features: [
          "Modelos predictivos custom",
          "Detección de anomalías avanzada",
          "Forecasting de volumen",
          "Optimización automática"
        ]
      },
      {
        id: "multi-country",
        name: "Multi-Country Support",
        icon: Globe,
        description: "Soporte adicional para Chile, Colombia y Perú con validaciones específicas",
        price: 5e3,
        priceUnit: "/país/año",
        features: [
          "Validaciones por regulador",
          "Formatos locales",
          "Compliance regional",
          "Soporte en zona horaria local"
        ]
      },
      {
        id: "white-label",
        name: "White Label",
        icon: Award,
        description: "Plataforma completamente personalizada con su marca y dominio",
        price: 15e3,
        priceUnit: "/año",
        features: [
          "Branding completo",
          "Dominio personalizado",
          "UI/UX customizado",
          "Email templates branded"
        ]
      },
      {
        id: "consulting",
        name: "Consultoría Regulatoria",
        icon: Users,
        description: "Horas de consultoría con expertos en normativa CONSAR y regulación",
        price: 200,
        priceUnit: "/hora",
        features: [
          "Expertos certificados",
          "Análisis de compliance",
          "Preparación auditorías",
          "Training personalizado"
        ]
      }
    ];
    function formatPrice(tier) {
      if (!tier.annualPrice) return "Personalizado";
      const price = tier.annualPrice;
      return `$${price.toLocaleString()}`;
    }
    function formatCurrency(value) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    $$renderer2.push(`<section id="pricing" class="relative py-24 px-4 md:px-8 bg-white overflow-hidden"><div class="absolute inset-0 opacity-5"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 2px 2px, #0066FF 1px, transparent 0); background-size: 50px 50px;"></div></div> <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-success/5 rounded-full blur-3xl"></div> <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"></div> <div class="container-custom relative z-10"><div${attr_class(`text-center mb-16 ${stringify("opacity-0")}`, "svelte-eosgnn")}><div class="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-4">`);
    Dollar_sign($$renderer2, { class: "w-4 h-4" });
    $$renderer2.push(`<!----> Precios Transparentes y Escalables</div> <h2 class="text-4xl md:text-5xl font-bold text-primary-dark mb-4">Planes que <span class="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">Escalan con Tu AFORE</span></h2> <p class="text-xl text-neutral-600 max-w-3xl mx-auto mb-8">Sin costos ocultos, sin sorpresas. Pague solo por lo que usa con la flexibilidad de
				escalar según sus necesidades crecen.</p> <div class="inline-flex items-center gap-4 p-2 bg-neutral-100 rounded-full"><button${attr_class(`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${stringify("text-neutral-600 hover:text-primary")}`)}>Mensual</button> <button${attr_class(`px-6 py-2 rounded-full font-semibold transition-all duration-300 relative ${stringify(
      "bg-white text-primary shadow-md"
    )}`)}>Anual <span class="absolute -top-2 -right-2 px-2 py-0.5 bg-success text-white text-xs font-bold rounded-full">-17%</span></button></div></div> <div${attr_class(`grid lg:grid-cols-3 gap-8 mb-16 ${stringify("opacity-0")}`, "svelte-eosgnn")}><!--[-->`);
    const each_array = ensure_array_like(pricingTiers);
    for (let $$index_3 = 0, $$length = each_array.length; $$index_3 < $$length; $$index_3++) {
      let tier = each_array[$$index_3];
      $$renderer2.push(`<div${attr_class(`relative p-8 bg-white border-2 rounded-3xl transition-all duration-300 hover:shadow-2xl ${stringify(tier.recommended ? "border-primary shadow-xl scale-105" : "border-neutral-200 hover:border-primary/50")}`)}>`);
      if (tier.badge) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-success text-white text-sm font-bold rounded-full shadow-lg">${escape_html(tier.badge)}</div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <div class="text-center mb-6"><h3 class="text-2xl font-bold text-primary-dark mb-2">${escape_html(tier.name)}</h3> <p class="text-neutral-600 text-sm mb-4">${escape_html(tier.tagline)}</p> <div class="mb-4">`);
      if (tier.annualPrice) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="text-5xl font-bold text-primary mb-2">${escape_html(formatPrice(tier))}</div> <div class="text-neutral-600 text-sm">${escape_html(tier.priceUnit)} / ${escape_html("año")}</div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="text-4xl font-bold text-primary mb-2">Personalizado</div> <div class="text-neutral-600 text-sm">Contactar ventas</div>`);
      }
      $$renderer2.push(`<!--]--></div> <p class="text-sm text-neutral-600">${escape_html(tier.description)}</p></div> <div class="grid grid-cols-2 gap-4 mb-6 p-4 bg-neutral-50 rounded-xl"><div class="text-center"><div class="text-2xl font-bold text-primary-dark">${escape_html(tier.maxFunds)}</div> <div class="text-xs text-neutral-600">Fondos</div></div> <div class="text-center"><div class="text-2xl font-bold text-primary-dark">${escape_html(tier.filesPerMonth)}</div> <div class="text-xs text-neutral-600">Archivos/Mes</div></div></div> <div class="mb-6"><h4 class="text-sm font-semibold text-neutral-900 mb-3">Características Destacadas:</h4> <ul class="space-y-2"><!--[-->`);
      const each_array_1 = ensure_array_like(tier.highlights);
      for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
        let highlight = each_array_1[$$index];
        $$renderer2.push(`<li class="flex items-center gap-2 text-sm">`);
        Circle_check($$renderer2, { class: "w-4 h-4 text-success flex-shrink-0" });
        $$renderer2.push(`<!----> <span class="text-neutral-700">${escape_html(highlight)}</span></li>`);
      }
      $$renderer2.push(`<!--]--></ul></div> <a href="#contact"${attr_class(`block w-full px-6 py-4 rounded-xl font-semibold text-center transition-all duration-300 hover:scale-105 ${stringify(tier.recommended ? "bg-gradient-to-r from-primary to-success text-white shadow-lg hover:shadow-xl" : tier.ctaType === "primary" ? "bg-primary text-white hover:bg-primary-dark" : "border-2 border-primary text-primary hover:bg-primary hover:text-white")}`)}>${escape_html(tier.cta)}</a> <button class="w-full mt-4 px-4 py-2 text-sm text-primary font-semibold hover:text-primary-dark transition-colors flex items-center justify-center gap-2"><span>${escape_html(selectedTier === tier.id ? "Ocultar" : "Ver")} Detalles Completos</span> `);
      Chevron_right($$renderer2, {
        class: `w-4 h-4 transition-transform ${stringify(selectedTier === tier.id ? "rotate-90" : "")}`
      });
      $$renderer2.push(`<!----></button> `);
      if (selectedTier === tier.id) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="mt-6 pt-6 border-t border-neutral-200 space-y-4"><!--[-->`);
        const each_array_2 = ensure_array_like(tier.features);
        for (let $$index_2 = 0, $$length2 = each_array_2.length; $$index_2 < $$length2; $$index_2++) {
          let category = each_array_2[$$index_2];
          $$renderer2.push(`<div><h5 class="text-sm font-bold text-neutral-900 mb-3">${escape_html(category.category)}</h5> <ul class="space-y-2"><!--[-->`);
          const each_array_3 = ensure_array_like(category.items);
          for (let $$index_1 = 0, $$length3 = each_array_3.length; $$index_1 < $$length3; $$index_1++) {
            let item = each_array_3[$$index_1];
            $$renderer2.push(`<li class="flex items-start gap-2 text-xs">`);
            if (item.included) {
              $$renderer2.push("<!--[-->");
              Check($$renderer2, { class: "w-4 h-4 text-success flex-shrink-0 mt-0.5" });
            } else {
              $$renderer2.push("<!--[!-->");
              X($$renderer2, { class: "w-4 h-4 text-neutral-300 flex-shrink-0 mt-0.5" });
            }
            $$renderer2.push(`<!--]--> <div class="flex-1"><span${attr_class(clsx(item.included ? "text-neutral-700" : "text-neutral-400"))}>${escape_html(item.name)}</span> `);
            if (item.detail) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<span class="text-neutral-500 ml-1">(${escape_html(item.detail)})</span>`);
            } else {
              $$renderer2.push("<!--[!-->");
            }
            $$renderer2.push(`<!--]--></div></li>`);
          }
          $$renderer2.push(`<!--]--></ul></div>`);
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div> <div${attr_class(`text-center mb-12 ${stringify("opacity-0")}`, "svelte-eosgnn")}><button class="inline-flex items-center gap-3 px-8 py-4 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-xl font-semibold text-primary-dark transition-all duration-300 group">`);
    Chart_column($$renderer2, { class: "w-5 h-5" });
    $$renderer2.push(`<!----> <span>${escape_html("Ver")} Comparación Completa de Planes</span> `);
    Chevron_right($$renderer2, {
      class: `w-5 h-5 transition-transform ${stringify("")}`
    });
    $$renderer2.push(`<!----></button></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div${attr_class(`mb-16 ${stringify("opacity-0")}`, "svelte-eosgnn")}><div class="p-8 bg-gradient-to-br from-primary-dark via-primary to-primary-dark text-white rounded-3xl"><div class="text-center mb-8"><div class="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">`);
    Calculator($$renderer2, { class: "w-4 h-4" });
    $$renderer2.push(`<!----> Calculadora de ROI</div> <h3 class="text-3xl font-bold mb-2">Calcule Su Retorno de Inversión</h3> <p class="text-white/80 max-w-2xl mx-auto">Vea cuánto puede ahorrar su AFORE con Hergon basado en sus métricas actuales</p></div> <div class="grid lg:grid-cols-2 gap-8"><div class="space-y-6"><div class="p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20"><h4 class="text-lg font-semibold mb-6">Sus Métricas Actuales</h4> <div class="mb-6"><label for="fondos-slider" class="block text-sm font-medium mb-2">Número de Fondos <span class="text-white/60">(Básica, Ahorro, etc.)</span></label> <input id="fondos-slider" type="range" min="1" max="20"${attr("value", fondos)} class="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider svelte-eosgnn"/> <div class="flex justify-between text-sm text-white/80 mt-2"><span>1</span> <span class="text-xl font-bold text-white">${escape_html(fondos)} fondos</span> <span>20</span></div></div> <div class="mb-6"><label for="archivos-slider" class="block text-sm font-medium mb-2">Archivos Procesados por Mes</label> <input id="archivos-slider" type="range" min="100" max="10000" step="100"${attr("value", archivosPerMonth)} class="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider svelte-eosgnn"/> <div class="flex justify-between text-sm text-white/80 mt-2"><span>100</span> <span class="text-xl font-bold text-white">${escape_html(archivosPerMonth.toLocaleString())}</span> <span>10K</span></div></div> <div class="mb-6"><label for="staff-slider" class="block text-sm font-medium mb-2">Personal Dedicado a Validación (FTE)</label> <input id="staff-slider" type="range" min="1" max="10"${attr("value", currentStaff)} class="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider svelte-eosgnn"/> <div class="flex justify-between text-sm text-white/80 mt-2"><span>1</span> <span class="text-xl font-bold text-white">${escape_html(currentStaff)} personas</span> <span>10</span></div></div> <div><label for="error-slider" class="block text-sm font-medium mb-2">Tasa de Error Actual (%)</label> <input id="error-slider" type="range" min="5" max="50"${attr("value", currentErrorRate)} class="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider svelte-eosgnn"/> <div class="flex justify-between text-sm text-white/80 mt-2"><span>5%</span> <span class="text-xl font-bold text-white">${escape_html(currentErrorRate)}%</span> <span>50%</span></div></div></div></div> <div class="space-y-4"><div class="p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20"><h4 class="text-lg font-semibold mb-6">Resultados Estimados</h4> <div class="space-y-4 mb-6"><div class="p-4 bg-white/5 rounded-xl"><div class="flex items-center justify-between mb-2"><div class="flex items-center gap-2">`);
    Users($$renderer2, { class: "w-5 h-5 text-success" });
    $$renderer2.push(`<!----> <span class="text-sm">Ahorro en Personal</span></div> <span class="text-xl font-bold">${escape_html(formatCurrency(calculatedSavings.staffSavings))}</span></div> <div class="text-xs text-white/60">Reducción de ${escape_html(currentStaff)} a ${escape_html(Math.ceil(currentStaff * 0.2))} FTE (80% reducción)</div></div> <div class="p-4 bg-white/5 rounded-xl"><div class="flex items-center justify-between mb-2"><div class="flex items-center gap-2">`);
    Clock($$renderer2, { class: "w-5 h-5 text-success" });
    $$renderer2.push(`<!----> <span class="text-sm">Ahorro en Tiempo</span></div> <span class="text-xl font-bold">${escape_html(formatCurrency(calculatedSavings.timeSavings))}</span></div> <div class="text-xs text-white/60">De 30 min/archivo a 3 segundos (99.9% más rápido)</div></div> <div class="p-4 bg-white/5 rounded-xl"><div class="flex items-center justify-between mb-2"><div class="flex items-center gap-2">`);
    Shield($$renderer2, { class: "w-5 h-5 text-success" });
    $$renderer2.push(`<!----> <span class="text-sm">Ahorro por Reducción de Errores</span></div> <span class="text-xl font-bold">${escape_html(formatCurrency(calculatedSavings.errorSavings))}</span></div> <div class="text-xs text-white/60">De ${escape_html(currentErrorRate)}% a 0.1% tasa de error</div></div></div> <div class="pt-6 border-t border-white/20"><div class="mb-4"><div class="text-sm text-white/80 mb-1">Ahorro Anual Total</div> <div class="text-4xl font-bold text-success">${escape_html(formatCurrency(calculatedSavings.totalAnnualSavings))}</div></div> <div class="grid grid-cols-2 gap-4"><div class="p-4 bg-white/5 rounded-xl text-center"><div class="text-2xl font-bold text-warning mb-1">${escape_html(calculatedSavings.roi.toFixed(0))}%</div> <div class="text-xs text-white/80">ROI Año 1</div></div> <div class="p-4 bg-white/5 rounded-xl text-center"><div class="text-2xl font-bold text-warning mb-1">${escape_html(calculatedSavings.paybackMonths)}</div> <div class="text-xs text-white/80">Meses de Payback</div></div></div></div></div> <a href="#contact" class="block w-full px-6 py-4 bg-white text-primary font-bold text-center rounded-xl hover:bg-neutral-100 transition-all duration-300 hover:scale-105">Solicitar Análisis Detallado</a></div></div></div></div> <div${attr_class(`mb-16 ${stringify("opacity-0")}`, "svelte-eosgnn")}><div class="text-center mb-12"><h3 class="text-3xl font-bold text-primary-dark mb-4">Servicios Adicionales</h3> <p class="text-lg text-neutral-600 max-w-2xl mx-auto">Expanda las capacidades de su plataforma con nuestros servicios complementarios</p></div> <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6"><!--[-->`);
    const each_array_7 = ensure_array_like(addOns);
    for (let $$index_8 = 0, $$length = each_array_7.length; $$index_8 < $$length; $$index_8++) {
      let addon = each_array_7[$$index_8];
      const Icon2 = addon.icon;
      $$renderer2.push(`<div class="p-6 bg-white border border-neutral-200 rounded-2xl hover:border-primary hover:shadow-lg transition-all duration-300 group"><div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><!---->`);
      Icon2($$renderer2, { class: "w-6 h-6 text-primary" });
      $$renderer2.push(`<!----></div> <h4 class="text-lg font-bold text-primary-dark mb-2">${escape_html(addon.name)}</h4> <p class="text-sm text-neutral-600 mb-4">${escape_html(addon.description)}</p> <div class="mb-4"><span class="text-2xl font-bold text-primary">$${escape_html(addon.price.toLocaleString())}</span> <span class="text-sm text-neutral-600">${escape_html(addon.priceUnit)}</span></div> <ul class="space-y-2"><!--[-->`);
      const each_array_8 = ensure_array_like(addon.features);
      for (let $$index_7 = 0, $$length2 = each_array_8.length; $$index_7 < $$length2; $$index_7++) {
        let feature = each_array_8[$$index_7];
        $$renderer2.push(`<li class="flex items-center gap-2 text-xs text-neutral-700">`);
        Check($$renderer2, { class: "w-3 h-3 text-success flex-shrink-0" });
        $$renderer2.push(`<!----> <span>${escape_html(feature)}</span></li>`);
      }
      $$renderer2.push(`<!--]--></ul></div>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div${attr_class(`text-center ${stringify("opacity-0")}`, "svelte-eosgnn")}><div class="p-8 bg-neutral-50 border border-neutral-200 rounded-3xl max-w-4xl mx-auto">`);
    Info($$renderer2, { class: "w-12 h-12 text-primary mx-auto mb-4" });
    $$renderer2.push(`<!----> <h3 class="text-2xl font-bold text-primary-dark mb-4">¿Preguntas sobre Precios?</h3> <p class="text-neutral-600 mb-6">Todos los planes incluyen actualizaciones automáticas, soporte técnico, y acceso completo
					a nuevas funcionalidades sin costo adicional. Los precios se ajustan automáticamente al
					crecer su número de fondos.</p> <div class="flex flex-wrap justify-center gap-4"><a href="#contact" class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all duration-300"><span>Hablar con Ventas</span> `);
    Arrow_right($$renderer2, { class: "w-5 h-5" });
    $$renderer2.push(`<!----></a> <a href="#contact" class="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary hover:text-white transition-all duration-300"><span>Solicitar Demo</span> `);
    Arrow_right($$renderer2, { class: "w-5 h-5" });
    $$renderer2.push(`<!----></a></div></div></div></div></section>`);
  });
}
function ContactSection($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let contactMethod = "demo";
    let selectedPlan = "professional";
    let preferredTime = "";
    let formData = {
      name: "",
      email: "",
      company: "",
      country: "mexico",
      phone: "",
      fondos: "",
      archivosPerMonth: "",
      message: "",
      agreeToTerms: false
    };
    const contactMethods = [
      {
        id: "demo",
        icon: Video,
        title: "Agendar Demo",
        description: "Demo personalizada de 30 minutos",
        badge: "Más Popular",
        benefits: [
          "Demo en vivo con experto",
          "Análisis de sus archivos",
          "Prueba con datos reales",
          "ROI personalizado"
        ]
      },
      {
        id: "contact",
        icon: Message_square,
        title: "Contacto General",
        description: "Información y cotización",
        badge: null,
        benefits: [
          "Respuesta en 24 horas",
          "Cotización detallada",
          "Plan personalizado",
          "Sin compromiso"
        ]
      },
      {
        id: "support",
        icon: Headphones,
        title: "Soporte Técnico",
        description: "Para clientes actuales",
        badge: "Clientes",
        benefits: [
          "Soporte prioritario",
          "Acceso a documentación",
          "Chat en vivo",
          "Portal de tickets"
        ]
      }
    ];
    const offices = [
      {
        country: "México",
        flag: "🇲🇽",
        city: "Ciudad de México",
        address: "Paseo de la Reforma 505",
        neighborhood: "Cuauhtémoc",
        zipCode: "06500",
        phone: "+52 55 1234 5678",
        email: "mexico@hergon.com",
        hours: "Lun-Vie: 9:00 - 18:00",
        timezone: "GMT-6",
        isPrimary: true
      },
      {
        country: "Chile",
        flag: "🇨🇱",
        city: "Santiago",
        address: "Av. Apoquindo 4800",
        neighborhood: "Las Condes",
        zipCode: "7550000",
        phone: "+56 2 2345 6789",
        email: "chile@hergon.com",
        hours: "Lun-Vie: 9:00 - 18:00",
        timezone: "GMT-3",
        isPrimary: false
      }
    ];
    const countries = [
      { value: "mexico", label: "México" },
      { value: "chile", label: "Chile" },
      { value: "colombia", label: "Colombia" },
      { value: "peru", label: "Perú" },
      { value: "other", label: "Otro" }
    ];
    const timeSlots = [
      { value: "morning", label: "Mañana (9:00 - 12:00)" },
      { value: "afternoon", label: "Tarde (12:00 - 15:00)" },
      { value: "evening", label: "Tarde-Noche (15:00 - 18:00)" }
    ];
    const plans = [
      { value: "starter", label: "Starter (1-5 fondos)" },
      { value: "professional", label: "Professional (6-15 fondos)" },
      { value: "enterprise", label: "Enterprise (15+ fondos)" },
      { value: "not-sure", label: "No estoy seguro" }
    ];
    const faqs = [
      {
        question: "¿Cuánto tiempo toma la implementación?",
        answer: "La implementación típica toma 2-4 semanas desde el contrato hasta go-live. Incluye setup, integración con sus sistemas, capacitación y validación con archivos reales."
      },
      {
        question: "¿Ofrecen período de prueba?",
        answer: "Sí, ofrecemos un piloto de 30 días donde puede probar la plataforma con sus archivos reales. Sin compromiso y con soporte completo durante el período de prueba."
      },
      {
        question: "¿Qué tipo de soporte incluyen?",
        answer: "Todos los planes incluyen soporte técnico por email. Professional y Enterprise incluyen soporte telefónico 24/7. Enterprise incluye account manager dedicado."
      },
      {
        question: "¿Los datos están seguros?",
        answer: "Absolutamente. Utilizamos encriptación TLS 1.3, almacenamiento AES-256, multi-tenancy con RLS, y cumplimos con SOC 2 e ISO 27001. Auditorías trimestrales de penetration testing."
      }
    ];
    $$renderer2.push(`<section id="contact" class="relative py-24 px-4 md:px-8 bg-gradient-to-br from-neutral-50 via-white to-neutral-50 overflow-hidden"><div class="absolute inset-0 opacity-5"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 2px 2px, #0066FF 1px, transparent 0); background-size: 40px 40px;"></div></div> <div class="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"></div> <div class="absolute bottom-0 right-0 w-[600px] h-[600px] bg-success/5 rounded-full blur-3xl"></div> <div class="container-custom relative z-10"><div${attr_class(`text-center mb-16 ${stringify("opacity-0")}`, "svelte-1mt7jo5")}><div class="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-4">`);
    Message_square($$renderer2, { class: "w-4 h-4" });
    $$renderer2.push(`<!----> Comience Hoy Mismo</div> <h2 class="text-4xl md:text-5xl font-bold text-primary-dark mb-4">Hable con <span class="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">Nuestro Equipo</span></h2> <p class="text-xl text-neutral-600 max-w-3xl mx-auto">Solicite una demo personalizada, obtenga una cotización o consulte con nuestros expertos
				en compliance. Respuesta garantizada en 24 horas.</p></div> <div${attr_class(`mb-12 ${stringify("opacity-0")}`, "svelte-1mt7jo5")}><div class="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"><!--[-->`);
    const each_array = ensure_array_like(contactMethods);
    for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
      let method = each_array[$$index_1];
      const Icon2 = method.icon;
      $$renderer2.push(`<button${attr_class(`relative p-6 bg-white border-2 rounded-2xl transition-all duration-300 text-left hover:shadow-xl hover:-translate-y-1 ${stringify(contactMethod === method.id ? "border-primary shadow-lg shadow-primary/20" : "border-neutral-200 hover:border-primary/50")}`)}>`);
      if (method.badge) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="absolute -top-3 right-4 px-3 py-1 bg-gradient-to-r from-primary to-success text-white text-xs font-bold rounded-full">${escape_html(method.badge)}</div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <div class="flex items-start gap-4 mb-4"><div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><!---->`);
      Icon2($$renderer2, { class: "w-6 h-6 text-primary" });
      $$renderer2.push(`<!----></div> <div class="flex-1"><h3 class="text-lg font-bold text-primary-dark mb-1">${escape_html(method.title)}</h3> <p class="text-sm text-neutral-600">${escape_html(method.description)}</p></div></div> <ul class="space-y-2"><!--[-->`);
      const each_array_1 = ensure_array_like(method.benefits);
      for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
        let benefit = each_array_1[$$index];
        $$renderer2.push(`<li class="flex items-center gap-2 text-sm text-neutral-700">`);
        Circle_check($$renderer2, { class: "w-4 h-4 text-success flex-shrink-0" });
        $$renderer2.push(`<!----> <span>${escape_html(benefit)}</span></li>`);
      }
      $$renderer2.push(`<!--]--></ul> `);
      if (contactMethod === method.id) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="absolute -bottom-3 left-1/2 -translate-x-1/2"><div class="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-primary"></div></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></button>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div${attr_class(`grid lg:grid-cols-3 gap-8 mb-16 ${stringify("opacity-0")}`, "svelte-1mt7jo5")}><div class="lg:col-span-2"><div class="p-8 bg-white border border-neutral-200 rounded-3xl shadow-lg">`);
    {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<form class="space-y-6"><div><h3 class="text-2xl font-bold text-primary-dark mb-2">`);
      {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`Agendar Demo Personalizada`);
      }
      $$renderer2.push(`<!--]--></h3> <p class="text-sm text-neutral-600">Complete el formulario y nos pondremos en contacto lo antes posible</p></div> <div class="grid md:grid-cols-2 gap-6"><div><label for="name" class="block text-sm font-medium text-neutral-700 mb-2">Nombre Completo *</label> <input type="text" id="name"${attr("value", formData.name)}${attr_class(`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${stringify("border-neutral-300")}`)} placeholder="Juan Pérez"/> `);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> <div><label for="email" class="block text-sm font-medium text-neutral-700 mb-2">Email Corporativo *</label> <input type="email" id="email"${attr("value", formData.email)}${attr_class(`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${stringify("border-neutral-300")}`)} placeholder="juan.perez@afore.com"/> `);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div></div> <div class="grid md:grid-cols-2 gap-6"><div><label for="company" class="block text-sm font-medium text-neutral-700 mb-2">AFORE / AFP *</label> <input type="text" id="company"${attr("value", formData.company)}${attr_class(`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${stringify("border-neutral-300")}`)} placeholder="AFORE XXX"/> `);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> <div><label for="country" class="block text-sm font-medium text-neutral-700 mb-2">País *</label> `);
      $$renderer2.select(
        {
          id: "country",
          value: formData.country,
          class: "w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        },
        ($$renderer3) => {
          $$renderer3.push(`<!--[-->`);
          const each_array_2 = ensure_array_like(countries);
          for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
            let country = each_array_2[$$index_2];
            $$renderer3.option({ value: country.value }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(country.label)}`);
            });
          }
          $$renderer3.push(`<!--]-->`);
        }
      );
      $$renderer2.push(`</div></div> <div class="grid md:grid-cols-2 gap-6"><div><label for="phone" class="block text-sm font-medium text-neutral-700 mb-2">Teléfono</label> <input type="tel" id="phone"${attr("value", formData.phone)} class="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all" placeholder="+52 55 1234 5678"/></div> <div><label for="fondos" class="block text-sm font-medium text-neutral-700 mb-2">Número de Fondos</label> <input type="number" id="fondos"${attr("value", formData.fondos)} class="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all" placeholder="5" min="1"/></div></div> `);
      {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="grid md:grid-cols-2 gap-6"><div><label for="plan" class="block text-sm font-medium text-neutral-700 mb-2">Plan de Interés</label> `);
        $$renderer2.select(
          {
            id: "plan",
            value: selectedPlan,
            class: "w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          },
          ($$renderer3) => {
            $$renderer3.push(`<!--[-->`);
            const each_array_3 = ensure_array_like(plans);
            for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
              let plan = each_array_3[$$index_3];
              $$renderer3.option({ value: plan.value }, ($$renderer4) => {
                $$renderer4.push(`${escape_html(plan.label)}`);
              });
            }
            $$renderer3.push(`<!--]-->`);
          }
        );
        $$renderer2.push(`</div> <div><label for="time" class="block text-sm font-medium text-neutral-700 mb-2">Horario Preferido</label> `);
        $$renderer2.select(
          {
            id: "time",
            value: preferredTime,
            class: "w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          },
          ($$renderer3) => {
            $$renderer3.option({ value: "" }, ($$renderer4) => {
              $$renderer4.push(`Seleccionar horario`);
            });
            $$renderer3.push(`<!--[-->`);
            const each_array_4 = ensure_array_like(timeSlots);
            for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
              let slot2 = each_array_4[$$index_4];
              $$renderer3.option({ value: slot2.value }, ($$renderer4) => {
                $$renderer4.push(`${escape_html(slot2.label)}`);
              });
            }
            $$renderer3.push(`<!--]-->`);
          }
        );
        $$renderer2.push(`</div></div> <div><label for="archivos" class="block text-sm font-medium text-neutral-700 mb-2">Archivos Procesados por Mes (aprox)</label> <input type="number" id="archivos"${attr("value", formData.archivosPerMonth)} class="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all" placeholder="500" min="0"/></div>`);
      }
      $$renderer2.push(`<!--]--> `);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <div><label for="message" class="block text-sm font-medium text-neutral-700 mb-2">Mensaje / Comentarios</label> <textarea id="message" rows="4" class="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none" placeholder="Cuéntenos sobre sus necesidades de validación...">`);
      const $$body = escape_html(formData.message);
      if ($$body) {
        $$renderer2.push(`${$$body}`);
      }
      $$renderer2.push(`</textarea></div> <div class="flex items-start gap-3"><input type="checkbox" id="terms"${attr("checked", formData.agreeToTerms, true)} class="mt-1 w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary"/> <label for="terms" class="text-sm text-neutral-600">Acepto los términos de servicio y política de privacidad de Hergon. Autorizo el
									contacto comercial.</label></div> <button type="submit"${attr("disabled", true, true)} class="w-full px-8 py-4 bg-gradient-to-r from-primary to-success text-white font-bold rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3">`);
      {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<span>${escape_html(
          "Agendar Demo Gratuita"
        )}</span> `);
        Arrow_right($$renderer2, { class: "w-5 h-5" });
        $$renderer2.push(`<!---->`);
      }
      $$renderer2.push(`<!--]--></button> <p class="text-xs text-neutral-500 text-center">* Respuesta garantizada en menos de 24 horas hábiles</p></form>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div class="space-y-6"><div class="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm"><h4 class="text-lg font-bold text-primary-dark mb-4">Por Qué Elegirnos</h4> <div class="space-y-4"><div class="flex items-start gap-3"><div class="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">`);
    Zap($$renderer2, { class: "w-5 h-5 text-success" });
    $$renderer2.push(`<!----></div> <div><div class="text-2xl font-bold text-primary-dark">24h</div> <div class="text-sm text-neutral-600">Tiempo de respuesta</div></div></div> <div class="flex items-start gap-3"><div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">`);
    Users($$renderer2, { class: "w-5 h-5 text-primary" });
    $$renderer2.push(`<!----></div> <div><div class="text-2xl font-bold text-primary-dark">2</div> <div class="text-sm text-neutral-600">AFOREs en producción</div></div></div> <div class="flex items-start gap-3"><div class="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center flex-shrink-0">`);
    Trending_up($$renderer2, { class: "w-5 h-5 text-warning" });
    $$renderer2.push(`<!----></div> <div><div class="text-2xl font-bold text-primary-dark">520%</div> <div class="text-sm text-neutral-600">ROI promedio año 1</div></div></div> <div class="flex items-start gap-3"><div class="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">`);
    Shield($$renderer2, { class: "w-5 h-5 text-success" });
    $$renderer2.push(`<!----></div> <div><div class="text-2xl font-bold text-primary-dark">99.9%</div> <div class="text-sm text-neutral-600">Uptime SLA</div></div></div></div></div> <div class="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm"><h4 class="text-lg font-bold text-primary-dark mb-4">Nuestras Oficinas</h4> <div class="space-y-4"><!--[-->`);
    const each_array_5 = ensure_array_like(offices);
    for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
      let office = each_array_5[$$index_5];
      $$renderer2.push(`<div class="p-4 bg-neutral-50 rounded-xl"><div class="flex items-center gap-2 mb-3"><span class="text-2xl">${escape_html(office.flag)}</span> <div><div class="font-bold text-neutral-900">${escape_html(office.city)}</div> <div class="text-xs text-neutral-600">${escape_html(office.country)}</div></div> `);
      if (office.isPrimary) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span class="ml-auto px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">Principal</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> <div class="space-y-2 text-sm"><div class="flex items-start gap-2">`);
      Map_pin($$renderer2, { class: "w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" });
      $$renderer2.push(`<!----> <div class="text-neutral-600">${escape_html(office.address)}<br/> ${escape_html(office.neighborhood)}, ${escape_html(office.zipCode)}</div></div> <div class="flex items-center gap-2">`);
      Phone($$renderer2, { class: "w-4 h-4 text-neutral-400 flex-shrink-0" });
      $$renderer2.push(`<!----> <a${attr("href", `tel:${stringify(office.phone)}`)} class="text-primary hover:underline">${escape_html(office.phone)}</a></div> <div class="flex items-center gap-2">`);
      Mail($$renderer2, { class: "w-4 h-4 text-neutral-400 flex-shrink-0" });
      $$renderer2.push(`<!----> <a${attr("href", `mailto:${stringify(office.email)}`)} class="text-primary hover:underline">${escape_html(office.email)}</a></div> <div class="flex items-center gap-2">`);
      Clock($$renderer2, { class: "w-4 h-4 text-neutral-400 flex-shrink-0" });
      $$renderer2.push(`<!----> <span class="text-neutral-600">${escape_html(office.hours)}</span></div></div></div>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div class="p-6 bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl"><h4 class="text-lg font-bold mb-4">Contacto Directo</h4> <div class="space-y-3 text-sm"><a href="mailto:info@hergon.com" class="flex items-center gap-3 hover:text-white/80">`);
    Mail($$renderer2, { class: "w-5 h-5" });
    $$renderer2.push(`<!----> <span>info@hergon.com</span></a> <a href="tel:+525512345678" class="flex items-center gap-3 hover:text-white/80">`);
    Phone($$renderer2, { class: "w-5 h-5" });
    $$renderer2.push(`<!----> <span>+52 55 1234 5678</span></a> <div class="pt-4 border-t border-white/20"><p class="text-xs text-white/80 mb-3">Síguenos en:</p> <div class="flex gap-3"><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" class="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors" aria-label="LinkedIn">`);
    Linkedin($$renderer2, { class: "w-5 h-5" });
    $$renderer2.push(`<!----></a> <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" class="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors" aria-label="Twitter">`);
    Twitter($$renderer2, { class: "w-5 h-5" });
    $$renderer2.push(`<!----></a></div></div></div></div></div></div> <div${attr_class(`mb-16 ${stringify("opacity-0")}`, "svelte-1mt7jo5")}><h3 class="text-2xl font-bold text-primary-dark text-center mb-8">Preguntas Frecuentes</h3> <div class="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto"><!--[-->`);
    const each_array_6 = ensure_array_like(faqs);
    for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
      let faq = each_array_6[$$index_6];
      $$renderer2.push(`<div class="p-6 bg-white border border-neutral-200 rounded-2xl"><div class="flex items-start gap-3 mb-3">`);
      Info($$renderer2, { class: "w-5 h-5 text-primary flex-shrink-0 mt-0.5" });
      $$renderer2.push(`<!----> <h4 class="font-bold text-neutral-900">${escape_html(faq.question)}</h4></div> <p class="text-sm text-neutral-600 pl-8">${escape_html(faq.answer)}</p></div>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div${attr_class(`text-center ${stringify("opacity-0")}`, "svelte-1mt7jo5")}><div class="p-8 bg-neutral-50 border border-neutral-200 rounded-3xl max-w-4xl mx-auto"><h3 class="text-2xl font-bold text-primary-dark mb-4">¿Listo para Transformar su Validación?</h3> <p class="text-neutral-600 mb-6">Únase a las AFOREs que ya confían en Hergon para validación automatizada y cumplimiento
					garantizado. Demo gratuita, sin compromiso.</p> <div class="flex flex-wrap justify-center gap-4"><button class="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-success text-white font-bold rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105">`);
    Video($$renderer2, { class: "w-5 h-5" });
    $$renderer2.push(`<!----> <span>Agendar Demo</span></button> <a href="#pricing" class="inline-flex items-center gap-2 px-8 py-4 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all duration-300">`);
    File_text($$renderer2, { class: "w-5 h-5" });
    $$renderer2.push(`<!----> <span>Ver Planes</span></a></div></div></div></div></section>`);
  });
}
function FinalCTASection($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let activeStep = 0;
    const nextSteps = [
      {
        step: 1,
        icon: Message_square,
        title: "Contacto Inicial",
        description: "Agende una llamada de 15 min",
        duration: "Hoy",
        color: "primary"
      },
      {
        step: 2,
        icon: Video,
        title: "Demo Personalizada",
        description: "Vea Hergon con sus archivos",
        duration: "2-3 días",
        color: "success"
      },
      {
        step: 3,
        icon: File_text,
        title: "Propuesta & ROI",
        description: "Análisis detallado de valor",
        duration: "1 semana",
        color: "warning"
      },
      {
        step: 4,
        icon: Zap,
        title: "Implementación",
        description: "Go-live en 2-4 semanas",
        duration: "2-4 semanas",
        color: "primary"
      }
    ];
    const finalBenefits = [
      {
        icon: Clock,
        stat: "99.9%",
        label: "Reducción de Tiempo",
        description: "De 48 horas a 3 segundos"
      },
      {
        icon: Dollar_sign,
        stat: "86%",
        label: "Reducción de Costos",
        description: "Ahorro anual promedio"
      },
      {
        icon: Shield,
        stat: "99.7%",
        label: "Menos Errores",
        description: "Precisión automatizada"
      },
      {
        icon: Trending_up,
        stat: "520%",
        label: "ROI Año 1",
        description: "Retorno verificado"
      }
    ];
    const socialProof = [
      { icon: Building_2, value: "2", label: "AFOREs Activas" },
      { icon: File_text, value: "10K+", label: "Archivos/Mes" },
      { icon: Award, value: "37", label: "Validaciones" },
      { icon: Users, value: "100%", label: "Satisfacción" }
    ];
    const urgencyReasons = [
      {
        icon: Target,
        title: "Cumplimiento CONSAR 2026",
        description: "Nuevas normativas requieren automatización"
      },
      {
        icon: Trending_up,
        title: "Ventaja Competitiva",
        description: "Sus competidores ya están automatizando"
      },
      {
        icon: Dollar_sign,
        title: "Ahorro Inmediato",
        description: "Cada mes sin Hergon es dinero perdido"
      }
    ];
    $$renderer2.push(`<section class="relative py-24 px-4 md:px-8 bg-gradient-to-br from-primary-dark via-primary to-primary-dark text-white overflow-hidden"><div class="absolute inset-0 opacity-10"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 50px 50px;"></div></div> <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div> <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-success/10 rounded-full blur-3xl"></div> <div class="container-custom relative z-10"><div${attr_class(`text-center mb-16 ${stringify("opacity-0")}`, "svelte-wzcawx")}><div class="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-sm font-medium mb-6">`);
    Sparkles($$renderer2, { class: "w-4 h-4" });
    $$renderer2.push(`<!----> Transforme su Validación Hoy</div> <h2 class="text-4xl md:text-6xl font-bold mb-6 leading-tight">¿Listo para Automatizar <br/> <span class="bg-gradient-to-r from-success to-warning bg-clip-text text-transparent">su Compliance?</span></h2> <p class="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">Únase a las AFOREs que ya confían en Hergon para validación automatizada, cumplimiento
				garantizado, y ROI del 520% en el primer año.</p> <div class="flex flex-wrap justify-center gap-4 mb-8"><a href="#contact" class="inline-flex items-center gap-3 px-8 py-5 bg-white text-primary font-bold text-lg rounded-xl hover:bg-neutral-100 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 group">`);
    Video($$renderer2, { class: "w-6 h-6" });
    $$renderer2.push(`<!----> <span>Agendar Demo Gratuita</span> `);
    Arrow_right($$renderer2, {
      class: "w-6 h-6 group-hover:translate-x-1 transition-transform"
    });
    $$renderer2.push(`<!----></a> <a href="#pricing" class="inline-flex items-center gap-3 px-8 py-5 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold text-lg rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105">`);
    File_text($$renderer2, { class: "w-6 h-6" });
    $$renderer2.push(`<!----> <span>Ver Planes y Precios</span></a></div> <p class="text-sm text-white/70">✓ Demo en vivo con sus archivos   
				✓ Sin compromiso   
				✓ Respuesta en 24 horas</p></div> <div${attr_class(`mb-20 ${stringify("opacity-0")}`, "svelte-wzcawx")}><h3 class="text-2xl md:text-3xl font-bold text-center mb-12">Su Camino hacia la Automatización</h3> <div class="max-w-5xl mx-auto"><div class="hidden md:block"><div class="relative"><div class="absolute top-16 left-0 right-0 h-1 bg-white/20"><div class="h-full bg-gradient-to-r from-success to-warning transition-all duration-1000"${attr_style(`width: ${stringify((activeStep + 1) / nextSteps.length * 100)}%`)}></div></div> <div class="grid grid-cols-4 gap-4"><!--[-->`);
    const each_array = ensure_array_like(nextSteps);
    for (let index = 0, $$length = each_array.length; index < $$length; index++) {
      let step = each_array[index];
      const StepIcon = step.icon;
      $$renderer2.push(`<div class="relative"><button${attr_class(`w-full p-6 bg-white/10 backdrop-blur-lg border-2 rounded-2xl transition-all duration-300 ${stringify(activeStep === index ? "border-white shadow-2xl shadow-white/20 scale-105" : "border-white/30 hover:border-white/50")}`)}><div${attr_class(`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center font-bold text-2xl transition-all duration-300 ${stringify(activeStep === index ? "bg-white text-primary scale-110" : "bg-white/20 text-white")}`)}>${escape_html(step.step)}</div> <div class="mb-4"><!---->`);
      StepIcon($$renderer2, {
        class: `w-8 h-8 mx-auto ${stringify(activeStep === index ? "text-white" : "text-white/70")}`
      });
      $$renderer2.push(`<!----></div> <h4 class="font-bold mb-2 text-white">${escape_html(step.title)}</h4> <p class="text-sm text-white/80 mb-3">${escape_html(step.description)}</p> <div class="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">${escape_html(step.duration)}</div></button></div>`);
    }
    $$renderer2.push(`<!--]--></div></div></div> <div class="md:hidden space-y-4"><!--[-->`);
    const each_array_1 = ensure_array_like(nextSteps);
    for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
      let step = each_array_1[index];
      step.icon;
      $$renderer2.push(`<button${attr_class(`w-full p-6 bg-white/10 backdrop-blur-lg border-2 rounded-2xl transition-all duration-300 ${stringify(activeStep === index ? "border-white shadow-lg" : "border-white/30")}`)}><div class="flex items-center gap-4"><div${attr_class(`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${stringify(activeStep === index ? "bg-white text-primary" : "bg-white/20 text-white")}`)}>${escape_html(step.step)}</div> <div class="flex-1 text-left"><h4 class="font-bold mb-1 text-white">${escape_html(step.title)}</h4> <p class="text-sm text-white/80">${escape_html(step.description)}</p></div> <div class="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">${escape_html(step.duration)}</div></div></button>`);
    }
    $$renderer2.push(`<!--]--></div></div></div> <div${attr_class(`mb-20 ${stringify("opacity-0")}`, "svelte-wzcawx")}><h3 class="text-2xl md:text-3xl font-bold text-center mb-12">El Impacto que Puede Esperar</h3> <div class="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto"><!--[-->`);
    const each_array_2 = ensure_array_like(finalBenefits);
    for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
      let benefit = each_array_2[$$index_2];
      const Icon2 = benefit.icon;
      $$renderer2.push(`<div class="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105 group"><div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><!---->`);
      Icon2($$renderer2, { class: "w-7 h-7 text-white" });
      $$renderer2.push(`<!----></div> <div class="text-4xl font-bold mb-2">${escape_html(benefit.stat)}</div> <div class="text-sm font-semibold mb-2">${escape_html(benefit.label)}</div> <div class="text-xs text-white/70">${escape_html(benefit.description)}</div></div>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div${attr_class(`mb-20 ${stringify("opacity-0")}`, "svelte-wzcawx")}><div class="p-8 bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl max-w-5xl mx-auto"><div class="grid grid-cols-2 md:grid-cols-4 gap-8"><!--[-->`);
    const each_array_3 = ensure_array_like(socialProof);
    for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
      let proof = each_array_3[$$index_3];
      const Icon2 = proof.icon;
      $$renderer2.push(`<div class="text-center"><!---->`);
      Icon2($$renderer2, { class: "w-8 h-8 text-white/70 mx-auto mb-3" });
      $$renderer2.push(`<!----> <div class="text-3xl md:text-4xl font-bold mb-1">${escape_html(proof.value)}</div> <div class="text-sm text-white/80">${escape_html(proof.label)}</div></div>`);
    }
    $$renderer2.push(`<!--]--></div></div></div> <div${attr_class(`mb-16 ${stringify("opacity-0")}`, "svelte-wzcawx")}><div class="max-w-4xl mx-auto"><h3 class="text-2xl md:text-3xl font-bold text-center mb-8">Por Qué Actuar Ahora</h3> <div class="grid md:grid-cols-3 gap-6"><!--[-->`);
    const each_array_4 = ensure_array_like(urgencyReasons);
    for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
      let reason = each_array_4[$$index_4];
      const Icon2 = reason.icon;
      $$renderer2.push(`<div class="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300"><div class="w-12 h-12 bg-warning/20 rounded-xl flex items-center justify-center mb-4"><!---->`);
      Icon2($$renderer2, { class: "w-6 h-6 text-warning" });
      $$renderer2.push(`<!----></div> <h4 class="font-bold mb-2 text-lg">${escape_html(reason.title)}</h4> <p class="text-sm text-white/80">${escape_html(reason.description)}</p></div>`);
    }
    $$renderer2.push(`<!--]--></div></div></div> <div${attr_class(`text-center ${stringify("opacity-0")}`, "svelte-wzcawx")}><div class="mb-8"><h3 class="text-3xl md:text-4xl font-bold mb-4">Elija su Siguiente Paso</h3> <p class="text-xl text-white/90 max-w-2xl mx-auto">Múltiples formas de comenzar. Todas sin compromiso.</p></div> <div class="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12"><div class="p-6 bg-white/10 backdrop-blur-lg border-2 border-white/30 rounded-2xl hover:bg-white/15 hover:border-white/50 transition-all duration-300 hover:scale-105 group">`);
    Video($$renderer2, { class: "w-12 h-12 mx-auto mb-4 text-success" });
    $$renderer2.push(`<!----> <h4 class="font-bold text-lg mb-2">Demo Personalizada</h4> <p class="text-sm text-white/80 mb-6">30 minutos con experto. Vea Hergon con sus archivos.</p> <a href="#contact" class="inline-flex items-center gap-2 px-6 py-3 bg-success text-white font-semibold rounded-xl hover:bg-success/90 transition-all w-full justify-center group-hover:scale-105"><span>Agendar Demo</span> `);
    Arrow_right($$renderer2, { class: "w-5 h-5" });
    $$renderer2.push(`<!----></a></div> <div class="p-6 bg-white/10 backdrop-blur-lg border-2 border-white/30 rounded-2xl hover:bg-white/15 hover:border-white/50 transition-all duration-300 hover:scale-105 group">`);
    Phone($$renderer2, { class: "w-12 h-12 mx-auto mb-4 text-primary" });
    $$renderer2.push(`<!----> <h4 class="font-bold text-lg mb-2">Hablar con Ventas</h4> <p class="text-sm text-white/80 mb-6">Discuta sus necesidades específicas y obtenga una cotización.</p> <a href="tel:+525512345678" class="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-neutral-100 transition-all w-full justify-center group-hover:scale-105"><span>Llamar Ahora</span> `);
    Phone($$renderer2, { class: "w-5 h-5" });
    $$renderer2.push(`<!----></a></div> <div class="p-6 bg-white/10 backdrop-blur-lg border-2 border-white/30 rounded-2xl hover:bg-white/15 hover:border-white/50 transition-all duration-300 hover:scale-105 group">`);
    File_text($$renderer2, { class: "w-12 h-12 mx-auto mb-4 text-warning" });
    $$renderer2.push(`<!----> <h4 class="font-bold text-lg mb-2">Descargar Info</h4> <p class="text-sm text-white/80 mb-6">PDF con casos de uso, ROI y especificaciones técnicas.</p> <a href="#contact" class="inline-flex items-center gap-2 px-6 py-3 bg-warning text-white font-semibold rounded-xl hover:bg-warning/90 transition-all w-full justify-center group-hover:scale-105"><span>Solicitar PDF</span> `);
    Arrow_right($$renderer2, { class: "w-5 h-5" });
    $$renderer2.push(`<!----></a></div></div> <div class="flex flex-wrap justify-center items-center gap-8 text-sm text-white/70"><div class="flex items-center gap-2">`);
    Circle_check($$renderer2, { class: "w-5 h-5 text-success" });
    $$renderer2.push(`<!----> <span>Sin tarjeta de crédito</span></div> <div class="flex items-center gap-2">`);
    Circle_check($$renderer2, { class: "w-5 h-5 text-success" });
    $$renderer2.push(`<!----> <span>Demo en 24 horas</span></div> <div class="flex items-center gap-2">`);
    Circle_check($$renderer2, { class: "w-5 h-5 text-success" });
    $$renderer2.push(`<!----> <span>Setup en 2-4 semanas</span></div> <div class="flex items-center gap-2">`);
    Circle_check($$renderer2, { class: "w-5 h-5 text-success" });
    $$renderer2.push(`<!----> <span>ROI garantizado</span></div></div></div> <div${attr_class(`mt-16 text-center ${stringify("opacity-0")}`, "svelte-wzcawx")}><div class="inline-block p-8 bg-white/5 backdrop-blur-lg border border-white/20 rounded-3xl max-w-3xl">`);
    Shield($$renderer2, { class: "w-16 h-16 mx-auto mb-4 text-success" });
    $$renderer2.push(`<!----> <h4 class="text-2xl font-bold mb-3">Garantía de Satisfacción</h4> <p class="text-white/90 mb-4">Si en los primeros 30 días Hergon no cumple con sus expectativas, le devolvemos el
					100% de su inversión. Sin preguntas.</p> <div class="flex items-center justify-center gap-2 text-sm text-success">`);
    Star($$renderer2, { class: "w-5 h-5 fill-current" });
    $$renderer2.push(`<!----> `);
    Star($$renderer2, { class: "w-5 h-5 fill-current" });
    $$renderer2.push(`<!----> `);
    Star($$renderer2, { class: "w-5 h-5 fill-current" });
    $$renderer2.push(`<!----> `);
    Star($$renderer2, { class: "w-5 h-5 fill-current" });
    $$renderer2.push(`<!----> `);
    Star($$renderer2, { class: "w-5 h-5 fill-current" });
    $$renderer2.push(`<!----> <span class="ml-2 font-semibold">100% Satisfacción de Clientes</span></div></div></div></div></section>`);
  });
}
function Footer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let newsletterEmail = "";
    const footerSections = [
      {
        title: "Producto",
        links: [
          { label: "Características", href: "#features" },
          { label: "Cómo Funciona", href: "#how-it-works" },
          { label: "Seguridad & Compliance", href: "#security" },
          { label: "Precios", href: "#pricing" },
          { label: "Casos de Uso", href: "#contact" },
          { label: "Integraciones", href: "#contact" }
        ]
      },
      {
        title: "Soluciones",
        links: [
          { label: "Para AFOREs", href: "#contact" },
          { label: "Para AFPs", href: "#contact" },
          { label: "Grupos Financieros", href: "#contact" },
          { label: "Consultorías", href: "#contact" },
          { label: "Reguladores", href: "#contact" }
        ]
      },
      {
        title: "Recursos",
        links: [
          { label: "Documentación", href: "#contact" },
          { label: "API Reference", href: "#contact" },
          { label: "Centro de Ayuda", href: "#contact" },
          { label: "Blog", href: "#contact" },
          { label: "Webinars", href: "#contact" },
          { label: "Casos de Éxito", href: "#contact" }
        ]
      },
      {
        title: "Empresa",
        links: [
          { label: "Nosotros", href: "#contact" },
          { label: "Carreras", href: "#contact" },
          { label: "Partners", href: "#contact" },
          { label: "Prensa", href: "#contact" },
          { label: "Contacto", href: "#contact" }
        ]
      }
    ];
    const legalLinks = [
      { label: "Privacidad", href: "/privacy" },
      { label: "Términos de Servicio", href: "/terms" },
      { label: "SLA", href: "/sla" },
      { label: "Compliance", href: "/compliance" },
      { label: "Seguridad", href: "/security" }
    ];
    const certifications = [
      { name: "SOC 2", status: "En Proceso" },
      { name: "ISO 27001", status: "En Proceso" },
      { name: "CONSAR", status: "Certificado" }
    ];
    const offices = [
      {
        country: "México",
        flag: "🇲🇽",
        address: "Paseo de la Reforma 505, CDMX",
        phone: "+52 55 1234 5678",
        email: "mexico@hergon.com"
      },
      {
        country: "Chile",
        flag: "🇨🇱",
        address: "Av. Apoquindo 4800, Santiago",
        phone: "+56 2 2345 6789",
        email: "chile@hergon.com"
      }
    ];
    const socialLinks = [
      {
        name: "LinkedIn",
        icon: Linkedin,
        href: "https://linkedin.com",
        color: "hover:text-[#0A66C2]"
      },
      {
        name: "Twitter",
        icon: Twitter,
        href: "https://twitter.com",
        color: "hover:text-[#1DA1F2]"
      },
      {
        name: "GitHub",
        icon: Github,
        href: "https://github.com",
        color: "hover:text-white"
      }
    ];
    $$renderer2.push(`<footer class="relative bg-gradient-to-br from-primary-dark via-primary to-primary-dark text-white overflow-hidden"><div class="absolute inset-0 opacity-5"><div class="absolute inset-0" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 40px 40px;"></div></div> <div class="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl"></div> <div class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-success/10 rounded-full blur-3xl"></div> <div class="container-custom relative z-10"><div${attr_class(`py-12 border-b border-white/10 ${stringify("opacity-0")}`, "svelte-jz8lnl")}><div class="grid lg:grid-cols-2 gap-12 items-center"><div><h3 class="text-2xl font-bold mb-3">Manténgase Actualizado</h3> <p class="text-white/80 mb-6">Reciba actualizaciones sobre nuevas funcionalidades, normativas CONSAR, y mejores
						prácticas.</p> `);
    {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<form class="flex gap-3"><div class="flex-1"><input type="email"${attr("value", newsletterEmail)} placeholder="su-email@empresa.com" class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:bg-white/15 focus:border-white/40 transition-all"/> `);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> <button type="submit" class="px-6 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-neutral-100 transition-all hover:scale-105 flex items-center gap-2">`);
      Send($$renderer2, { class: "w-4 h-4" });
      $$renderer2.push(`<!----> <span class="hidden sm:inline">Suscribirse</span></button></form>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="grid sm:grid-cols-2 gap-6"><a href="tel:+525512345678" class="p-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl hover:bg-white/15 transition-all group">`);
    Phone($$renderer2, { class: "w-6 h-6 mb-3 text-success" });
    $$renderer2.push(`<!----> <div class="text-sm text-white/70 mb-1">Llámenos</div> <div class="font-semibold group-hover:text-success transition-colors">+52 55 1234 5678</div></a> <a href="mailto:info@hergon.com" class="p-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl hover:bg-white/15 transition-all group">`);
    Mail($$renderer2, { class: "w-6 h-6 mb-3 text-primary" });
    $$renderer2.push(`<!----> <div class="text-sm text-white/70 mb-1">Email</div> <div class="font-semibold group-hover:text-primary transition-colors">info@hergon.com</div></a></div></div></div> <div class="py-12 border-b border-white/10"><div class="grid lg:grid-cols-5 gap-12"><div${attr_class(`lg:col-span-1 ${stringify("opacity-0")}`, "svelte-jz8lnl")}><div class="flex items-center gap-2 mb-6"><div class="w-12 h-12 bg-gradient-to-br from-white to-success rounded-xl flex items-center justify-center shadow-lg"><span class="text-primary font-bold text-2xl">H</span></div> <div><div class="text-2xl font-bold">Hergon</div> <div class="text-xs text-white/60">By Vector01</div></div></div> <p class="text-white/70 text-sm mb-6 leading-relaxed">Plataforma enterprise de validación automatizada para AFOREs y AFPs en Latinoamérica.</p> <div class="flex gap-3"><!--[-->`);
    const each_array = ensure_array_like(socialLinks);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let social = each_array[$$index];
      const Icon2 = social.icon;
      $$renderer2.push(`<a${attr("href", social.href)} target="_blank" rel="noopener noreferrer"${attr_class(`w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center ${stringify(social.color)} transition-all hover:scale-110`, "svelte-jz8lnl")}${attr("aria-label", social.name)}><!---->`);
      Icon2($$renderer2, { class: "w-5 h-5" });
      $$renderer2.push(`<!----></a>`);
    }
    $$renderer2.push(`<!--]--></div></div> <!--[-->`);
    const each_array_1 = ensure_array_like(footerSections);
    for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
      let section = each_array_1[index];
      $$renderer2.push(`<div${attr_class(
        clsx("opacity-0"),
        "svelte-jz8lnl"
      )}><h3 class="font-bold text-lg mb-4">${escape_html(section.title)}</h3> <ul class="space-y-3"><!--[-->`);
      const each_array_2 = ensure_array_like(section.links);
      for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
        let link = each_array_2[$$index_1];
        $$renderer2.push(`<li><a${attr("href", link.href)} class="text-white/70 hover:text-white transition-colors text-sm flex items-center gap-1 group"><span>${escape_html(link.label)}</span> `);
        if (link.href.startsWith("http")) {
          $$renderer2.push("<!--[-->");
          External_link($$renderer2, {
            class: "w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
          });
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></a></li>`);
      }
      $$renderer2.push(`<!--]--></ul></div>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div${attr_class(`py-12 border-b border-white/10 ${stringify("opacity-0")}`, "svelte-jz8lnl")}><h3 class="font-bold text-xl mb-8 text-center">Nuestras Oficinas</h3> <div class="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"><!--[-->`);
    const each_array_3 = ensure_array_like(offices);
    for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
      let office = each_array_3[$$index_3];
      $$renderer2.push(`<div class="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl hover:bg-white/15 transition-all"><div class="flex items-center gap-3 mb-4"><span class="text-4xl">${escape_html(office.flag)}</span> <h4 class="text-xl font-bold">${escape_html(office.country)}</h4></div> <div class="space-y-3 text-sm"><div class="flex items-start gap-3">`);
      Map_pin($$renderer2, { class: "w-4 h-4 text-white/60 flex-shrink-0 mt-0.5" });
      $$renderer2.push(`<!----> <span class="text-white/80">${escape_html(office.address)}</span></div> <div class="flex items-center gap-3">`);
      Phone($$renderer2, { class: "w-4 h-4 text-white/60 flex-shrink-0" });
      $$renderer2.push(`<!----> <a${attr("href", `tel:${stringify(office.phone)}`)} class="text-white/80 hover:text-white">${escape_html(office.phone)}</a></div> <div class="flex items-center gap-3">`);
      Mail($$renderer2, { class: "w-4 h-4 text-white/60 flex-shrink-0" });
      $$renderer2.push(`<!----> <a${attr("href", `mailto:${stringify(office.email)}`)} class="text-white/80 hover:text-white">${escape_html(office.email)}</a></div></div></div>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div${attr_class(`py-8 border-b border-white/10 ${stringify("opacity-0")}`, "svelte-jz8lnl")}><div class="flex flex-wrap justify-center items-center gap-8"><div class="flex items-center gap-2">`);
    Shield($$renderer2, { class: "w-5 h-5 text-success" });
    $$renderer2.push(`<!----> <span class="text-sm text-white/80">Encriptación TLS 1.3</span></div> <!--[-->`);
    const each_array_4 = ensure_array_like(certifications);
    for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
      let cert = each_array_4[$$index_4];
      $$renderer2.push(`<div class="flex items-center gap-2">`);
      Award($$renderer2, { class: "w-5 h-5 text-warning" });
      $$renderer2.push(`<!----> <span class="text-sm text-white/80">${escape_html(cert.name)} <span class="text-xs text-white/60">(${escape_html(cert.status)})</span></span></div>`);
    }
    $$renderer2.push(`<!--]--> <div class="flex items-center gap-2">`);
    Circle_check($$renderer2, { class: "w-5 h-5 text-success" });
    $$renderer2.push(`<!----> <span class="text-sm text-white/80">99.9% Uptime SLA</span></div> <div class="flex items-center gap-2">`);
    Globe($$renderer2, { class: "w-5 h-5 text-primary" });
    $$renderer2.push(`<!----> <span class="text-sm text-white/80">4 Países</span></div></div></div> <div${attr_class(`py-8 ${stringify("opacity-0")}`, "svelte-jz8lnl")}><div class="flex flex-col md:flex-row justify-between items-center gap-6"><div class="flex flex-wrap justify-center gap-6 text-sm"><!--[-->`);
    const each_array_5 = ensure_array_like(legalLinks);
    for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
      let link = each_array_5[$$index_5];
      $$renderer2.push(`<a${attr("href", link.href)} class="text-white/60 hover:text-white transition-colors">${escape_html(link.label)}</a>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="text-sm text-white/60 text-center md:text-right"><p>© 2026 Hergon. Todos los derechos reservados.</p> <p class="text-xs mt-1">Hecho con ❤️ en Latinoamérica</p></div></div></div> <div${attr_class(`pb-6 text-center ${stringify("opacity-0")}`, "svelte-jz8lnl")}><p class="text-xs text-white/50">Hergon es una plataforma de Vector01 dedicada a la automatización de compliance para
				instituciones financieras. Cumplimos con las normativas de CONSAR, SuperPensiones,
				SuperFinanciera y SBS.</p></div></div></footer>`);
  });
}
function _page($$renderer) {
  head("1uha8ag", $$renderer, ($$renderer2) => {
    $$renderer2.title(($$renderer3) => {
      $$renderer3.push(`<title>Hergon - Validación Automatizada para AFOREs en Latinoamérica</title>`);
    });
    $$renderer2.push(`<meta name="description" content="Plataforma enterprise de validación automatizada de archivos para AFOREs y AFPs. Cumplimiento regulatorio garantizado con event sourcing y trazabilidad completa."/>`);
  });
  Header($$renderer);
  $$renderer.push(`<!----> `);
  HeroSection($$renderer);
  $$renderer.push(`<!----> `);
  ProblemSolutionSection($$renderer);
  $$renderer.push(`<!----> `);
  FeaturesSection($$renderer);
  $$renderer.push(`<!----> `);
  HowItWorksSection($$renderer);
  $$renderer.push(`<!----> `);
  MetricsSection($$renderer);
  $$renderer.push(`<!----> `);
  SecurityComplianceSection($$renderer);
  $$renderer.push(`<!----> `);
  LatinAmericaSection($$renderer);
  $$renderer.push(`<!----> `);
  PricingSection($$renderer);
  $$renderer.push(`<!----> `);
  ContactSection($$renderer);
  $$renderer.push(`<!----> `);
  FinalCTASection($$renderer);
  $$renderer.push(`<!----> `);
  Footer($$renderer);
  $$renderer.push(`<!---->`);
}
export {
  _page as default
};
