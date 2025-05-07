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

    // Get the most recent invite for this team
    const { data, error } = await supabase
      .from("team_invites")
      .select("invite_code, expires_at")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // If no invite found, return empty response
      if (error.code === "PGRST116") {
        return NextResponse.json({});
      }

      console.error("Error fetching team invite:", error);
      return NextResponse.json(
        { error: "Failed to check for existing invite" },
        { status: 500 },
      );
    }

    // Check if the invite has expired
    if (data && new Date(data.expires_at as string) < new Date()) {
      return NextResponse.json({});
    }

    // Return the invite URL if it exists and is valid
    if (data) {
      return NextResponse.json({
        inviteCode: data.invite_code,
        inviteUrl: `${process.env.NEXT_PUBLIC_BASE_URL || ""}/invite/${data.invite_code}`,
      });
    }

    return NextResponse.json({});
  } catch (error) {
    console.error("Error in team invite check API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
