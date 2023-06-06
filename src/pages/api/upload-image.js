const cloudinary = require("cloudinary").v2;
const formidable = require("formidable-serverless");

//set bodyparser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Configuration
cloudinary.config({
  cloud_name: "df06gsebz",
  api_key: "968127319495237",
  api_secret: "zReggem_ImGlf6PJGQOgucSaBmA",
});
export default async (req, res) => {
  const data = await new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
      if (err) reject({ err });
      resolve({ err, fields, files });
    });
  });

  cloudinary.uploader
    .upload(data.files.image.path)
    .then((data) => {
      res.status(200).json(data.secure_url);
    })
    .catch((err) => {
      console.log(err);
      res.status(400);
    });
};
