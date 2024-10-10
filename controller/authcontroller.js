const signup = (req,res,next) =>{
    res.json({
        status: 'success',
        message: 'signup is working fine'
    });
};

module.exports= {signup};