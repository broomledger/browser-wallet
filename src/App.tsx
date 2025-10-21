import { useState } from "react";

export default function BroomWallet() {
	const [balance, setBalance] = useState(1000); // example balance
	const [recipient, setRecipient] = useState("");
	const [amount, setAmount] = useState("");

	const handleSend = () => {
		if (!recipient || !amount) return;
		const amt = parseFloat(amount);
		if (amt > 0 && amt <= balance) {
			setBalance(balance - amt);
			alert(`Sent ${amt} Broom to ${recipient}`);
			setRecipient("");
			setAmount("");
		} else {
			alert("Invalid amount");
		}
	};

	return (
		<div className="p-6 max-w-md mx-auto bg-base-100 rounded-lg shadow-md">
			<h1 className="text-2xl font-bold mb-4">Broom Wallet</h1>

			<div className="mb-6">
				<span className="block text-gray-500">Balance</span>
				<span className="text-xl font-semibold">{balance} Broom</span>
			</div>

			<div className="flex flex-col gap-3">
				<input
					type="text"
					placeholder="Recipient Address"
					value={recipient}
					onChange={(e) => setRecipient(e.target.value)}
					className="input input-bordered w-full"
				/>
				<input
					type="number"
					placeholder="Amount to Send"
					value={amount}
					onChange={(e) => setAmount(e.target.value)}
					className="input input-bordered w-full"
				/>
				<button onClick={handleSend} className="btn btn-primary w-full">
					Send Broom
				</button>
			</div>
		</div>
	);
}
