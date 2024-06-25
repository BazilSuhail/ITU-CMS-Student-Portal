import React, { useState, useEffect } from 'react';
import { fs,auth } from '../Config/Config'; 

const ShowCompletedCourses = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [totalCreditHours, setTotalCreditHours] = useState(0);

  useEffect(() => {
    const fetchCompletedCourses = async () => {
      setLoading(true);
      setError(null);

      try {
        const user = auth.currentUser;
        if (user) {
          const studentId = user.uid;
          const studentDoc = await fs.collection('students').doc(studentId).get();
          if (studentDoc.exists) {
            const studentData = studentDoc.data();
            const courseIds = studentData.completedCourses || [];

            const courseDataPromises = courseIds.map(async (courseId) => {
              const courseDoc = await fs.collection('courses').doc(courseId).get();
              if (courseDoc.exists) {
                return courseDoc.data();
              }
              return null;
            });

            const courses = await Promise.all(courseDataPromises);
            setCompletedCourses(courses.filter(course => course !== null));
          } else {
            setError('Student data not found');
          }
        } else {
          setError('User not logged in');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedCourses();
  }, []);

  useEffect(() => {
    // Sum the credit hours whenever completedCourses changes
    const calculateTotalCreditHours = () => {
      const totalHours = completedCourses.reduce((acc, course) => acc + parseInt(course.creditHours, 10), 0);
      setTotalCreditHours(totalHours);
    };

    calculateTotalCreditHours();
  }, [completedCourses]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h2>Completed Courses</h2>
      {completedCourses.length > 0 ? (
        <div>
          <table>
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Credit Hours</th>
                <th>Expected Semester</th>
                <th>Code</th>
              </tr>
            </thead>
            <tbody>
              {completedCourses.map((course) => (
                <tr key={course.code}>
                  <td>{course.name}</td>
                  <td>{course.creditHours}</td>
                  <td>{course.expectedSemester}</td>
                  <td>{course.code}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>Total Credit Hours: {totalCreditHours}</p>
        </div>
      ) : (
        <p>No completed courses found.</p>
      )}
    </div>
  );
};

export default ShowCompletedCourses;
