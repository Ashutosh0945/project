import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, set } from 'firebase/database';
import { database } from '../services/firebase';
import './FitnessForm.css';

const FitnessForm = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    age: '',
    weight: '',
    weightUnit: 'kg',
    height: '',
    heightUnit: 'cm',
    fitnessGoal: '',
    goalReason: '',
    activityLevel: '',
    goalWeight: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateBMI = () => {
    let weight = parseFloat(formData.weight);
    let height = parseFloat(formData.height);
    
    // Convert to kg if in lbs
    if (formData.weightUnit === 'lbs') {
      weight = weight * 0.453592;
    }
    
    // Convert to meters if in cm or feet
    if (formData.heightUnit === 'cm') {
      height = height / 100;
    } else if (formData.heightUnit === 'feet') {
      height = height * 0.3048;
    }
    
    const bmi = weight / (height * height);
    return bmi.toFixed(2);
  };

  const getBMIClassification = (bmi) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi >= 18.5 && bmi <= 24.9) return 'Balanced';
    return 'Overweight';
  };

  const calculateMacros = (bmi, weight, fitnessGoal, activityLevel) => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fats = 0;
    
    // Base metabolic rate calculation (simplified)
    const bmr = weight * 22;
    
    // Activity multiplier
    let activityMultiplier = 1.2; // Not very active
    if (activityLevel === 'lightlyActive') activityMultiplier = 1.375;
    if (activityLevel === 'active') activityMultiplier = 1.55;
    if (activityLevel === 'veryActive') activityMultiplier = 1.725;
    
    // Calculate calories based on goal
    if (fitnessGoal === 'gainWeight') {
      calories = bmr * activityMultiplier + 500;
      protein = weight * 1.6; // grams
      fats = weight * 0.8; // grams
      carbs = (calories - (protein * 4 + fats * 9)) / 4; // grams
    } else if (fitnessGoal === 'loseWeight') {
      calories = bmr * activityMultiplier - 500;
      protein = weight * 2; // grams
      fats = weight * 0.5; // grams
      carbs = (calories - (protein * 4 + fats * 9)) / 4; // grams
    } else if (fitnessGoal === 'gainMuscle') {
      calories = bmr * activityMultiplier + 200;
      protein = weight * 2.2; // grams
      fats = weight * 0.6; // grams
      carbs = (calories - (protein * 4 + fats * 9)) / 4; // grams
    } else { // Manage stress
      calories = bmr * activityMultiplier;
      protein = weight * 1.4; // grams
      fats = weight * 0.7; // grams
      carbs = (calories - (protein * 4 + fats * 9)) / 4; // grams
    }
    
    return {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fats: Math.round(fats)
    };
  };

  const getRecommendations = (fitnessGoal) => {
    let dietRecommendations = [];
    let exerciseRecommendations = [];
    
    switch (fitnessGoal) {
      case 'gainWeight':
        dietRecommendations = [
          'Increase caloric intake by 500 calories above maintenance',
          'Eat protein-rich foods like meat, eggs, and dairy',
          'Include calorie-dense foods like nuts, avocados, and olive oil',
          'Consume 3 main meals and 2-3 snacks daily',
          'Consider protein shakes to supplement your diet'
        ];
        exerciseRecommendations = [
          'Focus on weight training 3-4 times per week',
          'Prioritize compound exercises (squats, deadlifts, bench press)',
          'Limit cardio to 1-2 short sessions per week',
          'Rest adequately between workouts (1-2 days)',
          'Gradually increase weights over time'
        ];
        break;
        
      case 'loseWeight':
        dietRecommendations = [
          'Create a caloric deficit of 500 calories below maintenance',
          'Increase protein intake to preserve muscle mass',
          'Eat plenty of fiber-rich vegetables to stay full',
          'Drink water before meals to reduce hunger',
          'Limit processed foods and sugary drinks'
        ];
        exerciseRecommendations = [
          'Incorporate cardio 4-5 times per week (running, cycling, swimming)',
          'Add 2-3 strength training sessions weekly',
          'Consider HIIT (High-Intensity Interval Training) for efficiency',
          'Stay active throughout the day with walking',
          'Aim for 150-300 minutes of exercise per week'
        ];
        break;
        
      case 'gainMuscle':
        dietRecommendations = [
          'Consume a moderate caloric surplus (200-300 calories)',
          'Eat 1.6-2.2g of protein per kg of bodyweight',
          'Time protein intake around workouts',
          'Include carbs before and after training',
          'Stay well-hydrated throughout the day'
        ];
        exerciseRecommendations = [
          'Follow a progressive strength training program',
          'Train each muscle group 2-3 times per week',
          'Focus on compound exercises with proper form',
          'Incorporate both strength (heavy weight, low reps) and hypertrophy (moderate weight, higher reps) training',
          'Ensure adequate recovery between sessions'
        ];
        break;
        
      case 'manageStress':
        dietRecommendations = [
          'Focus on balanced, whole-food-based meals',
          'Include omega-3 rich foods like fatty fish',
          'Consume magnesium-rich foods like leafy greens and nuts',
          'Limit caffeine and alcohol',
          'Stay hydrated with water and herbal teas'
        ];
        exerciseRecommendations = [
          'Practice yoga or tai chi 3-4 times per week',
          'Include daily meditation or deep breathing exercises',
          'Take regular walks in nature',
          'Try low-intensity activities like swimming',
          'Balance activity with proper sleep (7-9 hours)'
        ];
        break;
        
      default:
        dietRecommendations = ['Maintain a balanced diet with whole foods'];
        exerciseRecommendations = ['Regular physical activity for 30 minutes daily'];
    }
    
    return {
      diet: dietRecommendations,
      exercise: exerciseRecommendations
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Calculate BMI
      const bmi = calculateBMI();
      const bmiClassification = getBMIClassification(bmi);
      
      // Calculate macros
      const weightInKg = formData.weightUnit === 'kg' 
        ? parseFloat(formData.weight) 
        : parseFloat(formData.weight) * 0.453592;
        
      const macros = calculateMacros(
        bmi, 
        weightInKg, 
        formData.fitnessGoal, 
        formData.activityLevel
      );
      
      // Get recommendations
      const recommendations = getRecommendations(formData.fitnessGoal);
      
      // Prepare data for Firebase
      const fitnessData = {
        ...formData,
        bmi,
        bmiClassification,
        macros,
        recommendations,
        updatedAt: new Date().toISOString()
      };
      
      // Save to Firebase
      await set(ref(database, `users/${user.uid}/fitnessData`), fitnessData);
      
      setSuccess('Your fitness data has been saved successfully!');
      setTimeout(() => {
        navigate('/fitness-results');
      }, 1500);
      
    } catch (error) {
      setError('Error saving data. Please try again.');
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fitness-form-container">
      <div className="fitness-form-card">
        <h2>Your Fitness Profile</h2>
        <p className="form-subtitle">Complete the form below to get personalized fitness recommendations</p>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="age">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="1"
                max="120"
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group weight-group">
                <label htmlFor="weight">Weight</label>
                <div className="input-unit-group">
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    min="1"
                    step="0.1"
                    required
                  />
                  <select
                    name="weightUnit"
                    value={formData.weightUnit}
                    onChange={handleChange}
                  >
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group height-group">
                <label htmlFor="height">Height</label>
                <div className="input-unit-group">
                  <input
                    type="number"
                    id="height"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    min="1"
                    step="0.1"
                    required
                  />
                  <select
                    name="heightUnit"
                    value={formData.heightUnit}
                    onChange={handleChange}
                  >
                    <option value="cm">cm</option>
                    <option value="feet">feet</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Fitness Goals</h3>
            
            <div className="form-group">
              <label htmlFor="fitnessGoal">What is your primary fitness goal?</label>
              <select
                id="fitnessGoal"
                name="fitnessGoal"
                value={formData.fitnessGoal}
                onChange={handleChange}
                required
              >
                <option value="">Select Goal</option>
                <option value="gainWeight">Gain Weight</option>
                <option value="loseWeight">Lose Weight</option>
                <option value="gainMuscle">Gain Muscle</option>
                <option value="manageStress">Manage Stress</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="goalReason">Why is this goal important to you?</label>
              <textarea
                id="goalReason"
                name="goalReason"
                value={formData.goalReason}
                onChange={handleChange}
                rows="3"
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="activityLevel">Your current activity level</label>
              <select
                id="activityLevel"
                name="activityLevel"
                value={formData.activityLevel}
                onChange={handleChange}
                required
              >
                <option value="">Select Activity Level</option>
                <option value="notVeryActive">Not Very Active</option>
                <option value="lightlyActive">Lightly Active</option>
                <option value="active">Active</option>
                <option value="veryActive">Very Active</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="goalWeight">Goal Weight (optional)</label>
              <input
                type="number"
                id="goalWeight"
                name="goalWeight"
                value={formData.goalWeight}
                onChange={handleChange}
                min="1"
                step="0.1"
              />
              <span className="form-helper-text">In {formData.weightUnit}</span>
            </div>
          </div>
          
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Calculating...' : 'Get Your Fitness Plan'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FitnessForm; 