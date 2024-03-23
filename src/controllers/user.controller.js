const asyncHandler = require("../utils/asyncHandler");
const APiError = require('../utils/APiError');
const User = require('../models/user.model');
const uploadOnCloudinary = require('../utils/cloudnary');
const ApiResponse = require('../utils/ApiResponse');

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new APiError(500, 'Something went wrong while generating tokens')
    }
}

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

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new APiError(409, 'User with email or username already existing user')
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new APiError(400, 'Avatar file is required')
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath).catch(error => {
        console.error('Error uploading avatar:', error);
        throw new APiError(500, 'Error uploading avatar to Cloudinary');
    });

    if (!avatar || !avatar.url) {
        throw new APiError(500, 'Failed to upload avatar to Cloudinary');
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath).catch(error => {
        console.error('Error uploading cover image:', error);
        throw new APiError(500, 'Error uploading cover image to Cloudinary');
    });

    if (!coverImage || !coverImage.url) {
        throw new APiError(500, 'Failed to upload cover image to Cloudinary');
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage.url || "",
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

const loginUser = asyncHandler(async (req, res) => {
    // reqy-body -> data
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send cookie

    const { email, username, password } = req.body

    if (!username || !email) {
        throw new APiError(400, 'username or password is required')
    }

    const user = await User.findOne({ $or: [{ username }, { email }] })

    if (!user) {
        throw new APiError(404, 'User not found')
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new APiError(401, 'Invalid user credientials')
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, {
                user: loggedInUser, accessToken, refreshToken
            },
                "User logged in successfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"))
})

module.exports = {
    registerUser,
    loginUser,
    logoutUser
};