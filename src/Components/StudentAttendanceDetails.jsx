import React, { useState, useEffect } from 'react';
import { auth, fs } from '../Config/Config';

const StudentAttendanceDetails = ({ assignCourseId }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [totalDays, setTotalDays] = useState(0);
  const [daysPresent, setDaysPresent] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
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
            setStudentData(student);

            // Fetch attendance data using the provided assignCourseId
            if (assignCourseId) {
              const attendanceDocRef = fs.collection('attendances').doc(assignCourseId);
              const attendanceDoc = await attendanceDocRef.get();

              if (attendanceDoc.exists) {
                const attendanceData = attendanceDoc.data().attendances || [];
                setAttendanceRecords(attendanceData);

                // Calculate total days and days present
                let total = 0;
                let present = 0;

                attendanceData.forEach(record => {
                  total++;
                  if (record.records && record.records[user.uid] === true) {
                    present++;
                  }
                });

                setTotalDays(total);
                setDaysPresent(present);
              } else {
                setError('No attendance records found');
              }
            } else {
              setError('No course ID provided');
            }
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

    fetchUserData();
  }, [assignCourseId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  // Calculate attendance percentage
  const attendancePercentage = totalDays > 0 ? ((daysPresent / totalDays) * 100).toFixed(2) : 0;

  return (
    <div>
      <h2>Attendance Portal</h2>
      {currentUser && (
        <div>
          <p><strong>User ID:</strong> {currentUser.uid}</p>
          <p><strong>Email:</strong> {currentUser.email}</p>
          {studentData && (
            <div>
              <p><strong>Student Name:</strong> {studentData.name}</p>
              <p><strong>Roll Number:</strong> {studentData.rollNumber}</p>
              {/* Display attendance records */}
              <h3>Attendance Records</h3>
              {attendanceRecords.length > 0 ? (
                <div>
                  <p>Total Days: {totalDays}</p>
                  <p>Days Present: {daysPresent}</p>
                  <p>Attendance Percentage: {attendancePercentage}%</p>
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceRecords.map((record, index) => (
                        <tr key={index}>
                          <td>{record.date}</td>
                          <td>{record.records[currentUser.uid] ? 'Present' : 'Absent'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No attendance records found.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentAttendanceDetails;
