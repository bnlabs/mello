const isLocal = true

export const config = {
	baseURL: isLocal
		? "http://localhost:3000/"
		: "https://mello.bnlabsolutions.net/"
}
