import React, { useEffect, useState } from 'react';
import { fs, auth } from '../Config/Config';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SemesterGpa = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await fs.collection('students').doc(user.uid).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            setResults(userData.results || []);
          } else {
            setError('No such document!');
          }
        } else {
          setError('No user is logged in');
        }
      } catch (err) {
        setError('Error fetching document: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const data = {
    labels: results.map(result => `Semester ${result.semester}`),
    datasets: [
      {
        label: 'GPA',
        data: results.map(result => result.gpa),
        backgroundColor: '#6d5700e7',
        borderColor: 'rgba(255, 255, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'white', // Color of x-axis labels
          font: {
            size: 14, // Font size for x-axis labels
            family: 'Arial', // Font family for x-axis labels
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.2)', // Color of y-axis grid lines
        },
        ticks: {
          color: 'white', // Color of y-axis labels
          font: {
            size: 14, // Font size for y-axis labels
            family: 'Arial', // Font family for y-axis labels
          },
        },
      },
    },
  };


  if (loading) {
    return <div className='h-[150px] '></div>;
  }

  if (error) {
    return <div className='text-red-500 p-[15px] border-2 border-red-600 rounded-xl'>{error}</div>;
  }

  return (
    <div>
      {results.length === 0 ? (
        <div>No results available</div>
      ) : (
        <div className="mx-auto md:w-[680px] h-[200px] w-[350px] md:h-[320px]"> {/* Adjust the width and height as needed */}
          <Bar data={data} options={options} />
        </div>
      )}
    </div> 
  );
};

export default SemesterGpa;
/*results.map((result, index) => (
            <div key={index} className="result">
              <div>GPA: {result.gpa}</div>
              <div>Semester: {result.semester}</div>
            </div>
          ))*/
