
// Get path for Content Bundle assets
export const getBundleAssetPath = () => {
	let path = ''
	if(process.env.PUBLIC_URL && process.env.PUBLIC_URL.charAt(0) === '/') {
		path = process.env.PUBLIC_URL.match(/\/[^/]*/)[0]
	}

	return path;
}

export default {
	getBundleAssetPath,
}
