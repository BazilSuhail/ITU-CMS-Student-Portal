import React, { useEffect, useState, Suspense, lazy } from "react";
import { BrowserRouter as Router, useNavigate, Routes, Route } from "react-router-dom";
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
// Fallback component to display while loading
const Loading = () => (
  <div className=" lg:pl-[285px] overflow-hidden w-full  xsx:h-screen animate-fadeInOut p-[5px] md:p-[15px]">
    
    <div className="w-full my-[15px] flex"> 
      <div className="w-[100%] ml-auto rounded-[15px] h-[85px] mr-[15px] bg-custom-blue"></div>
      <div className="w-[85px] rounded-full h-[85px]  bg-custom-blue"></div>
    </div> 
    <div className="w-full mt-[10px] flex"> 
      <div className="w-[38%] ml-auto rounded-[10px] h-[385px] lg:h-[455px] mr-[15px] bg-custom-blue"></div>
      <div className="w-[62%]  mr-auto rounded-[12px]] h-[385px] lg:h-[455px] bg-custom-blue"></div>
    </div> 
    <div className="w-full my-[4px] flex"> 
      <div className="w-[28%]  rounded-[20px] h-[85px] mr-[5px] bg-custom-blue"></div>
      <div className="w-[75%] rounded-[18px] h-[85px]  bg-custom-blue"></div>
    </div>  
    <div className="w-full my-[2px] flex"> 
      <div className="w-[100%]  rounded-[15px] h-[35px] mx-auto bg-custom-blue"></div> 
    </div> 
  </div>
);

const App = () => {
  return (
    <Router>
      <Navbar />
      <Suspense fallback={<Loading />}>
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
