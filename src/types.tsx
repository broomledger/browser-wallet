import { importPrivateKey } from "./utils";

export type WalletProps = {
	privateKey: String;
	publicKey: String;
	clearKeys: () => void;
};
export type StartProps = {
	setPrivateKey: React.Dispatch<React.SetStateAction<String>>;
	setPublicKey: React.Dispatch<React.SetStateAction<String>>;
};

export type PendingTx = {
	id: string;
	to: string;
	amount: number;
};

export interface Keypair {
	error?: string;
	private: string;
	public: string;
}

export interface Signature {
	error?: string;
	sig: string;
}

export interface Hash {
	error?: string;
	hash: string;
}

// wasm declarations
export declare function wasmGenerateKeypair(): Keypair;

export declare function wasmGetSignature(privateKey: string, data: Uint8Array): Signature;

export declare function wasmHashArgon(data: Uint8Array): Hash;

export class Transaction {
	sig: string | undefined;
	coinbase: boolean;
	note: string;
	nonce: number;
	to: string;
	from: string;
	amount: number;

	constructor(note: string, nonce: number, to: string, from: string, amount: number) {
		this.coinbase = false;
		this.note = note;
		this.nonce = nonce;
		this.to = to;
		this.from = from;
		this.amount = amount;
	}

	serialize(): number[] {
		const buf: number[] = [];

		buf.push(this.coinbase ? 1 : 0);

		const pushString = (str: string) => {
			for (let i = 0; i < str.length; i++) {
				buf.push(str.charCodeAt(i));
			}
		};

		pushString(this.note);

		const pushNumber = (num: number) => {
			const arr = new Uint8Array(4);
			const view = new DataView(arr.buffer);
			view.setUint32(0, num, false);
			buf.push(...arr);
		};

		pushNumber(this.nonce);
		pushString(this.to);
		pushString(this.from);
		pushNumber(this.amount);

		return buf;
	}

	async sign(privateKey: string) {
		const priv = await importPrivateKey(privateKey);
		const ser = this.serialize();
		const hash = await hashData(ser);

		const privBytes = await cryptoKeyToBytes(priv);
	}
}

const hashData = async (data: number[]) => {
	// const res = await hash({
	// 	pass: new Uint8Array(data),
	// 	salt: new Uint8Array(0),
	// 	type: ArgonType.Argon2d,
	// 	time: 2,
	// 	mem: 512 * 1024,
	// 	parallelism: 2,
	// 	hashLen: 32,
	// });
	return [];
};

async function cryptoKeyToBytes(privKey: CryptoKey): Promise<Uint8Array> {
	const raw = await crypto.subtle.exportKey("raw", privKey);
	return new Uint8Array(raw);
}

function bytesToHex(bytes: Uint8Array) {
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}
