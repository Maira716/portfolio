import { NextResponse } from "next/server";
import {
  getFinancesForProject,
  getAllFinances,
  saveFinancesForProject,
  saveAllFinances,
} from "@/lib/serverStore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const all = searchParams.get("all");

    if (all === "true" || !projectId) {
      const allFinances = getAllFinances();
      return NextResponse.json({ finances: allFinances });
    }

    const finances = getFinancesForProject(projectId);
    return NextResponse.json({ finances });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.financesMap && typeof body.financesMap === "object") {
      const saved = saveAllFinances(body.financesMap);
      return NextResponse.json({ success: true, finances: saved });
    }

    const { projectId, finances } = body;
    if (!projectId || !finances) {
      return NextResponse.json(
        { error: "projectId and finances are required" },
        { status: 400 }
      );
    }

    const saved = saveFinancesForProject(projectId, finances);
    return NextResponse.json({ success: true, finances: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
