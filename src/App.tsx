import React, { useState, useEffect } from 'react';
import { Users, Camera, BookOpen, User, LogOut, LogIn as Login, GraduationCap, Clock, FileSpreadsheet } from 'lucide-react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import TrainingSystem from './components/TrainingSystem';
import AttendanceSystem from './components/AttendanceSystem';
import StudentProfile from './components/StudentProfile';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

function AppContent() {
  const { isAuthenticated, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Lokmanya College</h1>
                <p className="text-sm text-gray-600">Smart Attendance System</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-lg min-h-screen border-r border-gray-200">
          <div className="p-6">
            <div className="space-y-2">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  currentPage === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <BookOpen className="h-5 w-5" />
                <span className="font-medium">Dashboard</span>
              </button>
              <button
                onClick={() => setCurrentPage('training')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  currentPage === 'training'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <Camera className="h-5 w-5" />
                <span className="font-medium">Training System</span>
              </button>
              <button
                onClick={() => setCurrentPage('attendance')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  currentPage === 'attendance'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <Clock className="h-5 w-5" />
                <span className="font-medium">Attendance</span>
              </button>
              <button
                onClick={() => setCurrentPage('profile')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  currentPage === 'profile'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <Users className="h-5 w-5" />
                <span className="font-medium">Student Profiles</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'training' && <TrainingSystem />}
          {currentPage === 'attendance' && <AttendanceSystem />}
          {currentPage === 'profile' && <StudentProfile />}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;