import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findUser() {
  // Try to find user by name or just list recent users
  const { data: users, error } = await supabase
    .from('users') // Assuming there is a public users table or I need to use auth.users via admin
    .select('id, name, phone')
    .ilike('name', '%Madhan%')
    .limit(5);

  if (error) {
      // Fallback: list all if table exists
      console.log('Error searching by name, listing all public users...');
       const { data: allUsers } = await supabase.from('users').select('id, name, phone').limit(5);
       console.log('Users:', allUsers);
  } else {
      console.log('Found Users:', users);
  }
}

findUser();
