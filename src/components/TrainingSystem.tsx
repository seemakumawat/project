import React, { useState } from 'react';
import { Camera, Upload, User, Mail, MapPin, BookOpen, Plus, Check } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function TrainingSystem() {
  const { students, addStudent, updateStudent } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [trainingProgress, setTrainingProgress] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cgpa: '',
    advisor: '',
    address: '',
  });

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    addStudent({
      ...formData,
      cgpa: parseFloat(formData.cgpa),
      trainingImages: 0,
    });
    setFormData({ name: '', email: '', cgpa: '', advisor: '', address: '' });
    setShowAddForm(false);
  };

  const startTraining = (studentId: string) => {
    setSelectedStudent(studentId);
    setTrainingProgress('0');
    
    // Simulate training progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          updateStudent(studentId, { trainingImages: Math.floor(Math.random() * 15) + 20 });
          setTrainingProgress(null);
          setSelectedStudent(null);
        }, 1000);
      }
      setTrainingProgress(progress.toFixed(0));
    }, 200);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Training System</h1>
          <p className="text-gray-600 mt-2">Capture and train face recognition models for students</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Add Student Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Student</h2>
          <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Academic Advisor</label>
              <input
                type="text"
                value={formData.advisor}
                onChange={(e) => setFormData({ ...formData, advisor: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                required
              />
            </div>
            <div className="md:col-span-2 flex space-x-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Student
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((student) => (
          <div key={student.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{student.name}</h3>
                <p className="text-sm text-gray-600">{student.email}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <BookOpen className="h-4 w-4" />
                <span>CGPA: {student.cgpa}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>Advisor: {student.advisor}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{student.address}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Training Images</span>
                <span className={`text-sm font-bold ${student.trainingImages > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                  {student.trainingImages}
                </span>
              </div>

              {selectedStudent === student.id && trainingProgress !== null ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Training Progress</span>
                    <span className="font-medium">{trainingProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${trainingProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => startTraining(student.id)}
                  disabled={selectedStudent !== null}
                  className={`w-full py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                    student.trainingImages > 0
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } ${selectedStudent !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {student.trainingImages > 0 ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Retrain Model</span>
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4" />
                      <span>Start Training</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}