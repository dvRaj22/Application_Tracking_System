@echo off
echo Installing Cloudinary dependencies...
cd server
npm install cloudinary multer-storage-cloudinary
echo.
echo Dependencies installed successfully!
echo.
echo Please add your Cloudinary credentials to the .env file:
echo CLOUDINARY_CLOUD_NAME=your_cloud_name
echo CLOUDINARY_API_KEY=your_api_key
echo CLOUDINARY_API_SECRET=your_api_secret
echo.
pause
