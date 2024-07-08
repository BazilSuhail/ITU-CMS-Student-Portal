import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Circles } from 'react-loader-spinner';
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

  return (
    <div className='ml-[10px] xsx:ml-[285px] mr-[12px] flex flex-col'>
      <h2 className='text-custom-blue my-[12px] border- text-2xl text-center font-bold p-[8px] rounded-2xl'>Student's Marks</h2>

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
      ) : currentCourses.length > 0 ? (

        <div className='grid grid-cols-1 xsx:grid-cols-2 xl:grid-cols-3 p-[10px] my-[12px]'>
          {currentCourses.map((course) => (
            <div key={course.assignCourseId} className='bg-custom-blue flex flex-col rounded-lg m-[5px] text-white p-[15px]' >
              <div className='bg-gray-500 mt-[15px] rounded-lg mx-auto w-[100%] h-[230px]'></div>
              <p className='text-2xl font-bold my-[8px] ml-[5px]'>{course.courseName}</p>
              <div className='flex justify-between'>
                <p className='text-md text-gray-400'>{course.instructorName}</p>
                <p className='text-md text-gray-400 border-2 border-gray-200 px-[5px] rounded-md'>{course.creditHours}</p>
              </div>
              <p className='text-md text-gray-400 font-bold'>{course.className}</p>
              <button onClick={() => handleViewMarks(course)} className='mx-auto w-[100%] font-bold hover:bg-custom-back-grey my-[8px] bg-blue-700 p-[8px] rounded-xl'>View Marks</button>

            </div>
          ))}
        </div>
      ) : (
        <p className='text-red-500  mt-[15px] p-[15px] border-2 border-red-600 rounded-xl'>No enrolled courses found.</p>
      )
      }
    </div >
  );
};

export default ViewMarks;
