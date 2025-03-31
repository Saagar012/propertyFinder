require('dotenv').config({path: `${process.cwd()}/.env`});
const express = require('express');
const cors = require('cors');  // Import CORS
const app = express();
const authRouter = require('./route/authRoute');
const propertyRoute = require('./route/propertyRoute');
const projectRouter = require('./route/projectRoute');
const emailRoute = require('./route/emailRoute');
const notificationRoute = require('./route/notificationRoute');

const path = require('path');

const catchAsync = require('./utils/catchAsync');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');

app.use(express.json());

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE'], // Allow specific methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
}));

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
app.use('/api/v1/property',propertyRoute )
// app.use('/api/v1/propertyStatus',propertyRoute )
// app.use('/api/v1/rejectionMessage',propertyRoute )
// app.use('/api/v1/updateProperty',propertyRoute )

app.use('/api/v1/propertyRequest',emailRoute)
app.use('/api/v1/notifications', notificationRoute )

// Serve static files from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Debug: Log the requested URL when an image is requested
app.use('/uploads', (req, res, next) => {
    console.log('Requested image path:', req.url); // Logs the requested URL for images
    next();
});



app.use('*', 
    catchAsync(async(req,resp,next)=>{
        throw new AppError(`cant find the ${ req.originalUrl} on this server`, 404);
})
);
app.use(globalErrorHandler);

app.listen(process.env.APP_PORT || 4000, () => {
    console.log('Server up and running !!!');
})