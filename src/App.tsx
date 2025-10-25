import { useEffect, useState } from "react";
import { Wallet } from "./wallet";
import { Start } from "./start";

declare const Go: any; // eslint-disable-line

export default function BroomWallet() {
  const [privateKey, setPrivateKey] = useState<string>("");
  const [publicKey, setPublicKey] = useState<string>("");

  const [wasmReady, setWasmReady] = useState<boolean>(false);

  useEffect(() => {
    const wasmBinary = "/broom-crypto.wasm";
    const go = new Go();
    WebAssembly.instantiateStreaming(fetch(wasmBinary), go.importObject).then(
      (result) => {
        go.run(result.instance);
        setWasmReady(true);
      },
    );
    const priv = localStorage.getItem("privateKey");

    const pub = localStorage.getItem("publicKey");

    setPrivateKey(priv ?? "");
    setPublicKey(pub ?? "");
  }, []);

  return (
    <>
      {wasmReady ? (
        <>
          {privateKey === "" ? (
            <Start
              setPrivateKey={setPrivateKey}
              setPublicKey={setPublicKey}
            ></Start>
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
      ) : (
        <div className="text-center mt-44 text-4xl text-primary">
          loading wasm binary...
        </div>
      )}
    </>
  );
}
