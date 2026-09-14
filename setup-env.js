const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/purchase_management?schema=public"\n';

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('.env file created successfully');
  console.log('Please update the DATABASE_URL with your actual PostgreSQL credentials');
} else {
  console.log('.env file already exists');
}
