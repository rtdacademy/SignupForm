// Content imports
import Lesson01keyboardingbasics from './01_keyboarding_basics';
import Lesson02keyboardingpractice from './02_keyboarding_practice';
import Lesson03keyboardingfinalassessment from './03_keyboarding_final_assessment';

// Content registry using itemId as keys - matching database exactly
const contentRegistry = {
  '01_keyboarding_basics': Lesson01keyboardingbasics,
  '02_keyboarding_practice': Lesson02keyboardingpractice,
  '03_keyboarding_final_assessment': Lesson03keyboardingfinalassessment,
};

export default contentRegistry;
