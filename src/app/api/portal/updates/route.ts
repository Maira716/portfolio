import { NextResponse } from "next/server";
import { getUpdatesForProject, saveUpdateForProject } from "@/lib/serverStore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }
    const updates = getUpdatesForProject(projectId);
    return NextResponse.json({ updates });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { projectId, update } = await req.json();
    if (!projectId || !update) {
      return NextResponse.json({ error: "projectId and update are required" }, { status: 400 });
    }
    const updatedList = saveUpdateForProject(projectId, update);
    return NextResponse.json({ success: true, updates: updatedList });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
