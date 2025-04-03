# Fitness Tracker App

A comprehensive fitness tracking application built with React and Firebase that helps users set and achieve their fitness goals.

## Features

- **User Authentication**: Email/password signup and login using Firebase Authentication
- **Personal Fitness Profile**: Input personal details like height, weight, and fitness goals
- **BMI Calculation**: Automatic BMI calculation and classification
- **Macronutrient Recommendations**: Custom macronutrient breakdowns based on user goals
- **Personalized Diet & Exercise Plans**: Goal-based recommendations for diet and exercise
- **Real-Time Data Sync**: Firebase Realtime Database for instant updates
- **Responsive Design**: Works on desktop and mobile devices

## Technologies Used

- **Frontend**: React with Hooks, React Router
- **Backend**: Firebase (Authentication, Realtime Database)
- **Charts**: Chart.js with React-Chartjs-2
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js and npm installed
- Firebase account

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/fitness-tracker-app.git
   cd fitness-tracker-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure Firebase:
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Email/Password authentication in the Authentication section
   - Set up a Realtime Database
   - Copy your Firebase configuration from Project Settings
   - Update the Firebase configuration in `src/services/firebase.js`

4. Start the development server:
   ```
   npm run dev
   ```

## Usage

1. **Sign Up/Login**: Create an account or log in with your email and password.
2. **Complete the Fitness Form**: Input your personal details and fitness goals.
3. **View Dashboard**: See your key stats and daily recommendations.
4. **Check Detailed Results**: View your BMI, macronutrient breakdown, and personalized recommendations.
5. **Update Your Profile**: Modify your fitness data as needed.

## Deployment

To build the app for production:

```
npm run build
```

The built files will be in the `dist` directory. You can deploy these files to any static hosting service like Firebase Hosting, Netlify, or Vercel.

## Future Enhancements

- Progress tracking with graphs
- Workout planning and tracking
- Meal planning with recipes
- Social features for motivation
- Mobile app using React Native

## License

This project is licensed under the MIT License. 