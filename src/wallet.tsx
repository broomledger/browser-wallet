import { useState } from "react";
import type { PendingTx, WalletProps } from "./types";

export const Wallet = ({ privateKey, publicKey, clearKeys }: WalletProps) => {
	const [balance, setBalance] = useState(0);
	const [pending, setPending] = useState<PendingTx[]>([]);
	const [sendTo, setSendTo] = useState("");
	const [sendAmount, setSendAmount] = useState("");

	return (
		<div className="p-6 max-w-md mx-auto bg-base-100 shadow-xl rounded-2xl">
			<h2 className="text-3xl font-bold mb-6 text-center text-primary">My Wallet</h2>

			{/* Balance */}
			<div className="mb-6 p-4 rounded-xl bg-base-200 text-center shadow-inner">
				<p className="text-base-content text-sm">Balance</p>
				<p className="text-base-content text-2xl font-semibold">{balance} BROOM</p>
			</div>

			{/* Your Address */}
			<div className="mb-6 relative">
				<label className="block text-base-content text-sm font-medium mb-1">Your Wallet Address</label>
				<input
					type="text"
					value={publicKey as string}
					readOnly
					className="input input-bordered w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
				/>
				<button
					onClick={() => navigator.clipboard.writeText(publicKey as string)}
					className="btn btn-sm absolute right-2 top-7"
				>
					Copy
				</button>
			</div>

			{/* Clear Keys Button */}
			<button
				onClick={() => {
					if (confirm("this will erase your keys locally")) {
						clearKeys();
					}
				}}
				className="btn btn-sm btn-outline mt-2 float-right mr-2"
			>
				Clear
			</button>

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
				<button className="btn btn-info w-full mt-2">Send</button>
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
