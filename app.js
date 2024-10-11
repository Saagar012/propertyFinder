require('dotenv').config({path: `${process.cwd()}/.env`});
const express = require('express');
const app = express();
const authRouter = require('./route/authRoute')

app.use(express.json());

 app.get('/', (req,res) => {
    res.status(200).json({
        status: 'success',
        message: 'Wohoo ! Rest  APIS are working.   '
    }

    )
})

app.use('/api/v1/auth',authRouter);
app.use('*',(req,resp)=>{
    resp.status(404).json({
        statts:'failed',
        message:'Route Not found.'
    })
})


app.listen(process.env.APP_PORT || 4000, () => {
    console.log('Server up and running !!!');
})