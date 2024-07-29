import React, { forwardRef, useImperativeHandle, useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import countryList from 'react-select-country-list';

const InternationalStudentDocuments = forwardRef(({ formData, handleChange }, ref) => {
  const [errors, setErrors] = useState({});
  const [fileNames, setFileNames] = useState({
    passport: formData.passport ? formData.passport.name : '',
    additionalID: formData.additionalID ? formData.additionalID.name : '',
    residencyProof: formData.residencyProof ? formData.residencyProof.name : '',
  });
  const countryOptions = useMemo(() => countryList().getData(), []);

  useImperativeHandle(ref, () => ({
    validateForm: () => {
      const newErrors = {};
      if (!formData.passport) newErrors.passport = "Please upload your passport";
      if (!formData.additionalID) newErrors.additionalID = "Please upload an additional ID (Birth Certificate or National ID Card)";
      if (!formData.country) newErrors.country = "Please select your country";

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }
  }));

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (file) {
      handleChange({
        target: {
          name: name,
          value: file,
        }
      });
      setFileNames(prevFileNames => ({
        ...prevFileNames,
        [name]: file.name,
      }));
    }
  };

  const handleCountryChange = (selectedOption) => {
    handleChange({
      target: {
        name: 'country',
        value: selectedOption.label
      }
    });
  };

  return (
    <div className="form-section">
      <h2 className="section-title">Upload Documents</h2>

      <div className="form-group">
        <label htmlFor="passport">
          Upload Passport<span style={{ color: 'red' }}> *</span>
        </label>
        <input
          type="file"
          id="passport"
          name="passport"
          onChange={handleFileChange}
          className={`form-control ${errors.passport ? 'is-invalid' : ''}`}
          style={{ display: 'none' }}
        />
        <label htmlFor="passport" className="file-upload-button">Choose File</label>
        {fileNames.passport && <span>{fileNames.passport}</span>}
        {errors.passport && <div className="error-message">{errors.passport}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="additionalID">
          Upload Additional ID (Birth Certificate or National ID Card)<span style={{ color: 'red' }}> *</span>
        </label>
        <input
          type="file"
          id="additionalID"
          name="additionalID"
          onChange={handleFileChange}
          className={`form-control ${errors.additionalID ? 'is-invalid' : ''}`}
          style={{ display: 'none' }}
        />
        <label htmlFor="additionalID" className="file-upload-button">Choose File</label>
        {fileNames.additionalID && <span>{fileNames.additionalID}</span>}
        {errors.additionalID && <div className="error-message">{errors.additionalID}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="residencyProof">Upload Proof of Residency (Study Permit or Work Permit, if applicable)</label>
        <input
          type="file"
          id="residencyProof"
          name="residencyProof"
          onChange={handleFileChange}
          className={`form-control ${errors.residencyProof ? 'is-invalid' : ''}`}
          style={{ display: 'none' }}
        />
        <label htmlFor="residencyProof" className="file-upload-button">Choose File</label>
        {fileNames.residencyProof && <span>{fileNames.residencyProof}</span>}
        {errors.residencyProof && <div className="error-message">{errors.residencyProof}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="country">What country are you from?<span style={{ color: 'red' }}> *</span></label>
        <Select
          options={countryOptions}
          value={countryOptions.find(option => option.label === formData.country)}
          onChange={handleCountryChange}
          className={errors.country ? 'is-invalid' : ''}
        />
        {errors.country && <div className="error-message">{errors.country}</div>}
      </div>
    </div>
  );
});

export default InternationalStudentDocuments;
