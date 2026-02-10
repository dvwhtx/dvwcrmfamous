import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://iuynytnlcnusdepiognz.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijk5Yzc0MjYyLTZhNDUtNDgwMS1hZGRkLTRjNzRhNTY0NDhhNSJ9.eyJwcm9qZWN0SWQiOiJpdXlueXRubGNudXNkZXBpb2dueiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzcwNjU2NTQwLCJleHAiOjIwODYwMTY1NDAsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.kOx5OuUhwSMCTZLyfYzU4CrrHL_2ohXSbuJ1-AxRuQA';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };