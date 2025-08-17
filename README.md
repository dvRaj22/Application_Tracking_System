# 🚀 Mini Applicant Tracking System (ATS)

A full-stack web application for managing job applications with a modern Kanban board interface and comprehensive analytics dashboard.

## ✨ Features

### 🎯 **Core Functionality**
- **Kanban Board**: Drag-and-drop interface for managing application stages
- **Real-time Updates**: Live status changes and data synchronization
- **Application Management**: Add, edit, delete, and track job applications
- **Advanced Filtering**: Search and filter by role, status, and experience

### 📊 **Analytics Dashboard**
- **Conversion Funnel**: Real-time recruitment pipeline metrics
- **Status Distribution**: Visual breakdown of applications by stage
- **Role Analytics**: Candidate distribution across different positions
- **Experience Insights**: Average experience and distribution charts
- **Timeline Tracking**: Application trends over time (daily/weekly/monthly)

### 🎨 **User Experience**
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Mode**: Toggle between themes for comfortable viewing
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Real-time Updates**: Auto-refresh every 30 seconds for live data

### 🔐 **Security & Performance**
- **JWT Authentication**: Secure user login and session management
- **Rate Limiting**: API protection against excessive requests
- **Input Validation**: Comprehensive data sanitization and validation
- **MongoDB Atlas**: Cloud-hosted database with automatic backups

## 🛠️ Tech Stack

### **Frontend**
- **React.js 18** - Modern UI framework with hooks
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **@dnd-kit** - Drag-and-drop functionality
- **Recharts** - Beautiful, responsive charts
- **React Hook Form** - Form handling and validation
- **React Router** - Client-side routing
- **Lucide React** - Modern icon library

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB Atlas** - Cloud database service
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Bcryptjs** - Password hashing
- **Express Rate Limit** - API rate limiting
- **Helmet** - Security headers
- **Multer** - File upload handling

## 📁 Project Structure

```
ATS/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── server/                 # Backend Node.js application
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── config/            # Configuration files
│   └── package.json       # Backend dependencies
├── .gitignore             # Git ignore rules
└── README.md              # Project documentation
```

## 🚀 Quick Start

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account
- Git

### **1. Clone the Repository**
```bash
git clone <your-repo-url>
cd ATS
```

### **2. Backend Setup**
```bash
cd server
npm install

# Create .env file
cp .env.example .env

# Update .env with your MongoDB URI and JWT secret
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=1000

# Start the server
npm run dev
```

### **3. Frontend Setup**
```bash
cd client
npm install

# Start the development server
npm run dev
```

### **4. Access the Application**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 🔧 Environment Variables

Create a `.env` file in the `server` directory:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ats_db

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=1000
```

## 📊 Database Schema

### **User Model**
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String,
  createdAt: Date,
  updatedAt: Date
}
```

### **Application Model**
```javascript
{
  candidateName: String,
  role: String,
  yearsOfExperience: Number,
  resumeLink: String,
  status: String (enum: applied, interview, offer, rejected),
  notes: String,
  recruiter: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date,
  lastUpdated: Date
}
```

## 🎯 API Endpoints

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### **Applications**
- `GET /api/applications` - List applications with filters
- `POST /api/applications` - Create new application
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application
- `PATCH /api/applications/:id/status` - Update status (drag & drop)

### **Analytics**
- `GET /api/analytics/dashboard` - Dashboard metrics
- `GET /api/analytics/timeline` - Time-based analytics
- `GET /api/analytics/roles` - Role-specific analytics
- `GET /api/analytics/experience` - Experience distribution

## 🎨 Customization

### **Adding New Statuses**
1. Update the Application model enum in `server/models/Application.js`
2. Add new column in `client/src/pages/KanbanBoard.jsx`
3. Update analytics calculations in `server/routes/analytics.js`

### **Custom Fields**
1. Modify the Application schema in `server/models/Application.js`
2. Update the form in `client/src/pages/KanbanBoard.jsx`
3. Adjust API validation in `server/routes/applications.js`


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React.js** team for the amazing framework
- **Tailwind CSS** for the utility-first CSS approach
- **MongoDB Atlas** for the cloud database service
- **Recharts** for the beautiful chart components

## 📞 Support

If you have any questions or need help:
- Create an issue in this repository
- Contact: [rajdivyam730@gmail.com]

---

**Demo Video Link:** [Click Here](https://drive.google.com/file/d/1jgstLFeKfmojuM-W1JgK1ZDvTq063DuZ/view?usp=sharing)

**Made with ❤️ by Divyam Raj**


