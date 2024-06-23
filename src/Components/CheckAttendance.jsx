import React, { useState, useEffect } from 'react';
import { auth, fs } from '../Config/Config';
import StudentAttendanceDetails from './StudentAttendanceDetails';

const CheckAttendance = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get the current logged-in user
        const user = auth.currentUser;
        if (user) {
          setCurrentUser(user);

          // Fetch student data from Firestore based on user's UID
          const studentDoc = await fs.collection('students').doc(user.uid).get();

          if (studentDoc.exists) {
            const student = studentDoc.data();

            // Fetch enrolled courses data
            const enrolledCoursesIds = student.currentCourses || [];

            const coursesData = await Promise.all(
              enrolledCoursesIds.map(async (courseId) => {
                const assignCourseDoc = await fs.collection('assignCourses').doc(courseId).get();
                if (assignCourseDoc.exists) {
                  const assignCourseData = assignCourseDoc.data();
                  const courseDoc = await fs.collection('courses').doc(assignCourseData.courseId).get();
                  const classDoc = await fs.collection('classes').doc(assignCourseData.classId).get();
                  const instructorDoc = await fs.collection('instructors').doc(assignCourseData.instructorId).get();

                  return {
                    assignCourseId: courseId,
                    courseName: courseDoc.exists ? courseDoc.data().name : 'Unknown',
                    className: classDoc.exists ? classDoc.data().name : 'Unknown',
                    instructorName: instructorDoc.exists ? instructorDoc.data().name : 'Unknown',
                  };
                }
                return null;
              })
            );

            setEnrolledCourses(coursesData.filter(course => course !== null));
          } else {
            setError('No student data found for current user');
          }
        } else {
          setError('No user logged in');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  const handleViewAttendance = (courseId) => {
    setSelectedCourseId(courseId);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h2>Check Attendance</h2>
      {currentUser && (
        <div>
          <p><strong>User ID:</strong> {currentUser.uid}</p>
          <p><strong>Email:</strong> {currentUser.email}</p>
          {enrolledCourses.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Class Name</th>
                  <th>Course Name</th>
                  <th>Instructor Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {enrolledCourses.map((course) => (
                  <tr key={course.assignCourseId}>
                    <td>{course.className}</td>
                    <td>{course.courseName}</td>
                    <td>{course.instructorName}</td>
                    <td>
                      <button onClick={() => handleViewAttendance(course.assignCourseId)}>
                        View Attendance
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No enrolled courses found.</p>
          )}
        </div>
      )}
      {selectedCourseId && <StudentAttendanceDetails assignCourseId={selectedCourseId} />}
    </div>
  );
};

export default CheckAttendance;
