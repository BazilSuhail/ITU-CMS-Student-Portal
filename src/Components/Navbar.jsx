import React from "react";
import { NavLink, useNavigate} from "react-router-dom"; 
import "../Styles/navbar.css"; 
 
import {  auth } from "../Config/Config";
const Navbar = () => { 
  const navigate = useNavigate();
  const handleLogout = () => {
    auth.signOut();
    navigate("/signin");
  };

  return (
    <div className={"navbar"}>
       
      <div className="links"> 
        <NavLink to="/student-profile" className="nav-links">Students-profile</NavLink> 
        <NavLink to="/checktattendance" className="nav-links">Students Attendance</NavLink> 
        <NavLink to="/viewmarks" className="nav-links">View Marks</NavLink> 
        <NavLink to="/signin" className="nav-links">Sign in</NavLink> 
        <NavLink to="/enrollcourses" className="nav-links">ENrollment</NavLink> 
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div> 
    </div>
  );
};

export default Navbar;