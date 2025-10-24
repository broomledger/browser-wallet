// Define the types globally
interface Keypair {
	error?: string;
	private: string;
	public: string;
}

interface Signature {
	error?: string;
	sig: string;
}

interface Hash {
	error?: string;
	hash: string;
}

// Declare the functions as existing in the global scope
declare function wasmGenerateKeypair(): Keypair;

declare function wasmGetSignature(privateKey: string, data: Uint8Array): Signature;

declare function wasmHashArgon(data: Uint8Array): Hash;
