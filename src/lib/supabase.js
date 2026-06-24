import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  "https://uihtcabbgmldqiqifpaz.supabase.co";

const supabaseKey =
  "sb_publishable_2ngwhpzGvKlJWKIqumjJYQ_UgsTGMLj";

export const supabase =
  createClient(
    supabaseUrl,
    supabaseKey
  );