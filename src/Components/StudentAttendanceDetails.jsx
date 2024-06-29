import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { auth, fs } from '../Config/Config';

const StudentAttendanceDetails = () => {
  const { assignCourseId } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [totalDays, setTotalDays] = useState(0);
  const [daysPresent, setDaysPresent] = useState(0);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get the current logged-in user
        const user = auth.currentUser;
        if (user) {
          setCurrentUser(user);

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
          setError('No user logged in');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [assignCourseId]);

  // Calculate attendance percentage
  const attendancePercentage = totalDays > 0 ? ((daysPresent / totalDays) * 100).toFixed(2) : 0;

  return (
    <div className='ml-[10px] xsx:ml-[285px] mr-[12px] flex flex-col'>
      <h2 className='text-custom-blue my-[12px] border- text-2xl text-center font-bold p-[8px] rounded-2xl'>Attendance Record</h2>

      <div className='w-[95%] mb-[15px] mx-auto h-[2px] bg-custom-blue'></div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        currentUser && (
          <div>
            {attendanceRecords.length > 0 ? (
              <>
                <div className='gri grid-cols-1 xsx:grid-cols-4  p-[15px] my-[20px]'>


                  <p className=' shadow-custom-light  rounded-2xl mx-auto mb-[30px] font-extrabold text-custom-blue p-[15px] w-[90%]'>
                    <div className=' text-center text-2xl font-bold'>Total Days</div>
                    <div className='w-[75%] my-[7px] mx-auto h-[4px] bg-custom-blue'></div>
                    <div className='text-4xl text-center mx-auto'>{totalDays}</div>
                  </p>

                  <p className=' shadow-custom-light  rounded-2xl mx-auto mb-[30px]  font-extrabold text-custom-blue p-[15px] w-[90%]'>
                    <div className=' text-center text-2xl font-bold'>Days Present</div>
                    <div className='w-[75%] my-[7px] mx-auto h-[4px] bg-custom-blue'></div>
                    <div className='text-4xl text-green-500 text-center mx-auto'>{daysPresent}</div>
                  </p>


                  <p className=' shadow-custom-light  rounded-2xl mx-auto mb-[30px]  font-extrabold text-custom-blue p-[15px] w-[90%]'>
                    <div className=' text-center text-2xl font-bold'>Days Absent</div>
                    <div className='w-[75%] my-[7px] mx-auto h-[4px] bg-custom-blue'></div>
                    <div className='text-4xl text-red-600 text-center mx-auto'>{totalDays - daysPresent}</div>
                  </p>

                  <p className='bg-custom-blue text-white  mx-auto mb-[30px] rounded-2xl font-extrabold p-[15px] w-[90%]'>
                    <div className=' text-center text-2xl font-bold'>Attendance %</div>
                    <div className='w-[75%] my-[7px] mx-auto h-[4px] bg-white'></div>
                    <div className='text-3xl text-center mx-auto'>{attendancePercentage}%</div>
                  </p>
                </div>


                <div className='my-[8px] flex flex-col w-[100%] p-[35px] justify-center bg-gray-200 rounded-xl overflow-x-auto'>

                  <h2 className='text-2xl text-custom-blue mb-[8px] font-bold '>Complete Attendance</h2>

                  <div class="relative  overflow-x-auto shadow-md sm:rounded-lg">
                    <table class="w-[100%] text-sm text-gray-500 dark:text-gray-400">
                      <thead class="text-md text-gray-200 uppercase bg-gray-700">
                        <tr className='text-center'>
                          <th scope="col" class="whitespace-nowrap px-6 py-3">Date</th>
                          <th scope="col" class="whitespace-nowrap px-6 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className='bg-white'>
                        {attendanceRecords.map((record, index) => (
                          <tr key={index} className='text-center odd:bg-white even:bg-gray-200 text-custom-blue  border-b'>
                            <th scope="row" class="px-6 text-xl py-4 font-bold whitespace-nowrap e">{record.date}</th>
                            <td className='px-6 py-4'>
                              <div className={`whitespace-nowrap text-lg p-[5px] mx-auto font-bold text-white rounded-3xl w-[85px] xsx:w-[50%] ${record.records[currentUser.uid] ? 'bg-green-500' : 'bg-red-500'}`}>
                                {record.records[currentUser.uid] ? 'Present' : 'Absent'}
                              </div>
                            </td>


                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>

              </>

            ) : (
              <p>No attendance records found.</p>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default StudentAttendanceDetails;
