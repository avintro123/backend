const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        // upload the file on cloudnary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfully
        // console.log('File has been uploaded successfully in cloudinary ', response.url);
        fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
        console.error('Error uploading file to Cloudinary:', error);
        fs.unlinkSync(localFilePath); // Remove the locally saved temporary file
        throw new Error('Failed to upload file to Cloudinary: ' + error.message);
    }
}

module.exports = uploadOnCloudinary