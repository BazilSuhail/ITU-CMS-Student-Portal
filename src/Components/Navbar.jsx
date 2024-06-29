import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { auth, fs } from "../Config/Config";
import { PiStudentDuotone } from "react-icons/pi";

import { TbSquareRoundedPercentage } from "react-icons/tb";
import { LuBookOpen } from "react-icons/lu";
import { IoMdBookmarks } from "react-icons/io";
import { MdScreenRotation } from "react-icons/md";
import { PiHandWithdrawLight } from "react-icons/pi";
import { ImCross } from "react-icons/im";
import { RiMenu3Line } from "react-icons/ri";



import logo from "./itu.png"
import profile from "./Profile1.png"

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isXsx, setIsXsx] = useState(window.innerWidth >= 1600); // Adjust according to your custom 'xsx' size

  useEffect(() => {
    const fetchUserName = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await fs.collection("students").doc(user.uid).get();
        if (userDoc.exists) {
          setUserName(userDoc.data().name); // Assuming 'name' is the field in the document
        }
      }
    };
    fetchUserName();

    const handleResize = () => {
      setIsXsx(window.innerWidth >= 1600); // Adjust according to your custom 'xsx' size
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    auth.signOut();
    navigate("/signin");
  };

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav>
      {/* Navbar for larger screens ---- Show this div on all screens larger than small */}
      <div className="mt-[6px] fixed hidden xsx:flex xsx:flex-col xsx:justify-between shadow-xl rounded-2xl m-[10px] xsx:items-center w-[260px] h-[98vh] bg-custom-blue p-[10px]">
        <div className="w-[100%] flex justify-evenly">

          <img src={profile} alt="" className="w-[70px] h-[70px] " />

          <div className="ml-[20px]">
            <div className="text-white mt-[10px] text-sm text-center">Welcome,</div>
            <p className="text-white text-xsx text-center">{userName} !!</p>
          </div>

        </div>
        <div className="flex text-white flex-col w-[98%] mt-[-25px]">

          <NavLink
            to="/student-profile"
            className={({ isActive }) =>
              `flex items-center p-2 rounded-md text-md ${isActive ? 'bg-custom-back-grey text-white font-bold my-[6px]' : 'my-[6px] hover:bg-custom-back-grey hover:rounded-2xl hover:font-bold text-white'}`
            }
          >
            <PiStudentDuotone className="text-custom-sz mr-2" />
            <p className="mt-0">Dashboard</p>
          </NavLink>


          <NavLink
            to="/completedcourses"
            className={({ isActive }) =>
              `flex items-center p-2 rounded-md text-md ${isActive ? 'bg-custom-back-grey text-white font-bold my-[6px]' : 'my-[6px] hover:bg-custom-back-grey hover:rounded-2xl hover:font-bold text-white'}`
            }
          >
            <LuBookOpen className="text-custom-sz mr-2" />
            <p className="">Academia</p>
          </NavLink>
          <NavLink
            to="/attendance"
            className={({ isActive }) =>
              `flex items-center p-2 rounded-md text-md ${isActive ? 'bg-custom-back-grey text-white font-bold my-[6px]' : 'my-[6px] hover:bg-custom-back-grey hover:rounded-2xl hover:font-bold text-white'}`
            }
          >
            <TbSquareRoundedPercentage className="text-custom-sz mr-2" />
            <p>Attendance</p>
          </NavLink>

          <NavLink
            to="/viewmarks"
            className={({ isActive }) =>
              `flex items-center p-2 rounded-md text-md ${isActive ? 'bg-custom-back-grey text-white font-bold my-[6px]' : 'my-[6px] hover:bg-custom-back-grey hover:rounded-2xl hover:font-bold text-white'}`
            }>
            <IoMdBookmarks className="text-custom-sz mr-2" />
            <p>Marks</p>
          </NavLink>

          <div className="w-[95%] rounded-lg h-[2px] bg-custom-back-grey mx-auto my-[5px]"></div>


          <div className="ml-[6px] text-lg mb-[14px]">Checkout</div>

          <NavLink to="/enrollcourses" className="ml-[15px] mt-[6px] hover:bg-custom-back-grey hover:rounded-xl hover:font-bold  text-sm  text-white rounded-md p-[8px] w-[90%] flex flex-row "> <MdScreenRotation className="mb-[5px] mr-[4px] text-custom-size" /><p className="mt-[2px]">Enroll Courses</p></NavLink>
          <NavLink to="/withdrawcourses" className="ml-[15px] mt-[6px] hover:bg-custom-back-grey hover:rounded-xl hover:font-bold  text-sm  text-white rounded-md p-[8px] w-[90%] flex flex-row "> <PiHandWithdrawLight className="mb-[5px] mr-[4px] text-custom-size" /><p className="mt-[2px]">Withdraw Courses</p></NavLink>


        </div>
        <button onClick={handleLogout} className="text-2xl mb-[10px] p-[8px] font-bold w-[90%] text-white bg-red-800 rounded-lg ">Logout</button>

       
    </nav>
  );
};

export default Navbar;
