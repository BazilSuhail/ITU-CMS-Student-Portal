import React, { useState, useEffect } from 'react';
import { fs } from '../../Config/Config';

const CurrentCourses = ({ currentCoursesIds }) => {
  const [currentCoursesData, setCurrentCoursesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCurrentCourses = async () => {
      setLoading(true);
      setError(null);

      try {
        const coursesData = await Promise.all(
          currentCoursesIds.map(async (courseId) => {
            const assignCourseDoc = await fs.collection('assignCourses').doc(courseId).get();
            if (assignCourseDoc.exists) {
              const assignCourseData = assignCourseDoc.data();
              const courseDoc = await fs.collection('courses').doc(assignCourseData.courseId).get();
              const classDoc = await fs.collection('classes').doc(assignCourseData.classId).get();
              const instructorDoc = await fs.collection('instructors').doc(assignCourseData.instructorId).get();

              return {
                assignCourseId: courseId,
                courseName: courseDoc.exists ? courseDoc.data().name : 'Unknown Course',
                className: classDoc.exists ? classDoc.data().name : 'Unknown Class',
                instructorName: instructorDoc.exists ? instructorDoc.data().name : 'Unknown Instructor',
              };
            }
            return null;
          })
        );

        setCurrentCoursesData(coursesData.filter(course => course !== null));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentCourses();
  }, [currentCoursesIds]);

  if (loading) {
    return <p>Loading current courses...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <> 
      {currentCoursesData.length > 0 ? (

        <div className='my-[8px] flex flex-col w-[100%] p-[15px] justify-center bg-gray-100 rounded-xl overflow-x-auto'>
          <h2 className='text-2xl text-custom-blue mb-[8px] font-bold '>Completed Courses</h2>
          <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table class="w-[100%] text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead class="text-md text-gray-200 uppercase bg-gray-700">
                <tr className='text-center'>
                  <th scope="col" class="px-6 py-3">Course Name</th>
                  <th scope="col" class="px-6 py-3">Course Instructor</th>
                  <th scope="col" class="px-6 py-3">Class Name</th>
                </tr>
              </thead>
              <tbody className='bg-white'>
                {currentCoursesData.map((course) => (
                  <tr key={course.assignCourseId} className='text-center odd:bg-white even:bg-gray-200 text-custom-blue  border-b'>
                    <th scope="row" class="px-6 py-4 font-bold whitespace-nowrap e">{course.courseName}</th>
                    <td className="px-6 py-4">{course.instructorName}</td>
                    <td className="px-6 py-4">{course.className}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      ) : (
        <p>No current courses found.</p>
      )}
    </>
  );
};

export default CurrentCourses;
