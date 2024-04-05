// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	app: {
		head: {
			title: "Mello",
			meta: [{ name: "description", content: "Screen sharing website" }],
		},
	},
	devtools: { enabled: true },
	css: ["~/assets/css/main.css"],
	postcss: {
		plugins: {
			tailwindcss: {},
			autoprefixer: {},
		},
	},
	modules: ["nuxt-primevue"],
	primevue: {
		/* Options */
		options: {
			ripple: true,
			inputStyle: "filled",
		},
	},
})
