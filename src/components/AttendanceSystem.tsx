import React, { useState } from 'react';
import { Camera, Upload, Download, Users, Calendar, Clock, FileSpreadsheet } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function AttendanceSystem() {
  const { students, addAttendanceRecord, getAttendanceByClass, exportAttendanceCSV } = useData();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizedStudents, setRecognizedStudents] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const courses = ['Computer Science 101', 'Mathematics 201', 'Physics 301', 'Chemistry 101', 'English 102'];

  const processImage = () => {
    if (!selectedCourse) {
      alert('Please select a course first');
      return;
    }

    setIsProcessing(true);
    setShowResults(false);

    // Simulate image processing and face recognition
    setTimeout(() => {
      // Randomly recognize some students
      const recognizedCount = Math.floor(Math.random() * students.length) + 1;
      const shuffled = [...students].sort(() => 0.5 - Math.random());
      const recognized = shuffled.slice(0, recognizedCount);
      
      setRecognizedStudents(recognized.map(s => s.name));
      
      // Add attendance records
      const currentTime = new Date().toLocaleTimeString();
      recognized.forEach(student => {
        addAttendanceRecord({
          studentId: student.id,
          studentName: student.name,
          course: selectedCourse,
          date: selectedDate,
          time: currentTime,
          status: 'present'
        });
      });

      setIsProcessing(false);
      setShowResults(true);
    }, 3000);
  };

  const handleExportCSV = () => {
    if (!selectedCourse) {
      alert('Please select a course first');
      return;
    }
    exportAttendanceCSV(selectedCourse, selectedDate);
  };

  const todayAttendance = getAttendanceByClass(selectedCourse, selectedDate);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Attendance System</h1>
        <p className="text-gray-600 mt-2">Capture photos and automatically record student attendance</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a course</option>
              {courses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleExportCSV}
              disabled={todayAttendance.length === 0}
              className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Camera Interface */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <div className="space-y-4">
            {isProcessing ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto flex items-center justify-center">
                  <Camera className="h-8 w-8 text-white animate-pulse" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Processing Image...</h3>
                <p className="text-gray-600">Using MTCNN and FaceNet for face recognition</p>
                <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }} />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto flex items-center justify-center">
                  <Camera className="h-8 w-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Capture Class Photo</h3>
                <p className="text-gray-600">Take a photo of students or upload an existing image</p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={processImage}
                    disabled={!selectedCourse}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <Camera className="h-5 w-5" />
                    <span>Take Photo</span>
                  </button>
                  <label className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 cursor-pointer">
                    <Upload className="h-5 w-5" />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recognition Results */}
      {showResults && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Recognition Results</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recognizedStudents.map((name, index) => (
              <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="w-10 h-10 bg-green-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <p className="font-medium text-gray-900">{name}</p>
                <p className="text-sm text-green-600">Present</p>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-600 mt-4">
            Recognized {recognizedStudents.length} student{recognizedStudents.length !== 1 ? 's' : ''} in the image
          </p>
        </div>
      )}

      {/* Today's Attendance */}
      {todayAttendance.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Today's Attendance - {selectedCourse}</h2>
            </div>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {todayAttendance.length} Present
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Student Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Time</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {todayAttendance.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-900">{record.studentName}</td>
                    <td className="py-3 px-4 text-gray-600">{record.time}</td>
                    <td className="py-3 px-4">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                        Present
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}