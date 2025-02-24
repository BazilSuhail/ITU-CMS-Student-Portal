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

import logo from "../Assets/itu.png";
import profile from "../Assets/Profile1.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isXsx, setIsXsx] = useState(window.innerWidth >= 1600);
  const [loading, setLoading] = useState(true); // Loading state
   
  useEffect(() => {
    const fetchUserName = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await fs.collection("students").doc(user.uid).get();
          if (userDoc.exists) {
            setUserName(userDoc.data().name);
            //console.log("Fetched name = " + userName);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false); 
      }
    };
  
    const handleResize = () => {
      setIsXsx(window.innerWidth >= 1600);
    };
  
    setTimeout(() => {
      fetchUserName();
      window.addEventListener('resize', handleResize);
    }, 1000);
  
    return () => window.removeEventListener('resize', handleResize);
  });
  

  const handleLogout = async () => {
    try {

      await auth.signOut();
      navigate("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const firstName = userName.split(' ')[0];

  return (
    <nav>
      {/* Navbar for larger screens */}
      <div className="mt-[6px] fixed hidden xsx:flex xsx:flex-col xsx:justify-between shadow-xl rounded-2xl m-[10px] xsx:items-center w-[260px] h-[98vh] bg-custom-blue p-[10px]">
        <div className="mt-[8px] w-[100%] flex">
          <img src={profile} alt="" className="ml-[5px] border-[3px] border-custom-back-grey mt-[3px] rounded-full w-[65px] h-[65px] " />
          <div className="ml-[15px] flex flex-col justify-start items-start">
            <div className="text-white text-[12px] mt-[10px] text-md text-center">Welcome,</div>
            {loading ? (
              <p className="text-white text-sm text-center">Loading name...</p>
            ) : (
                <p className="text-white text-[28px] text-center">{firstName}!</p>
            )}

          </div>
        </div>
        <div className="flex text-white flex-col w-[98%] mt-[-25px]">
          <NavLink
            to="/student-profile"
            className={({ isActive }) =>
              `flex items-center p-2 rounded-md text-md ${isActive ? 'bg-custom-back-grey text-white font-[600] my-[6px]' : 'my-[6px] hover:bg-custom-back-grey hover:rounded-2xl hover:font-[600] text-white'}`
            }
          >
            <PiStudentDuotone className="text-custom-sz mr-2" />
            <p className="mt-0">Dashboard</p>
          </NavLink>

          <NavLink
            to="/completedcourses"
            className={({ isActive }) =>
              `flex items-center p-2 rounded-md text-md ${isActive ? 'bg-custom-back-grey text-white font-[600] my-[6px]' : 'my-[6px] hover:bg-custom-back-grey hover:rounded-2xl hover:font-[600] text-white'}`
            }
          >
            <LuBookOpen className="text-custom-sz mr-2" />
            <p className="">Academia</p>
          </NavLink>
          <NavLink
            to="/attendance"
            className={({ isActive }) =>
              `flex items-center p-2 rounded-md text-md ${isActive ? 'bg-custom-back-grey text-white font-[600] my-[6px]' : 'my-[6px] hover:bg-custom-back-grey hover:rounded-2xl hover:font-[600] text-white'}`
            }
          >
            <TbSquareRoundedPercentage className="text-custom-sz mr-2" />
            <p>Attendance</p>
          </NavLink>

          <NavLink
            to="/viewmarks"
            className={({ isActive }) =>
              `flex items-center p-2 rounded-md text-md ${isActive ? 'bg-custom-back-grey text-white font-[600] my-[6px]' : 'my-[6px] hover:bg-custom-back-grey hover:rounded-2xl hover:font-[600] text-white'}`
            }>
            <IoMdBookmarks className="text-custom-sz mr-2" />
            <p>Marks</p>
          </NavLink>

          <div className="w-[95%] rounded-lg h-[2px] bg-custom-back-grey mx-auto my-[5px]"></div>

          <div className="ml-[6px] text-lg mb-[14px]">Checkout</div>

          <NavLink to="/enrollcourses" className="ml-[15px] mt-[6px] hover:bg-custom-back-grey hover:rounded-xl hover:font-[600]  text-sm  text-white rounded-md p-[8px] w-[90%] flex flex-row "> <MdScreenRotation className="mb-[5px] mr-[4px] text-custom-size" /><p className="mt-[2px]">Enroll Courses</p></NavLink>
          <NavLink to="/withdrawcourses" className="ml-[15px] mt-[6px] hover:bg-custom-back-grey hover:rounded-xl hover:font-[600]  text-sm  text-white rounded-md p-[8px] w-[90%] flex flex-row "> <PiHandWithdrawLight className="mb-[5px] mr-[4px] text-custom-size" /><p className="mt-[2px]">Withdraw Courses</p></NavLink>
        </div>
        <button onClick={handleLogout} className="text-[18px] mb-[10px] py-[6px] font-[600] w-[90%] text-white bg-red-800 rounded-lg ">Logout</button>
      </div>

      {/* Navbar for small screens */}
      {location.pathname !== '/signin' && (
        <div className="xsx:hidden bg-custom-blue w-full h-[80px] z-35 flex items-center" onClick={toggleNavbar}>
          <img src={logo} alt="" className="w-[50px] ml-[14px] h-[50px] " />
          <button className="text-white ml-auto mr-[18px]">{isOpen ? <p></p> : <p><RiMenu3Line size={25} /></p>}</button>
        </div>
      )}

      {/* Conditionally render the first div for smaller screens */}
      {!isXsx && isOpen && (
        <div className="w-[100vw] fixed h-[100vh] flex backdrop-filter-lg z-50 bg-[white]/40 backdrop-blur-[5px] justify-center items-center">
          <div className={`z-40 flex flex-col justify-between items-center w-[320px] mt-[-125px] h-[80vh] bg-custom-blue p-[10px] shadow-xl rounded-2xl mx-[10px] transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <button className="bg-red-500 cursor-pointer text-white rounded-full p-[8px] ml-auto mb-[-85px]" onClick={toggleNavbar}>
              <ImCross size={12} />
            </button>

            <div className="w-[100%] flex">
              <img src={profile} alt="" className="ml-[15px] w-[65px] h-[65px] mt-[8px]" />
              <div className="ml-[15px] flex flex-col justify-start items-start">
                <div className="text-white mt-[13px] mb-[-5px] text-[12px] text-center">Welcome,</div>

                {loading ? (
                  <p className="text-white text-[27px] text-center">Loading name...</p>
                ) : (
                  <div className="text-white mt-[5px] text-[27px] text-center">{firstName} !!</div>
                )}
              </div>
            </div>

            <div className="flex text-white flex-col w-[98%] mt-[-25px]">
              <NavLink
                to="/student-profile" onClick={toggleNavbar}
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-md text-md ${isActive ? 'bg-custom-back-grey text-white font-[600] my-[6px]' : 'my-[6px] hover:bg-custom-back-grey hover:rounded-2xl hover:font-[600] text-white'}`
                }
              >
                <PiStudentDuotone className="text-custom-sz mr-2" />
                <p className="mt-0">Dashboard</p>
              </NavLink>

              <NavLink
                to="/completedcourses" onClick={toggleNavbar}
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-md text-md ${isActive ? 'bg-custom-back-grey text-white font-[600] my-[6px]' : 'my-[6px] hover:bg-custom-back-grey hover:rounded-2xl hover:font-[600] text-white'}`
                }
              >
                <LuBookOpen className="text-custom-sz mr-2" />
                <p className="">Academia</p>
              </NavLink>

              <NavLink
                to="/attendance" onClick={toggleNavbar}
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-md text-md ${isActive ? 'bg-custom-back-grey text-white font-[600] my-[6px]' : 'my-[6px] hover:bg-custom-back-grey hover:rounded-2xl hover:font-[600] text-white'}`
                }
              >
                <TbSquareRoundedPercentage className="text-custom-sz mr-2" />
                <p>Attendance</p>
              </NavLink>

              <NavLink onClick={toggleNavbar}
                to="/viewmarks"
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-md text-md ${isActive ? 'bg-custom-back-grey text-white font-[600] my-[6px]' : 'my-[6px] hover:bg-custom-back-grey hover:rounded-2xl hover:font-[600] text-white'}`
                }
              >
                <IoMdBookmarks className="text-custom-sz mr-2" />
                <p>Marks</p>
              </NavLink>

              <div className="w-[95%] rounded-lg h-[2px] bg-custom-back-grey mx-auto my-[5px]"></div>

              <div className="ml-[6px] text-lg mb-[14px]">Checkout</div>

              <NavLink onClick={toggleNavbar} to="/enrollcourses" className="ml-[15px] mt-[6px] hover:bg-custom-back-grey hover:rounded-xl hover:font-[600] text-sm text-white rounded-md p-[8px] w-[90%] flex flex-row">
                <MdScreenRotation className="mb-[5px] mr-[4px] text-custom-size" />
                <p className="mt-[2px]">Enroll Courses</p>
              </NavLink>

              <NavLink onClick={toggleNavbar} to="/withdrawcourses" className="ml-[15px] mt-[6px] hover:bg-custom-back-grey hover:rounded-xl hover:font-[600] text-sm text-white rounded-md p-[8px] w-[90%] flex flex-row">
                <PiHandWithdrawLight className="mb-[5px] mr-[4px] text-custom-size" />
                <p className="mt-[2px]">Withdraw Courses</p>
              </NavLink>
            </div>

            <button onClick={handleLogout} className="text-[16px] mb-[10px] p-[8px] font-[600] w-[90%] text-white bg-red-800 rounded-lg">
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
