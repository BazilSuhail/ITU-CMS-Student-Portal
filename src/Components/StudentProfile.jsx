import React, { useState, useEffect } from 'react';
import { auth, fs } from '../Config/Config'; 

const StudentProfile = () => {
  const [userData, setUserData] = useState(null);
  const [className, setClassName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);

      try {
        const currentUser = auth.currentUser;

        if (currentUser) {
          const docRef = await fs.collection('students').doc(currentUser.uid).get();
          if (docRef.exists) {
            const userData = docRef.data();
            setUserData(userData);

            if (userData.classId) {
              const classDoc = await fs.collection('classes').doc(userData.classId).get();
              if (classDoc.exists) {
                setClassName(classDoc.data().name);
              } else {
                setClassName('Unknown Class');
              }
            } else {
              setClassName('No Class ID');
            }
          } else {
            setError('No user data found');
          }
        } else {
          setError('No authenticated user found');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h2>Student Profile</h2>
      {userData ? (
        <div>
          <p><strong>Name:</strong> {userData.name}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Phone:</strong> {userData.phone}</p>
          <p><strong>Date of Birth:</strong> {userData.dob}</p>
          <p><strong>Class Name:</strong> {className}</p>
        </div>
      ) : (
        <p>No user data available</p>
      )}
    </div>
  );
};

export default StudentProfile;
