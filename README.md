# Team Task Manager

A modern, collaborative task management application built with React, Node.js, and MongoDB. Features real-time collaboration, multi-assignee tasks, and professional project management capabilities.

## Features

### Core Functionality
- **Project Management** - Create and organize projects with team members
- **Task Management** - Create, assign, and track tasks with multiple assignees
- **User Authentication** - Secure signup/login with JWT tokens
- **Member Management** - Add/remove team members with role-based permissions
- **Real-time Updates** - Instant task status updates and member changes

### Advanced Features
- **Multi-Assignee Tasks** - Assign tasks to multiple team members
- **Kanban Board** - Visual task management with drag-and-drop columns
- **Priority Levels** - High, Medium, Low priority categorization
- **Due Date Tracking** - Task deadlines and overdue notifications
- **Search & Filter** - Find users and tasks quickly
- **Responsive Design** - Works seamlessly on desktop and mobile

### UI/UX Features
- **Modern Interface** - Clean, professional design with Tailwind CSS
- **Multi-Select Dropdowns** - Advanced user selection with search
- **Member Badges** - Visual indicators for roles and current user
- **Smooth Animations** - Polished transitions and micro-interactions
- **Dark Mode Support** - Eye-friendly dark theme option

## 🛠 Tech Stack

### Frontend
- **React 19** - Modern React with hooks and concurrent features
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Professional UI components
- **Zustand** - Lightweight state management
- **Axios** - HTTP client for API calls
- **Sonner** - Beautiful toast notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - Object Data Modeling (ODM)
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Development Tools
- **ESLint** - Code linting and formatting
- **Nodemon** - Auto-restart development server
- **Git** - Version control

## 📁 Project Structure

```
team-task-manager/
├── backend/
│   ├── controllers/     # Request handlers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── utils/          # Utility functions
│   └── server.js       # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── api/        # API service functions
│   │   ├── store/      # State management
│   │   └── lib/        # Utility functions
│   └── public/         # Static assets
├── .env.example         # Environment variables template
└── README.md           # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20.19.0 or higher
- MongoDB (local or cloud instance)
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd team-task-manager
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend/task-manager-ui
npm install
```

4. **Set up environment variables**
```bash
# Copy the example environment file
cp ../.env.example ../.env

# Edit the .env file with your configuration
MONGODB_URI=mongodb://localhost:27017/team-task-manager
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

5. **Start the development servers**

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend/task-manager-ui
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📖 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Project Endpoints
- `GET /api/projects` - Get user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id/members` - Add project member
- `DELETE /api/projects/:id/members/:memberId` - Remove project member

### Task Endpoints
- `GET /api/tasks/project/:projectId` - Get project tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `PUT /api/tasks/:id/status` - Update task status
- `GET /api/tasks/dashboard` - Get dashboard stats

## 🔧 Configuration

### Environment Variables
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS

### Database Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Create a database named `team-task-manager`
3. Update `MONGODB_URI` in your .env file

## 🚀 Deployment

### Railway Deployment
1. Push your code to GitHub
2. Connect your repository to Railway
3. Set environment variables in Railway dashboard
4. Deploy both frontend and backend services

### Required Environment Variables (Railway)
```
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-key
NODE_ENV=production
PORT=5000
```

### Build Commands
- Backend: `npm start`
- Frontend: `npm run build`

## 🎯 Usage

### Creating a Project
1. Click "New Project" button
2. Enter project name and description
3. Project is created with you as admin

### Managing Members
1. Click the "X Members" button in project header
2. Add members by email address
3. Remove members with the × button (admin only)
4. View member roles and current user indicator

### Creating Tasks
1. Click "Create Task" button (admin only)
2. Fill in all required fields:
   - Title and description
   - Priority level
   - Due date
   - Assignees (multiple selection with search)
3. Task appears in "To Do" column

### Managing Tasks
- **Move Tasks**: Click task → Select new status
- **Edit Tasks**: Click edit icon (admin only)
- **View Details**: Expand task cards for metadata
- **Assignee Management**: Multiple users can be assigned to tasks

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for secure password storage
- **Role-Based Access** - Admin vs member permissions
- **CORS Protection** - Cross-origin request security
- **Input Validation** - Server-side validation for all inputs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Check MongoDB is running
- Verify MONGODB_URI in .env file
- Ensure database exists

**CORS Errors**
- Verify FRONTEND_URL environment variable
- Check backend CORS configuration

**Build Failures**
- Ensure Node.js version >= 20.19.0
- Clear node_modules and reinstall dependencies
- Check for syntax errors in code

**Authentication Issues**
- Verify JWT_SECRET is set
- Check token expiration
- Ensure proper headers in API requests

### Development Tips
- Use `npm run dev` for auto-restart during development
- Check browser console for frontend errors
- Use MongoDB Compass for database management
- Test API endpoints with Postman or curl

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review existing GitHub issues
3. Create a new issue with detailed information
4. Include error messages and environment details

---

Built with ❤️ for modern team collaboration

