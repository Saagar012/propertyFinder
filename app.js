require('dotenv').config({path: `${process.cwd()}/.env`});
const express = require('express');
const app = express();
const authRouter = require('./route/authRoute');
const projectRouter = require('./route/projectRoute');
const catchAsync = require('./utils/catchAsync');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');

app.use(express.json());

 app.get('/', (req,res) => {
    res.status(200).json({
        status: 'success',
        message: 'Wohoo ! Rest  APIS are working.'
    }

    )
})
// all routes will be present here.
app.use('/api/v1/auth',authRouter);
app.use('/api/v1/projects',projectRouter )

app.use('*', 
    catchAsync(async(req,resp,next)=>{
        throw new AppError(`cant find the ${ req.originalUrl} on this server`, 404);
})
);

app.use(globalErrorHandler);

app.listen(process.env.APP_PORT || 4000, () => {
    console.log('Server up and running !!!');
})