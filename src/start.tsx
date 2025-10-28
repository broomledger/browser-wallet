import { useEffect, useRef, useState } from "react";
import { type StartProps } from "./types";
import { downloadFile } from "./utils";

export const Start = ({ setPrivateKey, setPublicKey }: StartProps) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    console.log("Welcome screen loaded");
  }, []);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFile = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      setPrivateKey(data.private || "");
      setPublicKey(data.public || "");
      if (!data.public) {
        console.log("invalid file");
        throw new Error("invalid file");
      }
      localStorage.setItem("publicKey", data.public);
      localStorage.setItem("privateKey", data.private);
    } catch {
      alert("invalid file");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    console.log(file);
    if (file) handleFile(file);
  };

  const generateKeys = async () => {
    console.log("generating keys");

    const keyPair = wasmGenerateKeypair();
    if (keyPair.error) {
      alert("fatal wasm error");
      return;
    }

    const jsonOutput = {
      public: keyPair.public,
      private: keyPair.private,
    };
    downloadFile("walletconfig.broom", jsonOutput);

    setPublicKey(jsonOutput.public);
    setPrivateKey(jsonOutput.private);
    localStorage.setItem("publicKey", jsonOutput.public);
    localStorage.setItem("privateKey", jsonOutput.private);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 space-y-10 bg-base-100">
      <div className="space-y-2">
        <img src={"/broom.svg"} alt="Broom" className="w-20 h-20 mx-auto" />
        <h1 className="text-5xl font-bold text-primary">Broom Wallet</h1>

        <p className="text-base text-base-content/70 max-w-md">
          Manage your wallet securely. All data is stored in local storage, we
          keep none of your data.
        </p>
      </div>

      <div
        className={`w-96 h-36 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-colors duration-150 cursor-pointer ${
          dragOver
            ? "border-primary bg-base-200"
            : "border-base-300 bg-base-200/50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={handleFileSelect}
      >
        <p className="text-sm text-base-content/70">
          Drag & drop wallet config file here
        </p>
        <span className="text-xs text-base-content/50 mt-1">
          or click to browse
        </span>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <button
        className="btn btn-primary w-96 mt-2 text-lg  shadow"
        onClick={generateKeys}
      >
        Create New Wallet
      </button>
      <a
        href="https://broomledger.com"
        target="_blank"
        className="btn btn-small btn-accent btn-outline text-md"
      >
        Host a node
      </a>
    </div>
  );
};
