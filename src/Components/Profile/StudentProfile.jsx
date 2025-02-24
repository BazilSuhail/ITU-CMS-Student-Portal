import React, { useState, useEffect } from 'react';
import { auth, fs } from '../../Config/Config';
import CurrentCourses from './CurrentCourses';
import { Circles } from 'react-loader-spinner';
import { FaUserGraduate, FaEnvelope, FaCalendarAlt, FaUniversity, FaGraduationCap, FaChalkboardTeacher, FaUser, FaCity, FaGlobeAmericas, FaFlag, FaMale, FaIdBadge } from 'react-icons/fa'

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
            height="48"
            width="48"
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
          <div className='bg-gray-200 border-2 border-gray-200 mb-[15px] rounded-lg'>
            <p className='text-xl xsx:text-[18px] font-bold xl:ml-[9px] text-gray-700 mt-[10px] px-[7px]'>Academic Information:</p>

            <div className='grid grid-cols-1 xsx:grid-cols-3 gap-y-[8px] p-[15px]'>
              <div className='bg-blue-950 rounded-2xl text-white p-[15px] w-full flex flex-row xsx:w-[90%]'>
                <FaUserGraduate className='mr-[5px] text-[44px] text-gray-100 bg-gray-500 p-[9px] rounded-full' />
                <div className='ml-[15px]'>
                  <p className='font-bold text-gray-300 text-[12px]'>Roll Number:</p>
                  <p className='font-medium mt-[6px] text-gray-200 text-[18px]'>{userData.rollNumber}</p>
                </div>
              </div>

              <div className='bg-blue-950 rounded-2xl text-white p-[15px] w-full flex flex-row xsx:w-[90%]'>
                <FaEnvelope className='mr-[5px] text-[44px] text-gray-100 bg-gray-500 p-[9px] rounded-full' />
                <div className='ml-[15px]'>
                  <p className='font-bold text-gray-300 text-[12px]'>Email:</p>
                  <p className='font-medium mt-[6px] text-gray-200 lg:text-[15px] text-[22px] xl:text-[18px]'>{userData.email}</p>
                </div>
              </div>

              <div className='bg-blue-950 rounded-2xl text-white p-[15px] w-full flex flex-row xsx:w-[90%]'>
                <FaCalendarAlt className='mr-[5px] text-[44px] text-gray-100 bg-gray-500 p-[9px] rounded-full' />
                <div className='ml-[15px]'>
                  <p className='font-bold text-gray-300 text-[12px]'>Batch:</p>
                  <p className='font-medium mt-[6px] text-gray-200 text-[18px]'>{userData.batch}</p>
                </div>
              </div>

              <div className='bg-blue-950 rounded-2xl text-white p-[15px] w-full flex flex-row xsx:w-[90%]'>
                <FaUniversity className='mr-[5px] text-[44px] text-gray-100 bg-gray-500 p-[9px] rounded-full' />
                <div className='ml-[15px]'>
                  <p className='font-bold text-gray-300 text-[12px]'>Semester:</p>
                  <p className='font-medium mt-[6px]   text-gray-200 text-[18px]'>{userData.semester}</p>
                </div>
              </div>

              <div className='bg-blue-950 rounded-2xl text-white p-[15px] w-full flex flex-row xsx:w-[90%]'>
                <FaGraduationCap className='mr-[5px] text-[44px] text-gray-100 bg-gray-500 p-[9px] rounded-full' />
                <div className='ml-[15px]'>
                  <p className='font-bold text-gray-300 text-[12px]'>Degree Program:</p>
                  <p className='font-medium mt-[6px] text-gray-200 lg:text-[15px] text-[22px] xl:text-[18px]'>{userData.degreeProgram}</p>
                </div>
              </div>

              <div className='bg-blue-950 rounded-2xl text-white p-[15px] w-full flex flex-row xsx:w-[90%]'>
                <FaChalkboardTeacher className='mr-[5px] text-[44px] text-gray-100 bg-gray-500 p-[9px] rounded-full' />
                <div className='ml-[15px]'>
                  <p className='font-bold text-gray-300 text-[12px]'>Class:</p>
                  <p className='font-medium mt-[6px] text-gray-200 text-[18px]'>{className}</p>
                </div>
              </div>

            </div>
              </div>
              
          <div className='bg-gray-200 border-2 border-gray-200 mb-[15px] rounded-lg'>
            <p className='text-xl xsx:text-[18px] font-bold xl:ml-[9px] text-gray-700 mt-[10px] px-[7px]'>Personal Information:</p>
            <div className='grid grid-cols-1 xsx:grid-cols-3 gap-y-[8px] xl:gap-y-4 p-[15px]'>

              <div className='bg-white rounded-2xl text-custom-blue p-[15px] w-full xsx:w-[90%] flex flex-row'>
                <FaUser className='mr-[5px] text-[44px] text-gray-100 bg-gray-500 p-[9px] rounded-full' />
                <div className='ml-[15px]'>
                  <p className='text-[12px] font-semibold text-gray-400'>Name:</p>
                  <p className='text-[18px] font-medium text-gray-800 '>{userData.name}</p>
                </div>
              </div>

              <div className='bg-white rounded-2xl text-custom-blue p-[15px] w-full xsx:w-[90%] flex flex-row'>
                <FaIdBadge className='mr-[5px] text-[44px] text-gray-100 bg-gray-500 p-[9px] rounded-full' />
                <div className='ml-[15px]'>
                  <p className='text-[12px] font-semibold text-gray-400'>Father's Name:</p>
                  <p className='text-[18px] font-medium text-gray-800 '>{userData.fatherName}</p>
                </div>
              </div>

              <div className='bg-white rounded-2xl text-custom-blue p-[15px] w-full xsx:w-[90%] flex flex-row'>
                <FaMale className='mr-[5px] text-[44px] text-gray-100 bg-gray-500 p-[9px] rounded-full' />
                <div className='ml-[15px]'>
                  <p className='text-[12px] font-semibold text-gray-400'>Gender:</p>
                  <p className='text-[18px] font-medium text-gray-800 '>{userData.gender}</p>
                </div>
              </div>

              <div className='bg-white rounded-2xl text-custom-blue p-[15px] w-full xsx:w-[90%] flex flex-row'>
                <FaCity className='mr-[5px] text-[44px] text-gray-100 bg-gray-500 p-[9px] rounded-full' />
                <div className='ml-[15px]'>
                  <p className='text-[12px] font-semibold text-gray-400'>City:</p>
                  <p className='text-[18px] font-medium text-gray-800 '>{userData.city}</p>
                </div>
              </div>

              <div className='bg-white rounded-2xl text-custom-blue p-[15px] w-full xsx:w-[90%] flex flex-row'>
                <FaGlobeAmericas className='mr-[5px] text-[44px] text-gray-100 bg-gray-500 p-[9px] rounded-full' />
                <div className='ml-[15px]'>
                  <p className='text-[12px] font-semibold text-gray-400'>Country:</p>
                  <p className='text-[19px] font-medium text-gray-800 '>{userData.country}</p>
                </div>
              </div>

              <div className='bg-white rounded-2xl text-custom-blue p-[15px] w-full xsx:w-[90%] flex flex-row'>
                <FaFlag className='mr-[5px] text-[44px] text-gray-100 bg-gray-500 p-[9px] rounded-full' />
                <div className='ml-[15px]'>
                  <p className='text-[12px] font-semibold text-gray-400'>Nationality:</p>
                  <p className='text-[18px] font-medium text-gray-800 '>{userData.nationality}</p>
                </div>
              </div>
            </div>
          </div>


          <div className=' py-[7px] pl-[15px] m-[5px] text-sm xsx:text-[16px] font-medium bg-blue-950 rounded-lg text-blue-100 flex w-[100%] items-center'>Current Address: <div className='ml-[2px] mb-[4px] text-white text-md xsx:text-lg px-[20px]  font-normal  '>{userData.currentAddress}</div></div>
          <div className='py-[7px] pl-[15px] m-[5px] text-sm xsx:text-[16px] font-medium bg-blue-950 rounded-lg text-blue-100 flex w-[100%] items-center'>Permanent Address: <div className='ml-[2px] mb-[4px] text-white text-md xsx:text-lg  px-[20px] font-normal '>{userData.permanentAddress}</div></div>

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
