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
