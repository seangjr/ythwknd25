import { google } from "googleapis";

/**
 * Helper function to safely parse the Google service account key
 * Handles various formats including Base64 encoding
 */
export function parseServiceAccountKey(key: string | undefined) {
  if (!key) {
    console.log("No service account key provided");
    return null;
  }

  // Try to detect if the key is Base64 encoded
  const isBase64 = (str: string) => {
    try {
      // Base64 strings are typically longer than 100 characters
      // and contain only Base64 valid characters
      return str.length > 100 && /^[A-Za-z0-9+/=]+$/.test(str);
    } catch (e) {
      return false;
    }
  };

  // Try to decode Base64 if it looks like Base64
  if (isBase64(key)) {
    try {
      console.log("Key appears to be Base64 encoded, attempting to decode");
      const decoded = Buffer.from(key, "base64").toString();
      try {
        const parsed = JSON.parse(decoded);
        console.log("Successfully parsed Base64 decoded key");
        return parsed;
      } catch (e) {
        console.log("Failed to parse Base64 decoded key as JSON");
      }
    } catch (e) {
      console.log("Failed to decode as Base64");
    }
  }

  // If not Base64 or Base64 decoding failed, try direct parsing
  try {
    console.log("Attempting direct JSON parsing");
    return JSON.parse(key);
  } catch (e) {
    console.log("Direct parsing failed, trying with replacements");
    try {
      // Try parsing after replacing escaped newlines and trimming
      return JSON.parse(key.replace(/\\n/g, "\n").trim());
    } catch (e) {
      console.log(
        "Second parsing attempt failed, trying with additional processing",
      );
      try {
        // Try parsing after removing any surrounding quotes
        const unquoted = key.replace(/^["']|["']$/g, "");
        return JSON.parse(unquoted);
      } catch (e) {
        console.log("All parsing attempts failed");
        console.error("Service account key parsing error:", e);
        return null;
      }
    }
  }
}

/**
 * Creates a Google Sheets client with authentication
 */
export async function createSheetsClient() {
  const credentials = parseServiceAccountKey(
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
  );

  if (!credentials) {
    throw new Error("Failed to parse Google service account credentials");
  }

  // Log credential structure for debugging (without sensitive data)
  const credentialStructure = {
    hasPrivateKey: !!credentials.private_key,
    hasClientEmail: !!credentials.client_email,
    hasProjectId: !!credentials.project_id,
    type: credentials.type,
  };
  console.log("Credential structure:", credentialStructure);

  // Initialize auth client
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  // Create and return sheets client
  return google.sheets({ version: "v4", auth });
}
