const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/questions', (req, res) => {
  res.json({
    questions: [],
    examDuration: 1800000
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','index.html'));
});

app.listen(port, ()=>{});
