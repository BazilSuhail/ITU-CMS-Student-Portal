import React, { useState, useEffect } from 'react';
import { auth, fs } from '../Config/Config';

const ViewMarks = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCourses, setCurrentCourses] = useState([]);
  const [selectedCourseMarks, setSelectedCourseMarks] = useState(null);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      setLoading(true);
      setError(null);

      try {
        const currentUser = auth.currentUser;

        if (currentUser) {
          const studentDoc = await fs.collection('students').doc(currentUser.uid).get();
          if (studentDoc.exists) {
            const studentData = studentDoc.data();
            const enrolledCoursesIds = studentData.currentCourses || [];

            const assignCoursesData = await Promise.all(enrolledCoursesIds.map(async courseId => {
              const assignCourseDoc = await fs.collection('assignCourses').doc(courseId).get();
              if (assignCourseDoc.exists) {
                const assignCourseData = assignCourseDoc.data();
                const { courseId: actualCourseId, instructorId, classId } = assignCourseData;

                const courseDoc = await fs.collection('courses').doc(actualCourseId).get();
                const instructorDoc = await fs.collection('instructors').doc(instructorId).get();
                const classDoc = await fs.collection('classes').doc(classId).get();
                const courseData = courseDoc.exists ? courseDoc.data() : {};
                const instructorData = instructorDoc.exists ? instructorDoc.data() : {};
                const classData = classDoc.exists ? classDoc.data() : {};

                return {
                  assignCourseId: courseId,
                  courseId: actualCourseId,
                  courseName: courseData.name || 'Unknown Course',
                  creditHours: courseData.creditHours || 'Unknown',
                  instructorName: instructorData.name || 'Unknown Instructor',
                  className: classData.name || 'Unknown Class',
                };
              } else {
                return {
                  assignCourseId: courseId,
                  courseId: courseId,
                  courseName: 'Unknown Course',
                  creditHours: 'Unknown',
                  instructorName: 'Unknown Instructor',
                  className: 'Unknown Class',
                };
              }
            }));

            setCurrentCourses(assignCoursesData);
          } else {
            setError('Student data not found');
          }
        } else {
          setError('No authenticated user found');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  const handleViewMarks = async (assignCourseId) => {
    try {
      const marksDoc = await fs.collection('studentsMarks').doc(assignCourseId).get();
      if (marksDoc.exists) {
        const marksData = marksDoc.data();

        const studentMarks = marksData.marksOfStudents.find(student => student.studentId === auth.currentUser.uid);

        if (studentMarks) {
          setSelectedCourseMarks({
            criteriaDefined: marksData.criteriaDefined || [],
            studentMarks: studentMarks.marks || {},
            grade: studentMarks.grade || 'I',
          });
        } else {
          setSelectedCourseMarks(null);
          setError('Marks not found for the logged-in student');
        }
      } else {
        setSelectedCourseMarks(null);
        setError('Marks document not found');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const calculateTotalWeightedMarks = () => {
    if (!selectedCourseMarks) return 0;
    return selectedCourseMarks.criteriaDefined.reduce((total, criterion) => {
      const obtainedMarks = selectedCourseMarks.studentMarks[criterion.assessment] || 0;
      const weightage = parseFloat(criterion.weightage) || 0;
      return total + ((obtainedMarks / criterion.totalMarks) * weightage);
    }, 0).toFixed(2);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h2>Student Portal</h2>
      {currentCourses.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Course ID</th>
              <th>Course Name</th>
              <th>Credit Hours</th>
              <th>Instructor Name</th>
              <th>Class Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentCourses.map((course) => (
              <tr key={course.assignCourseId}>
                <td>{course.courseId}</td>
                <td>{course.courseName}</td>
                <td>{course.creditHours}</td>
                <td>{course.instructorName}</td>
                <td>{course.className}</td>
                <td>
                  <button onClick={() => handleViewMarks(course.assignCourseId)}>View Marks</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No enrolled courses found.</p>
      )}

      {selectedCourseMarks && (
        <div>
          <h3>Marks for Selected Course</h3>
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
      )}
    </div>
  );
};

export default ViewMarks;
