export const validateKey = (key: string) => {
	console.log(`validating key: ${key}`);
	return true;
};

// Convert CryptoKey -> base64 string
export async function generateAddress(publicKey: CryptoKey) {
	const spki = await crypto.subtle.exportKey("spki", publicKey);
	const b64 = btoa(String.fromCharCode(...new Uint8Array(spki)));
	return b64;
}

// Convert base64 string -> CryptoKey
export async function importAddress(b64: string) {
	const binary = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
	const key = await crypto.subtle.importKey("spki", binary.buffer, { name: "ECDSA", namedCurve: "P-256" }, true, [
		"verify",
	]);
	return key;
}

// Convert private CryptoKey -> base64 string
export async function exportPrivateKey(privateKey: CryptoKey) {
	const pkcs8 = await crypto.subtle.exportKey("pkcs8", privateKey);
	const b64 = btoa(String.fromCharCode(...new Uint8Array(pkcs8)));
	return b64;
}

// Convert base64 string -> private CryptoKey
export async function importPrivateKey(b64: string) {
	const binary = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
	const key = await crypto.subtle.importKey("pkcs8", binary.buffer, { name: "ECDSA", namedCurve: "P-256" }, true, [
		"sign",
	]);
	return key;
}
