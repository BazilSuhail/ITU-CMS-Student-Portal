import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fs } from '../Config/Config';

const CourseDetails = () => {
  const { assignCourseId } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch assignment details
        const assignmentDoc = await fs.collection('assignCourses').doc(assignCourseId).get();
        if (assignmentDoc.exists) {
          const assignmentData = assignmentDoc.data();

          // Fetch course and class details
          const courseDoc = await fs.collection('courses').doc(assignmentData.courseId).get();
          const classDoc = await fs.collection('classes').doc(assignmentData.classId).get();
          
          // Fetch students of the class
          const classData = classDoc.data();
          setStudents(classData.studentsOfClass || []);
          
          setCourseData({
            courseName: courseDoc.data().name,
            className: classDoc.data().name,
            courseId: assignmentData.courseId,
            classId: assignmentData.classId,
          });
        } else {
          setError('No assignment data found');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [assignCourseId]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendance({
      ...attendance,
      [studentId]: status,
    });
  };

  const handleSaveAttendance = async () => {
    try {
      const attendanceDocRef = fs.collection('attendances').doc(assignCourseId);
      const attendanceDoc = await attendanceDocRef.get();

      if (attendanceDoc.exists) {
        // Update existing document
        await attendanceDocRef.update({
          attendances: fs.FieldValue.arrayUnion({
            date: selectedDate,
            records: attendance,
          }),
        });
      } else {
        // Create new document
        await attendanceDocRef.set({
          assignCourseId: assignCourseId,
          attendances: [
            {
              date: selectedDate,
              records: attendance,
            },
          ],
        });
      }
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

  return (
    <div>
      <h2>Course Details</h2>
      {courseData && (
        <div>
          <p><strong>Course Name:</strong> {courseData.courseName}</p>
          <p><strong>Class Name:</strong> {courseData.className}</p>
        </div>
      )}
      <h3>Mark Attendance</h3>
      <label>
        Select Date:
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          required
        />
      </label>
      <table>
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Present</th>
            <th>Absent</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.name}</td>
              <td>
                <input
                  type="radio"
                  name={`attendance-${student.id}`}
                  value="present"
                  checked={attendance[student.id] === true}
                  onChange={() => handleAttendanceChange(student.id, true)}
                />
              </td>
              <td>
                <input
                  type="radio"
                  name={`attendance-${student.id}`}
                  value="absent"
                  checked={attendance[student.id] === false}
                  onChange={() => handleAttendanceChange(student.id, false)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleSaveAttendance}>Save Attendance</button>
    </div>
  );
};

export default CourseDetails;
