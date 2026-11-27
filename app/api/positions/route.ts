import { NextResponse } from "next/server";
import { isPubkey, upstream } from "@/lib/api";
import { getPositions } from "@/lib/jup";

export async function GET(request: Request) {
  const owner = new URL(request.url).searchParams.get("owner");
  if (!isPubkey(owner)) return NextResponse.json({ error: "owner is not a Solana address." }, { status: 400 });

  try {
    const positions = await getPositions(owner);
    return NextResponse.json({ positions });
  } catch (e) {
    return upstream(e);
  }
}
