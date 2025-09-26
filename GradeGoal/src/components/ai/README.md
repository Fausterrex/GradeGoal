# AI Integration for GradeGoal

This folder contains all AI-related components and services for the GradeGoal application, specifically integrating with Google Gemini AI for intelligent academic recommendations and predictions.

## 📁 Folder Structure

```
src/components/ai/
├── components/           # AI-specific React components
│   ├── AIAnalysisButton.jsx      # Button to trigger AI analysis
│   └── AIRecommendationCard.jsx  # Display AI recommendations
├── services/            # AI service integrations
│   └── geminiService.js          # Gemini AI API integration
├── utils/               # AI utility functions
│   └── aiHelpers.js             # Helper functions for AI features
└── README.md            # This file
```

## 🤖 Features

### 1. AI Analysis Button
- **Component**: `AIAnalysisButton.jsx`
- **Purpose**: Triggers AI analysis for specific course goals
- **Features**:
  - One-click AI analysis generation
  - Loading states and error handling
  - Integration with Gemini AI API

### 2. AI Recommendation Cards
- **Component**: `AIRecommendationCard.jsx`
- **Purpose**: Displays AI-generated recommendations
- **Features**:
  - Expandable recommendation details
  - Priority-based color coding
  - Mark as read/dismiss functionality
  - Rich content display (predictions, study habits, etc.)

### 3. Gemini AI Service
- **Service**: `geminiService.js`
- **Purpose**: Handles all Gemini AI API interactions
- **Features**:
  - Generate AI recommendations
  - Calculate enhanced achievement probability
  - Save/retrieve AI recommendations
  - Fallback recommendations when AI fails

### 4. AI Helpers
- **Utils**: `aiHelpers.js`
- **Purpose**: Utility functions for AI features
- **Features**:
  - Enhanced achievement probability calculation
  - AI recommendation formatting
  - Priority color schemes
  - Data validation and parsing

## 🔧 Setup Instructions

### 1. Environment Variables
Create a `.env` file in the project root with:
```env
REACT_APP_GEMINI_API_KEY=your-gemini-api-key-here
REACT_APP_API_BASE_URL=http://localhost:8080/api
```

### 2. Database Migration
Run the AI recommendations migration:
```sql
-- Run the migration script
source database/ai_recommendations_migration.sql
```

### 3. Backend API
Ensure the Spring Boot backend has the AI recommendation endpoints:
- `POST /api/ai-recommendations` - Save AI recommendations
- `GET /api/ai-recommendations/{userId}` - Get user AI recommendations
- `PUT /api/ai-recommendations/{id}/read` - Mark as read
- `PUT /api/ai-recommendations/{id}/dismiss` - Dismiss recommendation

## 📊 AI Output Types

The AI integration provides the following types of recommendations:

### 1. Predicted Final Grade
- **Percentage**: Predicted final grade percentage
- **GPA**: Predicted final GPA
- **Confidence**: AI confidence level (HIGH/MEDIUM/LOW)
- **Reasoning**: Explanation of the prediction

### 2. Assessment Recommendations
- **Category-specific**: Recommendations for each assessment category
- **Target Grades**: Specific grade targets needed
- **Priority**: High/Medium/Low priority
- **Reasoning**: Why these grades are needed

### 3. Target Goal Probability
- **Achievable**: Whether the goal is achievable
- **Probability**: Percentage chance of achieving the goal
- **Required Grades**: What grades are needed
- **Recommendations**: Specific advice for goal achievement

### 4. Status Update
- **Current Status**: Current performance status
- **Trend**: Improving/Declining/Stable
- **Key Insights**: Important observations about performance

### 5. Study Habit Recommendations
- **Habits**: Specific study habits to adopt
- **Reasoning**: Why these habits help
- **Priority**: High/Medium/Low priority

## 🎯 Integration Points

### 1. Academic Goal Cards
- AI Analysis button added to goal cards
- Triggers AI analysis for specific course goals
- Shows enhanced achievement probability

### 2. Unified Recommendations
- Replaced hardcoded recommendations with AI data
- Displays AI-generated insights
- Real-time loading and error handling

### 3. Enhanced Achievement Probability
- Uses AI insights to calculate more accurate probabilities
- Considers course completion, current performance, and AI predictions
- Updates in real-time as new data becomes available

## 🔄 Data Flow

1. **User clicks AI Analysis button** on academic goal card
2. **AIAnalysisButton** calls `geminiService.generateAIRecommendations()`
3. **Gemini AI** analyzes course data and generates recommendations
4. **Recommendations saved** to database via API
5. **UnifiedRecommendations** component displays AI recommendations
6. **Users can interact** with recommendations (read, dismiss, expand)

## 🛠️ Customization

### Adding New AI Features
1. Create new components in `components/` folder
2. Add new service methods in `geminiService.js`
3. Update database schema if needed
4. Add new API endpoints in Spring Boot backend

### Modifying AI Prompts
Edit the `buildRecommendationPrompt()` function in `geminiService.js` to customize the AI prompts.

### Styling AI Components
All AI components use Tailwind CSS classes and can be customized by modifying the component files.

## 🐛 Troubleshooting

### Common Issues

1. **AI Analysis Button not working**
   - Check if `REACT_APP_GEMINI_API_KEY` is set
   - Verify API endpoints are accessible
   - Check browser console for errors

2. **Recommendations not loading**
   - Verify database migration was run
   - Check API endpoints are working
   - Ensure user has AI recommendations in database

3. **AI recommendations not displaying**
   - Check if recommendations are being saved to database
   - Verify API response format matches component expectations
   - Check for JavaScript errors in console

### Debug Mode
Set `REACT_APP_DEBUG=true` in your `.env` file to enable debug logging.

## 📈 Future Enhancements

- [ ] Real-time AI analysis updates
- [ ] AI-powered study schedule generation
- [ ] Predictive analytics for course outcomes
- [ ] Integration with calendar for study reminders
- [ ] AI-powered goal adjustment suggestions
- [ ] Machine learning model training on user data

## 🤝 Contributing

When adding new AI features:
1. Follow the existing folder structure
2. Add proper error handling
3. Include loading states
4. Write comprehensive documentation
5. Test with various data scenarios
6. Ensure accessibility compliance

## 📝 License

This AI integration is part of the GradeGoal project and follows the same licensing terms.
