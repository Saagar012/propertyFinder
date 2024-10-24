const project = require("../db/models/project");
const catchAsync = require("../utils/catchAsync");


const createProject = catchAsync(async(req,resp,next) => {
    const body = req.body;
    const userId = req.user.id;

    const newProject = await project.create({
        id: body.id,
        title: body.title,
        productImage: body.productImage,
        price: body.price,
        isFeatured:body.isFeatured,
        shortDescription: body.shortDescription,
        description: body.description,
        productUrl: body.productUrl,
        category: body.category,
        tags: body.tags,
        createdBy: userId,
    });
    return resp.status(201).json({
        status: 'success',
        data: newProject,
    });
})


const getAllProjects = catchAsync(async(req,resp,next)=>{
    const result = await project.findAll();

    return resp.json({
        status: 'success',
        data: result,
    })
})



module.exports = {createProject, getAllProjects};