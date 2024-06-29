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

  // Filter out the courses that are in the completed courses list
  const filteredCourses = courses.filter(course => !completedCourses.includes(course.courseName));

  return (


    <div className='ml-[10px] xsx:ml-[285px] mr-[12px] flex flex-col'>
      <h2 className='text-custom-blue my-[12px] border- text-2xl text-center font-bold p-[8px] rounded-2xl'>Available Courses</h2>

      <div className='w-[95%] mb-[15px] mx-auto h-[2px] bg-custom-blue'></div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <div>
          {currentUser && (
            <div className='my-[8px] flex flex-col w-[100%] p-[15px] justify-center bg-gray-100 rounded-xl overflow-x-auto'> 
              <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table class="w-[100%] text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead class="text-md text-gray-200 uppercase bg-gray-700">
                    <tr className='text-center'>
                      <th scope="col" class="px-6 py-3">Course Name</th>
                      <th scope="col" class="px-6 py-3">Class Taught To</th>
                      <th scope="col" class="px-6 py-3">Instructor Teaching</th>
                      <th scope="col" class="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map((course) => (
                      <tr key={course.id} className='text-center odd:bg-white even:bg-gray-200 text-custom-blue  border-b'>
                        <th scope="row" class="px-6 py-4 text-lg font-bold whitespace-nowrap">{course.courseName}</th>
                        <td className="whitespace-nowrap text-center font-bold px-6 py-4"><p className='bg-blue-950 rounded-lg text-white p-[8px]'>{course.className}</p></td>
                        <td className="whitespace-nowrap text-lg text-center font-bold  px-6 py-4">{course.instructorName}</td>

                        <td className="whitespace-nowrap text-center font-bold  px-6 py-4"> 
                          {enrolledCourses.includes(course.id) ? (
                            <button disabled  className="whitespace-nowrap bg-gray-500 text-md py-[8px] px-[12px] font-semibold text-white rounded-xl">Enrolled</button>
                          ) : (
                            <button onClick={() => handleEnroll(course.id) }  className="whitespace-nowrap bg-custom-blue hover:bg-white hover:border-2 hover:text-custom-blue text-md py-[8px] px-[25px] font-semibold text-white rounded-xl">Enroll</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnrolledCourses;
