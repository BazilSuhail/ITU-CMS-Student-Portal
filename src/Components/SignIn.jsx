import React, { useState } from 'react';
import { auth, fs } from '../Config/Config';
import logo from "./itu.png";
import { useNavigate } from 'react-router-dom';
import { Circles } from 'react-loader-spinner';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      const departmentDoc = await fs.collection('students').doc(user.uid).get();
      if (departmentDoc.exists) {
        const departmentData = departmentDoc.data();
        // Redirect to the department's profile page
        navigate('/student-profile', { state: { name: departmentData.name, email: departmentData.email } });
      } else {
        setError('Student not found in database.');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const [emailClicked, setEmailClicked] = useState(false);
  const [passwordClicked, setPasswordClicked] = useState(false);

  return (
    <div className='fixed text-white bg-custom-blue w-screen h-screen z-50'>

      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-70 backdrop-blur-[6px] flex items-center justify-center z-50">
          <Circles
            height="60"
            width="60"
            color="rgb(143, 186, 255)"
            ariaLabel="circles-loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        </div>
      )}

      <img src={logo} alt="" className='mx-auto xsx:w-[200px] xsx:mt-[45px] mt-[65px] w-[150px] h-[150px] xsx:h-[200px] rounded-[50%] my-[20px]' />
      <div className=' w-[100vw] md:w-[600px] mx-auto p-[8px] md:p-[20px] flex flex-col items-center'>

        <h2 className='text-3xl font-bold xsx:mt-[-20px] mb-[25px]'>Student Portal</h2>
        <div className='h-[3px] w-[95%] mx-auto mb-[25px] bg-blue-50'></div>
        {error && <p className='text-red-500 font-medium '>{error}</p>}

        <h4 className='text-lg text-blue-50 self-start flex items-center xsx:pl-[12px] pl-[8px] font-medium'>Login with <p className='pl-[8px] underline text-blue-500'>Provided Credentials</p></h4>
        <form onSubmit={handleSignIn} className='flex flex-col w-[95%]'>

          <div className='relative my-6'>
            <label
              className={`absolute left-3 top-[15px] bg-custom-blue text-white font-medium transition-transform duration-300 transform ${emailClicked || email ? 'scale-85 -translate-y-[28px] translate-x-[5px]' : ''
                }`}
              htmlFor="email"
              onClick={() => setEmailClicked(true)}
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              className="rounded-lg bg-custom-blue border font-normal text-[25px] text-white p-[8px] border-white w-full focus:outline-none"
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailClicked(true)}
              onBlur={(e) => setEmailClicked(e.target.value !== '')}
              required
            />
          </div>

          <div className='relative mb-6'>
            <label
              className={`absolute left-3 top-[15px] bg-custom-blue text-white  font-medium transition-transform duration-300 transform ${passwordClicked || password ? 'scale-85 -translate-y-[28px] translate-x-[5px]' : ''
                }`}
              htmlFor="password"
              onClick={() => setPasswordClicked(true)}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              className="rounded-lg bg-custom-blue border font-normal text-[25px] text-white p-[8px] border-white w-full focus:outline-none"
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordClicked(true)}
              onBlur={(e) => setPasswordClicked(e.target.value !== '')}
              required
            />
          </div>

          <button type="submit" className='bg-blue-600 w-full font-medium p-[8px] text-2xl rounded-2xl mb-[35px]' disabled={loading}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
