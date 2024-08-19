import React, { useState, useEffect } from 'react';
import { fs, auth } from '../../Config/Config';
import { Circles } from 'react-loader-spinner';
import CurrentCourses from './CurrentCourses';
import SemesterGpa from '../SemesterGpa';
import { IoBarChartOutline } from "react-icons/io5";

const ShowCompletedCourses = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [totalCreditHours, setTotalCreditHours] = useState(0);
  const [semesterGPAs, setSemesterGPAs] = useState([]);
  const [cumulativeGPA, setCumulativeGPA] = useState(0);
  const [userData, setUserData] = useState({});
  const [showCompletedCourses, setShowCompletedCourses] = useState(true);

  useEffect(() => {
    const fetchCompletedCourses = async () => {
      setLoading(true);
      setError(null);

      try {
        const user = auth.currentUser;
        if (user) {
          const studentId = user.uid;
          const studentDoc = await fs.collection('students').doc(studentId).get();
          if (studentDoc.exists) {
            const studentData = studentDoc.data();
            setUserData(studentData);
            const courseIds = studentData.completedCourses || [];
            const results = studentData.results || [];

            const courseDataPromises = courseIds.map(async (courseId) => {
              const courseDoc = await fs.collection('courses').doc(courseId).get();
              if (courseDoc.exists) {
                return courseDoc.data();
              }
              return null;
            });

            const courses = await Promise.all(courseDataPromises);
            setCompletedCourses(courses.filter(course => course !== null));

            // Extract GPA data
            setSemesterGPAs(results);

            // Calculate cumulative GPA
            const totalGPA = results.reduce((acc, result) => acc + parseFloat(result.gpa), 0);
            const cumulativeGPA = results.length > 0 ? totalGPA / results.length : 0;
            setCumulativeGPA(cumulativeGPA);
          } else {
            setError('Student data not found');
          }
        } else {
          setError('User not logged in');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedCourses();
  }, []);

  useEffect(() => {
    // Sum the credit hours whenever completedCourses changes
    const calculateTotalCreditHours = () => {
      const totalHours = completedCourses.reduce((acc, course) => acc + parseInt(course.creditHours, 10), 0);
      setTotalCreditHours(totalHours);
    };

    calculateTotalCreditHours();
  }, [completedCourses]);

  return (
    <div className='ml-[10px] xsx:ml-[285px] mr-[12px] flex flex-col'>
      <h2 className='text-custom-blue my-[12px] border- text-2xl text-center font-bold p-[8px] rounded-2xl'>Academic History</h2>

      <div className='w-[95%] mb-[15px] mx-auto h-[2px] bg-custom-blue'></div>
      <nav className='bg-custom-blue rounded-lg w-[85%] xsx:w-[55%] p-[8px] flex justify-around mt-[10px]  mx-auto text-[12px] sm:text-md xsx:text-xl'px>
        <button
          onClick={() => setShowCompletedCourses(true)}
          className={`rounded-lg border-2 border-custom-blue hover:border-white p-[10px] ${showCompletedCourses ? 'bg-custom-back-grey text-white' : 'bg-transparent text-white'}`}>
          Completed Courses
        </button>
        <button
          onClick={() => setShowCompletedCourses(false)}
          className={`rounded-lg border-2 border-custom-blue hover:border-white p-[10px] ${!showCompletedCourses ? 'bg-custom-back-grey text-white' : 'bg-transparent text-white'}`}>
          Current Courses
        </button>
      </nav>

      {loading ? (
        <div className='xsx:w-[calc(98vw-285px)] h-[calc(100vh-285px)] xsx:h-[calc(100vh-285px)] w-screen flex flex-col justify-center items-center'>
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
      ) : showCompletedCourses ? (
        <>

          <div className='grid grid-cols-1 xsx:grid-cols-3 gap-y-[12px] gap-x-2 p-[15px] my-[20px]'>
            

            <div className='  bg-custom-blue font-extrabold rounded-2xl text-white mx-auto p-[15px] w-[90%]'>
              <div className='text-center text-md font-bold'>Total Credit Hours Earned</div>
              <div className='text-4xl text-center'>{totalCreditHours}</div>
            </div>


            <div className='  bg-custom-blue font-extrabold rounded-2xl text-white mx-auto p-[15px] w-[90%]'>
              <div className='text-center text-md font-bold'>Total Completed Courses</div>
              <div className='text-4xl text-center'>{completedCourses.length}</div>
            </div>

            <div className='  bg-custom-blue rounded-2xl font-extrabold text-white mx-auto p-[15px] w-[90%]'>
              <div className=' text-center text-md font-bold'>Cumulative GPA</div>
              <div className='text-4xl  text-center '>{cumulativeGPA.toFixed(2)}</div>
            </div>
          </div>

          {semesterGPAs.length > 0 ? (
            <div className='mb-[8px] flex flex-col w-[100%] px-[8px] bg-custom-blue text-white rounded-xl'>
                  <div className='flex mb-[15px] ml-[15px] items-center rounded-lg text-[22px]'>
                  <IoBarChartOutline size={29}/>
                  <h2 className='ml-[7px] font-medium '>Grade Point Averages</h2>
              </div>

              <SemesterGpa />
            </div>

          ) : (
            <p className='text-red-500 p-[15px] border-2 border-red-600 rounded-xl'>No GPA data found.</p>
          )}

          {completedCourses.length > 0 ? (
            <div className='my-[8px] flex flex-col w-[100%] p-[15px] justify-center bg-gray-100 rounded-xl overflow-x-auto'>
              <h2 className='text-2xl text-custom-blue mb-[8px] font-bold '>Completed Courses</h2>
              <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-[100%] text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead className="text-md text-gray-200 uppercase bg-gray-700">
                    <tr className='text-center'>
                      <th scope="col" className="px-6 py-3">Course Code</th>
                      <th scope="col" className="px-6 py-3">Course Name</th>
                      <th scope="col" className="px-6 py-3">Semester</th>
                      <th scope="col" className="px-6 py-3">Credit Hours</th>
                    </tr>
                  </thead>
                  <tbody className='bg-white'>
                    {completedCourses.map((course, index) => (
                      <tr key={course.code} className='text-center odd:bg-white even:bg-gray-200 text-custom-blue  border-b'>
                        <th scope="row" className="px-6 py-4 font-bold whitespace-nowrap e">{course.code}</th>
                        <td className="px-6  font-medium  py-4">{course.name}</td>
                        <td className="px-6  font-medium  py-4">{course.expectedSemester}</td>
                        <td className="px-6  font-medium  py-4">{course.creditHours}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          ) : (
            <p className='text-red-500 p-[15px] border-2 border-red-600 rounded-xl'>No completed courses found.</p>
          )}
        </>
      ) : (
        <CurrentCourses currentCoursesIds={userData.currentCourses || []} />
      )}
    </div>
  );
};

export default ShowCompletedCourses;
