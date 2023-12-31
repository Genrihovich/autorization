require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const router = require('./router/index');
const mongoose = require('mongoose');
const errorMiddleware = require('./middlewares/error-middleware');

const port = process.env.PORT || 5000;

const app = express();

//блок подключения Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use('/api', router);// 1-й параметр маршрут, 2-й сам роутер
app.use(errorMiddleware); // это мидлваре должен быть самым последним

const start = async () => {
    try {

        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        app.listen(port, () => console.log(`Server started on Port = ${port}`));

    } catch (e) {
        console.log(e);
    }
};

start();