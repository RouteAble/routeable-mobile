import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

SUPABASE_ADDRESS="https://yauarsrrohyqatibwepl.supabase.co";
SUPABASE_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhdWFyc3Jyb2h5cWF0aWJ3ZXBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk1Njk2MTMsImV4cCI6MjAxNTE0NTYxM30.Z5dxXChXLsjSFFLmmG_kflv-bDRL35CUmExpbhNa8hE"

const supabaseUrl = SUPABASE_ADDRESS; // Replace with your Supabase URL
const supabaseAnonKey = SUPABASE_API_KEY; // Replace with your Supabase anonymous key

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
