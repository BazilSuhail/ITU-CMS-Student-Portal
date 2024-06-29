import React, { useState } from 'react';
import { auth, fs } from '../Config/Config';

import logo from "./itu.png"
import { useNavigate } from 'react-router-dom';

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

  return (
    <div className='fixed text-white bg-custom-blue w-screen h-screen z-50'>
      <img src={logo} alt="" className='mx-auto xsx:w-[200px] xsx:mt-[45px] mt-[65px] w-[150px] h-[150px] xsx:h-[200px] rounded-[50%] my-[20px]' />
      <div className='border rounded-xl border-white w-[95vw] md:w-[600px] font-extrabold mx-auto p-[12px] md:p-[20px] flex flex-col items-center'>

        <h2 className='text-3xl'>Sign In</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSignIn} className='flex flex-col w-[95%]'>

          <div className='text-lg text-blue-200 mb-[5px] font-normal'>Email:</div>
          <input
            type="email"
            id="email"
            placeholder='Enter Assigned Email....'
            value={email}
            className='rounded-lg bg-custom-blue border placeholder:font-thin font-normal text-lg text-white p-[8px] border-white'
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className='text-lg text-blue-200 mb-[5px] mt-[15px] font-normal'>Password:</div>
          <input
            type="password"
            id="password"

            placeholder='Enter Password'
            className='rounded-lg bg-custom-blue border placeholder:font-thin text-lg text-white p-[8px] border-white'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className='bg-blue-600 w-[100%] font-medium p-[8px] text-2xl rounded-2xl my-[35px]' disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
