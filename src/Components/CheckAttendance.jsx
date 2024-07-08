import React, { useState, useEffect } from 'react';
import { auth, fs } from '../Config/Config';
import { useNavigate } from 'react-router-dom';
import { Circles } from 'react-loader-spinner'

const CheckAttendance = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

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
    navigate(`/attendance/${courseId}`);
  };

  return (
    <div className='ml-[10px] xsx:ml-[285px] mr-[12px] flex flex-col'>
      <h2 className='text-custom-blue my-[12px] border- text-2xl text-center font-bold p-[8px] rounded-2xl'>Student's Attendance</h2>

      <div className='w-[95%] mb-[15px] mx-auto h-[2px] bg-custom-blue'></div>
      {loading ? (
        <div className='xsx:w-[calc(98vw-285px)] h-[calc(98vh-95px)] w-screen flex flex-col justify-center items-center'>
          <Circles
            height="60"
            width="60"
            color="rgb(0, 63, 146)"
            ariaLabel="circles-loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        </div>
      ) : error ? (
        <p className='text-red-500 p-[15px] border-2 border-red-600 rounded-xl'>Error: {error}</p>
      ) : (
        <div>
          {currentUser && (
            <div>
              {enrolledCourses.length > 0 ? (
                <div className='my-[8px] flex flex-col w-[100%] p-[15px] justify-center bg-gray-100 rounded-xl overflow-x-auto'>
                  <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                    <h2 className='text-2xl text-custom-blue mb-[8px] font-bold '>Attendance Records</h2>
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                          <th scope="col" className="whitespace-nowrap text-center  px-6 py-3">Course Name</th>
                          <th scope="col" className="whitespace-nowrap text-center  px-6 py-3">Class Name</th>
                          <th scope="col" className="whitespace-nowrap text-center  px-6 py-3">Instructor Name</th>
                          <th scope="col" className="whitespace-nowrap text-center  px-6 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrolledCourses.map((course) => (
                          <tr key={course.assignCourseId} className='text-center odd:bg-white even:bg-gray-200 text-custom-blue  border-b'>
                            <th scope="row" class="px-6 py-4 font-bold whitespace-nowrap e">{course.courseName}</th>
                            <td className="whitespace-nowrap text-center px-6 py-4">{course.className}</td>
                            <td className="whitespace-nowrap text-center  px-6 py-4">{course.instructorName}</td>
                            <td className="whitespace-nowrap text-center  px-6 py-4">
                              <button onClick={() => handleViewAttendance(course.assignCourseId)} className="whitespace-nowrap bg-custom-blue hover:bg-white hover:border-2 hover:text-custom-blue text-md py-[8px] px-[12px] font-semibold text-white rounded-xl" >
                                View Attendance
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className='text-red-500 p-[15px] border-2 border-red-600 rounded-xl'>No enrolled courses found.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CheckAttendance;
