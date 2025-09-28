const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();

// const port = 3000;
const port = process.env.PORT || 3000;

// Connect to SQLite database (creates file if not exists)
const db = new sqlite3.Database('./poems.db');

// Middleware to serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database with table and sample data
function initDatabase() {
  db.serialize(() => {
    // Create poems table if not exists
    db.run(`
      CREATE TABLE IF NOT EXISTS poems (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    db.get('SELECT COUNT(*) as count FROM poems', (err, row) => {
      if (err) console.error(err);
      if (row.count === 0) {
        const stmt = db.prepare('INSERT INTO poems (title, content) VALUES (?, ?)');
        samplePoems.forEach(poem => stmt.run(poem.title, poem.content));
        stmt.finalize();
        console.log('Sample poems inserted.');
      }
    });
  });
}

initDatabase();

// API Endpoint: Get all poem titles
app.get('/api/poems', (req, res) => {
  db.all('SELECT title FROM poems', (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json(rows.map(row => row.title));
    }
  });
});

// API Endpoint: Search poem titles
app.get('/api/search', (req, res) => {
  const query = `%${req.query.q || ''}%`; // Use LIKE for partial match
  db.all('SELECT title FROM poems WHERE title LIKE ?', [query], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json(rows.map(row => row.title));
    }
  });
});

// API Endpoint: Get poem content by title
app.get('/api/poem', (req, res) => {
  const title = req.query.title;
  if (!title) {
    return res.status(400).json({ error: 'Title required' });
  }
  db.get('SELECT content FROM poems WHERE title = ?', [title], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
    } else if (!row) {
      res.status(404).json({ error: 'Poem not found' });
    } else {
      res.json({ content: row.content });
    }
  });
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
