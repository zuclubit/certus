/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				primary: {
					DEFAULT: '#0066FF',
					dark: '#0A2540',
					light: '#3385FF'
				},
				success: '#00D4AA',
				warning: '#FF6B35',
				danger: '#EF4444',
				neutral: {
					50: '#F7F9FC',
					100: '#EDF1F7',
					200: '#E1E8F0',
					300: '#C7D2E0',
					400: '#8B95A5',
					500: '#5B6B7D',
					600: '#404E5F',
					700: '#2D3748',
					800: '#1A202C',
					900: '#0F1419'
				}
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				mono: ['JetBrains Mono', 'monospace']
			}
		}
	},
	plugins: [require('@tailwindcss/typography')]
};
