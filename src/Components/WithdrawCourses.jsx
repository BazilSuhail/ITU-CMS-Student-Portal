import React, { useState, useEffect } from 'react';
import { auth, fs, FieldValue } from '../Config/Config';

const WithdrawCourses = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentCourses, setCurrentCourses] = useState([]);
    const [withdrawCourses, setWithdrawCourses] = useState([]);
    const [currentCoursesData, setCurrentCoursesData] = useState([]);
    const [withdrawCoursesData, setWithdrawCoursesData] = useState([]);

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            setError(null);

            try {
                const currentUser = auth.currentUser;

                if (currentUser) {
                    const studentDoc = await fs.collection('students').doc(currentUser.uid).get();
                    if (studentDoc.exists) {
                        const studentData = studentDoc.data();
                        const enrolledCourseIds = studentData.currentCourses || [];
                        const appliedWithdrawCourseIds = studentData.withdrawCourses || [];

                        const courseDataPromises = enrolledCourseIds.map(async (courseId) => {
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
                        setCurrentCourses(enrolledCourseIds);
                        setWithdrawCourses(appliedWithdrawCourseIds);
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

            setCurrentCourses((prev) => prev.filter(id => id !== assignCourseId));
            setWithdrawCourses((prev) => [...prev, assignCourseId]);
        } catch (error) {
            alert(error.message);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Withdraw Courses</h2>

            {currentCoursesData.length > 0 ? (
                <div>
                    <h3>Current Courses</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Course Name</th>
                                <th>Instructor Name</th>
                                <th>Class Name</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentCoursesData.map((course) => (
                                <tr key={course.assignCourseId}>
                                    <td>{course.courseName}</td>
                                    <td>{course.instructorName}</td>
                                    <td>{course.className}</td>
                                    <td>
                                        <button onClick={() => handleWithdraw(course.assignCourseId)}>Apply for Withdraw</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p>No current courses found.</p>
            )}

            {withdrawCoursesData.length > 0 ? (
                <div>
                    <h3>Courses Applied for Withdraw</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Course Name</th>
                                <th>Instructor Name</th>
                                <th>Class Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {withdrawCoursesData.map((course) => (
                                <tr key={course.assignCourseId}>
                                    <td>{course.courseName}</td>
                                    <td>{course.instructorName}</td>
                                    <td>{course.className}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p>No courses applied for withdraw.</p>
            )}
        </div>
    );
};

export default WithdrawCourses;
