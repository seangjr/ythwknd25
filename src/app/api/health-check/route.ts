import { createClient, handleDatabaseError } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createClient();

    // Test the connection with a simple query
    const { error } = await supabase
      .from("registrations")
      .select("id")
      .limit(1);

    if (error) {
      const errorResponse = handleDatabaseError(error);
      return NextResponse.json(
        { error: errorResponse.message },
        { status: errorResponse.status },
      );
    }

    return NextResponse.json({ status: "healthy" });
  } catch (error) {
    const errorResponse = handleDatabaseError(error);
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.status },
    );
  }
} 