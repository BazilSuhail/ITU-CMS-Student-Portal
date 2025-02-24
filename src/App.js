import React, { useEffect, useState, Suspense, lazy } from "react";
import { BrowserRouter as Router, useNavigate, Routes, Route } from "react-router-dom";
import { auth } from "./Config/Config"; // Import Firebase auth
import Navbar from "./Components/Navbar"; // Assuming Navbar is not lazy-loaded
import { Circles } from "react-loader-spinner";

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

const DefaultRoute = () => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (currentUser) {
        navigate("/student-profile");
      } else {
        navigate("/signin");
      }
    }
  }, [loading, currentUser, navigate]);

  if (loading) {
    return <p className="z-100 "></p>;
  }

  return null;
}; 

const App = () => {
  return (
    <Router>
      <Navbar />
      <Suspense fallback={<div className='xsx:w-[calc(98vw-285px)] h-[calc(100vh-195px)] xsx:h-[calc(100vh-85px)] w-screen flex flex-col justify-center items-center'>
        <Circles
          height="60"
          width="60"
          color="rgb(0, 63, 146)"
          ariaLabel="circles-loading"
          wrapperStyle={{}}
          wrapperClass=""
          visible={true}
        />
      </div>}>
        <Routes>
          <Route path="/" element={<DefaultRoute />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/student-profile" element={<StudentProfile />} />
          <Route path="/completedcourses" element={<ShowCompletedCourses />} />
          <Route path="/attendance" element={<CheckAttendance />} />
          <Route path="/attendance/:assignCourseId" element={<StudentAttendanceDetails />} />
          <Route path="/viewmarks" element={<ViewMarks />} />
          <Route path="/marks/:courseName" element={<MarksOfSubject />} />
          <Route path="/enrollcourses" element={<EnrolledCourses />} />
          <Route path="/withdrawcourses" element={<WithdrawCourses />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
