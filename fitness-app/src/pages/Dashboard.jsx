import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { database } from '../services/firebase';
import './Dashboard.css';

const Dashboard = ({ user }) => {
  const [fitnessData, setFitnessData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fitnessDataRef = ref(database, `users/${user.uid}/fitnessData`);
    
    const unsubscribe = onValue(fitnessDataRef, (snapshot) => {
      setLoading(true);
      if (snapshot.exists()) {
        setFitnessData(snapshot.val());
      } else {
        setFitnessData(null);
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user.uid]);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>{getGreeting()}, {fitnessData?.name || user.email.split('@')[0]}</h2>
        <p className="subtitle">Welcome to your fitness dashboard</p>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <p>Loading your dashboard...</p>
        </div>
      ) : (
        <div className="dashboard-content">
          {!fitnessData ? (
            <div className="no-data-container">
              <h3>Get Started with Your Fitness Journey</h3>
              <p>Complete your fitness profile to receive personalized recommendations.</p>
              <Link to="/fitness-form" className="start-btn">Complete Your Profile</Link>
            </div>
          ) : (
            <>
              <div className="dashboard-grid">
                <div className="quick-stats-card card">
                  <h3>Your Quick Stats</h3>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-label">BMI</span>
                      <span className="stat-value">{fitnessData.bmi}</span>
                      <span className="stat-status">{fitnessData.bmiClassification}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Daily Calories</span>
                      <span className="stat-value">{fitnessData.macros.calories}</span>
                      <span className="stat-status">kcal</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Goal</span>
                      <span className="stat-value">
                        {fitnessData.fitnessGoal === 'gainWeight' && 'Gain Weight'}
                        {fitnessData.fitnessGoal === 'loseWeight' && 'Lose Weight'}
                        {fitnessData.fitnessGoal === 'gainMuscle' && 'Gain Muscle'}
                        {fitnessData.fitnessGoal === 'manageStress' && 'Manage Stress'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="quick-actions-card card">
                  <h3>Quick Actions</h3>
                  <div className="action-buttons">
                    <Link to="/fitness-form" className="action-btn update">
                      Update Fitness Profile
                    </Link>
                    <Link to="/fitness-results" className="action-btn view">
                      View Detailed Results
                    </Link>
                  </div>
                </div>
                
                <div className="tips-card card">
                  <h3>Daily Fitness Tip</h3>
                  <div className="daily-tip">
                    <p>
                      {fitnessData.fitnessGoal === 'gainWeight' && 
                        "To gain weight effectively, focus on calorie-dense foods and strength training. Aim to gradually increase your calorie intake."}
                      {fitnessData.fitnessGoal === 'loseWeight' && 
                        "For weight loss, consistency is key. Combine a sustainable calorie deficit with regular exercise and enough sleep."}
                      {fitnessData.fitnessGoal === 'gainMuscle' && 
                        "Protein timing matters for muscle growth. Try to consume protein within 30 minutes after your workout."}
                      {fitnessData.fitnessGoal === 'manageStress' && 
                        "Regular deep breathing exercises can reduce stress hormone levels and promote relaxation."}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="reminders-card card">
                <h3>Today's Focus</h3>
                <ul className="focus-list">
                  {fitnessData.fitnessGoal === 'gainWeight' && (
                    <>
                      <li>Eat at least 3 main meals and 2-3 snacks</li>
                      <li>Focus on compound exercises if it's a training day</li>
                      <li>Ensure you're in a caloric surplus of approximately 500 calories</li>
                    </>
                  )}
                  {fitnessData.fitnessGoal === 'loseWeight' && (
                    <>
                      <li>Maintain a calorie deficit of approximately 500 calories</li>
                      <li>Include at least 30 minutes of cardiovascular exercise</li>
                      <li>Stay hydrated throughout the day</li>
                    </>
                  )}
                  {fitnessData.fitnessGoal === 'gainMuscle' && (
                    <>
                      <li>Consume adequate protein (target: {fitnessData.macros.protein}g)</li>
                      <li>Focus on progressive overload in your workouts</li>
                      <li>Ensure you're getting enough rest and recovery</li>
                    </>
                  )}
                  {fitnessData.fitnessGoal === 'manageStress' && (
                    <>
                      <li>Take time for meditation or deep breathing exercises</li>
                      <li>Prioritize 7-9 hours of quality sleep</li>
                      <li>Include physical activity that you enjoy</li>
                    </>
                  )}
                </ul>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard; 