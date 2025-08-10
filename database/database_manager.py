import sqlite3
import os
from datetime import datetime

class DatabaseManager:
    def __init__(self, db_path="database/students.db"):
        self.db_path = db_path
        self.ensure_database_exists()
        self.create_tables()
    
    def ensure_database_exists(self):
        """Ensure the database directory exists"""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
    
    def create_tables(self):
        """Create necessary tables if they don't exist"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Students table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                cgpa REAL,
                advisor TEXT,
                address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Attendance table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT NOT NULL,
                course_name TEXT NOT NULL,
                date TEXT NOT NULL,
                time TEXT NOT NULL,
                status TEXT DEFAULT 'present',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students (student_id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def add_student(self, student_id, name, email, cgpa, advisor, address):
        """Add a new student to the database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO students (student_id, name, email, cgpa, advisor, address)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (student_id, name, email, cgpa, advisor, address))
            conn.commit()
            return True
        except sqlite3.IntegrityError:
            return False
        finally:
            conn.close()
    
    def get_student(self, student_id):
        """Get student information by ID"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM students WHERE student_id = ?', (student_id,))
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return {
                'id': result[0],
                'student_id': result[1],
                'name': result[2],
                'email': result[3],
                'cgpa': result[4],
                'advisor': result[5],
                'address': result[6],
                'created_at': result[7]
            }
        return None
    
    def get_all_students(self):
        """Get all students from the database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM students ORDER BY name')
        results = cursor.fetchall()
        conn.close()
        
        students = []
        for result in results:
            students.append({
                'id': result[0],
                'student_id': result[1],
                'name': result[2],
                'email': result[3],
                'cgpa': result[4],
                'advisor': result[5],
                'address': result[6],
                'created_at': result[7]
            })
        return students
    
    def record_attendance(self, student_id, course_name, date, time):
        """Record attendance for a student"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO attendance (student_id, course_name, date, time)
            VALUES (?, ?, ?, ?)
        ''', (student_id, course_name, date, time))
        
        conn.commit()
        conn.close()
    
    def get_attendance(self, course_name, date):
        """Get attendance records for a specific course and date"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT a.*, s.name 
            FROM attendance a
            JOIN students s ON a.student_id = s.student_id
            WHERE a.course_name = ? AND a.date = ?
            ORDER BY a.time
        ''', (course_name, date))
        
        results = cursor.fetchall()
        conn.close()
        
        attendance_records = []
        for result in results:
            attendance_records.append({
                'id': result[0],
                'student_id': result[1],
                'course_name': result[2],
                'date': result[3],
                'time': result[4],
                'status': result[5],
                'student_name': result[7]
            })
        return attendance_records