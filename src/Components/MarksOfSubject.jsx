import React from 'react';
import { useLocation } from 'react-router-dom';
import { MdOutlineGrade } from "react-icons/md";
import { PiGraduationCapThin } from "react-icons/pi";

const MarksOfSubject = () => {
    const location = useLocation();
    const { selectedCourseMarks, courseName } = location.state || {};

    const calculateTotalWeightedMarks = () => {
        if (!selectedCourseMarks) return 0;
        return selectedCourseMarks.criteriaDefined.reduce((total, criterion) => {
            const obtainedMarks = selectedCourseMarks.studentMarks[criterion.assessment] || 0;
            const weightage = parseFloat(criterion.weightage) || 0;
            return total + ((obtainedMarks / criterion.totalMarks) * weightage);
        }, 0).toFixed(2);
    };

    return (
        <div className='ml-[10px] xsx:ml-[285px] mr-[12px] flex flex-col'>
            <h2 className='text-custom-blue my-[12px] border- text-2xl text-center font-bold p-[8px] rounded-2xl'>"{courseName}" Marks</h2>

            <div className='w-[95%] mb-[15px] mx-auto h-[2px] bg-custom-blue'></div>
            {selectedCourseMarks ? (
                <div>
                    <div className='bg-custom-blue  w-[265px] my-[25px] text-white border- text-2xl text-center font-serif p-[8px] rounded-2xl'>Grading Criteria</div>

                    <div class="relative  w-[100%] xl:w-[48%] mt-[25px] overflow-x-auto shadow-md sm:rounded-lg">
                        <table class="w-[100%] text-sm text-gray-400 dark:text-gray-400">
                            <thead class="text-lg text-gray-200 bg-gray-900">
                                <tr className='text-center'>
                                    <th scope="col" class="whitespace-nowrap px-6 py-3">Sr.No</th>
                                    <th scope="col" class="whitespace-nowrap px-6 py-3">Assessment Name</th>
                                    <th scope="col" class="whitespace-nowrap px-6 py-3">Weightage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedCourseMarks.criteriaDefined.map((criterion, index) => (
                                    <tr key={index} className='text-center odd:bg-white even:bg-gray-200 text-custom-blue text-lg'>
                                        <th scope="row" class="px-6 py-4 font-bold whitespace-nowrap e">{index}</th>
                                        <th scope="row" class="px-6 py-4 font-bold whitespace-nowrap e">{criterion.assessment}</th>
                                        <td className="whitespace-nowrap text-center">
                                            <p className=' bg-gray-700 text-white mx-auto  p-[6px] rounded-2xl'>{criterion.weightage}%</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className='shadow-custom-light w-[265px] my-[32px] text-custom-blue border- text-2xl text-center font-bold p-[8px] rounded-2xl'>Obtained Marks</div>
                    <div className='w-[95%] mb-[15px] mx-auto h-[2px] bg-custom-blue'></div>

                    <div class="relative w-[98%] mx-auto overflow-x-auto shadow-md sm:rounded-lg">
                        <table class="w-[100%] text-sm text-gray-500 dark:text-gray-400">
                            <thead class="text-md text-gray-200 uppercase bg-gray-700">
                                <tr className='text-center'>
                                    <th scope="col" class="whitespace-nowrap px-6 py-3">Assessment Type</th>
                                    <th scope="col" class="whitespace-nowrap px-6 py-3">Obtained Marks</th>
                                    <th scope="col" class="whitespace-nowrap px-6 py-3">Total Marks</th>
                                    <th scope="col" class="whitespace-nowrap px-6 py-3">Obtained Weighted Marks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedCourseMarks.criteriaDefined.map((criterion, index) => (
                                    <tr key={index} className='text-center odd:bg-white even:bg-gray-200 text-custom-blue text-lg'>
                                        <th scope="row" class="px-6 py-4 font-bold whitespace-nowrap e">{criterion.assessment}</th>
                                        <td className="whitespace-nowrap text-center px-6 py-4">{selectedCourseMarks.studentMarks[criterion.assessment]}</td>
                                        <td className="whitespace-nowrap text-center  px-6 py-4">{criterion.totalMarks}</td>
                                        <td className="whitespace-nowrap text-center">
                                            <p className=' bg-gray-700 text-white mx-auto w-[75px] p-[6px] rounded-2xl'>{(selectedCourseMarks.studentMarks[criterion.assessment] / criterion.totalMarks * criterion.weightage).toFixed(2)} </p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className='grid lg:grid-cols-2 gap-y-7 w-[85%] mx-auto mt-[25px] '>
                        <p className='shadow-custom-dark  h-[65px] flex mx-auto rounded-2xl justify-center items-center text-custom-blue p-[15px] xsx:w-[88%] w-[100%]'>
                            < PiGraduationCapThin size={45} />
                            <div className='ml-[5px] text-MD xsx:text-lg font-bold'>Total Weighted Marks:</div>
                            <div className='text-xl ml-[15px] bg-blue-950 py-[8px] text-white px-[4px] xsx:px-[15px] rounded-xl'>{calculateTotalWeightedMarks()}</div>
                        </p>
                        <p className='shadow-custom-dark h-[65px] flex mx-auto rounded-2xl justify-center items-center text-custom-blue p-[15px] xsx:w-[88%] w-[100%]'>
                            < MdOutlineGrade size={45} />
                            <div className='ml-[5px] text-xl font-bold'>Grade:</div>
                            <div className='text-xl ml-[15px] bg-blue-950 py-[8px] text-white px-[15px] rounded-xl'>{selectedCourseMarks.grade}</div>
                        </p>
                        <div className='h-[20px]'></div>
                    </div>


                </div>
            ) : (
                <p className='text-red-500  mt-[15px] p-[15px] border-2 border-red-600 rounded-xl'>No records for {courseName} found.</p>
            )}
        </div>
    );
};

export default MarksOfSubject;
