// PART ONE | Create an unsigned upload preset

// 1. Go to Settings
// 2. Open the Upload tab
// 3. Click "Add Upload Preset"
// 4. Enter "untrusted-images" for the "Upload preset name"
// 5. Select "Unsigned" for the "Signing mode"
// 6. Enter "cloudinary-node-signed-upload-demo" for the "Folder"
// 7. Enable "Use filename or externally defined public ID"
// 8. Disable "Unique filename"
// 9. Open the "Transform" tab
// 10. Add "e_grayscale" to the "Incoming transformation" field
// 11. Open the "Manage & Analyze" tab
// 12. Add "untrusted" to the "Tags" list
// 13. Click "Save"

import "dotenv/config"

import os from "node:os"

import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
})

// PART TWO | Upload an image using the unsigned upload preset

const path = `${os.homedir()}/Desktop/cloudinary-node-signed-upload-demo/chase.jpg`

const unsignedImage = await cloudinary.uploader.unsigned_upload(
    path,
    "untrusted-images",
    {public_id: "chase-sdk-unsigned"},
)

console.log(unsignedImage.url)

// PART THREE | Generate a signature

const timestamp = Math.round(new Date().getTime() / 1000)

const signature = cloudinary.utils.api_sign_request(
    {
        folder: "cloudinary-node-signed-upload-demo",
        public_id: "chase-rest-signed",
        unique_filename: false,
        timestamp,
    },
    process.env.API_SECRET!,
)

console.log(signature)

// PART FOUR | Upload an image using the REST API

const fileBuffer = fs.readFileSync(path)
const base64File = fileBuffer.toString("base64")
const dataUri = `data:image/jpeg;base64,${base64File}`

const url = `https://api.cloudinary.com/v1_1/${process.env.CLOUD_NAME}/image/upload`

const formData = new FormData()

formData.append("file", dataUri)
formData.append("folder", "cloudinary-node-signed-upload-demo")
formData.append("public_id", "chase-rest-signed")
formData.append("unique_filename", "false")
formData.append("timestamp", timestamp.toString())
formData.append("api_key", process.env.API_KEY!)
formData.append("signature", signature)

const response = await fetch(url, {
    method: "POST",
    body: formData,
})

const signedRestImage = await response.json()
console.log(signedRestImage.url)

// PART FIVE | Upload an image using the signature

const signedSdkImage = await cloudinary.uploader.upload(path, {
    folder: "cloudinary-node-signed-upload-demo",
    public_id: "chase-sdk-signed",
    unique_filename: false,
})

console.log(signedSdkImage.url)
