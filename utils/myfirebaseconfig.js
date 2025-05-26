



// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
 export default {
   firebaseConfig: {
     apiKey: process.env.APIKEY,
     authDomain: process.env.AUTHDOMAIN,
     projectId: process.env.PROJECTID,
     storageBucket: process.env.STORAGEBUCKET,
     messagingSenderId: process.env.MESSAGINGSENDERID,
     appId: process.env.APPID,
     measurementId: process.env.MEASUREMENTID,
   },
 };







