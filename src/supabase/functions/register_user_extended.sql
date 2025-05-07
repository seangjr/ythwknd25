-- Create a stored procedure for registering a user with extended data in a transaction
CREATE OR REPLACE FUNCTION register_user_extended(
  p_line_number INTEGER,
  p_group_number INTEGER,
  p_email VARCHAR,
  p_full_name VARCHAR,
  p_nickname VARCHAR,
  p_age INTEGER,
  p_gender VARCHAR,
  p_nric_passport VARCHAR,
  p_contact_number VARCHAR,
  p_instagram_handle VARCHAR,
  p_school_name VARCHAR,
  p_ym_member BOOLEAN,
  p_cg_leader VARCHAR,
  p_hero_id VARCHAR,
  p_team_id INTEGER,
  p_invite_code VARCHAR,
  p_emergency_contact_name VARCHAR,
  p_emergency_contact_relationship VARCHAR,
  p_emergency_contact_phone VARCHAR,
  p_emergency_contact_email VARCHAR,
  -- Additional fields
  p_is_christian VARCHAR,
  p_event_source VARCHAR,
  p_other_event_source VARCHAR,
  p_invited_by_friend VARCHAR,
  p_church_name VARCHAR,
  p_pastor_name VARCHAR,
  p_church_role VARCHAR
) RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Insert registration with extended fields
  INSERT INTO registrations (
    line_number,
    group_number,
    email,
    full_name,
    nickname,
    age,
    gender,
    nric_passport,
    contact_number,
    instagram_handle,
    school_name,
    ym_member,
    cg_leader,
    hero_id,
    team_id,
    invite_code,
    emergency_contact_name,
    emergency_contact_relationship,
    emergency_contact_phone,
    emergency_contact_email,
    -- Additional fields
    is_christian,
    event_source,
    other_event_source,
    invited_by_friend,
    church_name,
    pastor_name,
    church_role,
    created_at
  ) VALUES (
    p_line_number,
    p_group_number,
    p_email,
    p_full_name,
    p_nickname,
    p_age,
    p_gender,
    p_nric_passport,
    p_contact_number,
    p_instagram_handle,
    p_school_name,
    p_ym_member,
    p_cg_leader,
    p_hero_id,
    p_team_id,
    p_invite_code,
    p_emergency_contact_name,
    p_emergency_contact_relationship,
    p_emergency_contact_phone,
    p_emergency_contact_email,
    -- Additional fields
    p_is_christian,
    p_event_source,
    p_other_event_source,
    p_invited_by_friend,
    p_church_name,
    p_pastor_name,
    p_church_role,
    NOW()
  )
  RETURNING to_jsonb(registrations.*) INTO v_result;

  -- Update hero availability
  UPDATE hero_availability
  SET is_available = FALSE
  WHERE team_id = p_team_id AND hero_id = p_hero_id;

  RETURN v_result;
END;
$$;
