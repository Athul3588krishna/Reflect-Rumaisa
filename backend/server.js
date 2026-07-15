const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB().then(() => {
  // Seed default admin and user for testing
  seedUsers();
});

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/diary', require('./routes/diary'));
app.use('/api/todo', require('./routes/todo'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Reflect: Personal Multimedia Diary and Planner API',
    status: 'Running'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Seed helper function
async function seedUsers() {
  try {
    // Seed Admin
    const adminEmail = 'admin@reflect.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        name: 'Reflect Admin',
        email: adminEmail,
        password: 'adminpassword',
        role: 'admin'
      });
      console.log('Seeded default admin user: admin@reflect.com');
    }

    // Seed Regular User
    const userEmail = 'user@reflect.com';
    const userExists = await User.findOne({ email: userEmail });
    if (!userExists) {
      await User.create({
        name: 'Reflect User',
        email: userEmail,
        password: 'userpassword',
        role: 'user'
      });
      console.log('Seeded default regular user: user@reflect.com');
    }
  } catch (error) {
    console.error('Error seeding users:', error.message);
  }
}

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
