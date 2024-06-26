import React from 'react';
import { useLocation } from 'react-router-dom';

const Marks = () => {
  const location = useLocation();
  const { selectedCourseMarks, courseName } = location.state || {};

  const calculateTotalWeightedMarks = () => {
    if (!selectedCourseMarks) return 0;
    return selectedCourseMarks.criteriaDefined.reduce((total, criterion) => {
      const obtainedMarks = selectedCourseMarks.studentMarks[criterion.assessment] || 0;
      const weightage = parseFloat(criterion.weightage) || 0;
      return total + ((obtainedMarks / criterion.totalMarks) * weightage);
    }, 0).toFixed(2);
  };

  return (
    <div>
      {selectedCourseMarks ? (
        <div>
          <h3>Marks for {courseName}</h3>
          <div>
            <h4>Criteria</h4>
            <ul>
              {selectedCourseMarks.criteriaDefined.map((criterion, index) => (
                <li key={index}>
                  {criterion.assessment} - Weightage: {criterion.weightage}%, Total Marks: {criterion.totalMarks}
                </li>
              ))}
            </ul>
          </div>
          <table>
            <thead>
              <tr>
                <th>Criteria</th>
                <th>Obtained Marks</th>
                <th>Total Marks</th>
                <th>Weighted Marks</th>
              </tr>
            </thead>
            <tbody>
              {selectedCourseMarks.criteriaDefined.map((criterion, index) => (
                <tr key={index}>
                  <td>{criterion.assessment}</td>
                  <td>{selectedCourseMarks.studentMarks[criterion.assessment]}</td>
                  <td>{criterion.totalMarks}</td>
                  <td>
                    {(selectedCourseMarks.studentMarks[criterion.assessment] / criterion.totalMarks * criterion.weightage).toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="3"><strong>Total Weighted Marks</strong></td>
                <td><strong>{calculateTotalWeightedMarks()}</strong></td>
              </tr>
              <tr>
                <td colSpan="3"><strong>Grade</strong></td>
                <td><strong>{selectedCourseMarks.grade}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p>No records for {courseName} found.</p>
      )}
    </div>
  );
};

export default Marks;
