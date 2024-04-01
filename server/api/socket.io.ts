export default defineEventHandler(async (event) => {
	initSocket(event)

	return {
		result: 300,
	}
})
