import React, { useState, useEffect } from 'react';
import { auth, fs, FieldValue } from '../Config/Config';
import { Circles } from 'react-loader-spinner';

const WithdrawCourses = () => {
    const [loading, setLoading] = useState(true);
    const [currentCoursesData, setCurrentCoursesData] = useState([]);
    const [withdrawCoursesData, setWithdrawCoursesData] = useState([]);

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);

            try {
                const currentUser = auth.currentUser;

                if (currentUser) {
                    const studentDoc = await fs.collection('students').doc(currentUser.uid).get();
                    if (studentDoc.exists) {
                        const studentData = studentDoc.data();
                        const enrolledCourseIds = studentData.currentCourses || [];
                        const appliedWithdrawCourseIds = studentData.withdrawCourses || [];

                        const courseDataPromises = enrolledCourseIds
                            .filter(courseId => !appliedWithdrawCourseIds.includes(courseId))
                            .map(async (courseId) => {
                                const assignCourseDoc = await fs.collection('assignCourses').doc(courseId).get();
                                if (assignCourseDoc.exists) {
                                    const assignCourseData = assignCourseDoc.data();
                                    const { instructorId, courseId: actualCourseId, classId } = assignCourseData;

                                    const courseDoc = await fs.collection('courses').doc(actualCourseId).get();
                                    const instructorDoc = await fs.collection('instructors').doc(instructorId).get();
                                    const classDoc = await fs.collection('classes').doc(classId).get();

                                    return {
                                        assignCourseId: courseId,
                                        courseName: courseDoc.exists ? courseDoc.data().name : 'Unknown Course',
                                        instructorName: instructorDoc.exists ? instructorDoc.data().name : 'Unknown Instructor',
                                        className: classDoc.exists ? classDoc.data().name : 'Unknown Class',
                                    };
                                }
                                return null;
                            });

                        const withdrawCourseDataPromises = appliedWithdrawCourseIds.map(async (courseId) => {
                            const assignCourseDoc = await fs.collection('assignCourses').doc(courseId).get();
                            if (assignCourseDoc.exists) {
                                const assignCourseData = assignCourseDoc.data();
                                const { instructorId, courseId: actualCourseId, classId } = assignCourseData;

                                const courseDoc = await fs.collection('courses').doc(actualCourseId).get();
                                const instructorDoc = await fs.collection('instructors').doc(instructorId).get();
                                const classDoc = await fs.collection('classes').doc(classId).get();

                                return {
                                    assignCourseId: courseId,
                                    courseName: courseDoc.exists ? courseDoc.data().name : 'Unknown Course',
                                    instructorName: instructorDoc.exists ? instructorDoc.data().name : 'Unknown Instructor',
                                    className: classDoc.exists ? classDoc.data().name : 'Unknown Class',
                                };
                            }
                            return null;
                        });

                        const currentCourses = await Promise.all(courseDataPromises);
                        const withdrawCourses = await Promise.all(withdrawCourseDataPromises);

                        setCurrentCoursesData(currentCourses.filter(course => course !== null));
                        setWithdrawCoursesData(withdrawCourses.filter(course => course !== null));
                    } else {
                        alert('Student data not found');
                    }
                } else {
                    alert('No authenticated user found');
                }
            } catch (error) {
                alert(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const handleWithdraw = async (assignCourseId) => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                alert('No authenticated user found');
                return;
            }

            const studentDocRef = fs.collection('students').doc(currentUser.uid);
            await studentDocRef.update({
                withdrawCourses: FieldValue.arrayUnion(assignCourseId),
            });

            setWithdrawCoursesData(prevWithdrawCourses => {
                return [...prevWithdrawCourses, currentCoursesData.find(course => course.assignCourseId === assignCourseId)];
            });
            setCurrentCoursesData(prevCurrentCourses => {
                return prevCurrentCourses.filter(course => course.assignCourseId !== assignCourseId);
            });
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className='ml-[10px] xsx:ml-[285px] mr-[12px] flex flex-col'>
            <h2 className='text-custom-blue my-[12px] border- text-2xl text-center font-bold p-[8px] rounded-2xl'>Withdraw Courses</h2>

            <div className='w-[95%] mb-[15px] mx-auto h-[2px] bg-custom-blue'></div>
            {loading ? (
                <div className='xsx:w-[calc(98vw-285px)] h-[calc(98vh-95px)] w-screen flex flex-col justify-center items-center'>
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
            ) :
                <div>

                    {currentCoursesData.length > 0 ? (
                        <div className='my-[8px] flex flex-col w-[100%] p-[15px] justify-center bg-gray-200 rounded-xl overflow-x-auto'>
                            <h2 className='text-2xl text-custom-blue mb-[8px] font-bold '>Courses Enrolled</h2>
                            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                                <table className="w-[100%] text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                    <thead className="text-md text-gray-200 uppercase bg-gray-700">
                                        <tr className='text-center'>
                                            <th scope="col" className="whitespace-nowrap px-6 py-3">Course Name</th>
                                            <th scope="col" className="whitespace-nowrap px-6 py-3">Instructor Name</th>
                                            <th scope="col" className="whitespace-nowrap px-6 py-3">Class Enrolled In</th>
                                            <th scope="col" className="whitespace-nowrap px-6 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentCoursesData.map((course) => (
                                            <tr key={course.assignCourseId} className='text-center odd:bg-white even:bg-gray-200 text-custom-blue  border-b'>
                                                <th scope="row" className="px-6 py-4 font-bold whitespace-nowrap">{course.courseName}</th>
                                                <td className="px-6  font-medium  py-4">{course.instructorName}</td>
                                                <td className="px-6 font-medium  py-4">{course.className}</td>
                                                <td className="whitespace-nowrap text-center px-6 py-4">
                                                    <button onClick={() => handleWithdraw(course.assignCourseId)} className="whitespace-nowrap bg-custom-blue hover:bg-white border-2 hover:text-custom-blue text-md py-[8px] px-[12px] font-semibold text-white rounded-xl" >
                                                        Withdraw Course
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <p className='text-red-500  mt-[15px] p-[15px] border-2 border-red-600 rounded-xl'>No current courses found.</p>
                    )}

                    {withdrawCoursesData.length > 0 ? (
                        <div className='mt-[28px] flex flex-col w-[100%] p-[15px] justify-center bg-gray-200 rounded-xl overflow-x-auto'>
                            <h2 className='text-2xl text-custom-blue mb-[8px] font-bold '>Courses Applied For Withdraw</h2>
                            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                                <table className="w-[100%] text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                    <thead className="text-md text-gray-200 uppercase bg-gray-700">
                                        <tr className='text-center'>
                                            <th scope="col" className="whitespace-nowrap px-6 py-3">Course Name</th>
                                            <th scope="col" className="whitespace-nowrap px-6 py-3">Instructor Name</th>
                                            <th scope="col" className="whitespace-nowrap px-6 py-3">Class Enrolled In</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {withdrawCoursesData.map((course) => (
                                            <tr key={course.assignCourseId} className='text-center odd:bg-white even:bg-gray-200 text-custom-blue  border-b'>
                                                <th scope="row" className="px-6 py-4 font-bold whitespace-nowrap">{course.courseName}</th>
                                                <td className="px-6 font-medium  py-4">{course.instructorName}</td>
                                                <td className="px-6 font-medium  py-4">{course.className}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <p className='text-red-500  mt-[15px] p-[15px] border-2 border-red-600 rounded-xl'>No courses applied for withdraw.</p>
                    )}
                </div>
            }
        </div>
    );
};

export default WithdrawCourses;
