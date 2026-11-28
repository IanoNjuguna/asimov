import { describe, expect, test } from "bun:test";
import {
  FOLLOW_LIMIT,
  parseFollowing,
  serializeFollowing,
  toggleFollowing,
  type Followed,
} from "@/lib/follow";

const entry = (id: string, at = 1): Followed => ({
  marketId: id,
  title: id.toUpperCase(),
  eventTitle: `event ${id}`,
  addedAt: at,
});

describe("parseFollowing", () => {
  test("survives junk in storage", () => {
    expect(parseFollowing(null)).toEqual([]);
    expect(parseFollowing("not json")).toEqual([]);
    expect(parseFollowing('{"a":1}')).toEqual([]);
    expect(parseFollowing("[1,null,\"x\"]")).toEqual([]);
  });

  test("drops entries with no market id and fills missing strings", () => {
    const raw = JSON.stringify([{ marketId: "m1" }, { title: "no id" }, { marketId: "m2", title: "T" }]);
    expect(parseFollowing(raw)).toEqual([
      { marketId: "m1", title: "", eventTitle: "", addedAt: 0 },
      { marketId: "m2", title: "T", eventTitle: "", addedAt: 0 },
    ]);
  });

  test("dedupes and caps the list", () => {
    const many = Array.from({ length: FOLLOW_LIMIT + 10 }, (_, i) => entry(`m${i}`));
    const parsed = parseFollowing(JSON.stringify([...many, entry("m0")]));
    expect(parsed).toHaveLength(FOLLOW_LIMIT);
    expect(new Set(parsed.map((p) => p.marketId)).size).toBe(FOLLOW_LIMIT);
  });
});

describe("toggleFollowing", () => {
  test("adds to the front", () => {
    expect(toggleFollowing([entry("a")], entry("b", 2)).map((f) => f.marketId)).toEqual(["b", "a"]);
  });

  test("removes when present", () => {
    expect(toggleFollowing([entry("a"), entry("b")], entry("a")).map((f) => f.marketId)).toEqual(["b"]);
  });

  test("never exceeds the cap", () => {
    const full = Array.from({ length: FOLLOW_LIMIT }, (_, i) => entry(`m${i}`));
    expect(toggleFollowing(full, entry("new"))).toHaveLength(FOLLOW_LIMIT);
    expect(toggleFollowing(full, entry("new"))[0].marketId).toBe("new");
  });
});

describe("serializeFollowing", () => {
  test("round trips", () => {
    const list = [entry("a", 5), entry("b", 6)];
    expect(parseFollowing(serializeFollowing(list))).toEqual(list);
  });
});
