import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  "https://cedyrwcnyoytrnjgjxus.supabase.co";

const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZHlyd2NueW95dHJuamdqeHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3ODQ0NjgsImV4cCI6MjA5NjM2MDQ2OH0.ClyebOnTHVmGvGldsz5kvaYEHmNDpORsAu8uRX34bkY";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);