const jwt = require('jsonwebtoken')
const APiError = require("../utils/APiError");
const asyncHandler = require("../utils/asyncHandler");
const User = require('../models/user.model')

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new APiError(401, "Invalid authorization")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user) {
            throw new APiError(401, "Invalid acess token")
        }

        req.user = user;
        next()
    } catch (error) {
        throw new APiError(401, error?.message || 'invalid access token')
    }

})

module.exports = verifyJWT;