import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  "https://cedyrwcnyoytrnjgjxus.supabase.co";

const supabaseKey =
  "YOUR_PUBLISHABLE_KEY_HERE";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);