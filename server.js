const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const app = express();

// const port = 3000;
const port = process.env.PORT || 3000;

// Connect to PostgreSQL using Vercel's DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }  // Required for Vercel Postgres
});

// Middleware to serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database with table and sample data
async function initDatabase() {
  try {
    // Create poems table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS poems (
        id SERIAL PRIMARY KEY,
        title TEXT UNIQUE NOT NULL,
        content TEXT NOT NULL
      )
    `);

    // Insert sample Arabic poems (only if table is empty)
    const samplePoems = [
      { title: 'قصيدة الورد', content: 'الورد ينبت في الحدائق الخضراء\nيبعث العطر في كل مكان\nجماله يسحر العيون\nويملأ القلوب بالسرور' },
      { title: 'قصيدة البحر', content: 'البحر الهائج يضرب الصخور\nأمواجه تروي قصص الأزمان\nفي أعماقه أسرار مخفية\nوحياة مليئة بالغموض' },
      { title: 'قصيدة الجبل', content: 'الجبل الشامخ يقف صامدا\nيواجه الرياح والعواصف\nقمته تلامس السماء\nويحمل تاريخ الأرض' },
      { title: 'قصيدة الشمس', content: 'الشمس تشرق كل صباح\nتنير العالم بأشعتها الذهبية\nتدفئ القلوب الباردة\nوتزرع الأمل في النفوس' },
      { title: 'قصيدة القمر', content: 'القمر يضيء في الليل الدامس\nيرسم لوحات فضية على الأرض\nسر جماله في هدوئه\nويحكي حكايات العشاق' }
    ];

    // Check if data exists before inserting
    const countRes = await pool.query('SELECT COUNT(*) as count FROM poems');
    if (parseInt(countRes.rows[0].count) === 0) {
      for (const poem of samplePoems) {
        await pool.query('INSERT INTO poems (title, content) VALUES ($1, $2)', [poem.title, poem.content]);
      }
      console.log('Sample poems inserted.');
    }
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

initDatabase();

// API Endpoint: Get all poem titles
app.get('/api/poems', async (req, res) => {
  try {
    const result = await pool.query('SELECT title FROM poems');
    res.json(result.rows.map(row => row.title));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// API Endpoint: Search poem titles
app.get('/api/search', async (req, res) => {
  const query = `%${req.query.q || ''}%`; // Use LIKE for partial match
  try {
    const result = await pool.query('SELECT title FROM poems WHERE title LIKE $1', [query]);
    res.json(result.rows.map(row => row.title));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// API Endpoint: Get poem content by title
app.get('/api/poem', async (req, res) => {
  const title = req.query.title;
  if (!title) {
    return res.status(400).json({ error: 'Title required' });
  }
  try {
    const result = await pool.query('SELECT content FROM poems WHERE title = $1', [title]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Poem not found' });
    } else {
      res.json({ content: result.rows[0].content });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

/*
// Serve the main index.html for all non-API routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
*/
// Serve the main index.html for all non-API routes (SPA fallback)
app.get('/*splat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/*
// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
*/


// Change: Added '0.0.0.0' as the second argument to app.listen.
// Why: This makes the server accessible to any device on your local network.
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
