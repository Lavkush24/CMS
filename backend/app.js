require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const { startWorker } = require('./services/syncWorker');

const app = express();
app.use(express.json());
app.use(express.static('public'));


app.use(cors());

connectDB();
startWorker();

app.use('/', require('./routes/auth'));
app.use('/ping', require('./routes/ping'));
app.use('/auth', require('./routes/auth'));
app.use('/student',require('./routes/student'));
app.use('/teacher', require('./routes/teacher'));
app.use('/batch', require('./routes/batch'));
app.use('/dash', require('./routes/dash'));
app.use('/upgrade',require('./routes/plan'));
app.use('/chart', require('./routes/chart'));

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});