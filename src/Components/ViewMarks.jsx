import React, { useState, useEffect } from 'react';
import { auth, fs } from '../Config/Config';

const ViewMarks = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourseMarks, setSelectedCourseMarks] = useState(null);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get the currently authenticated user
        const currentUser = auth.currentUser;

        if (currentUser) {
          // Fetch the user data from Firestore to get enrolled courses
          const studentDoc = await fs.collection('students').doc(currentUser.uid).get();
          if (studentDoc.exists) {
            const studentData = studentDoc.data();
            const enrolledCoursesIds = studentData.enrolledCourses || [];
            console.log('Enrolled Courses IDs:', enrolledCoursesIds);

            // Fetch details of each enrolled course from assignCourses
            const assignCoursesData = await Promise.all(enrolledCoursesIds.map(async courseId => {
              const assignCourseDoc = await fs.collection('assignCourses').doc(courseId).get();
              if (assignCourseDoc.exists) {
                const assignCourseData = assignCourseDoc.data();
                const actualCourseId = assignCourseData.courseId;

                // Fetch course name using the actualCourseId from the courses collection
                const courseDoc = await fs.collection('courses').doc(actualCourseId).get();
                if (courseDoc.exists) {
                  const courseData = courseDoc.data();
                  console.log(`Course Data for ${actualCourseId}:`, courseData);
                  return {
                    courseId: actualCourseId,
                    courseName: courseData.name || 'Unknown Course',
                  };
                } else {
                  console.error(`Course document for ID ${actualCourseId} does not exist.`);
                  return {
                    courseId: actualCourseId,
                    courseName: 'Unknown Course',
                  };
                }
              } else {
                console.error(`AssignCourse document for ID ${courseId} does not exist.`);
                return {
                  courseId: courseId,
                  courseName: 'Unknown Course',
                };
              }
            }));

            setEnrolledCourses(assignCoursesData);
          } else {
            setError('Student data not found');
          }
        } else {
          setError('No authenticated user found');
        }
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  const handleViewMarks = async (courseId) => {
    try {
      // Fetch marks for the selected course and logged-in student
      const marksDoc = await fs.collection('studentsMarks').doc(courseId).get();
      if (marksDoc.exists) {
        const marksData = marksDoc.data();
        console.log('Marks Data:', marksData);

        // Find marks for the logged-in student
        const studentMarks = marksData.marksOfStudents.find(student => student.studentId === auth.currentUser.uid);

        if (studentMarks) {
          setSelectedCourseMarks({
            criteriaDefined: marksData.criteriaDefined || [],
            studentMarks: studentMarks.marks || {},
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
      console.error('Error fetching marks:', error);
      setError(error.message);
    }
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
      {enrolledCourses.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Course ID</th>
              <th>Course Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {enrolledCourses.map((course) => (
              <tr key={course.courseId}>
                <td>{course.courseId}</td>
                <td>{course.courseName}</td>
                <td>
                  <button onClick={() => handleViewMarks(course.courseId)}>View Marks</button>
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
          <table>
            <thead>
              <tr>
                <th>Criteria</th>
                <th>Marks</th>
              </tr>
            </thead>
            <tbody>
              {selectedCourseMarks.criteriaDefined.map((criterion, index) => (
                <tr key={index}>
                  <td>{criterion.subject} ({criterion.weightage}%)</td>
                  <td>{selectedCourseMarks.studentMarks[criterion.subject]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ViewMarks;
