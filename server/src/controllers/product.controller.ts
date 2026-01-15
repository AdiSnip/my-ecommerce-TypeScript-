import { asyncHandler } from "../utils/asyncHandler";
import { Product } from "../models/product.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Request, Response } from "express";

export const createProduct = asyncHandler(async (req:Request,res:Response)=>{
    return res.status(200).json(new ApiResponse(200,"good"))
})