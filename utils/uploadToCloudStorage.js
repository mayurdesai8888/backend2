// utils/uploadToCloudStorage.js
import admin from "firebase-admin";
import { fileURLToPath } from "url";
import path from "path";
import { dirname } from "path";
// import serviceAccount from "../serviceAccountKey.json" assert { type: "json" };
const serviceAccount = {
  type: "service_account",
  project_id: "automs-database",
  private_key_id: "70c7ced5132b54bacf0b289b4f0cbd90d67abacd",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC4SZAVmx8bdSd4\nfr3YPLDMuFqhDZ+xZ52kp2tpXj31AN9fZ2s3ISS1mMjbXU/Xzg7ABPnckX+YoGvN\nLwh1+HKjjs5qcldwMIOt6lzehWthH0g5sagbIkOmq15m0uDhd1oUb1sc0eymxZIs\n1odn/louWKnZiiwo0DV+pr8XFrLV5KGD4EXUTEvihFut4u95PVFbd1yoK9Yd5XLu\nh+WOuQ0ZryOtwtHzDUjs0snROLXR2MFyn0ONA+FiixYuLFlrkO5k1SA8Cw6n54U3\nKqgVKXX//chizPBH/50waf+AxMUpPT629MlS14icS/7av81o8mHetLGhQ3z34fFw\nigHjsdjfAgMBAAECggEAJDBB7JQ9HBG58gYFdsCYQWNUXLsFqHs98Db2N0dL6GBG\n/P+chMNr54M8siMVSj4LFHcFr+Qch9a8xJqfUTc8H9UrwKh6div4t77FhObzSquv\nbbDu34Evgru1OoDfqzbaSBgD7tlkXO2AQnDQP0Ip6F7935usB0m3r4rEDJ8m+Cxq\n/mQ9i0gUX2NRsbv7UJe4oZeJGEE5EhMJcuqwM4CDZWnwrtgTtGDXvT9Gn6dDsM8P\nTAMifqg5dJ/nBn3pTu+J9Ajqt6XjmBxnrH+XCuXkolErh7TJJ7iJTL86BEq6NRw7\n+9KJZcV/5X1J9HHjiW106Sl7kAhZSC42NgLZbkiXHQKBgQD1i/jXlu4vXbU4P6DC\nw4/3dyvTHJ30UVgavf3GITfKd1LhacYK7FN67m0CpCIIMI1crEyPYanHlMyg9Cx3\nNx/rxya0n9uw/U/Lbg/62/rUPPPyBEP+m+rfmRfr9N7+IVYaGP6fbA4hsZ8E7RqO\nQd3kjYvhXnjyUpO001UKsplOlQKBgQDAIfiPFLnPd8GUk0YkYiZjs8ZyOddvpyIW\nHojY6rNrg4Lbel3wXNtwjyvTRZkGDGr4V45M0I9/pMyUCArEvOdPYzs1+uD0716H\n1CiuB3u5AGEYvcqZrglcqWbjWQnw7TgNRczDmc6H401RGa31sfdPqZx9rdJh+djB\nvyvYpR2QowKBgDpjbmjVmw3oWo9lkfS+TB2sWN96jpTqQukZBJ94hqu+dBbl8BHo\n4HD7ATD/lpgb84F19z6hGp464+3iIjC3CwAl+y44VSVhFvho06Pza1HMrLWADisd\nKFzDKs0RDXWgt7i8+M8wAqxAcG/bcdUiFIGkpv6QWHJG8JivKCnDDnGBAoGAIZmP\nQ05nlD2oL9h1isVTW1pEGRO+djsvPdkHK5AX4nR0PPewV+mVQqD3FBJ2yVUAm/+L\n1ike/z6NvFGPuIoklYCQCUefcZYu3OggWRbb7yV+1XnTZX7HClphsN6QW37Qr5mG\nTqqmMKNykP1Bq9b8ngTWZjAwu4ua+X76Jv/xJKsCgYEApYKOJlD2ZsFU5Uo9wsX2\nKtK/scMf3fOF47drs8xKpLa77ZC9Vonmm1dGjOMiszazjFSjl1nl9uye2+uaLot2\n1d6SJGhoQ8xKOz7GtW16rHLMvJ4PrL1qHEcoXJOJZynouwS6C+nHs53sXqy05YkI\nCuVTuqf/qIth8xKZI2JL3+U=\n-----END PRIVATE KEY-----\n",
  client_email:
    "firebase-adminsdk-fbsvc@automs-database.iam.gserviceaccount.com",
  client_id: "113495255358007936328",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40automs-database.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

// ES module-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "automs-database.firebasestorage.app", // replace with your actual bucket name
  });
}

const bucket = admin.storage().bucket();

export const uploadToCloudStorage = async (localFilePath, destFileName) => {
  try {
    const fullPath = path.resolve(__dirname, localFilePath);
    const destination = `invoicepdfs/${destFileName}.pdf`;

    await bucket.upload(fullPath, {
      destination,
      // public: true,
      // metadata: {
      //   contentType: "application/pdf",
      // },
      metadata: {
        contentType: "application/pdf",
      },
    });

    const file = bucket.file(destination);

    // Make the file public
    // await bucket.file(destination).makePublic();

    // Return the public URL
    // return `https://storage.googleapis.com/${bucket.name}/${destination}`;

    // Generate a signed URL (expires in 1 hour)
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
    });

    console.log("✅ PDF uploaded and made public");


   const [metadata] = await file.getMetadata();
    console.log("✅ PDF uploaded to Firebase");
    console.log("🌐 Public URL:", metadata.mediaLink);

    return metadata.mediaLink;
  } catch (error) {
    console.error("❌ Upload to Firebase failed:", error);
    throw error;
  }
};
