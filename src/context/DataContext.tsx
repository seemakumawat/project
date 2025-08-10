import React, { createContext, useContext, useState, useEffect } from 'react';

interface Student {
  id: string;
  name: string;
  email: string;
  cgpa: number;
  advisor: string;
  address: string;
  photoUrl?: string;
  trainingImages: number;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  course: string;
  date: string;
  time: string;
  status: 'present' | 'absent';
}

interface DataContextType {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  addAttendanceRecord: (record: Omit<AttendanceRecord, 'id'>) => void;
  getAttendanceByClass: (course: string, date: string) => AttendanceRecord[];
  exportAttendanceCSV: (course: string, date: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    // Load initial demo data
    const demoStudents: Student[] = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@university.edu',
        cgpa: 3.8,
        advisor: 'Dr. Johnson',
        address: '123 Campus Drive',
        trainingImages: 25,
      },
      {
        id: '2',
        name: 'Emma Wilson',
        email: 'emma.wilson@university.edu',
        cgpa: 3.9,
        advisor: 'Dr. Brown',
        address: '456 College Street',
        trainingImages: 30,
      },
      {
        id: '3',
        name: 'Michael Chen',
        email: 'michael.chen@university.edu',
        cgpa: 3.7,
        advisor: 'Dr. Davis',
        address: '789 University Avenue',
        trainingImages: 28,
      },
    ];

    const savedStudents = localStorage.getItem('eduface_students');
    const savedAttendance = localStorage.getItem('eduface_attendance');

    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    } else {
      setStudents(demoStudents);
      localStorage.setItem('eduface_students', JSON.stringify(demoStudents));
    }

    if (savedAttendance) {
      setAttendanceRecords(JSON.parse(savedAttendance));
    }
  }, []);

  const addStudent = (student: Omit<Student, 'id'>) => {
    const newStudent = { ...student, id: Date.now().toString() };
    const updatedStudents = [...students, newStudent];
    setStudents(updatedStudents);
    localStorage.setItem('eduface_students', JSON.stringify(updatedStudents));
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    const updatedStudents = students.map(student =>
      student.id === id ? { ...student, ...updates } : student
    );
    setStudents(updatedStudents);
    localStorage.setItem('eduface_students', JSON.stringify(updatedStudents));
  };

  const addAttendanceRecord = (record: Omit<AttendanceRecord, 'id'>) => {
    const newRecord = { ...record, id: Date.now().toString() };
    const updatedRecords = [...attendanceRecords, newRecord];
    setAttendanceRecords(updatedRecords);
    localStorage.setItem('eduface_attendance', JSON.stringify(updatedRecords));
  };

  const getAttendanceByClass = (course: string, date: string) => {
    return attendanceRecords.filter(
      record => record.course === course && record.date === date
    );
  };

  const exportAttendanceCSV = (course: string, date: string) => {
    const records = getAttendanceByClass(course, date);
    const csvContent = [
      ['Student Name', 'Course', 'Date', 'Time', 'Status'],
      ...records.map(record => [
        record.studentName,
        record.course,
        record.date,
        record.time,
        record.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${course}_${date}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <DataContext.Provider value={{
      students,
      attendanceRecords,
      addStudent,
      updateStudent,
      addAttendanceRecord,
      getAttendanceByClass,
      exportAttendanceCSV,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}