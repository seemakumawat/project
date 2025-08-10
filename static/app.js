const API_BASE = '';

function $(sel) { return document.querySelector(sel); }
function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') e.className = v; else if (k === 'html') e.innerHTML = v; else e.setAttribute(k, v);
  });
  children.forEach(c => e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
  return e;
}

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function loadStudents() {
  const list = $('#students-list');
  list.innerHTML = 'Loading...';
  try {
    const students = await fetchJSON(`${API_BASE}/api/students`);
    const table = el('table', { class: 'table' });
    const thead = el('thead', {}, [el('tr', {}, [
      el('th', { html: 'Student ID' }),
      el('th', { html: 'Name' }),
      el('th', { html: 'Email' }),
      el('th', { html: 'CGPA' }),
      el('th', { html: 'Advisor' }),
      el('th', { html: 'Address' }),
    ])]);
    const tbody = el('tbody');
    for (const s of students) {
      tbody.appendChild(el('tr', {}, [
        el('td', { html: s.student_id || '' }),
        el('td', { html: s.name || '' }),
        el('td', { html: s.email || '' }),
        el('td', { html: s.cgpa || '' }),
        el('td', { html: s.advisor || '' }),
        el('td', { html: s.address || '' }),
      ]));
    }
    table.appendChild(thead); table.appendChild(tbody);
    list.innerHTML = ''; list.appendChild(table);
  } catch (e) {
    list.innerHTML = 'Failed to load students';
  }
}

async function submitAddStudent(evt) {
  evt.preventDefault();
  const form = evt.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    await fetchJSON(`${API_BASE}/api/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    form.reset();
    await loadStudents();
  } catch (e) {
    alert('Failed to add student: ' + e.message);
  }
}

function getInputs() {
  const course = $('#course').value.trim();
  const date = $('#date').value.trim();
  const time = $('#time').value.trim();
  return { course, date, time };
}

async function loadAttendance() {
  const { course, date } = getInputs();
  const tableHolder = $('#attendance-table');
  tableHolder.innerHTML = 'Loading...';
  if (!course || !date) { tableHolder.innerHTML = 'Enter course and date'; return; }
  try {
    const records = await fetchJSON(`${API_BASE}/api/attendance?course=${encodeURIComponent(course)}&date=${encodeURIComponent(date)}`);
    const table = el('table', { class: 'table' });
    const thead = el('thead', {}, [el('tr', {}, [
      el('th', { html: 'Student Name' }),
      el('th', { html: 'Student ID' }),
      el('th', { html: 'Time' }),
      el('th', { html: 'Status' }),
    ])]);
    const tbody = el('tbody');
    for (const r of records) {
      tbody.appendChild(el('tr', {}, [
        el('td', { html: r.student_name || '' }),
        el('td', { html: r.student_id || '' }),
        el('td', { html: r.time || '' }),
        el('td', { html: r.status || '' }),
      ]));
    }
    table.appendChild(thead); table.appendChild(tbody);
    tableHolder.innerHTML = ''; tableHolder.appendChild(table);
  } catch (e) {
    tableHolder.innerHTML = 'Failed to load attendance';
  }
}

async function submitRecognize(evt) {
  evt.preventDefault();
  const { course, date, time } = getInputs();
  if (!course || !date) { alert('Enter course and date'); return; }
  const input = document.getElementById('image');
  if (!input.files || input.files.length === 0) { alert('Select an image'); return; }

  const formData = new FormData();
  formData.append('course', course);
  formData.append('date', date);
  if (time) formData.append('time', time);
  formData.append('image', input.files[0]);

  try {
    const res = await fetchJSON(`${API_BASE}/api/attendance/recognize`, { method: 'POST', body: formData });
    if (res.recognized && res.recognized.length) {
      alert(`Recognized: ${res.recognized.map(r => `${r.student_name} (${r.student_id})`).join(', ')}`);
    } else {
      alert('No faces recognized above threshold');
    }
    await loadAttendance();
  } catch (e) {
    alert('Recognition failed: ' + e.message);
  }
}

function wireExportLink() {
  const link = document.getElementById('export-link');
  link.addEventListener('click', (evt) => {
    evt.preventDefault();
    const { course, date } = getInputs();
    if (!course || !date) { alert('Enter course and date'); return; }
    link.href = `${API_BASE}/api/attendance/export?course=${encodeURIComponent(course)}&date=${encodeURIComponent(date)}`;
    link.download = `attendance_${course}_${date}.csv`;
    link.click();
  });
}

function setDefaultDateTime() {
  const d = document.getElementById('date');
  if (d && !d.value) d.value = new Date().toISOString().slice(0, 10);
  const t = document.getElementById('time');
  if (t && !t.value) t.value = new Date().toTimeString().slice(0,5);
}

async function triggerTrain() {
  try {
    const btn = document.getElementById('train-btn');
    btn.disabled = true; btn.textContent = 'Training...';
    const res = await fetchJSON(`${API_BASE}/api/train`, { method: 'POST' });
    alert(res.message || 'Training complete');
  } catch (e) {
    alert('Training failed: ' + e.message);
  } finally {
    const btn = document.getElementById('train-btn');
    btn.disabled = false; btn.textContent = 'Train Classifier';
    await showStats();
  }
}

async function showStats() {
  try {
    const stats = await fetchJSON(`${API_BASE}/api/train/stats`);
    document.getElementById('train-stats').textContent = JSON.stringify(stats, null, 2);
  } catch (e) {
    document.getElementById('train-stats').textContent = 'Failed to load stats';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  setDefaultDateTime();
  $('#add-student-form').addEventListener('submit', submitAddStudent);
  $('#recognize-form').addEventListener('submit', submitRecognize);
  $('#refresh-attendance').addEventListener('click', loadAttendance);
  document.getElementById('train-btn').addEventListener('click', triggerTrain);
  document.getElementById('stats-btn').addEventListener('click', showStats);
  wireExportLink();
  loadStudents();
  showStats();
});