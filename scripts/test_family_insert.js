const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSelect() {
  console.log("Testing select from profiles...");
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) {
    console.error("FAIL:", error);
  } else {
    console.log("SUCCESS:", data);
  }
}

testSelect();
