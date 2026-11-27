const RPC = process.env.SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com";

type RpcResult<T> = { result?: T; error?: { message?: string } };

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
