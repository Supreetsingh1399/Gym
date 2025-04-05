// constants/exerciseData.ts
// Hardcoded exercise data for popular workouts

import { GYM_IMAGES, WORKOUT_IMAGES } from './assetUrls';

// Types for exercise data
export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscle: string;
  equipment: string;
  difficulty: string;
  instructions: string[];
  imageUrl: string;
}

export interface WorkoutData {
  id: string;
  title: string;
  duration: string;
  level: string;
  imageUrl: string;
  trainer: string;
  description: string;
  category: string;
  calories: string;
  exercises: Exercise[];
}

// Sample exercise images - replace with your actual image URLs
export const EXERCISE_IMAGES = [
  'https://images.unsplash.com/photo-1574680096145-d05b474e2155?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
  'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
  'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
  'https://images.unsplash.com/photo-1594381898411-846e7d193883?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
  'https://images.unsplash.com/photo-1598971639058-aee79e11be1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
  'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
  'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
];

// Database of exercises
export const EXERCISES: Exercise[] = [
  {
    id: 'ex1',
    name: 'Push-ups',
    description: 'Classic bodyweight exercise for chest and triceps',
    muscle: 'Chest',
    equipment: 'None',
    difficulty: 'Beginner',
    instructions: [
      'Get down on all fours, placing your hands slightly wider than your shoulders.',
      'Straighten your arms and legs.',
      'Lower your body until your chest nearly touches the floor.',
      'Pause, then push yourself back up.',
      'Repeat for the recommended number of repetitions.'
    ],
    imageUrl: EXERCISE_IMAGES[0]
  },
  {
    id: 'ex2',
    name: 'Squats',
    description: 'Compound exercise for lower body strength',
    muscle: 'Quadriceps',
    equipment: 'None',
    difficulty: 'Beginner',
    instructions: [
      'Stand with feet a little wider than shoulder-width apart.',
      'Keep your chest up and back straight.',
      'Bend your knees and lower your body as if sitting in a chair.',
      'Keep your weight in your heels.',
      'Go as low as you can, ideally until thighs are parallel to the floor.',
      'Push back up to starting position.',
      'Repeat for recommended repetitions.'
    ],
    imageUrl: EXERCISE_IMAGES[1]
  },
  {
    id: 'ex3',
    name: 'Lunges',
    description: 'Unilateral exercise for leg strength and balance',
    muscle: 'Quadriceps',
    equipment: 'None',
    difficulty: 'Beginner',
    instructions: [
      'Stand tall with feet hip-width apart.',
      'Take a big step forward with your right leg.',
      'Lower your body until your right thigh is parallel to the floor and your right shin is vertical.',
      'Press into your right heel to drive back up to the starting position.',
      'Repeat on the other side.',
      'Continue alternating legs for recommended repetitions.'
    ],
    imageUrl: EXERCISE_IMAGES[2]
  },
  {
    id: 'ex4',
    name: 'Plank',
    description: 'Core stabilization exercise',
    muscle: 'Core',
    equipment: 'None',
    difficulty: 'Beginner',
    instructions: [
      'Start in a push-up position but with your weight on your forearms.',
      'Keep your body in a straight line from head to heels.',
      'Engage your core by sucking your belly button toward your spine.',
      'Hold this position without allowing your hips to rise or drop.',
      'Hold for the recommended amount of time.'
    ],
    imageUrl: EXERCISE_IMAGES[3]
  },
  {
    id: 'ex5',
    name: 'Dumbbell Rows',
    description: 'Upper back exercise with dumbbells',
    muscle: 'Back',
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    instructions: [
      'Stand with feet shoulder-width apart, holding a dumbbell in each hand.',
      'Bend forward at the hips, keeping your back straight.',
      'Let your arms hang straight down, palms facing each other.',
      'Pull the dumbbells up to your sides, keeping your elbows close to your body.',
      'Squeeze your shoulder blades together at the top.',
      'Lower the dumbbells back to the starting position.',
      'Repeat for recommended repetitions.'
    ],
    imageUrl: EXERCISE_IMAGES[4]
  },
  {
    id: 'ex6',
    name: 'Burpees',
    description: 'Full body exercise for cardio and strength',
    muscle: 'Full Body',
    equipment: 'None',
    difficulty: 'Advanced',
    instructions: [
      'Start standing with your feet shoulder-width apart.',
      'Drop into a squat position and place your hands on the floor.',
      'Kick your feet back into a plank position.',
      'Immediately return your feet to the squat position.',
      'Jump up from the squat position.',
      'Repeat for recommended repetitions.'
    ],
    imageUrl: EXERCISE_IMAGES[5]
  },
  {
    id: 'ex7',
    name: 'Bicycle Crunches',
    description: 'Dynamic core exercise targeting obliques',
    muscle: 'Abs',
    equipment: 'None',
    difficulty: 'Intermediate',
    instructions: [
      'Lie on your back with your hands behind your head.',
      'Lift your shoulders off the ground and bring your knees to your chest.',
      'Straighten your left leg while turning your upper body to the right.',
      'Bring your left elbow toward your right knee.',
      'Switch sides, bringing your right elbow to your left knee while extending your right leg.',
      'Continue alternating sides in a pedaling motion.',
      'Repeat for recommended repetitions.'
    ],
    imageUrl: EXERCISE_IMAGES[6]
  },
  {
    id: 'ex8',
    name: 'Mountain Climbers',
    description: 'Dynamic core exercise with cardio benefits',
    muscle: 'Core',
    equipment: 'None',
    difficulty: 'Intermediate',
    instructions: [
      'Start in a plank position with arms straight.',
      'Bring your right knee toward your chest.',
      'Quickly switch, extending the right leg back while bringing the left knee in.',
      'Continue alternating legs at a rapid pace.',
      'Keep your hips down and core engaged throughout.',
      'Repeat for recommended repetitions or time.'
    ],
    imageUrl: EXERCISE_IMAGES[7]
  },
  {
    id: 'ex9',
    name: 'Deadlifts',
    description: 'Compound movement for posterior chain',
    muscle: 'Lower Back',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    instructions: [
      'Stand with feet hip-width apart, barbell over your mid-foot.',
      'Bend at the hips and knees, keeping your back straight.',
      'Grip the bar with hands shoulder-width apart.',
      'Lift the bar by straightening your hips and knees.',
      'Stand up straight with the bar against your thighs.',
      'Return the bar to the floor by hinging at your hips and bending your knees.',
      'Repeat for recommended repetitions.'
    ],
    imageUrl: EXERCISE_IMAGES[0]
  },
  {
    id: 'ex10',
    name: 'Bench Press',
    description: 'Classic chest strength exercise',
    muscle: 'Chest',
    equipment: 'Barbell, Bench',
    difficulty: 'Intermediate',
    instructions: [
      'Lie on a flat bench with your feet on the ground.',
      'Grip the barbell slightly wider than shoulder-width apart.',
      'Unrack the bar and hold it over your chest with arms extended.',
      'Lower the bar to your mid-chest.',
      'Press the bar back up to the starting position.',
      'Repeat for recommended repetitions.'
    ],
    imageUrl: EXERCISE_IMAGES[1]
  },
  {
    id: 'ex11',
    name: 'Pull-ups',
    description: 'Upper body pulling exercise',
    muscle: 'Back',
    equipment: 'Pull-up Bar',
    difficulty: 'Advanced',
    instructions: [
      'Grip a pull-up bar with palms facing away from you, hands shoulder-width apart.',
      'Hang with arms fully extended.',
      'Pull yourself up until your chin clears the bar.',
      'Lower yourself back to the starting position with control.',
      'Repeat for recommended repetitions.'
    ],
    imageUrl: EXERCISE_IMAGES[2]
  },
  {
    id: 'ex12',
    name: 'Russian Twists',
    description: 'Rotational core exercise',
    muscle: 'Obliques',
    equipment: 'Medicine Ball (optional)',
    difficulty: 'Intermediate',
    instructions: [
      'Sit on the floor with knees bent and feet lifted slightly off the ground.',
      'Lean back slightly, maintaining a straight back.',
      'Clasp your hands together or hold a medicine ball.',
      'Twist your torso to the right, then to the left.',
      'Continue alternating sides.',
      'Repeat for recommended repetitions.'
    ],
    imageUrl: EXERCISE_IMAGES[3]
  },
  {
    id: 'ex13',
    name: 'Shoulder Press',
    description: 'Vertical pressing movement for shoulders',
    muscle: 'Shoulders',
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    instructions: [
      'Sit or stand with a dumbbell in each hand at shoulder height.',
      'Palms should be facing forward.',
      'Press the weights upward until your arms are fully extended overhead.',
      'Slowly lower the weights back to shoulder level.',
      'Repeat for recommended repetitions.'
    ],
    imageUrl: EXERCISE_IMAGES[4]
  },
  {
    id: 'ex14',
    name: 'Jumping Jacks',
    description: 'Full body cardio exercise',
    muscle: 'Full Body',
    equipment: 'None',
    difficulty: 'Beginner',
    instructions: [
      'Stand with your feet together and arms at your sides.',
      'Jump up, spreading your feet beyond shoulder width and bringing your arms above your head.',
      'Jump again, returning to the starting position.',
      'Repeat at a quick pace for recommended time or repetitions.'
    ],
    imageUrl: EXERCISE_IMAGES[5]
  },
  {
    id: 'ex15',
    name: 'Tricep Dips',
    description: 'Isolation exercise for triceps',
    muscle: 'Triceps',
    equipment: 'Bench or Chair',
    difficulty: 'Beginner',
    instructions: [
      'Sit on the edge of a bench or chair with hands gripping the edge.',
      'Slide your butt off the bench with legs extended or slightly bent.',
      'Lower your body by bending your elbows until they reach about 90 degrees.',
      'Push back up to the starting position by straightening your arms.',
      'Repeat for recommended repetitions.'
    ],
    imageUrl: EXERCISE_IMAGES[6]
  },
];

// Popular workouts with exercise data
export const POPULAR_WORKOUTS: WorkoutData[] = [
  {
    id: 'workout1',
    title: 'Full Body Strength',
    duration: '45 min',
    level: 'Intermediate',
    imageUrl: WORKOUT_IMAGES[0],
    trainer: 'Alex Johnson',
    description: 'Complete full body workout focusing on compound movements for strength development',
    category: 'Strength',
    calories: '350-450',
    exercises: [
      EXERCISES[0], // Push-ups
      EXERCISES[1], // Squats
      EXERCISES[4], // Dumbbell Rows
      EXERCISES[8], // Deadlifts
      EXERCISES[12], // Shoulder Press
    ]
  },
  {
    id: 'workout2',
    title: 'HIIT Cardio Blast',
    duration: '30 min',
    level: 'Advanced',
    imageUrl: WORKOUT_IMAGES[1],
    trainer: 'Sarah Chen',
    description: 'High-intensity interval training to maximize calorie burn and improve cardiovascular fitness',
    category: 'Cardio',
    calories: '400-500',
    exercises: [
      EXERCISES[5], // Burpees
      EXERCISES[7], // Mountain Climbers
      EXERCISES[13], // Jumping Jacks
      EXERCISES[2], // Lunges
      EXERCISES[5], // Burpees (repeat)
    ]
  },
  {
    id: 'workout3',
    title: 'Core & Abs Builder',
    duration: '20 min',
    level: 'Beginner',
    imageUrl: WORKOUT_IMAGES[2],
    trainer: 'Mike Torres',
    description: 'Focus on core strength with effective ab exercises for a stronger midsection',
    category: 'Core',
    calories: '200-300',
    exercises: [
      EXERCISES[3], // Plank
      EXERCISES[6], // Bicycle Crunches
      EXERCISES[11], // Russian Twists
      EXERCISES[7], // Mountain Climbers
      EXERCISES[3], // Plank (repeat)
    ]
  },
  {
    id: 'workout4',
    title: 'Upper Body Focus',
    duration: '35 min',
    level: 'Intermediate',
    imageUrl: WORKOUT_IMAGES[3],
    trainer: 'David Kim',
    description: 'Build strength in arms, chest, back and shoulders with this targeted upper body workout',
    category: 'Strength',
    calories: '300-400',
    exercises: [
      EXERCISES[0], // Push-ups
      EXERCISES[4], // Dumbbell Rows
      EXERCISES[9], // Bench Press
      EXERCISES[10], // Pull-ups
      EXERCISES[14], // Tricep Dips
    ]
  },
  {
    id: 'workout5',
    title: 'Bodyweight Basics',
    duration: '25 min',
    level: 'Beginner',
    imageUrl: WORKOUT_IMAGES[0],
    trainer: 'Lisa Wong',
    description: 'Perfect for beginners or those without equipment, using just your bodyweight for a total body workout',
    category: 'Strength',
    calories: '250-350',
    exercises: [
      EXERCISES[0], // Push-ups
      EXERCISES[1], // Squats
      EXERCISES[2], // Lunges
      EXERCISES[3], // Plank
      EXERCISES[13], // Jumping Jacks
    ]
  },
  {
    id: 'workout6',
    title: 'Lower Body Power',
    duration: '40 min',
    level: 'Advanced',
    imageUrl: WORKOUT_IMAGES[1],
    trainer: 'Marcus Johnson',
    description: 'Build strength and power in your legs with this intense lower body workout',
    category: 'Strength',
    calories: '350-450',
    exercises: [
      EXERCISES[1], // Squats
      EXERCISES[2], // Lunges
      EXERCISES[8], // Deadlifts
      EXERCISES[5], // Burpees
      EXERCISES[7], // Mountain Climbers
    ]
  },
];

// Function to get mock workouts from our dataset
export const getMockWorkouts = (count = 4): WorkoutData[] => {
  // Return a slice of our popular workouts, or shuffle and return random ones
  return POPULAR_WORKOUTS.slice(0, count);
};

// Function to get workout by ID
export const getWorkoutById = (id: string): WorkoutData | undefined => {
  return POPULAR_WORKOUTS.find(workout => workout.id === id);
};

// Function to get related workouts
export const getRelatedWorkouts = (currentWorkoutId: string, count = 3): WorkoutData[] => {
  return POPULAR_WORKOUTS
    .filter(workout => workout.id !== currentWorkoutId)
    .sort(() => 0.5 - Math.random())
    .slice(0, count);
};

// Function to get workouts by level
export const getWorkoutsByLevel = (level: string): WorkoutData[] => {
  return POPULAR_WORKOUTS.filter(workout => 
    workout.level.toLowerCase() === level.toLowerCase()
  );
};

// Function to get workouts by category
export const getWorkoutsByCategory = (category: string): WorkoutData[] => {
  return POPULAR_WORKOUTS.filter(workout => 
    workout.category.toLowerCase() === category.toLowerCase()
  );
};