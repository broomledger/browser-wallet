export const validateKey = (key: string) => {
	console.log(`validating key: ${key}`);
	return true;
};

// Convert CryptoKey -> base64 string
export async function generateAddress(publicKey: CryptoKey): Promise<string> {
	if (!publicKey || publicKey.type !== "public") {
		throw new Error("Invalid CryptoKey: Expected a public key object.");
	}
	if (!publicKey.extractable) {
		throw new Error("Cannot export public key: 'extractable' property must be true.");
	}

	// 1. Export the public key in SPKI format (SubjectPublicKeyInfo - matching Go's PKIX)
	try {
		const exportedBuffer: ArrayBuffer = await crypto.subtle.exportKey("spki", publicKey);

		// 2. Base64 Encode the ArrayBuffer
		return arrayBufferToBase64(exportedBuffer);
	} catch (e) {
		console.error("Error during public key export:", e);
		// Explicitly cast error to unknown and then to Error if possible
		const errorMessage = e instanceof Error ? e.message : "Public key export failed due to a cryptography error.";
		throw new Error(errorMessage);
	}
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
export async function exportPrivateKey(privateKey: CryptoKey): Promise<string> {
	if (!privateKey || privateKey.type !== "private") {
		throw new Error("Invalid CryptoKey: Expected a private key object.");
	}
	// Note: private keys MUST be marked as extractable to be exported.
	if (!privateKey.extractable) {
		throw new Error("Cannot export private key: 'extractable' property must be true.");
	}

	// 1. Export the private key in PKCS#8 format (matching Go's MarshalECPrivateKey)
	try {
		const exportedBuffer: ArrayBuffer = await crypto.subtle.exportKey("pkcs8", privateKey);

		// 2. Base64 Encode the ArrayBuffer (equivalent to Go's base64.StdEncoding.EncodeToString)
		return arrayBufferToBase64(exportedBuffer);
	} catch (e) {
		console.error("Error during private key export:", e);
		// Explicitly handle errors
		const errorMessage = e instanceof Error ? e.message : "Private key export failed due to a cryptography error.";
		throw new Error(errorMessage);
	}
}

// Convert base64 string -> private CryptoKey
export async function importPrivateKey(b64: string) {
	const binary = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
	const key = await crypto.subtle.importKey("pkcs8", binary.buffer, { name: "ECDSA", namedCurve: "P-256" }, true, [
		"sign",
	]);
	return key;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
	let binary: string = "";
	// We explicitly cast the buffer to Uint8Array for byte-level access.
	const bytes = new Uint8Array(buffer);
	const len: number = bytes.byteLength;
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	// btoa() performs the standard base64 encoding
	return btoa(binary);
}

export const downloadFile = (filename: string, data: any) => {
	const blob = new Blob([JSON.stringify(data, null, 2)], {
		type: "application/json",
	});

	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
};

type PollResponse = {
	balance: number;
	nonce: number;
};

export const pollNode = async (nodeUrl: string, address: string): Promise<PollResponse> => {
	const options = {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ address: address }),
	};

	const res = await fetch(`${nodeUrl}/address`, options);

	const data = await res.json();

	return data;
};

export const getRandomNodeAddress = () => {
	const hostValues = ["node.broomledger.com", "node2.broomledger.com"];

	const shuffled = hostValues.sort(() => Math.random() - 0.5);

	return `https://${shuffled[0]}`;
};
