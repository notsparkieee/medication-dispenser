const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const pool = require('./db');
const { DateTime } = require('luxon');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// 🔧 Ensure DB session timezone is IST
pool.query(`SET TIME ZONE 'Asia/Kolkata'`)
  .then(() => console.log('✅ DB session timezone set to IST'))
  .catch(console.error);

// ✅ Route to add a new patient schedule (input time is IST)
app.post('/add-patient', async (req, res) => {
  const { name, device, pod, time } = req.body;
  console.log('📥 Received:', req.body);

  if (!name || !device || !pod || !time) {
    console.log('❗ Missing field');
    return res.status(400).send('Missing field(s)');
  }

  try {
    // 1. Get today's date in IST
    const todayIST = DateTime.now().setZone('Asia/Kolkata').toFormat('yyyy-MM-dd');
    
    // 2. Construct full datetime in IST zone
    const fullISTDateTime = DateTime.fromISO(`${todayIST}T${time}:00`, { zone: 'Asia/Kolkata' });
    
    // 3. Convert to ISO string with correct offset
    const isoWithOffset = fullISTDateTime.toISO(); // Includes +05:30
    
    console.log('⏰ Inserting IST datetime:', isoWithOffset);

    // 4. Insert into DB
    const result = await pool.query(
      'INSERT INTO medication_schedule (patient_name, device, pod, dose_time) VALUES ($1, $2, $3, $4)',
      [name, device, pod, isoWithOffset]
    );

    console.log('✅ Inserted:', result.rowCount);
    res.send('✅ Schedule added!');
  } catch (err) {
    console.error('❌ DB Error:', err.message);
    res.status(500).send('❌ ' + err.message);
  }
});

// ✅ Route for ESP32 to fetch today’s schedule in IST
app.get('/api/schedule', async (req, res) => {
  const { device, pod } = req.query;
  if (!device || !pod) return res.status(400).send('Missing device or pod');

  try {
    // 1. Get today's date in IST
    const todayIST = DateTime.now().setZone('Asia/Kolkata').toFormat('yyyy-MM-dd');

    // 2. Fetch entries where IST date matches today
    const result = await pool.query(
      `SELECT *,
       (dose_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata') AS dose_time_ist
       FROM medication_schedule
       WHERE device = $1 AND pod = $2
       AND (dose_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::date = $3::date
       ORDER BY dose_time ASC`,
      [device, pod, todayIST]
    );

    // 3. Format dose_time_ist in IST
    const rows = result.rows.map(row => {
      const formattedIST = DateTime.fromJSDate(row.dose_time_ist)
        .setZone('Asia/Kolkata')
        .toFormat('yyyy-MM-dd HH:mm:ss');

      return {
        id: row.id,
        patient_name: row.patient_name,
        device: row.device,
        pod: row.pod,
        dose_time: formattedIST
      };
    });

    res.json(rows);
  } catch (err) {
    console.error('❌ DB Error:', err.message);
    res.status(500).send('DB error: ' + err.message);
  }
});
// DEBUG: Show all stored times (raw from DB)
app.get('/debug/show-times', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, patient_name, device, pod, dose_time FROM medication_schedule ORDER BY id DESC LIMIT 10');
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Debug Error:', err.message);
    res.status(500).send('DB error: ' + err.message);
  }
});
// http://localhost:3000/debug/show-times

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
