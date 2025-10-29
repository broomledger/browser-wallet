import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  type Transaction,
  type WalletProps,
  type ClientTransaction,
} from "./types";
import {
  downloadFile,
  getRandomNodeAddress,
  pollNode,
  validatePublicKey,
} from "./utils";

const CONVERSION_RATE = 100000;

export const Wallet = ({ privateKey, publicKey, clearKeys }: WalletProps) => {
  const [balance, setBalance] = useState(0);

  const [searchParams] = useSearchParams();

  const toAddress = searchParams.get("to");

  const getPending = (): Transaction[] => {
    const storedPending = localStorage.getItem("pending");
    if (!storedPending) {
      return [];
    }

    const parsedPending = JSON.parse(storedPending);

    return parsedPending as Transaction[];
  };
  const [pending, setPending] = useState<Transaction[]>(getPending());
  const [amountInput, setAmountInput] = useState<string>("");

  const [sendingMsg, setSendingMsg] = useState<string>("");

  const backupPending = (txns: Transaction[]) => {
    localStorage.setItem("pending", JSON.stringify(txns));
  };

  const formattedBalance = (balance / CONVERSION_RATE).toLocaleString("en-US", {
    minimumFractionDigits: 2,
  });

  const [nonce, setNonce] = useState<number>(0);
  const [syncing, setSyncing] = useState<boolean>(false);

  const baseTxn: ClientTransaction = {
    coinbase: false,
    note: "",
    nonce: nonce + 1,
    to: toAddress ?? "",
    from: publicKey,
    amount: 0,
  };

  const [txn, setTxn] = useState<ClientTransaction>({ ...baseTxn });

  const syncWallet = async () => {
    setSyncing(true);
    console.log("syncing wallet");
    try {
      const value = await pollNode(getRandomNodeAddress(), publicKey as string);
      setNonce(value.nonce);
      setBalance(value.balance);
      console.log(value);
    } catch (err) {
      console.log(err);
    }
    setSyncing(false);
  };

  const downloadKeys = () => {
    downloadFile("walletconfig.broom", {
      public: publicKey,
      private: privateKey,
    });
  };

  useEffect(() => {
    syncWallet();
    const inter = setInterval(() => {
      syncWallet();
    }, 3000);

    return () => {
      clearInterval(inter);
      console.log("clean up");
    };
  }, []);

  const mutateTransactionField = (
    key: keyof ClientTransaction,
    value: string | number | null | undefined,
  ) => {
    console.log(key, value);
    const fieldType = typeof txn[key];
    console.log(fieldType);
    if (fieldType != typeof value) {
      return;
    }

    setTxn((prev) => ({ ...prev, [key]: value }));
  };

  const amountValid = (): boolean => {
    if (txn.amount > balance / CONVERSION_RATE) {
      return false;
    }
    return true;
  };

  const prepareTransaction = (
    txn: ClientTransaction,
    privateKey: string,
  ): Transaction => {
    const maxPendingNonce = pending.reduce((acc, value) => {
      return acc > value.nonce ? acc : value.nonce;
    }, nonce);

    txn.nonce = maxPendingNonce + 1;

    console.log("txn nonce: ", txn.nonce);

    txn.amount = Math.floor(txn.amount * CONVERSION_RATE);
    const sigOutput = wasmGetTransactionSig(privateKey, JSON.stringify(txn));

    if (sigOutput.error) {
      throw new Error(sigOutput.error);
    }

    console.log(sigOutput.sig);

    return {
      ...txn,
      sig: sigOutput.sig,
    };
  };

  const broadcastTransaction = async (txn: Transaction): Promise<void> => {
    console.log("sending txn: ", txn);

    const options = {
      method: "POST",
      body: JSON.stringify(txn),
    };
    const res = await fetch(
      "https://node.broomledger.com/transaction",
      options,
    );

    if (!res.ok) {
      alert("bad request");
    }
    return;
  };

  const sendTransaction = async () => {
    console.log("sending txn");

    if (!validatePublicKey(txn.to)) {
      alert("invalid public key");
      return;
    }

    if (txn.amount * CONVERSION_RATE > balance) {
      alert("invalid amount");
      return;
    }

    if (!confirm("Are you sure?")) {
      return;
    }

    setSendingMsg("hashing + signing transaction");

    // wasm hevy workload needs to push async
    setTimeout(async () => {
      console.log("Starting signing...");
      const finalTxn = prepareTransaction(txn, privateKey);

      setSendingMsg("broadcasting transaction to network");
      await broadcastTransaction(finalTxn);

      setPending((prev) => {
        const newPending = [...prev, finalTxn];
        backupPending(newPending);
        return newPending;
      });

      setSendingMsg("");
      console.log("setting input amount back");
      setAmountInput("");
      setTxn(baseTxn);
    }, 100);
  };

  useEffect(() => {
    console.log(nonce);
  }, [nonce]);

  const clearPending = () => {
    if (!confirm("Are you sure?")) {
      return;
    }

    setPending([]);
    backupPending([]);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-base-100 shadow-xl ">
      <img
        src={"/broom-transparent.svg"}
        alt="Broom"
        className="w-20 h-20 mx-auto"
      />

      <div className="flex justify-start ">
        <button
          onClick={() => {
            if (confirm("This will erase your keys locally")) clearKeys();
          }}
          className="btn btn-xs btn-ghost"
        >
          Clear Keys
        </button>

        <div className="grow"></div>
        <button onClick={downloadKeys} className="btn btn-xs btn-ghost">
          Download Keys
        </button>
      </div>
      {/* Balance */}
      <div className="mb-6 p-4  bg-base-200 shadow-inner flex flex-col items-center relative">
        <p className="text-base-content text-sm">Balance</p>
        <div className="text-base-content text-2xl font-semibold flex">
          <div className="font-bold">{formattedBalance}</div>
        </div>
        <button
          disabled={syncing}
          onClick={syncWallet}
          className="btn btn-xs btn-outline absolute bottom-2 right-2"
        >
          {syncing ? "Syncing" : "Sync"}
        </button>
      </div>

      {/* Your Address */}
      <div className="mb-6 relative">
        <label className="block text-sm font-medium mb-1">
          Your Wallet Address
        </label>
        <input
          type="text"
          value={publicKey as string}
          disabled
          className="input w-full  focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="flex absolute top-7 right-2 ">
          <button
            onClick={() =>
              navigator.clipboard.writeText(
                `https://wallet.broomledger.com?to=${publicKey as string}`,
              )
            }
            className="btn btn-sm border border-base-content"
          >
            Copy URL
          </button>

          <button
            onClick={() => navigator.clipboard.writeText(publicKey as string)}
            className="btn btn-sm border border-base-content "
          >
            Copy Raw
          </button>
        </div>
      </div>

      {/* Send Section */}
      <div className="mb-6 p-4 bg-base-200  shadow-inner space-y-3">
        <p className="text-base-content text-sm font-medium">Send BROOM</p>
        <input
          type="text"
          placeholder="Recipient Address"
          value={txn.to}
          onChange={(e) => mutateTransactionField("to", e.target.value)}
          className={`input ${!validatePublicKey(txn.to) && txn.to.length != 0 && "input-error"} input-bordered w-full  text-base-content`}
        />
        <input
          type="string"
          placeholder="Amount"
          onChange={(e) => {
            const val = e.target.value
              .replace(/[^0-9.]/g, "")
              .replace(/(\..*?)\..*/g, "$1");

            setAmountInput(val);
            const num = parseFloat(val);
            if (!isNaN(num)) mutateTransactionField("amount", num);
          }}
          className={`input ${!amountValid() && "input-error"} input-bordered w-full  text-base-content`}
          value={amountInput}
        />
        <button
          disabled={sendingMsg != ""}
          onClick={sendTransaction}
          className="btn btn-info  w-full mt-2"
        >
          {sendingMsg === "" ? "Send" : sendingMsg}
        </button>
      </div>

      {/* Pending Transactions */}
      <PendingTransactionTable
        pending={pending}
        setPending={setPending}
        nonce={nonce}
        backupPending={backupPending}
        clearPending={clearPending}
      />
    </div>
  );
};

const PendingTransactionTable = ({
  pending,
  setPending,
  nonce,
  backupPending,
  clearPending,
}: {
  pending: Transaction[];
  setPending: React.Dispatch<React.SetStateAction<Transaction[]>>;
  nonce: number;
  backupPending: (txns: Transaction[]) => void;
  clearPending: () => void;
}) => {
  const formatCurrency = (value: number) =>
    (value / CONVERSION_RATE).toLocaleString("en-US", {
      minimumFractionDigits: 2,
    });

  useEffect(() => {
    setPending((prev) => {
      const fileredPending = prev.filter((value) => value.nonce >= nonce + 1);

      if (fileredPending.length < prev.length) {
        backupPending(fileredPending);
      }
      return fileredPending;
    });
    console.log("hello");
  }, [nonce]);

  return (
    <div>
      <p className="text-base-content text-sm font-medium mb-3">
        Pending Transactions
        {pending.length != 0 && (
          <button
            onClick={clearPending}
            className="btn btn-xs btn-outline top-0  float-right"
          >
            clear
          </button>
        )}
      </p>

      <ul className="space-y-2 max-h-48 overflow-y-auto">
        {pending.map((tx) => (
          <li
            key={tx.sig}
            className="p-3 border  flex justify-between items-center bg-base-100 shadow-sm"
          >
            <span className="truncate text-base-content">{tx.to}</span>
            <span className="font-semibold text-accent text-nowrap">
              {formatCurrency(tx.amount)} BR
            </span>
          </li>
        ))}
        {pending.length === 0 && (
          <li className="text-base-content text-center p-2 italic">
            No pending transactions
          </li>
        )}
      </ul>
    </div>
  );
};
