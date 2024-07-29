import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import AlbertaSurvey from './AlbertaSurvey';
import InternationalSurvey from './InternationalSurvey';

const SurveyComponent = forwardRef(({ formData, handleChange }, ref) => {
  const isInternational = formData.studentType === 'International Student'; // Ensure correct string comparison
  const surveyRef = useRef();

  useImperativeHandle(ref, () => ({
    validateForm: () => {
      if (surveyRef.current && surveyRef.current.validateForm) {
        return surveyRef.current.validateForm();
      }
      // If no validation method is available, return true to allow form progression
      return true;
    }
  }));

  return (
    <section className="form-section">
      <h2 className="section-title">Quick Survey</h2>
      <p>Please help us understand our students better by answering these quick questions:</p>
      
      {isInternational ? (
        <InternationalSurvey ref={surveyRef} formData={formData} handleChange={handleChange} />
      ) : (
        <AlbertaSurvey ref={surveyRef} formData={formData} handleChange={handleChange} />
      )}
    </section>
  );
});

export default SurveyComponent;
