import React, { useEffect, useState, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./Config/Config"; // Import Firebase auth
import Navbar from "./Components/Navbar"; // Assuming Navbar is not lazy-loaded

// Lazy load components
const SignIn = lazy(() => import("./Components/SignIn"));
const CheckAttendance = lazy(() => import("./Components/CheckAttendance"));
const StudentAttendanceDetails = lazy(() => import("./Components/StudentAttendanceDetails"));
const EnrolledCourses = lazy(() => import("./Components/EnrolledCourses"));
const ViewMarks = lazy(() => import("./Components/ViewMarks"));
const WithdrawCourses = lazy(() => import("./Components/WithdrawCourses"));
const MarksOfSubject = lazy(() => import("./Components/MarksOfSubject"));
const StudentProfile = lazy(() => import("./Components/Profile/StudentProfile"));
const ShowCompletedCourses = lazy(() => import("./Components/Profile/CompletedCourses"));

// Fallback component to display while loading
const Loading = () => <div>Loading...</div>;

const AuthWrapper = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return currentUser ? children : <Navigate to="/signin" />;
};

const App = () => {
  return (
    <Router>
      <Navbar />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Navigate to="/signin" />} />
          <Route path="/signin" element={<SignIn />} />
          
          <Route path="/student-profile" element={<AuthWrapper><StudentProfile /></AuthWrapper>} />
          <Route path="/completedcourses" element={<AuthWrapper><ShowCompletedCourses /></AuthWrapper>} />
          
          <Route path="/attendance" element={<AuthWrapper><CheckAttendance /></AuthWrapper>} />
          <Route path="/attendance/:assignCourseId" element={<AuthWrapper><StudentAttendanceDetails /></AuthWrapper>} />
          
          <Route path="/viewmarks" element={<AuthWrapper><ViewMarks /></AuthWrapper>} />
          <Route path="/marks/:courseName" element={<AuthWrapper><MarksOfSubject /></AuthWrapper>} /> 
          
          <Route path="/enrollcourses" element={<AuthWrapper><EnrolledCourses /></AuthWrapper>} />
          <Route path="/withdrawcourses" element={<AuthWrapper><WithdrawCourses /></AuthWrapper>} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
