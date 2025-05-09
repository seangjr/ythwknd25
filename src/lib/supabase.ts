import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Create a singleton Supabase client
let supabase: ReturnType<typeof createSupabaseClient> | null = null;

export class DatabaseConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseConnectionError';
  }
}

export function createClient() {
  if (supabase) return supabase;

  // Check if environment variables are set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new DatabaseConnectionError('Supabase configuration is missing');
  }

  try {
    // Initialize the Supabase client
    supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );

    return supabase;
  } catch (error) {
    throw new DatabaseConnectionError('Failed to initialize database connection');
  }
}

export function handleDatabaseError(error: unknown) {
  if (error instanceof DatabaseConnectionError) {
    return {
      error: 'Database connection error',
      message: error.message,
      status: 503, // Service Unavailable
    };
  }

  // Handle Supabase specific errors
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as { code: string; message: string };
    
    switch (supabaseError.code) {
      case 'PGRST116': // No rows returned
        return {
          error: 'Not found',
          message: 'The requested resource was not found',
          status: 404,
        };
      case '23505': // Unique violation
        return {
          error: 'Conflict',
          message: 'A record with this data already exists',
          status: 409,
        };
      case '23503': // Foreign key violation
        return {
          error: 'Invalid reference',
          message: 'The referenced record does not exist',
          status: 400,
        };
      default:
        return {
          error: 'Database error',
          message: supabaseError.message || 'An unexpected database error occurred',
          status: 500,
        };
    }
  }

  // Handle unknown errors
  return {
    error: 'Internal server error',
    message: 'An unexpected error occurred',
    status: 500,
  };
}
