import { createSheetsClient } from "@/lib/google-sheets";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Extract registration data
    const {
      lineNumber,
      groupNumber,
      email,
      fullName,
      // nickname,
      age,
      gender,
      nricPassport,
      contactNumber,
      instagramHandle,
      schoolName,
      ymMember,
      cgLeader,
      hero,
      heroId, // Add this to handle both field names
      emergencyContactName,
      emergencyContactRelationship,
      emergencyContactPhone,
      emergencyContactEmail,
      // Additional fields for religious affiliation
      isChristian,
      eventSource,
      otherEventSource,
      invitedByFriend,
      // Church details
      // churchName,
      // pastorName,
      // churchRole,
    } = body;

    // Validate required fields
    if (!lineNumber || !email || !fullName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Google Sheets API setup
    try {
      // Check if Google Sheets integration is configured
      if (
        !process.env.GOOGLE_SERVICE_ACCOUNT_KEY ||
        !process.env.GOOGLE_SHEET_ID
      ) {
        console.log("Google Sheets integration not configured, skipping sync");
        return NextResponse.json({ success: true, sheetsSyncSkipped: true });
      }

      // Create Google Sheets client
      const sheets = await createSheetsClient();

      // Append data to the spreadsheet
      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: "Registrations!A:V", // Extended range to accommodate new fields
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: [
            [
              lineNumber,
              groupNumber,
              email,
              fullName,
              // nickname,
              age,
              gender,
              nricPassport,
              contactNumber,
              instagramHandle || "",
              schoolName,
              ymMember ? "Yes" : "No",
              cgLeader,
              hero || heroId,
              emergencyContactName,
              emergencyContactRelationship,
              emergencyContactPhone,
              emergencyContactEmail,
              // Additional fields
              isChristian || "",
              eventSource || "",
              otherEventSource || "",
              invitedByFriend || "",
              // churchName || "",
              // pastorName || "",
              // churchRole || "",
              new Date().toISOString(),
            ],
          ],
        },
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Google Sheets API error:", error);
      // Even if Google Sheets sync fails, we don't want to fail the registration
      // Just log the error and return success
      return NextResponse.json({
        success: true,
        sheetsSyncFailed: true,
        error: (error as { message?: string })?.message || "Unknown error",
      });
    }
  } catch (error) {
    console.error("Sheets sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync with Google Sheets" },
      { status: 500 },
    );
  }
}
