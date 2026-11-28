const RPC = process.env.SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com";

type RpcResult<T> = { result?: T; error?: { message?: string } };

async function rpcCall<T>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    cache: "no-store",
  });
  const body = (await res.json().catch(() => null)) as RpcResult<T> | null;
  if (!res.ok || !body) throw new Error(`rpc ${method} -> ${res.status}`);
  if (body.error) throw new Error(body.error.message ?? `rpc ${method} failed`);
  if (body.result === undefined) throw new Error(`rpc ${method} returned nothing`);
  return body.result;
}

/**
 * Read a wallet's spendable balance for a mint, plus SOL for fees. Two calls, no indexer.
 */
export async function getBalances(owner: string, mint: string): Promise<{ tokens: string; sol: number }> {
  type Parsed = {
    value: {
      account: { data: { parsed: { info: { tokenAmount: { amount: string } } } } };
    }[];
  };

  const [tokens, lamports] = await Promise.all([
    rpcCall<Parsed>("getTokenAccountsByOwner", [owner, { mint }, { encoding: "jsonParsed" }]),
    rpcCall<{ value: number }>("getBalance", [owner]),
  ]);

  // A wallet can hold the same mint in more than one account; the balance is the sum.
  const total = tokens.value.reduce(
    (sum, acc) => sum + Number(acc.account.data.parsed.info.tokenAmount.amount ?? 0),
    0,
  );

  return { tokens: String(total), sol: (lamports.value ?? 0) / 1e9 };
}

/**
 * Lands a signed transaction through plain JSON-RPC. Claim transactions come back
 * without an execution context, so they cannot use Jupiter's /execute.
 */
export async function submitSignedTransaction(base64: string): Promise<string> {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "sendTransaction",
      params: [base64, { encoding: "base64", skipPreflight: false, preflightCommitment: "confirmed" }],
    }),
    cache: "no-store",
  });

  const body = (await res.json().catch(() => null)) as RpcResult<string> | null;
  if (!res.ok || !body) throw new Error(`rpc ${res.status} ${JSON.stringify(body).slice(0, 200)}`);
  if (body.error) throw new Error(body.error.message ?? "RPC rejected the transaction.");
  if (!body.result) throw new Error("RPC returned no signature.");
  return body.result;
}
