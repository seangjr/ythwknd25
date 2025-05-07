import { createClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");

    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 },
      );
    }

    const supabase = createClient();

    // Fetch all registrations for this team
    const { data, error } = await supabase
      .from("registrations")
      .select(
        "id, line_number, nickname, instagram_handle, full_name, hero_id, created_at",
      )
      .eq("team_id", teamId)
      .order("line_number");

    if (error) {
      console.error("Error fetching team members:", error);
      return NextResponse.json(
        { error: "Failed to fetch team members" },
        { status: 500 },
      );
    }

    return NextResponse.json({ members: data || [] });
  } catch (error) {
    console.error("Error in team members API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
