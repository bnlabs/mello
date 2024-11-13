// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	app: {
		head: {
			title: "Mello",
			meta: [{ name: "description", content: "Screen sharing website" }],
			link: [{ rel: "icon", type: "image/png", href: "/bnlab.png" }]
		}
	},
	devtools: { enabled: true },
	css: ["~/assets/css/main.css"],
	postcss: {
		plugins: {
			tailwindcss: {},
			autoprefixer: {}
		}
	},
	modules: ["nuxt-primevue"],
	primevue: {
		/* Options */
		options: {
			ripple: true,
			inputStyle: "filled"
		}
	},
	runtimeConfig: {
		public: {
			livekitWSurl: "wss://mello-d6rzaz12.livekit.cloud"
		}
	},
	devServer: {
		port: 3000,
		https: {
			key: "./certs/localhost-key.pem",
			cert: "./certs/localhost.pem"
		}
	}
})
