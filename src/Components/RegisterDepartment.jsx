import React, { useState, useEffect } from 'react';
import { auth, fs } from '../Config/Config';

const RegisterDepartment = () => {
    const [departmentName, setDepartmentName] = useState('');
    const [departmentEmail, setDepartmentEmail] = useState('');
    const [departmentPassword, setDepartmentPassword] = useState('');
    const [instructorName, setInstructorName] = useState('');
    const [instructorEmail, setInstructorEmail] = useState('');
    const [instructorPassword, setInstructorPassword] = useState('');
    const [instructorPhone, setInstructorPhone] = useState('');
    const [instructorDob, setInstructorDob] = useState('');
    const [courseName, setCourseName] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                setLoading(true);
                const snapshot = await fs.collection('departments').get();
                const departmentsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setDepartments(departmentsData);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchInstructors = async () => {
            try {
                setLoading(true);
                const snapshot = await fs.collection('instructors').get();
                const instructorsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setInstructors(instructorsData);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchCourses = async () => {
            try {
                setLoading(true);
                const snapshot = await fs.collection('courses').get();
                const coursesData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setCourses(coursesData);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDepartments();
        fetchInstructors();
        fetchCourses();
    }, []);

    const handleRegisterDepartment = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Create a new user for the department in Firebase Authentication
            const departmentCredential = await auth.createUserWithEmailAndPassword(departmentEmail, departmentPassword);
            const departmentUser = departmentCredential.user;

            // Create a new document in the "departments" collection
            await fs.collection('departments').doc(departmentUser.uid).set({
                name: departmentName,
                email: departmentEmail,
                createdAt: new Date()
            });

            // Optionally, update the department user's profile
            await departmentUser.updateProfile({
                displayName: departmentName
            });

            // Reset form fields
            setDepartmentName('');
            setDepartmentEmail('');
            setDepartmentPassword('');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterInstructor = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Create a new user for the instructor in Firebase Authentication
            const instructorCredential = await auth.createUserWithEmailAndPassword(instructorEmail, instructorPassword);
            const instructorUser = instructorCredential.user;

            // Create a new document in the "instructors" collection
            await fs.collection('instructors').doc(instructorUser.uid).set({
                name: instructorName,
                email: instructorEmail,
                phone: instructorPhone,
                dob: instructorDob,
                createdAt: new Date()
            });

            // Optionally, update the instructor user's profile
            await instructorUser.updateProfile({
                displayName: instructorName
            });

            // Reset form fields
            setInstructorName('');
            setInstructorEmail('');
            setInstructorPassword('');
            setInstructorPhone('');
            setInstructorDob('');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Create a new course document
            const courseRef = await fs.collection('courses').add({
                name: courseName,
                code: courseCode,
                departmentId: selectedDepartment, // Assigning the course to a department
                createdAt: new Date()
            });

            console.log('Course added with ID: ', courseRef.id);

            // Reset form fields
            setCourseName('');
            setCourseCode('');
            setSelectedDepartment('');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Register Department</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleRegisterDepartment}>
                <div>
                    <label htmlFor="departmentName">Department Name:</label>
                    <input
                        type="text"
                        id="departmentName"
                        value={departmentName}
                        onChange={(e) => setDepartmentName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="departmentEmail">Department Email:</label>
                    <input
                        type="email"
                        id="departmentEmail"
                        value={departmentEmail}
                        onChange={(e) => setDepartmentEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="departmentPassword">Password:</label>
                    <input
                        type="password"
                        id="departmentPassword"
                        value={departmentPassword}
                        onChange={(e) => setDepartmentPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register Department'}
                </button>
            </form>

            <h2>Register Instructor</h2>
            <form onSubmit={handleRegisterInstructor}>
                <div>
                    <label htmlFor="instructorName">Instructor Name:</label>
                    <input
                        type="text"
                        id="instructorName"
                        value={instructorName}
                        onChange={(e) => setInstructorName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="instructorEmail">Instructor Email:</label>
                    <input
                        type="email"
                        id="instructorEmail"
                        value={instructorEmail}
                        onChange={(e) => setInstructorEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="instructorPassword">Password:</label>
                    <input
                        type="password"
                        id="instructorPassword"
                        value={instructorPassword}
                        onChange={(e) => setInstructorPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="instructorPhone">Phone:</label>
                    <input
                        type="text"
                        id="instructorPhone"
                        value={instructorPhone}
                        onChange={(e) => setInstructorPhone(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="instructorDob">Date of Birth:</label>
                    <input
                        type="date"
                        id="instructorDob"
                        value={instructorDob}
                        onChange={(e) => setInstructorDob(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register Instructor'}
                </button>
            </form>

            <h2>Create Course</h2>
            <form onSubmit={handleCreateCourse}>
                <div>
                    <label htmlFor="courseName">Course Name:</label>
                    <input
                        type="text"
                        id="courseName"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="courseCode">Course Code:</label>
                    <input
                        type="text"
                        id="courseCode"
                        value={courseCode}
                        onChange={(e) => setCourseCode(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="selectedDepartment">Select Department:</label>
                    <select
                        id="selectedDepartment"
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        required
                    >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Course'}
                </button>
            </form><h2>Available Departments</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                    </tr>
                </thead>
                <tbody>
                    {departments.map(dept => (
                        <tr key={dept.id}>
                            <td>{dept.id}</td>
                            <td>{dept.name}</td>
                            <td>{dept.email}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2>Available Instructors</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>DOB</th>
                    </tr>
                </thead>
                <tbody>
                    {instructors.map(inst => (
                        <tr key={inst.id}>
                            <td>{inst.id}</td>
                            <td>{inst.name}</td>
                            <td>{inst.email}</td>
                            <td>{inst.phone}</td>
                            <td>{inst.dob}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2>Available Courses</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Code</th>
                        <th>Department ID</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map(course => (
                        <tr key={course.id}>
                            <td>{course.id}</td>
                            <td>{course.name}</td>
                            <td>{course.code}</td>
                            <td>{course.departmentId}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RegisterDepartment;
