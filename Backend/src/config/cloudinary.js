const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const path = require("path");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isPDF = file.mimetype === "application/pdf";
    const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
    return {
      folder: "hms-medical-records",
      resource_type: isPDF ? "raw" : "image",
      public_id: `record_${Date.now()}.${ext}`,
      format: isPDF ? "pdf" : undefined,
    };
  },
});

const upload = multer({ storage });

module.exports = { cloudinary, upload };