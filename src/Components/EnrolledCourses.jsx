import React, { useState, useEffect } from 'react';
import { auth, fs } from '../Config/Config';

const EnrolledCourses = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get the current logged-in user
        const user = auth.currentUser;
        if (user) {
          setCurrentUser(user);

          // Fetch student data to get enrolled and completed courses
          const studentDoc = await fs.collection('students').doc(user.uid).get();
          if (studentDoc.exists) {
            const studentData = studentDoc.data();
            setEnrolledCourses(studentData.enrolledCourses || []);
            const completedCoursesIds = studentData.completedCourses || [];

            // Fetch completed courses names
            const completedCoursesNames = await Promise.all(
              completedCoursesIds.map(async (courseId) => {
                const courseDoc = await fs.collection('courses').doc(courseId).get();
                return courseDoc.exists ? courseDoc.data().name : 'Unknown Course';
              })
            );

            setCompletedCourses(completedCoursesNames);
          }

          // Fetch assignCourses data
          const assignCoursesSnapshot = await fs.collection('assignCourses').get();
          const coursesData = await Promise.all(assignCoursesSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            const courseDoc = await fs.collection('courses').doc(data.courseId).get();
            const instructorDoc = await fs.collection('instructors').doc(data.instructorId).get();
            const classDoc = await fs.collection('classes').doc(data.classId).get();
            return {
              id: doc.id,
              courseName: courseDoc.data().name,
              instructorName: instructorDoc.data().name,
              className: classDoc.data().name,
            };
          }));

          setCourses(coursesData);
        } else {
          setError('No user logged in');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      if (!currentUser) {
        setError('No user logged in');
        return;
      }

      // Update the student's enrolled courses in Firestore
      const studentDocRef = fs.collection('students').doc(currentUser.uid);
      await studentDocRef.update({
        enrolledCourses: [...enrolledCourses, courseId],
      });

      // Update the local state
      setEnrolledCourses((prev) => [...prev, courseId]);
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  // Filter out the courses that are in the completed courses list
  const filteredCourses = courses.filter(course => !completedCourses.includes(course.courseName));

  return (
    <div>
      <h2>Enroll in Courses</h2>
      {currentUser && (
        <div>
          <p><strong>User ID:</strong> {currentUser.uid}</p>
          <p><strong>Email:</strong> {currentUser.email}</p>
          <table>
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Instructor Name</th>
                <th>Class Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => (
                <tr key={course.id}>
                  <td>{course.courseName}</td>
                  <td>{course.instructorName}</td>
                  <td>{course.className}</td>
                  <td>
                    {enrolledCourses.includes(course.id) ? (
                      <button disabled>Enrolled</button>
                    ) : (
                      <button onClick={() => handleEnroll(course.id)}>Enroll</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EnrolledCourses;
