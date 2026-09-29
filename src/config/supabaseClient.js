import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jpepkkzohwqbcvgtbhoo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwZXBra3pvaHdxYmN2Z3RiaG9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1NTU2OTgsImV4cCI6MjEwNjEzMTY5OH0.XR66hBtPJqYxHizkJhi-yvOONhqOr7Uy388CloRuZEU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
