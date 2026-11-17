import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/apiAuth";
import { apiError } from "@/lib/apiErrors";
import { getLiveAlertCounts } from "@/services/liveAlerts";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return apiError("Authentication required.", 401);
  }

  try {
    const alerts = await getLiveAlertCounts();
    return NextResponse.json(
      { alerts },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[DASHBOARD] Could not load live alerts:", error);
    return apiError("Live alerts could not be loaded.", 500);
  }
}
