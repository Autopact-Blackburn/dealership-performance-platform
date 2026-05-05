import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://snzjsuwqetomdkvphvzs.supabase.co'

const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuempzdXdxZXRvbWRrdnBodnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NDQ5MTksImV4cCI6MjA5MzUyMDkxOX0.mkJ1_nxP0emPvhSqgUz7Q4zKm63LtG0J7xiYhwT78QQ'

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)