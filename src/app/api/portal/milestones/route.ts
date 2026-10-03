import { NextRequest, NextResponse } from "next/server";
import { getMilestonesForProject, getAllMilestones, saveMilestonesForProject, saveAllMilestones } from "@/lib/serverStore";
import { checkRateLimit } from "@/lib/apiSecurity";

export async function GET(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(req, 60, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Limite de requisições excedido." }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (projectId) {
      const milestones = getMilestonesForProject(projectId);
      return NextResponse.json({ milestones });
    }

    const all = getAllMilestones();
    return NextResponse.json({ milestonesMap: all });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, milestones, milestonesMap } = body;

    if (milestonesMap && typeof milestonesMap === "object") {
      const saved = saveAllMilestones(milestonesMap);
      return NextResponse.json({ success: true, milestonesMap: saved });
    }

    if (projectId && Array.isArray(milestones)) {
      const saved = saveMilestonesForProject(projectId, milestones);
      return NextResponse.json({ success: true, milestones: saved });
    }

    return NextResponse.json({ error: "projectId and milestones array are required" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
