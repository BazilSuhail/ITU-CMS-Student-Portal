import React, { useState, useEffect } from 'react';
import { auth, fs } from '../Config/Config';

const AssignCourses = ({ departmentAbbreviation }) => {
    const [courses, setCourses] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [classes, setClasses] = useState([]);
    const [filteredClasses, setFilteredClasses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedInstructor, setSelectedInstructor] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [assignLoading, setAssignLoading] = useState(false);
    const [assignError, setAssignError] = useState(null);
    const [assignSuccess, setAssignSuccess] = useState(null);
    const [department, setDepartment] = useState(null); // Added state for department

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    // Fetch the department of the logged-in user
                    const departmentSnapshot = await fs.collection('departments').doc(user.uid).get();
                    const departmentData = departmentSnapshot.data();
                    setDepartment(departmentData);

                    const coursesSnapshot = await fs.collection('courses').get();
                    const instructorsSnapshot = await fs.collection('instructors').get();
                    const classesSnapshot = await fs.collection('classes').get();

                    setCourses(coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                    setInstructors(instructorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                    setClasses(classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                    const assignmentsSnapshot = await fs.collection('assignCourses').get();
                    setAssignments(assignmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                } else {
                    setAssignError('No user is currently logged in.');
                }
            } catch (err) {
                setAssignError(err.message);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (department && classes.length > 0) {
            const filtered = classes.filter(cls => cls.name.startsWith(department.abbreviation));
            setFilteredClasses(filtered);
        }
    }, [department, classes]);

    const handleAssignCourse = async (e) => {
        e.preventDefault();
        setAssignLoading(true);
        setAssignError(null);
        setAssignSuccess(null);

        try {
            const user = auth.currentUser;
            if (user) {
                const existingAssignment = assignments.find(
                    assignment =>
                        assignment.courseId === selectedCourse &&
                        assignment.instructorId === selectedInstructor &&
                        assignment.classId === selectedClass
                );

                if (existingAssignment) {
                    setAssignError('This assignment already exists.');
                    return;
                }

                const assignmentRef = await fs.collection('assignCourses').add({
                    courseId: selectedCourse,
                    instructorId: selectedInstructor,
                    classId: selectedClass
                });

                setAssignments([
                    ...assignments,
                    {
                        id: assignmentRef.id,
                        courseId: selectedCourse,
                        instructorId: selectedInstructor,
                        classId: selectedClass
                    }
                ]);

                setSelectedCourse('');
                setSelectedInstructor('');
                setSelectedClass('');
                setAssignSuccess('Course assigned successfully!');
            } else {
                setAssignError('No user is currently logged in.');
            }
        } catch (error) {
            setAssignError(error.message);
        } finally {
            setAssignLoading(false);
        }
    };

    return (
        <div>
            <h3>Assign Courses to Instructors</h3>
            {assignError && <p style={{ color: 'red' }}>{assignError}</p>}
            {assignSuccess && <p style={{ color: 'green' }}>{assignSuccess}</p>}
            <form onSubmit={handleAssignCourse}>
                <div>
                    <label htmlFor="course">Course:</label>
                    <select
                        id="course"
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        required
                    >
                        <option value="">Select Course</option>
                        {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                                {course.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="instructor">Instructor:</label>
                    <select
                        id="instructor"
                        value={selectedInstructor}
                        onChange={(e) => setSelectedInstructor(e.target.value)}
                        required
                    >
                        <option value="">Select Instructor</option>
                        {instructors.map((instructor) => (
                            <option key={instructor.id} value={instructor.id}>
                                {instructor.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="class">Class:</label>
                    <select
                        id="class"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        required
                    >
                        <option value="">Select Class</option>
                        {filteredClasses.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                                {cls.name}
                            </option>
                        ))}
                    </select>
                </div>
                <button type="submit" disabled={assignLoading}>
                    {assignLoading ? 'Assigning...' : 'Assign Course'}
                </button>
            </form>

            <h3>Assignments</h3>
            {assignments.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Course</th>
                            <th>Instructor</th>
                            <th>Class</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assignments
                            .filter(assignment => {
                                const className = classes.find(cls => cls.id === assignment.classId)?.name;
                                return className && className.startsWith(departmentAbbreviation);
                            })
                            .map((assignment, index) => (
                                <tr key={index}>
                                    <td>{courses.find(course => course.id === assignment.courseId)?.name}</td>
                                    <td>{instructors.find(instructor => instructor.id === assignment.instructorId)?.name}</td>
                                    <td>{classes.find(cls => cls.id === assignment.classId)?.name}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            ) : (
                <p>No assignments found.</p>
            )}

        </div>
    );
};

export default AssignCourses;
/*
<tbody>
            {assignments
                .filter(assignment => {
                    const className = classes.find(cls => cls.id === assignment.classId)?.name;
                    return className && className.startsWith(props.abbreviation);
                })
                .map((assignment, index) => (
                    <tr key={index}>
                        <td>{courses.find(course => course.id === assignment.courseId)?.name}</td>
                        <td>{instructors.find(instructor => instructor.id === assignment.instructorId)?.name}</td>
                        <td>{classes.find(cls => cls.id === assignment.classId)?.name}</td>
                    </tr>
                ))}
        </tbody>
*/