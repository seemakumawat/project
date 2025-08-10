import os
import csv
from datetime import datetime
from typing import List, Dict, Optional

STUDENTS_CSV_PATH = os.path.join("database", "students.csv")
ATTENDANCE_CSV_PATH = os.path.join("database", "attendance.csv")

STUDENT_HEADERS = [
    "student_id",
    "name",
    "email",
    "cgpa",
    "advisor",
    "address",
    "created_at",
]

ATTENDANCE_HEADERS = [
    "id",
    "student_id",
    "course_name",
    "date",
    "time",
    "status",
    "created_at",
]


def _ensure_parent_dir_exists(path: str) -> None:
    parent_dir = os.path.dirname(path)
    if parent_dir:
        os.makedirs(parent_dir, exist_ok=True)


def ensure_csv_files_exist() -> None:
    _ensure_parent_dir_exists(STUDENTS_CSV_PATH)
    _ensure_parent_dir_exists(ATTENDANCE_CSV_PATH)

    if not os.path.exists(STUDENTS_CSV_PATH):
        with open(STUDENTS_CSV_PATH, mode="w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=STUDENT_HEADERS)
            writer.writeheader()

    if not os.path.exists(ATTENDANCE_CSV_PATH):
        with open(ATTENDANCE_CSV_PATH, mode="w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=ATTENDANCE_HEADERS)
            writer.writeheader()


def _read_csv(path: str) -> List[Dict[str, str]]:
    if not os.path.exists(path):
        return []
    with open(path, mode="r", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return [dict(row) for row in reader]


def _write_csv(path: str, headers: List[str], rows: List[Dict[str, str]]) -> None:
    _ensure_parent_dir_exists(path)
    with open(path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        for row in rows:
            writer.writerow({k: row.get(k, "") for k in headers})


def get_all_students() -> List[Dict[str, str]]:
    ensure_csv_files_exist()
    rows = _read_csv(STUDENTS_CSV_PATH)
    # Sort by name for consistent ordering
    return sorted(rows, key=lambda r: r.get("name", "").lower())


def get_student(student_id: str) -> Optional[Dict[str, str]]:
    ensure_csv_files_exist()
    for row in _read_csv(STUDENTS_CSV_PATH):
        if row.get("student_id") == student_id:
            return row
    return None


def add_student(student: Dict[str, str]) -> bool:
    """Add a student. Returns False if student_id already exists."""
    ensure_csv_files_exist()
    student_id = student.get("student_id", "").strip()
    if not student_id:
        return False

    rows = _read_csv(STUDENTS_CSV_PATH)
    for row in rows:
        if row.get("student_id") == student_id:
            return False

    now = datetime.utcnow().isoformat()
    new_row = {
        "student_id": student_id,
        "name": student.get("name", "").strip(),
        "email": student.get("email", "").strip(),
        "cgpa": str(student.get("cgpa", "")),
        "advisor": student.get("advisor", "").strip(),
        "address": student.get("address", "").strip(),
        "created_at": now,
    }

    rows.append(new_row)
    _write_csv(STUDENTS_CSV_PATH, STUDENT_HEADERS, rows)
    return True


def _get_next_attendance_id(rows: List[Dict[str, str]]) -> int:
    max_id = 0
    for row in rows:
        try:
            max_id = max(max_id, int(row.get("id", "0")))
        except ValueError:
            continue
    return max_id + 1


def record_attendance(student_id: str, course_name: str, date: str, time: str, status: str = "present") -> Dict[str, str]:
    ensure_csv_files_exist()
    rows = _read_csv(ATTENDANCE_CSV_PATH)

    now = datetime.utcnow().isoformat()
    next_id = _get_next_attendance_id(rows)

    new_row = {
        "id": str(next_id),
        "student_id": student_id,
        "course_name": course_name,
        "date": date,
        "time": time,
        "status": status,
        "created_at": now,
    }

    rows.append(new_row)
    _write_csv(ATTENDANCE_CSV_PATH, ATTENDANCE_HEADERS, rows)
    return new_row


def get_attendance(course_name: str, date: str) -> List[Dict[str, str]]:
    ensure_csv_files_exist()
    attendance_rows = [r for r in _read_csv(ATTENDANCE_CSV_PATH) if r.get("course_name") == course_name and r.get("date") == date]

    # Join student names
    students_index = {s["student_id"]: s for s in _read_csv(STUDENTS_CSV_PATH)}
    for row in attendance_rows:
        student = students_index.get(row.get("student_id", ""))
        row["student_name"] = student.get("name") if student else ""
    # Sort by time
    attendance_rows.sort(key=lambda r: r.get("time", ""))
    return attendance_rows


def export_attendance_csv(course_name: str, date: str) -> List[List[str]]:
    """Return a CSV matrix for the requested attendance (including header)."""
    records = get_attendance(course_name, date)
    header = ["Student Name", "Student ID", "Course", "Date", "Time", "Status"]
    rows: List[List[str]] = [header]
    for r in records:
        rows.append([
            r.get("student_name", ""),
            r.get("student_id", ""),
            r.get("course_name", ""),
            r.get("date", ""),
            r.get("time", ""),
            r.get("status", ""),
        ])
    return rows