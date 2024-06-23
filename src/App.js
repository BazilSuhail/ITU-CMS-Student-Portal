import React from "react";
import { BrowserRouter as Router, Routes, Route, } from "react-router-dom";
import SignIn from "./Components/SignIn";
import StudentProfile from "./Components/StudentProfile";
import Navbar from "./Components/Navbar";  
import CheckAttendance from "./Components/CheckAttendance";
import StudentAttendanceDetails from "./Components/StudentAttendanceDetails"; 
import EnrolledCourses from "./Components/EnrolledCourses";
import ViewMarks from "./Components/ViewMarks";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/*<Route exact path="/registerdepartment" element={<RegisterDepartment />} /> */}

        <Route path="/student-profile" element={<StudentProfile />} />
        <Route exact path="/signin" element={<SignIn />} />
        <Route exact path="/checktattendance" element={<CheckAttendance />} />
        <Route exact path="/enrollcourses" element={<EnrolledCourses />} />
        <Route exact path="/viewmarks" element={<ViewMarks />} />
        <Route exact path="/studentattendanceportal" element={<StudentAttendanceDetails />} />

      </Routes>
    </Router>
  );
};

export default App;