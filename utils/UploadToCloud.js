// import express, { Router } from "express";
import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
  uploadBytes,
} from "firebase/storage";
// import multer from "multer";
import config from "./myfirebaseconfig.js";
import fs from "fs";
import path from "path";
// const router = express.Router();

//Initialize a firebase application
initializeApp(config.firebaseConfig);

// // Initialize Cloud Storage and get a reference to the service
const storage = getStorage();

 const UploadToCloud = async ({ name = "uploaded.pdf", filePath }) => {
   console.log("name", name);
   try {
     const folder = "invoicepdfs";
     console.log("Uploading file:", filePath);
     const storageRef = ref(storage, `${folder}/${name}.pdf`);

     const fileBuffer = fs.readFileSync(filePath);

     await uploadBytes(storageRef, fileBuffer);

     const url = await getDownloadURL(storageRef);
     console.log("URL:", url);
     return url;
   } catch (error) {
     console.error("Upload Error:", error);
   }
 };

export default UploadToCloud;