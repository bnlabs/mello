// vitest.config.ts
import { defineVitestConfig } from "@nuxt/test-utils/config"

export default defineVitestConfig({
	test: {
		environment: "nuxt",
		include: [
			"tests/integrations/**/**" // Include integration tests
		]
		// you can optionally set Nuxt-specific environment options
		// environmentOptions: {
		//   nuxt: {
		//     rootDir: fileURLToPath(new URL('./playground', import.meta.url)),
		//     domEnvironment: 'happy-dom', // 'happy-dom' (default) or 'jsdom'
		//     overrides: {
		//       // other Nuxt config you want to pass
		//     }
		//   }
		// }
	}
})
