import { describe, expect, test } from "bun:test";
import { assertExecuted } from "@/lib/trade";

describe("assertExecuted", () => {
  test("a 200 with status Failed throws the venue's message", () => {
    expect(() => assertExecuted({ status: "Failed", error: "Insufficient funds" })).toThrow(
      "Insufficient funds",
    );
  });

  test("a 200 with status Failed and no message still throws", () => {
    expect(() => assertExecuted({ status: "Failed" })).toThrow(
      "The venue could not execute this transaction.",
    );
  });

  test("Success returns the signature", () => {
    expect(assertExecuted({ status: "Success", signature: "5sig" })).toBe("5sig");
  });

  test("Success without a signature returns null rather than undefined", () => {
    expect(assertExecuted({ status: "Success" })).toBeNull();
  });

  test("an answer with no status is not treated as a failure", () => {
    expect(assertExecuted({})).toBeNull();
  });
});
