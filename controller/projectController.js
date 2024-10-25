const { user } = require("../db/models/user");
const project = require("../db/models/project");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");


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
    const userId = req.user.id;
    const result = await project.findAll({
        include: user,
        where: { createdBy: userId },
    });
    return resp.json({
        status: 'success',
        data: result,
    })
})
const getProjectById = catchAsync(async(req,resp,next)=>{
    const projectId = req.params.id;
    const result = await project.findByPk(projectId, {include: user});

    if(!result){
        return next(new AppError('Invalid Project Id', 400))
    }

    return resp.json({
        status: 'success',
        data: result,
    })
})


const updateProject = catchAsync(async(req,resp,next)=>{
    const userId = req.user.id;
    const projectId = req.params.id;
    const body = req.body;
    const result = await project.findByPk(projectId);

    if(!result){
        return next(new AppError('Invalid project id'), 400);
    }
    result.title = body.title;
    result.productImage = body.productImage;
    result.price = body.price;
    result.shortDescription = body.shortDescription;
    result.description = body.description;
    result.productUrl = body.productUrl;
    result.category = body.category;
    result.tags = body.tags;

    const updatedResult = await result.save();

    return resp.json({
        status: 'success',
        data: updatedResult,
    });

})


const deleteProject = catchAsync(async(req,resp,next)=>{
    const projectId = req.params.id;
    const result = await project.findByPk(projectId);
    if(!result){
        return next(new AppError('Invalid project id'), 400);
    }

     await result.destroy();

    return resp.json({
        status: 'success',
        message: 'Record deleted successfully',
    });

})










module.exports = {createProject, getAllProjects, getProjectById, updateProject, deleteProject};