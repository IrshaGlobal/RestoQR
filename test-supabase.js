// Quick Supabase Connection Test
// Run this with: node test-supabase.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ftuihzoapphxmakufpxf.supabase.co'
const supabaseKey = 'sb_secret_FiSn3D9FvmJXDjBoA98MJw_wj3lHz4e'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n')
  
  try {
    // Test 1: Check if tables exist
    console.log('1. Checking database tables...')
    const { data: tables, error: tablesError } = await supabase
      .from('restaurants')
      .select('*')
      .limit(1)
    
    if (tablesError) {
      console.error('   ❌ Error:', tablesError.message)
      console.log('\n⚠️  Database schema not set up yet!')
      console.log('\n📋 Next steps:')
      console.log('   1. Go to https://app.supabase.com')
      console.log('   2. Open your project SQL Editor')
      console.log('   3. Run the contents of supabase-setup.sql')
      return false
    }
    
    console.log('   ✅ Tables are set up correctly\n')
    
    // Test 2: Check for existing restaurants
    console.log('2. Checking for restaurants...')
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('*')
    
    if (error) {
      console.error('   ❌ Error:', error.message)
      return false
    }
    
    if (restaurants && restaurants.length > 0) {
      console.log(`   ✅ Found ${restaurants.length} restaurant(s)`)
      restaurants.forEach(r => {
        console.log(`      - ${r.name} (${r.id})`)
      })
    } else {
      console.log('   ⚠️  No restaurants found')
      console.log('\n📋 To create your first restaurant, run this SQL:')
      console.log(`
INSERT INTO restaurants (name, currency, is_open) 
VALUES ('My Restaurant', '$', true) 
RETURNING id;
      `.trim())
    }
    
    console.log('\n✅ Supabase connection is working!\n')
    return true
    
  } catch (err) {
    console.error('❌ Connection failed:', err.message)
    return false
  }
}

testConnection()
