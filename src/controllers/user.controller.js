const asyncHandler = require("../utils/asyncHandler");
const APiError = require('../utils/APiError');
const User = require('../models/user.model');
const uploadOnCloudinary = require('../utils/cloudnary');
const ApiResponse = require('../utils/ApiResponse');

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username,email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove passwword and refresh token from response
    // check for user creation
    // return res 

    const { fullname, email, username, password } = req.body
    console.log('email: ', email);

    if (fullname === "") {
        throw new APiError(400, 'fullname is required')
    }

    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new APiError(409, 'User with email or username already existing user')
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new APiError(400, 'Avatar file is required')
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new APiError(400, 'Avatar file is required')
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        username: username.toLowerCase(),
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new APiError(500, 'Internal server error while registring the user')
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, 'User registered successfully')
    )

})

module.exports = registerUser;