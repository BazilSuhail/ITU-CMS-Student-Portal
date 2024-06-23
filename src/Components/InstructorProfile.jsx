import React, { useState, useEffect } from 'react';
import { auth, fs } from '../Config/Config';
import { useNavigate } from 'react-router-dom';

const InstructorProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get the currently authenticated user
        const currentUser = auth.currentUser;

        if (currentUser) {
          // Fetch the user data from Firestore
          const docRef = await fs.collection('instructors').doc(currentUser.uid).get();
          if (docRef.exists) {
            // Set user data state
            setUserData(docRef.data());

            // Fetch the assigned courses for this instructor
            const assignCoursesSnapshot = await fs.collection('assignCourses')
              .where('instructorId', '==', currentUser.uid)
              .get();

            // Get course and class data for each assignment
            const assignedCoursesData = await Promise.all(assignCoursesSnapshot.docs.map(async doc => {
              const assignment = doc.data();
              const courseDoc = await fs.collection('courses').doc(assignment.courseId).get();
              const classDoc = await fs.collection('classes').doc(assignment.classId).get();

              return {
                assignCourseId: doc.id,
                courseName: courseDoc.exists ? courseDoc.data().name : 'Unknown Course',
                className: classDoc.exists ? classDoc.data().name : 'Unknown Class',
                courseId: assignment.courseId,
                classId: assignment.classId
              };
            }));

            setAssignedCourses(assignedCoursesData);
          } else {
            setError('No user data found');
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

    fetchUserData();
  }, []);

  const handleNavigateToCourse = (assignCourseId) => {
    navigate(`/course-details/${assignCourseId}`);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h2>Instructor Profile</h2>
      {userData ? (
        <div>
          <p><strong>Name:</strong> {userData.name}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Phone:</strong> {userData.phone}</p>
          <p><strong>Date of Birth:</strong> {userData.dob}</p>

          <h3>Assigned Courses</h3>
          {assignedCourses.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Course Name</th>
                  <th>Class Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignedCourses.map((course, index) => (
                  <tr key={index}>
                    <td>{course.courseName}</td>
                    <td>{course.className}</td>
                    <td>
                      <button onClick={() => handleNavigateToCourse(course.assignCourseId)}>View Course</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No courses assigned.</p>
          )}
        </div>
      ) : (
        <p>No user data available</p>
      )}
    </div>
  );
};

export default InstructorProfile;
