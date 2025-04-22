export const getCsrfToken = () => (
	document
		.cookie
		.split('; ')
		.find(row => row.startsWith('csrf_token='))
		?.split('=')[1]
)
