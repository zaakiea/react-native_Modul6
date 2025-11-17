import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://gwrfxgvxqnijlcswfvzr.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cmZ4Z3Z4cW5pamxjc3dmdnpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MTMwNzEsImV4cCI6MjA3ODI4OTA3MX0.KDEWydOjlyVTYC38oZ09nIOqCfNSFXTPCnidvGcws_Q";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
