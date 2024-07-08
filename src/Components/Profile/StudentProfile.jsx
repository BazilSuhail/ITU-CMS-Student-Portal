import React, { useState, useEffect } from 'react';
import { auth, fs } from '../../Config/Config';
import CurrentCourses from './CurrentCourses';
import { Circles } from 'react-loader-spinner';

/*
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



*/

const StudentProfile = () => {
  const [userData, setUserData] = useState(null);
  const [className, setClassName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);

      try {
        const currentUser = auth.currentUser;

        if (currentUser) {
          const docRef = await fs.collection('students').doc(currentUser.uid).get();

          if (docRef.exists) {
            const userData = docRef.data();
            setUserData(userData);

            if (userData.classId) {
              const classDoc = await fs.collection('classes').doc(userData.classId).get();
              if (classDoc.exists) {
                setClassName(classDoc.data().name);
              } else {
                setClassName('Unknown Class');
              }
            } else {
              setClassName('No Class ID');
            }
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

  return (
    <div className='xsx:ml-[285px] ml-[10px] mr-[12px] flex flex-col'>
      <h2 className='text-custom-blue my-[12px] border- text-2xl text-center font-bold p-[8px] rounded-2xl'>Student Profile</h2>
      <div className='w-[95%] mb-[15px] mx-auto h-[2px] bg-custom-blue'></div>

      {loading ? (
        <div className='xsx:w-[calc(98vw-285px)] h-[calc(100vh-195px)] xsx:h-[calc(100vh-85px)] w-screen flex flex-col justify-center items-center'>
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
      ) : userData ? (
        <div>
          <p className='bg-blue-950 rounded-xl text-xl xsx:text-3xl mb-[-25px] xsx:mb-[0px] text-white p-[7px]'>Academic Information:</p>

          <div className='grid grid-cols-1 xsx:grid-cols-3 gap-y-[8px] p-[15px] my-[20px]'>
            <div className='bg-custom-blue rounded-2xl text-white p-[15px] w-full xsx:w-[90%] transform hover:scale-110 transition-transform duration-300'>
              <div className='ml-[5px] text-md'>Roll Number:</div>
              <div className='text-3xl xsx:text-4xl '>{userData.rollNumber}</div>
            </div>

            <div className='bg-custom-blue rounded-2xl text-white p-[15px] w-full xsx:w-[90%] transform hover:scale-110 transition-transform duration-300'>
              <div className='ml-[5px] text-md'>Email:</div>
              <div className='text-3xl xsx:text-4xl '>{userData.email}</div>
            </div>

            <div className='bg-custom-blue rounded-2xl text-white p-[15px] w-full xsx:w-[90%] transform hover:scale-110 transition-transform duration-300'>
              <div className='ml-[5px] text-md'>Batch:</div>
              <div className='text-3xl xsx:text-4xl '>{userData.batch}</div>
            </div>

            <div className='bg-custom-blue rounded-2xl text-white p-[15px] w-full xsx:w-[90%] transform hover:scale-110 transition-transform duration-300'>
              <div className='ml-[5px] text-md'>Semester:</div>
              <div className='text-3xl xsx:text-4xl '>{userData.semester}</div>
            </div>

            <div className='bg-custom-blue rounded-2xl text-white p-[15px] w-full xsx:w-[90%] transform hover:scale-110 transition-transform duration-300'>
              <div className='ml-[5px] text-md'>Degree Program:</div>
              <div className='text-2xl xsx:text-4xl '>{userData.degreeProgram}</div>
            </div>
            <div className='bg-custom-blue rounded-2xl text-white p-[15px] w-full xsx:w-[90%] transform hover:scale-110 transition-transform duration-300'>
              <div className='ml-[5px] text-md'>Class:</div>
              <div className='text-3xl xsx:text-4xl '>{className}</div>
            </div>
          </div>


          <p className='bg-blue-950 rounded-xl text-xl xsx:text-3xl mb-[-25px] xsx:mb-[0px] text-white p-[7px]'>Personal Information:</p>

          <div className='grid grid-cols-1 xsx:grid-cols-3 gap-y-[8px] p-[15px] my-[20px]'>

            <div className='shadow-custom-dark   rounded-2xl text-custom-blue p-[15px] w-full xsx:w-[90%]'>
              <div className='ml-[5px] text-md'>Name:</div>
              <div className='text-3xl'>{userData.name}</div>
            </div>

            <div className='shadow-custom-dark   rounded-2xl text-custom-blue p-[15px] w-full xsx:w-[90%]'>
              <div className='ml-[5px] text-md'>Father's Name:</div>
              <div className='text-3xl'>{userData.fatherName}</div>
            </div>

            <div className='shadow-custom-dark   rounded-2xl text-custom-blue p-[15px] w-full xsx:w-[90%]'>
              <div className='ml-[5px] text-md'>Gender:</div>
              <div className='text-3xl'>{userData.gender}</div>
            </div>

            <div className='shadow-custom-dark   rounded-2xl text-custom-blue p-[15px] w-full xsx:w-[90%]'>
              <div className='ml-[5px] text-md'>City:</div>
              <div className='text-3xl'>{userData.city}</div>
            </div>

            <div className='shadow-custom-dark   rounded-2xl text-custom-blue p-[15px] w-full xsx:w-[90%]'>
              <div className='ml-[5px] text-md'>Country:</div>
              <div className='text-3xl'>{userData.country}</div>
            </div>


            <div className='shadow-custom-dark  rounded-2xl text-custom-blue p-[15px] w-full xsx:w-[90%]'>
              <div className='ml-[15px] text-md'>Nationality:</div>
              <div className='text-3xl'>{userData.nationality}</div>
            </div>

          </div>

          <div className=' p-[7px]  m-[5px] text-sm xsx:text-lg bg-blue-950 rounded-lg text-white flex w-[100%] items-center'>Current Address: <div className='ml-[8px] mb-[4px] text-md xsx:text-2xl px-[20px] font-sans   '>{userData.currentAddress}</div></div>
          <div className='p-[7px]  m-[5px] text-sm xsx:text-lg bg-blue-950 rounded-lg text-white flex w-[100%] items-center'>Permanent Address: <div className='ml-[8px] mb-[4px] text-md xsx:text-2xl  px-[20px] font-sans '>{userData.permanentAddress}</div></div>

          <CurrentCourses currentCoursesIds={userData.currentCourses || []} />
        </div>
      ) : (
        <p>No user data available</p>
      )
      }
    </div >
  );
};

export default StudentProfile;
