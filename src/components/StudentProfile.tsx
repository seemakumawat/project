import React, { useState } from 'react';
import { Camera, Search, User, Mail, BookOpen, MapPin, Award, UserCheck } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function StudentProfile() {
  const { students } = useData();
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const simulateFaceRecognition = () => {
    setIsScanning(true);
    setSelectedStudent(null);

    setTimeout(() => {
      // Randomly select a student to simulate face recognition
      const randomStudent = students[Math.floor(Math.random() * students.length)];
      setSelectedStudent(randomStudent);
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Profiles</h1>
        <p className="text-gray-600 mt-2">Identify students and view their detailed profiles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Face Recognition Scanner */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <Camera className="h-5 w-5 text-blue-600" />
            <span>Face Recognition Scanner</span>
          </h2>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-6">
            {isScanning ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto flex items-center justify-center">
                  <Camera className="h-8 w-8 text-white animate-pulse" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Scanning Face...</h3>
                <p className="text-gray-600">Processing with MTCNN and FaceNet</p>
                <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto flex items-center justify-center">
                  <UserCheck className="h-8 w-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Identify Student</h3>
                <p className="text-gray-600">Point camera at student to view their profile</p>
                <button
                  onClick={simulateFaceRecognition}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Camera className="h-5 w-5" />
                  <span>Start Recognition</span>
                  
        
              </div>
            )}
          </div>

          {/* Search Alternative */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <Search className="h-5 w-5 text-gray-600" />
              <span>Quick Search</span>
            </h3>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />
            {searchTerm && (
              <div className="max-h-40 overflow-y-auto space-y-2">
                {filteredStudents.map(student => (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-600">{student.email}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Student Profile Display */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <User className="h-5 w-5 text-green-600" />
            <span>Student Profile</span>
          </h2>

          {selectedStudent ? (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="text-center pb-6 border-b border-gray-200">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedStudent.name}</h3>
                <p className="text-gray-600">Student ID: {selectedStudent.id}</p>
              </div>

              {/* Profile Details */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{selectedStudent.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Award className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">CGPA</p>
                    <p className="font-medium text-gray-900">{selectedStudent.cgpa}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Academic Advisor</p>
                    <p className="font-medium text-gray-900">{selectedStudent.advisor}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium text-gray-900">{selectedStudent.address}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Camera className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Training Images</p>
                    <p className="font-medium text-gray-900">{selectedStudent.trainingImages} images</p>
                  </div>
                </div>
              </div>

              {/* Recognition Status */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Successfully Identified</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Face recognition confidence: 95.2%
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Student Selected</h3>
              <p className="text-gray-600">Use face recognition or search to view a student profile</p>
            </div>
          )}
        </div>
      </div>

      {/* Students Overview */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">All Students</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map(student => (
            <button
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{student.name}</p>
                  <p className="text-sm text-gray-600">CGPA: {student.cgpa}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">{student.email}</p>
              <div className="mt-2">
                <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                  student.trainingImages > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {student.trainingImages > 0 ? 'Trained' : 'Not Trained'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}