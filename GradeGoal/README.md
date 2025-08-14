# GradeGoal - Full Stack Application

GradeGoal is a comprehensive grade tracking application built with React frontend and Spring Boot backend.

## 🏗️ Architecture

- **Frontend**: React 19 + Vite + Bootstrap
- **Backend**: Spring Boot 3.2 + JPA + H2 Database
- **Authentication**: Firebase (Frontend) + JWT (Backend - planned)
- **Database**: H2 In-Memory (Development) / PostgreSQL (Production ready)

## 🚀 Quick Start

### Prerequisites

- **Frontend**: Node.js 18+ and npm
- **Backend**: Java 17+ and Maven 3.6+

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd GradeGoal
```

### 2. Start the Backend (Spring Boot)

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The Spring Boot application will start on `http://localhost:8080`

**Backend Features:**
- RESTful API at `/api`
- H2 Database Console at `/h2-console`
- Grade management endpoints
- CORS configured for React frontend

### 3. Start the Frontend (React)

In a new terminal:

```bash
# From the root directory
npm install
npm run dev
```

The React application will start on `http://localhost:5173`

**Frontend Features:**
- User authentication with Firebase
- Grade management interface
- Responsive design with Bootstrap
- Real-time data from Spring Boot API

## 📁 Project Structure

```
GradeGoal/
├── src/                    # React frontend source
│   ├── components/        # React components
│   ├── context/          # React context (Auth)
│   ├── utils/            # Utility functions & API calls
│   └── assets/           # Static assets
├── backend/               # Spring Boot backend
│   ├── src/main/java/    # Java source code
│   ├── src/main/resources/ # Configuration files
│   └── pom.xml           # Maven dependencies
├── package.json           # Frontend dependencies
└── README.md             # This file
```

## 🔌 API Endpoints

### Base URL: `http://localhost:8080/api`

#### Grade Management
- `POST /grades` - Create a new grade
- `GET /grades/user/{userId}` - Get all grades for a user
- `GET /grades/{id}` - Get a specific grade
- `PUT /grades/{id}` - Update a grade
- `DELETE /grades/{id}` - Delete a grade

#### Analytics
- `GET /grades/user/{userId}/average` - Get user's average score
- `GET /grades/user/{userId}/subject/{subject}/average` - Get subject average
- `GET /grades/user/{userId}/above/{minScore}` - Get grades above threshold
- `GET /grades/user/{userId}/below/{maxScore}` - Get grades below threshold

#### Health Check
- `GET /grades/health` - Service status

## 🎯 Features

### Frontend
- ✅ User authentication (Firebase)
- ✅ Responsive UI with Bootstrap
- ✅ Grade management interface
- ✅ Real-time data updates
- ✅ Form validation
- ✅ Error handling

### Backend
- ✅ RESTful API
- ✅ JPA/Hibernate ORM
- ✅ Data validation
- ✅ CORS configuration
- ✅ H2 database (dev)
- ✅ Comprehensive grade analytics

## 🛠️ Development

### Adding New Features

1. **Backend**: Create entities, repositories, services, and controllers
2. **Frontend**: Create React components and integrate with API
3. **Database**: Update entities and run migrations

### Database Schema

The main entity is `Grade` with fields:
- `id` (Primary Key)
- `subject` (String)
- `assignmentName` (String)
- `score` (Double)
- `totalPoints` (Double)
- `comments` (String, optional)
- `dateCreated` (DateTime)
- `userId` (String)

## 🔧 Configuration

### Backend Configuration (`application.properties`)
- Server port: 8080
- API context: /api
- Database: H2 in-memory
- CORS: Enabled for localhost:5173

### Frontend Configuration
- API base URL: http://localhost:8080/api
- Development server: localhost:5173
- Firebase authentication

## 🚀 Deployment

### Backend Deployment
- Build: `mvn clean package`
- Run: `java -jar target/gradegoal-backend-0.0.1-SNAPSHOT.jar`
- Configure production database in `application.properties`

### Frontend Deployment
- Build: `npm run build`
- Deploy `dist/` folder to your hosting service

## 🧪 Testing

### Backend Testing
```bash
cd backend
mvn test
```

### Frontend Testing
```bash
npm test
```

## 📚 Learning Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev/)
- [Bootstrap Documentation](https://getbootstrap.com/)
- [JPA/Hibernate Guide](https://hibernate.org/orm/documentation/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify both frontend and backend are running
3. Check the H2 console for database issues
4. Review the API endpoints and request/response format

---

**Happy Coding! 🎉**
