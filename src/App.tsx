import { useEffect, useState } from "react";
import { Wallet } from "./wallet";
import { Start } from "./start";

export default function BroomWallet() {
	const [privateKey, setPrivateKey] = useState<String>("");
	const [publicKey, setPublicKey] = useState<String>("");

	useEffect(() => {
		const priv = localStorage.getItem("privateKey");

		const pub = localStorage.getItem("publicKey");

		setPrivateKey(priv ?? "");
		setPublicKey(pub ?? "");
	}, []);

	return (
		<>
			{privateKey === "" ? (
				<Start setPrivateKey={setPrivateKey} setPublicKey={setPublicKey}></Start>
			) : (
				<Wallet
					privateKey={privateKey}
					publicKey={publicKey}
					clearKeys={() => {
						setPrivateKey("");
						setPublicKey("");
						localStorage.setItem("publicKey", "");
						localStorage.setItem("privateKey", "");
					}}
				></Wallet>
			)}
		</>
	);
}
