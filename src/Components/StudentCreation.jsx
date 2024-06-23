import React, { useState, useEffect } from 'react';
import { auth, fs } from '../Config/Config';
import { arrayUnion } from 'firebase/firestore';

const StudentRegistration = () => {
    const [studentName, setStudentName] = useState('');
    const [studentEmail, setStudentEmail] = useState('');
    const [studentDob, setStudentDob] = useState('');
    const [studentPhone, setStudentPhone] = useState('');
    const [studentPassword, setStudentPassword] = useState('');
    const [studentClassId, setStudentClassId] = useState('');
    const [studentLoading, setStudentLoading] = useState(false);
    const [studentError, setStudentError] = useState(null);
    const [studentSuccess, setStudentSuccess] = useState(null);
    const [classes, setClasses] = useState([]);
    //const [students, setStudents] = useState([]);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const classesSnapshot = await fs.collection('classes').where('departmentId', '==', user.uid).get();
                    const classesList = classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setClasses(classesList);
                    console.log(classesList);
                } else {
                    setStudentError('No user is currently logged in.');
                }
            } catch (err) {
                setStudentError(err.message);
            }
        };

        fetchClasses();
    }, []);

    const handleRegisterStudent = async (e) => {
        e.preventDefault();
        setStudentLoading(true);
        setStudentError(null);
        setStudentSuccess(null);

        try {
            const userCredential = await auth.createUserWithEmailAndPassword(studentEmail, studentPassword);
            const user = userCredential.user;

            await fs.collection('students').doc(user.uid).set({
                name: studentName,
                email: studentEmail,
                dob: studentDob,
                phone: studentPhone,
                classId: studentClassId
            });

            await fs.collection('classes').doc(studentClassId).update({
                studentsOfClass: arrayUnion(user.uid)
            });

            setStudentName('');
            setStudentEmail('');
            setStudentDob('');
            setStudentPhone('');
            setStudentPassword('');
            setStudentClassId('');
            setStudentSuccess('Student registered successfully!');
        } catch (error) {
            setStudentError(error.message);
        } finally {
            setStudentLoading(false);
        }
    };

    return (
        <div>
            <h3>Register Student</h3>
            {studentError && <p style={{ color: 'red' }}>{studentError}</p>}
            {studentSuccess && <p style={{ color: 'green' }}>{studentSuccess}</p>}
            <form onSubmit={handleRegisterStudent}>
                <div>
                    <label htmlFor="studentName">Name:</label>
                    <input
                        type="text"
                        id="studentName"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="studentEmail">Email:</label>
                    <input
                        type="email"
                        id="studentEmail"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="studentDob">Date of Birth:</label>
                    <input
                        type="date"
                        id="studentDob"
                        value={studentDob}
                        onChange={(e) => setStudentDob(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="studentPhone">Phone:</label>
                    <input
                        type="text"
                        id="studentPhone"
                        value={studentPhone}
                        onChange={(e) => setStudentPhone(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="studentPassword">Password:</label>
                    <input
                        type="password"
                        id="studentPassword"
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="studentClassId">Class:</label>
                    <select
                        id="studentClassId"
                        value={studentClassId}
                        onChange={(e) => setStudentClassId(e.target.value)}
                        required
                    >
                        <option value="">Select Class</option>
                        {classes.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                                {cls.name}
                            </option>
                        ))}
                    </select>
                </div>
                <button type="submit" disabled={studentLoading}>
                    {studentLoading ? 'Registering...' : 'Register Student'}
                </button>
            </form>

            <h3>Students</h3>
            {/*students.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Date of Birth</th>
                            <th>Phone</th>
                            <th>Class</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <tr key={student.id}>
                                <td>{student.name}</td>
                                <td>{student.email}</td>
                                <td>{student.dob}</td>
                                <td>{student.phone}</td>
                                <td>{classes.find((cls) => cls.id === student.classId)?.name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No students found.</p>
            )*/}
        </div>
    );
};

export default StudentRegistration;
