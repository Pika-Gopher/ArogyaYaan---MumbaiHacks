import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = "https://iofaeqlozjbvhdxrjiij.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvZmFlcWxvempidmhkeHJqaWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MjU1MTMsImV4cCI6MjA3OTMwMTUxM30.KThTAmL7bM_TlKjH4IQtP3g1diouptO4kH-yyjqkjLk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
