const cloudinary = require("../config/cloudinary");


// ==================================================
// UPLOAD IMAGE TO CLOUDINARY
// ==================================================

const uploadToCloudinary = (
  fileBuffer,
  folder = "ecobazar/products"
) => {

  return new Promise((resolve, reject) => {

    const uploadStream =
      cloudinary.uploader.upload_stream(

        {
          folder,
          resource_type: "image",
        },

        (error, result) => {

          if (error) {

            reject(error);

          } else {

            resolve(result);

          }

        }
      );


    uploadStream.end(fileBuffer);

  });

};


// ==================================================
// DELETE IMAGE FROM CLOUDINARY
// ==================================================

const deleteFromCloudinary = async (
  publicId
) => {

  if (!publicId) {
    return null;
  }

  try {

    const result =
      await cloudinary.uploader.destroy(
        publicId
      );

    return result;

  } catch (error) {

    console.error(
      "Cloudinary delete error:",
      error
    );

    throw error;

  }

};


module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
};