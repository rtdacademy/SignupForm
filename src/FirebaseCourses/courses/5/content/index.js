// Content imports
import Lesson01datascienceintroductionoverview from './01_data_science_introduction_overview';
import Lesson02datasciencepythonbasics from './02_data_science_python_basics';
import Lesson03datasciencestatisticsreview from './03_data_science_statistics_review';
import Lesson04datascienceunit1assignment from './04_data_science_unit1_assignment';
import Lesson05datasciencepandasintroduction from './05_data_science_pandas_introduction';
import Lesson06datasciencedatacleaning from './06_data_science_data_cleaning';
import Lesson07datasciencevisualizationbasics from './07_data_science_visualization_basics';
import Lesson08datasciencepandaslab from './08_data_science_pandas_lab';
import Lesson09datascienceunit2quiz from './09_data_science_unit2_quiz';
import Lesson10datasciencemlfundamentals from './10_data_science_ml_fundamentals';
import Lesson11datasciencefinalexam from './11_data_science_final_exam';

// Content registry using itemId as keys - matching database exactly
const contentRegistry = {
  '01_data_science_introduction_overview': Lesson01datascienceintroductionoverview,
  '02_data_science_python_basics': Lesson02datasciencepythonbasics,
  '03_data_science_statistics_review': Lesson03datasciencestatisticsreview,
  '04_data_science_unit1_assignment': Lesson04datascienceunit1assignment,
  '05_data_science_pandas_introduction': Lesson05datasciencepandasintroduction,
  '06_data_science_data_cleaning': Lesson06datasciencedatacleaning,
  '07_data_science_visualization_basics': Lesson07datasciencevisualizationbasics,
  '08_data_science_pandas_lab': Lesson08datasciencepandaslab,
  '09_data_science_unit2_quiz': Lesson09datascienceunit2quiz,
  '10_data_science_ml_fundamentals': Lesson10datasciencemlfundamentals,
  '11_data_science_final_exam': Lesson11datasciencefinalexam,
};

export default contentRegistry;
