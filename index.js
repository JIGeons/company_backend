require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.use(cors({
  origin: 'http://localhost:5173', // frontURL 주소 cors 허용
  credentials: true,  // 쿠키 허용
}))

// Router
const userRoutes = require('./src/routes/user');

app.use("/api/auth", userRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => { console.log("Mongo DB 연결 성공.")})
  .catch((error) => { console.error('Mongo DB 연결 실패( error: ', error, ' )') });

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});