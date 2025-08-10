from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import io
import csv
from datetime import datetime
from werkzeug.utils import secure_filename

from face_recognition.face_detector import FaceRecognitionSystem
from training.training_manager import TrainingManager
from database.csv_storage import (
    ensure_csv_files_exist,
    get_all_students,
    get_student,
    add_student,
    record_attendance,
    get_attendance,
    export_attendance_csv,
)

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = Flask(__name__, static_folder="static")
CORS(app)

recognizer = FaceRecognitionSystem()
trainer = TrainingManager()
ensure_csv_files_exist()


@app.get("/")
def root():
    return send_file(os.path.join(BASE_DIR, "index.html"))


@app.get("/healthz")
def healthz():
    return jsonify({"ok": True})


@app.get("/api/students")
def api_list_students():
    return jsonify(get_all_students())


@app.post("/api/students")
def api_add_student():
    data = request.json or {}
    required = ["student_id", "name", "email"]
    if not all(data.get(k) for k in required):
        return jsonify({"error": "Missing required fields"}), 400
    ok = add_student(data)
    if not ok:
        return jsonify({"error": "student_id already exists"}), 409
    return jsonify({"ok": True})


@app.get("/api/attendance")
def api_get_attendance():
    course = request.args.get("course") or ""
    date = request.args.get("date") or ""
    if not course or not date:
        return jsonify({"error": "course and date are required"}), 400
    return jsonify(get_attendance(course, date))


@app.post("/api/attendance/recognize")
def api_recognize_and_record():
    course = request.form.get("course") or ""
    date = request.form.get("date") or ""
    time_str = request.form.get("time") or datetime.now().strftime("%H:%M:%S")
    if not course or not date:
        return jsonify({"error": "course and date are required"}), 400

    if "image" not in request.files:
        return jsonify({"error": "image file is required"}), 400

    image_file = request.files["image"]
    filename = secure_filename(image_file.filename or f"upload_{datetime.utcnow().timestamp()}.jpg")
    file_path = os.path.join(UPLOAD_DIR, filename)
    image_file.save(file_path)

    recognized = recognizer.process_image_for_attendance(file_path)

    results = []
    seen_ids = set()
    for r in recognized:
        student_id = str(r.get("student_id", ""))
        confidence = float(r.get("confidence", 0.0))
        if student_id and student_id not in seen_ids:
            seen_ids.add(student_id)
            record_attendance(student_id, course, date, time_str, status="present")
            student = get_student(student_id) or {"name": ""}
            results.append({
                "student_id": student_id,
                "student_name": student.get("name", ""),
                "confidence": confidence,
                "box": r.get("box", None),
            })

    return jsonify({"recognized": results})


@app.get("/api/attendance/export")
def api_export_attendance_csv():
    course = request.args.get("course") or ""
    date = request.args.get("date") or ""
    if not course or not date:
        return jsonify({"error": "course and date are required"}), 400

    matrix = export_attendance_csv(course, date)

    output = io.StringIO()
    writer = csv.writer(output)
    for row in matrix:
        writer.writerow(row)
    output.seek(0)

    return send_file(
        io.BytesIO(output.read().encode("utf-8")),
        mimetype="text/csv",
        as_attachment=True,
        download_name=f"attendance_{course}_{date}.csv",
    )


@app.post("/api/train")
def api_train():
    def _progress(message: str, pct: float):
        # Could stream logs; for now, ignore
        pass
    ok, msg = trainer.train_system(progress_callback=_progress)
    status = 200 if ok else 500
    return jsonify({"ok": ok, "message": msg}), status


@app.get("/api/train/stats")
def api_train_stats():
    return jsonify(trainer.get_training_statistics())


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8000)), debug=True)