/**
 * Database Connection Test Script
 * Run with: node test-connection.js
 */

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function testConnection() {
  console.log('🔍 Testing Neon Database Connection...\n');

  // Get DATABASE_URL from environment
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment variables');
    console.log('💡 Make sure .env.local is properly configured');
    return;
  }

  console.log('📋 Connection Details:');
  const urlParts = databaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^\/]+)\/(.+)/);
  if (urlParts) {
    console.log(`   User: ${urlParts[1]}`);
    console.log(`   Host: ${urlParts[3]}`);
    console.log(`   Database: ${urlParts[4].split('?')[0]}`);
  }
  console.log('');

  try {
    console.log('🔌 Attempting to connect...');
    const sql = neon(databaseUrl);
    
    console.log('✅ Connection established successfully!');
    console.log('');
    
    // Test query
    console.log('📊 Testing query execution...');
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    
    console.log('✅ Query executed successfully!');
    console.log('');
    console.log('📈 Database Info:');
    console.log(`   Current Time: ${result[0].current_time}`);
    console.log(`   PostgreSQL: ${result[0].pg_version.split(' ')[0]} ${result[0].pg_version.split(' ')[1]}`);
    console.log('');
    
    // Check tables
    console.log('📋 Checking tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    if (tables.length > 0) {
      console.log('✅ Tables found:');
      tables.forEach(t => console.log(`   - ${t.table_name}`));
    } else {
      console.log('⚠️  No tables found in database');
      console.log('💡 You may need to run the setup page: http://localhost:3000/setup');
    }
    console.log('');
    
    console.log('✅ All tests passed! Database connection is working correctly.');
    
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('');
    console.error('📋 Error Details:');
    console.error(`   Type: ${error.name}`);
    console.error(`   Message: ${error.message}`);
    console.error('');
    
    console.log('🔧 Troubleshooting Steps:');
    console.log('');
    console.log('1. Check Network Connectivity:');
    console.log('   - Disable VPN and try again');
    console.log('   - Check firewall settings');
    console.log('   - Try a different network (mobile hotspot)');
    console.log('');
    console.log('2. Verify Database URL:');
    console.log('   - Login to https://console.neon.tech');
    console.log('   - Check if your project is active');
    console.log('   - Copy the latest connection string');
    console.log('');
    console.log('3. Try Different Endpoints:');
    console.log('   - Switch between pooler and direct connection');
    console.log('   - Pooler: ep-sweet-unit-ahwph4ah-pooler.us-east-1.aws.neon.tech');
    console.log('   - Direct: ep-sweet-unit-ahwph4ah.us-east-1.aws.neon.tech');
    console.log('');
    console.log('4. DNS Resolution:');
    console.log('   - Try: ping ep-sweet-unit-ahwph4ah.us-east-1.aws.neon.tech');
    console.log('   - Try: nslookup ep-sweet-unit-ahwph4ah.us-east-1.aws.neon.tech');
    console.log('');
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.log('⚠️  DNS Resolution Error Detected');
      console.log('   This is typically caused by:');
      console.log('   - Firewall blocking DNS queries');
      console.log('   - VPN interfering with network requests');
      console.log('   - ISP DNS issues');
      console.log('   - Corporate network restrictions');
      console.log('');
      console.log('💡 Quick Fix: Try using Google DNS');
      console.log('   Windows: Settings → Network → Change adapter options');
      console.log('   → Right-click adapter → Properties → IPv4');
      console.log('   → Use: 8.8.8.8 and 8.8.4.4');
    }
    
    if (error.message.includes('timeout')) {
      console.log('⚠️  Connection Timeout Detected');
      console.log('   This is typically caused by:');
      console.log('   - Firewall blocking outbound connections');
      console.log('   - Slow network connection');
      console.log('   - Neon service issues');
      console.log('');
      console.log('💡 Try increasing timeout or checking Neon status');
    }
  }
}

// Run the test
testConnection().catch(console.error);
