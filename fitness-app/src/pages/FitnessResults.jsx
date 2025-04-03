import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { database } from '../services/firebase';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
} from 'chart.js';
import './FitnessResults.css';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

const FitnessResults = ({ user }) => {
  const [fitnessData, setFitnessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fitnessDataRef = ref(database, `users/${user.uid}/fitnessData`);
    
    const unsubscribe = onValue(fitnessDataRef, (snapshot) => {
      setLoading(true);
      if (snapshot.exists()) {
        setFitnessData(snapshot.val());
        setError('');
      } else {
        setFitnessData(null);
        setError('No fitness data found. Please complete the fitness form.');
      }
      setLoading(false);
    }, (error) => {
      setError('Error loading fitness data.');
      setLoading(false);
      console.error('Database error:', error);
    });
    
    return () => unsubscribe();
  }, [user.uid]);

  const macroChartData = fitnessData ? {
    labels: ['Protein', 'Carbs', 'Fats'],
    datasets: [
      {
        label: 'Macronutrients (g)',
        data: [
          fitnessData.macros.protein,
          fitnessData.macros.carbs,
          fitnessData.macros.fats
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  const getBMIColorClass = (classification) => {
    switch (classification) {
      case 'Underweight':
        return 'bmi-underweight';
      case 'Balanced':
        return 'bmi-balanced';
      case 'Overweight':
        return 'bmi-overweight';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading your fitness data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <Link to="/fitness-form" className="btn">Complete Fitness Form</Link>
      </div>
    );
  }

  return (
    <div className="fitness-results-container">
      <div className="results-header">
        <h2>Your Fitness Results</h2>
        <Link to="/fitness-form" className="update-btn">Update Information</Link>
      </div>
      
      <div className="results-grid">
        <div className="card user-info-card">
          <h3>Personal Information</h3>
          <div className="info-row">
            <span className="info-label">Name:</span>
            <span className="info-value">{fitnessData.name}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Age:</span>
            <span className="info-value">{fitnessData.age} years</span>
          </div>
          <div className="info-row">
            <span className="info-label">Gender:</span>
            <span className="info-value">{fitnessData.gender}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Weight:</span>
            <span className="info-value">
              {fitnessData.weight} {fitnessData.weightUnit}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Height:</span>
            <span className="info-value">
              {fitnessData.height} {fitnessData.heightUnit}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Activity Level:</span>
            <span className="info-value">
              {fitnessData.activityLevel === 'notVeryActive' && 'Not Very Active'}
              {fitnessData.activityLevel === 'lightlyActive' && 'Lightly Active'}
              {fitnessData.activityLevel === 'active' && 'Active'}
              {fitnessData.activityLevel === 'veryActive' && 'Very Active'}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Goal:</span>
            <span className="info-value">
              {fitnessData.fitnessGoal === 'gainWeight' && 'Gain Weight'}
              {fitnessData.fitnessGoal === 'loseWeight' && 'Lose Weight'}
              {fitnessData.fitnessGoal === 'gainMuscle' && 'Gain Muscle'}
              {fitnessData.fitnessGoal === 'manageStress' && 'Manage Stress'}
            </span>
          </div>
          {fitnessData.goalWeight && (
            <div className="info-row">
              <span className="info-label">Goal Weight:</span>
              <span className="info-value">
                {fitnessData.goalWeight} {fitnessData.weightUnit}
              </span>
            </div>
          )}
        </div>
        
        <div className="card bmi-card">
          <h3>BMI Analysis</h3>
          <div className={`bmi-value ${getBMIColorClass(fitnessData.bmiClassification)}`}>
            {fitnessData.bmi}
          </div>
          <div className="bmi-classification">
            Classification: <span className={getBMIColorClass(fitnessData.bmiClassification)}>
              {fitnessData.bmiClassification}
            </span>
          </div>
          <div className="bmi-scale">
            <div className="bmi-range underweight">
              <div className="range-label">Underweight</div>
              <div className="range-value">&lt;18.5</div>
            </div>
            <div className="bmi-range balanced">
              <div className="range-label">Balanced</div>
              <div className="range-value">18.5-24.9</div>
            </div>
            <div className="bmi-range overweight">
              <div className="range-label">Overweight</div>
              <div className="range-value">&gt;25</div>
            </div>
          </div>
        </div>
        
        <div className="card macro-card">
          <h3>Daily Macronutrients</h3>
          <div className="macro-chart">
            {macroChartData && <Pie data={macroChartData} />}
          </div>
          <div className="macro-details">
            <div className="macro-row">
              <span className="macro-label protein">Protein:</span>
              <span className="macro-value">{fitnessData.macros.protein}g</span>
            </div>
            <div className="macro-row">
              <span className="macro-label carbs">Carbs:</span>
              <span className="macro-value">{fitnessData.macros.carbs}g</span>
            </div>
            <div className="macro-row">
              <span className="macro-label fats">Fats:</span>
              <span className="macro-value">{fitnessData.macros.fats}g</span>
            </div>
            <div className="macro-row total">
              <span className="macro-label">Total Calories:</span>
              <span className="macro-value">{fitnessData.macros.calories} kcal</span>
            </div>
          </div>
        </div>
        
        <div className="card recommendations-card">
          <h3>Diet Recommendations</h3>
          <ul className="recommendations-list">
            {fitnessData.recommendations.diet.map((recommendation, index) => (
              <li key={`diet-${index}`}>{recommendation}</li>
            ))}
          </ul>
        </div>
        
        <div className="card recommendations-card">
          <h3>Exercise Recommendations</h3>
          <ul className="recommendations-list">
            {fitnessData.recommendations.exercise.map((recommendation, index) => (
              <li key={`exercise-${index}`}>{recommendation}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FitnessResults; 