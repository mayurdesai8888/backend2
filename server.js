import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./database/db.js";
import router from "./routes/auth_routes.js";
import workshopRoutes from "./routes/workshop_routes.js";

import vehicleRoutes from "./routes/vehicle_categories_routes.js";
import jobRoutes from "./routes/job_routes.js";
import crmRoutes from "./routes/crm_routes.js";




import paymentRoutes from "./routes/payment_routes.js";
import notificationRoutes from "./routes/notification_routes.js";
import allPlanRoutes from "./routes/allPlan_routes.js";
import whatappRoutes from "./routes/whatapp_routes.js";
// import generatePdfFile from './utils/generatePdfFile.js'

import Razorpay from "razorpay";
// import { sendPushNotification} from "./utils/notification1.js";



import wati_routes from "./routes/wati_routes.js"


import paymentRoutes2 from "./routes/payment_routes2.js";


import creditHistoryRoutes from "./routes/creditHistory_routes.js";




import UploadToCloud from "./utils/UploadToCloud.js";
import generatePdf from "./utils/generatePdfFile.js";
import seedBoostPlans from "./seed/boost.js";
import seedTopUps from "./seed/topUpSeed.js";
import paymentSeed from "./seed/paymentSeed.js";
import managetemplate from "./routes/managetemplate_routes.js"
// seedBoostPlans();
// paymentSeed();
dotenv.config();

const app = express();


const data = {
  // title: "Hello World",
  // content: "Hello World",
  // description: "This is a description",
};


export const RazorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_APT_SECRET,
});


// Middleware
app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Database Connection
connectDB();


// for seed
// seedBoostPlans();
// seedTopUps();



// Routes
app.use("/api/payment2", paymentRoutes2);

app.use("/api/notification", notificationRoutes);


app.use("/api/allplan", allPlanRoutes);

app.use("/api/whatapp", whatappRoutes);

app.use("/api/credit_history", creditHistoryRoutes);

app.use("/api/templates", managetemplate);

app.use("/api/auth", router);

app.use("/api/workshop", workshopRoutes);

app.use("/api/vehicles", vehicleRoutes);

app.use("/api/job", jobRoutes);


app.use("/api/crm", crmRoutes);

app.use("/api/wati", wati_routes);


// app.use("/api/payment", paymentRoutes);



// app.use("/api/notification", sendPushNotification);

// app.use("/api/temp", async (req, res) => {
//   await generatePdf(); // Assuming async
//   res.json({ message: "ok" });
// });






//app.use("/api/payment", paymentRoutes);



// connection
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

//for below code please remove comment when this using vercel else comment when using locally
module.exports = app;

