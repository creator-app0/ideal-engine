import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tnotkwrmwtcmtklykupb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRub3Rrd3Jtd3RjbXRrbHlrdXBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MDIxOTgsImV4cCI6MjA5MzQ3ODE5OH0.epMzJxas0oEAYKsMHpUwv5cMxsv6N77lRyI3dQBZMuw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)