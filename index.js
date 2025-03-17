require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => { console.log("Mongo DB 연결 성공.")})
  .catch((error) => { console.error('Mongo DB 연결 실패( error: ', error, ' )') });

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});