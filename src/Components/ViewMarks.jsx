import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, fs } from '../Config/Config';

const ViewMarks = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCourses, setCurrentCourses] = useState([]);
  const navigate = useNavigate();

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

  const handleViewMarks = async (course) => {
    let selectedCourseMarks = null;
    let errorMessage = null;

    try {
      const marksDoc = await fs.collection('studentsMarks').doc(course.assignCourseId).get();
      if (marksDoc.exists) {
        const marksData = marksDoc.data();

        const studentMarks = marksData.marksOfStudents.find(student => student.studentId === auth.currentUser.uid);

        if (studentMarks) {
          selectedCourseMarks = {
            criteriaDefined: marksData.criteriaDefined || [],
            studentMarks: studentMarks.marks || {},
            grade: studentMarks.grade || 'I',
          };
        } else {
          errorMessage = `No records for ${course.courseName} found.`;
        }
      } else {
        errorMessage = `No records for ${course.courseName} found.`;
      }
    } catch (error) {
      errorMessage = error.message;
    }

    navigate(`/marks/${course.courseName}`, {
      state: {
        selectedCourseMarks,
        courseName: course.courseName,
        errorMessage,
      },
    });
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>Student Portal</h2>
      {currentCourses.length > 0 ? (
        <>
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
                    <button onClick={() => handleViewMarks(course)}>View Marks</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {error && <p style={{ color: 'red', marginTop: '20px' }}>Error: {error}</p>}
        </>
      ) : (
        <p>No enrolled courses found.</p>
      )}
    </div>
  );
};

export default ViewMarks;
