import React from 'react';
import { Users, Camera, Clock, BookOpen, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { students, attendanceRecords } = useData();
  const { user } = useAuth();

  const todayDate = new Date().toISOString().split('T')[0];
  const todayAttendance = attendanceRecords.filter(record => record.date === todayDate);
  const totalClasses = [...new Set(attendanceRecords.map(record => record.course))].length;
  const trainedStudents = students.filter(student => student.trainingImages > 0).length;

  const stats = [
    {
      title: 'Total Students',
      value: students.length,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Trained Models',
      value: trainedStudents,
      icon: Camera,
      color: 'bg-green-500',
      change: '+8%',
    },
    {
      title: 'Today\'s Attendance',
      value: todayAttendance.length,
      icon: Clock,
      color: 'bg-orange-500',
      change: '+15%',
    },
    {
      title: 'Active Classes',
      value: totalClasses,
      icon: BookOpen,
      color: 'bg-purple-500',
      change: '+5%',
    },
  ];

  const recentAttendance = attendanceRecords.slice(-5).reverse();

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.username}!</h1>
        <p className="text-blue-100 text-lg">
          Monitor your attendance system performance and manage student data
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">{stat.change}</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-gray-600">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Attendance */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Recent Attendance</span>
            </h2>
          </div>
          <div className="p-6">
            {recentAttendance.length > 0 ? (
              <div className="space-y-4">
                {recentAttendance.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {record.status === 'present' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{record.studentName}</p>
                        <p className="text-sm text-gray-600">{record.course}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{record.time}</p>
                      <p className="text-sm text-gray-600">{record.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent attendance records</p>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>System Status</span>
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium text-gray-900">Face Detection</span>
              </div>
              <span className="text-green-600 font-bold">100%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                <span className="font-medium text-gray-900">Face Recognition</span>
              </div>
              <span className="text-blue-600 font-bold">95%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-orange-500" />
                <span className="font-medium text-gray-900">MTCNN Model</span>
              </div>
              <span className="text-orange-600 font-bold">Active</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-purple-500" />
                <span className="font-medium text-gray-900">FaceNet Model</span>
              </div>
              <span className="text-purple-600 font-bold">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}