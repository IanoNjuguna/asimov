import { NextResponse } from "next/server";
import { fail, upstream } from "@/lib/api";
import { getOrderStatus } from "@/lib/jup";

// Keeper fills are asynchronous: an order account can exist before any contracts land.
export async function GET(request: Request) {
  const orderPubkey = new URL(request.url).searchParams.get("order");
  if (!orderPubkey) return fail("order is required.");

  try {
    const status = await getOrderStatus(orderPubkey);
    return NextResponse.json(status);
  } catch (e) {
    return upstream(e);
  }
}
