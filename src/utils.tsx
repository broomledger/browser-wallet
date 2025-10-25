// eslint-disable-next-line
export const downloadFile = (filename: string, data: any) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

type PollResponse = {
  balance: number;
  nonce: number;
};

export const pollNode = async (
  nodeUrl: string,
  address: string,
): Promise<PollResponse> => {
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address: address }),
  };

  const res = await fetch(`${nodeUrl}/address`, options);

  const data = await res.json();

  return data;
};

export const getRandomNodeAddress = () => {
  const hostValues = ["node.broomledger.com", "node2.broomledger.com"];

  const shuffled = hostValues.sort(() => Math.random() - 0.5);

  return `https://${shuffled[0]}`;
};

export const validatePublicKey = (key: string): boolean => {
  if (key.length != 124) {
    return false;
  }

  return true;
};
