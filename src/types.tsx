export type WalletProps = {
  privateKey: string;
  publicKey: string;
  clearKeys: () => void;
};
export type StartProps = {
  setPrivateKey: React.Dispatch<React.SetStateAction<string>>;
  setPublicKey: React.Dispatch<React.SetStateAction<string>>;
};

export type ClientTransaction = {
  coinbase: boolean;
  note: string;
  nonce: number;
  to: string;
  from: string;
  amount: number;
};

export type Transaction = ClientTransaction & {
  sig: string;
};
