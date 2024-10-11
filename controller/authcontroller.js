
const { password } = require("pg/lib/defaults");
const user = require("../db/models/user");

const signup = async (req,res,next) =>{
    const body = req.body;
    if(!['1','2'].includes (body.userType))
       return  res.status(400).json({
        status: 'failed',
        message: 'Invalid user type.', 
    })


        const newUser = await user.create({
            userType: body.userType,
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            password: body.password,
            confirmPassword: body.confirmPassword
        })

    if(!newUser){
            return 
            res.status(400).json({
                status: 'failed',
                message: 'Failed to create the user'
            });
    }
    res.status(201).json({
        status: 'success',
        data: newUser,
    });

};

module.exports= {signup};