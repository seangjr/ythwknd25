import { createClient } from "@/lib/supabase";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

// Generate a new team invite
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { teamId } = body;

    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 },
      );
    }

    const supabase = createClient();

    // Generate a unique invite code
    const inviteCode = nanoid(10);

    // Insert the invite code
    const { data, error } = await supabase
      .from("team_invites")
      .insert({
        team_id: teamId,
        invite_code: inviteCode,
        expires_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ).toISOString(), // 7 days from now
      })
      .select();

    if (error) {
      console.error("Error creating team invite:", error);
      return NextResponse.json(
        { error: "Failed to create team invite" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      inviteCode,
      inviteUrl: `${process.env.NEXT_PUBLIC_BASE_URL || ""}/invite/${inviteCode}`,
    });
  } catch (error) {
    console.error("Error in team invite API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Validate a team invite
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const inviteCode = searchParams.get("code");

    if (!inviteCode) {
      return NextResponse.json(
        { error: "Invite code is required" },
        { status: 400 },
      );
    }

    const supabase = createClient();

    // Get the invite details
    const { data, error } = await supabase
      .from("team_invites")
      .select("team_id, expires_at")
      .eq("invite_code", inviteCode)
      .single();

    if (error) {
      console.error("Error fetching team invite:", error);
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 404 },
      );
    }

    // Check if the invite has expired
    if (new Date(data.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Invite has expired" },
        { status: 410 },
      );
    }

    // Get team details
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .select("id, name, color")
      .eq("id", data.team_id)
      .single();

    if (teamError) {
      console.error("Error fetching team details:", teamError);
      return NextResponse.json(
        { error: "Failed to fetch team details" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      teamId: data.team_id,
      teamName: teamData.name,
      teamColor: teamData.color,
      expiresAt: data.expires_at,
    });
  } catch (error) {
    console.error("Error in team invite API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
