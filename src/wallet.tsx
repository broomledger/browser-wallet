import { useEffect, useState } from "react";
import type { PendingTx, WalletProps } from "./types";
import { downloadFile, getRandomNodeAddress, pollNode } from "./utils";

export const Wallet = ({ privateKey, publicKey, clearKeys }: WalletProps) => {
	const [balance, setBalance] = useState(0);
	const [pending, setPending] = useState<PendingTx[]>([]);
	const [sendTo, setSendTo] = useState("");
	const [sendAmount, setSendAmount] = useState("");

	const formatted = (balance / 100000).toLocaleString("en-US", { minimumFractionDigits: 2 });

	const [nonce, setNonce] = useState<number>(0);
	const [syncing, setSyncing] = useState<boolean>(false);

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
		downloadFile("walletconfig.broom", { public: publicKey, private: privateKey });
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

	return (
		<div className="p-6 max-w-md mx-auto bg-base-100 shadow-xl rounded-2xl">
			<h2 className="text-3xl font-bold mb-6 text-center text-primary">Broom Wallet</h2>
			<div className="flex justify-end mt-8 mb-4">
				<button onClick={downloadKeys} className="btn btn-xs btn-outline">
					Download Keys
				</button>
				<button
					onClick={() => {
						if (confirm("This will erase your keys locally")) clearKeys();
					}}
					className="btn btn-xs btn-outline"
				>
					Clear Keys
				</button>
			</div>
			{/* Balance */}
			<div className="mb-6 p-4 rounded-xl bg-base-200 shadow-inner flex flex-col items-center relative">
				<p className="text-base-content text-sm">Balance</p>
				<div className="text-base-content text-2xl font-semibold flex">
					<div className="font-bold">{formatted}</div>
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
				<label className="block text-sm font-medium mb-1">Your Wallet Address</label>
				<input
					type="text"
					value={publicKey as string}
					disabled
					className="input w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
				/>
				<button
					onClick={() => navigator.clipboard.writeText(publicKey as string)}
					className="btn btn-sm border border-base-content absolute right-2 top-7"
				>
					Copy
				</button>
			</div>

			{/* Send Section */}
			<div className="mb-6 p-4 bg-base-200 rounded-xl shadow-inner space-y-3">
				<p className="text-base-content text-sm font-medium">Send BROOM</p>
				<input
					type="text"
					placeholder="Recipient Address"
					value={sendTo}
					onChange={(e) => setSendTo(e.target.value)}
					className="input input-bordered w-full rounded-xl text-base-content"
				/>
				<input
					type="number"
					placeholder="Amount"
					value={sendAmount}
					onChange={(e) => setSendAmount(e.target.value)}
					className="input input-bordered w-full rounded-xl text-base-content"
				/>
				<button className="btn btn-info  w-full mt-2">Send</button>
			</div>

			{/* Pending Transactions */}
			<div>
				<p className="text-base-content text-sm font-medium mb-3">Pending Transactions</p>
				<ul className="space-y-2 max-h-48 overflow-y-auto">
					{pending.map((tx) => (
						<li
							key={tx.id}
							className="p-3 border rounded-xl flex justify-between items-center bg-base-100 shadow-sm"
						>
							<span className="truncate text-base-content">{tx.to}</span>
							<span className="font-semibold text-warning">{tx.amount} BROOM</span>
						</li>
					))}
					{pending.length === 0 && (
						<li className="text-base-content text-center p-2 italic">No pending transactions</li>
					)}
				</ul>
			</div>
		</div>
	);
};
