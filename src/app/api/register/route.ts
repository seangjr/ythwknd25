import { createClient } from "@/lib/supabase";
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
      heroId,
      teamId,
      inviteCode,
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
    if (!lineNumber || !email || !fullName || !heroId || !teamId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Create Supabase client
    const supabase = createClient();

    // Check if line is already taken
    const { data: existingLine } = await supabase
      .from("registrations")
      .select("id")
      .eq("line_number", lineNumber)
      .single();

    if (existingLine) {
      return NextResponse.json(
        { error: "This line is already taken" },
        { status: 409 },
      );
    }

    // Check if email is unique
    const { data: existingEmail } = await supabase
      .from("registrations")
      .select("id")
      .eq("email", email)
      .single();

    if (existingEmail) {
      return NextResponse.json(
        { error: "This email is already registered. Please use a different email." },
        { status: 409 },
      );
    }

    // Check if hero is available for this team
    const { data: heroAvailability } = await supabase
      .from("hero_availability")
      .select("is_available")
      .eq("team_id", teamId)
      .eq("hero_id", heroId)
      .single();

    if (!heroAvailability || !heroAvailability.is_available) {
      return NextResponse.json(
        { error: "This hero is no longer available" },
        { status: 409 },
      );
    }

    // Prepare additional data for insertion
    const additionalData = {
      is_christian: isChristian || null,
      event_source: eventSource || null,
      other_event_source: otherEventSource || null,
      invited_by_friend: invitedByFriend || null,
      church_name: null,
      pastor_name: null,
      church_role: null,
    };

    // Try multiple registration functions in sequence
    let result;
    let error;

    // First try the direct insert approach
    try {
      const { data: insertData, error: insertError } = await supabase
        .from("registrations")
        .insert({
          line_number: lineNumber,
          group_number: groupNumber,
          email: email,
          full_name: fullName,
          nickname: fullName,
          age: Number(age),
          gender: gender,
          nric_passport: nricPassport,
          contact_number: contactNumber,
          instagram_handle: instagramHandle || null,
          school_name: schoolName,
          ym_member: ymMember === true || ymMember === "Yes",
          cg_leader: cgLeader,
          hero_id: heroId,
          team_id: teamId,
          invite_code: inviteCode || null,
          emergency_contact_name: emergencyContactName,
          emergency_contact_relationship: emergencyContactRelationship,
          emergency_contact_phone: emergencyContactPhone,
          emergency_contact_email: emergencyContactEmail,
          is_christian: additionalData.is_christian,
          event_source: additionalData.event_source,
          other_event_source: additionalData.other_event_source,
          invited_by_friend: additionalData.invited_by_friend,
          church_name: additionalData.church_name,
          pastor_name: additionalData.pastor_name,
          church_role: additionalData.church_role,
          created_at: new Date().toISOString(),
        })
        .select();

      if (insertError) {
        throw insertError;
      }

      // Update hero availability
      await supabase
        .from("hero_availability")
        .update({ is_available: false })
        .eq("team_id", teamId)
        .eq("hero_id", heroId);

      result = insertData;
    } catch (insertError) {
      console.error("Direct insert error:", insertError);

      // If direct insert fails, try the register_user_simple function
      try {
        const { data: simpleData, error: simpleError } = await supabase.rpc(
          "register_user_simple",
          {
            lineNumber,
            groupNumber,
            email,
            fullName,
            nickname: fullName,
            age: Number(age),
            gender,
            nricPassport,
            contactNumber,
            instagramHandle,
            schoolName,
            ymMember: ymMember === true || ymMember === "Yes",
            cgLeader,
            heroId,
            teamId,
            inviteCode,
            emergencyContactName,
            emergencyContactRelationship,
            emergencyContactPhone,
            emergencyContactEmail,
            isChristian: additionalData.is_christian,
            eventSource: additionalData.event_source,
            otherEventSource: additionalData.other_event_source,
            invitedByFriend: additionalData.invited_by_friend,
            churchName: additionalData.church_name,
            pastorName: additionalData.pastor_name,
            churchRole: additionalData.church_role,
          },
        );

        if (simpleError) {
          throw simpleError;
        }

        result = simpleData;
      } catch (simpleError) {
        console.error("Simple function error:", simpleError);

        // If that fails too, try the register_user_params function
        try {
          const { data: paramsData, error: paramsError } = await supabase.rpc(
            "register_user_params",
            {
              lineNumber,
              groupNumber,
              email,
              fullName,
              nickname: fullName,
              age: Number(age),
              gender,
              nricPassport,
              contactNumber,
              instagramHandle,
              schoolName,
              ymMember: ymMember === true || ymMember === "Yes",
              cgLeader,
              heroId,
              teamId,
              inviteCode,
              emergencyContactName,
              emergencyContactRelationship,
              emergencyContactPhone,
              emergencyContactEmail,
              isChristian: additionalData.is_christian,
              eventSource: additionalData.event_source,
              otherEventSource: additionalData.other_event_source,
              invitedByFriend: additionalData.invited_by_friend,
              churchName: additionalData.church_name,
              pastorName: additionalData.pastor_name,
              churchRole: additionalData.church_role,
            },
          );

          if (paramsError) {
            throw paramsError;
          }

          result = paramsData;
        } catch (paramsError) {
          console.error("Params function error:", paramsError);
          error = paramsError;
        }
      }
    }

    if (error || !result) {
      console.error("All registration methods failed");
      return NextResponse.json(
        {
          error:
            "Failed to create registration: " +
            (error?.message || "Unknown error"),
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
