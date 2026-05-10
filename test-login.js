// Test this in your browser console (F12) at http://localhost:5173/login
// This will help diagnose the login issue

async function testLogin() {
  console.log('🔍 Testing Supabase Connection...\n');
  
  // Check environment variables
  console.log('1. Checking environment variables:');
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('   URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('   Key:', supabaseKey ? '✅ Set' : '❌ Missing');
  console.log('');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERROR: Environment variables not set! Check your .env file.');
    return;
  }
  
  // Try to sign in
  console.log('2. Testing login with credentials...');
  const email = prompt('Enter test email:');
  const password = prompt('Enter test password:');
  
  if (!email || !password) {
    console.error('❌ No credentials provided');
    return;
  }
  
  try {
    // Import supabase client
    const { supabase } = await import('./src/lib/supabase.ts');
    
    console.log('   Attempting login for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('❌ Login failed with error:');
      console.error('   Message:', error.message);
      console.error('   Status:', error.status);
      console.error('');
      console.error('💡 Common fixes:');
      console.error('   1. Go to Supabase Dashboard > Authentication > Settings');
      console.error('   2. Disable "Enable email confirmations"');
      console.error('   3. Or manually confirm the user email');
      console.error('   4. Make sure the user exists in Authentication > Users');
      return;
    }
    
    console.log('✅ Login successful!');
    console.log('   User ID:', data.user.id);
    console.log('   Email:', data.user.email);
    console.log('   Email confirmed:', data.user.email_confirmed_at ? '✅ Yes' : '❌ No');
    console.log('');
    
    // Check restaurant_staff linkage
    console.log('3. Checking restaurant staff linkage...');
    const { data: staffData, error: staffError } = await supabase
      .from('restaurant_staff')
      .select('*, restaurants(name)')
      .eq('user_id', data.user.id)
      .single();
    
    if (staffError) {
      console.error('❌ User not linked to any restaurant');
      console.error('   Error:', staffError.message);
      console.error('');
      console.error('💡 Fix: Add user to restaurant_staff table:');
      console.error(`   INSERT INTO restaurant_staff (user_id, restaurant_id, role)`);
      console.error(`   VALUES ('${data.user.id}', 'YOUR_RESTAURANT_ID', 'admin');`);
      return;
    }
    
    console.log('✅ User is properly linked!');
    console.log('   Role:', staffData.role);
    console.log('   Restaurant:', staffData.restaurants?.name);
    console.log('');
    console.log('🎉 Everything looks good! You should be able to login.');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

// Run the test
testLogin();
