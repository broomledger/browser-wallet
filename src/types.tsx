export type WalletProps = {
  privateKey: string;
  publicKey: string;
  clearKeys: () => void;
};
export type StartProps = {
  setPrivateKey: React.Dispatch<React.SetStateAction<string>>;
  setPublicKey: React.Dispatch<React.SetStateAction<string>>;
};

export type PendingTx = {
  id: string;
  to: string;
  amount: number;
};

export type Transaction = {
  sig: string | undefined;
  coinbase: boolean;
  note: string;
  nonce: number;
  to: string;
  from: string;
  amount: number;
};
