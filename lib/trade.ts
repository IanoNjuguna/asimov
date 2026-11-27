// Shared by every panel that lands a Jupiter-built transaction.

export type ExecuteAnswer = {
  status?: string;
  signature?: string;
  error?: string;
};

/**
 * /execute answers HTTP 200 with status "Failed" when the venue does not land the
 * transaction, so a 200 is not a success. Returns the signature when it did land.
 */
export function assertExecuted(body: ExecuteAnswer): string | null {
  if (body.status && body.status !== "Success") {
    throw new Error(body.error || "The venue could not execute this transaction.");
  }
  return body.signature ?? null;
}
