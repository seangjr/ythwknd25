import { createClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

// Get hero availability for a specific team
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

    // Get all hero availability for this team
    const { data, error } = await supabase
      .from("hero_availability")
      .select("hero_id, is_available")
      .eq("team_id", teamId);

    if (error) {
      console.error("Error fetching hero availability:", error);
      return NextResponse.json(
        { error: "Failed to fetch hero availability" },
        { status: 500 },
      );
    }

    // Format the response
    const heroAvailability = data.map((item) => ({
      heroId: item.hero_id,
      isAvailable: item.is_available,
    }));

    return NextResponse.json(heroAvailability);
  } catch (error) {
    console.error("Error in hero availability API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Update hero availability when a hero is selected
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { teamId, heroId, isAvailable } = body;

    if (!teamId || !heroId) {
      return NextResponse.json(
        { error: "Team ID and Hero ID are required" },
        { status: 400 },
      );
    }

    const supabase = createClient();

    // Update the hero availability
    const { data, error } = await supabase
      .from("hero_availability")
      .update({ is_available: isAvailable })
      .eq("team_id", teamId)
      .eq("hero_id", heroId)
      .select();

    if (error) {
      console.error("Error updating hero availability:", error);
      return NextResponse.json(
        { error: "Failed to update hero availability" },
        { status: 500 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in hero availability API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
