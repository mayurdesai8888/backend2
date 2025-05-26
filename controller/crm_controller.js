import Job from "../models/job_model.js";

// get all upcoming services
const UpcomingServices = async (req, res) => {
  try {
    const authUser = req.user;

    if (!authUser || !authUser._id) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Missing user info." });
    }

    // Get start of today (00:00:00)
    const startOfTomorrow = new Date();
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    startOfTomorrow.setHours(0, 0, 0, 0);

    // Get end of the 15th day (23:59:59.999)
    const endOfFifteenthDay = new Date();
    endOfFifteenthDay.setDate(startOfTomorrow.getDate() + 14);
    endOfFifteenthDay.setHours(23, 59, 59, 999);

    // Find jobs with serviceDue between today and 15 days ahead
    const upcomingJobs = await Job.find({
      serviceDue: {
        $gte: startOfTomorrow,
        $lte: endOfFifteenthDay,
      },
      "createdBy.userId": authUser._id,
    })
      .sort({ serviceDue: 1 }) // Sort by ascending due date
      .select(
        "customerName customerPhone customerLocation registrationNumber serviceDue services totalInvoiceAmount"
      );

    res.status(200).json({
      success: true,
      message: "Upcoming services within 15 days",
      count: upcomingJobs.length,
      data: upcomingJobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming services",
      error: error.message,
    });
  }
};

// get all insurance due
const UpcomingInsuranceDue = async (req, res) => {
  try {
    const authUser = req.user;

    if (!authUser || !authUser._id) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Missing user info." });
    }

    const startOfTomorrow = new Date();
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    startOfTomorrow.setHours(0, 0, 0, 0);

    // Get end of the 15th day (23:59:59.999)
    const endOfFifteenthDay = new Date();
    endOfFifteenthDay.setDate(startOfTomorrow.getDate() + 14);
    endOfFifteenthDay.setHours(23, 59, 59, 999);

    // Fetch insurance due only for the current user's jobs
    const upcomingInsurance = await Job.find({
      insuranceDue: {
        $gte: startOfTomorrow,
        $lte: endOfFifteenthDay,
      },
      "createdBy.userId": authUser._id,
    })
      .sort({ insuranceDue: 1 }) // Ascending order
      .select("customerName customerPhone registrationNumber insuranceDue");

    res.status(200).json({
      success: true,
      message: "Upcoming insurance due within 15 days",
      count: upcomingInsurance.length,
      data: upcomingInsurance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming insurance due",
      error: error.message,
    });
  }
};

// get all Puc services due
const UpcomingPUCDue = async (req, res) => {
  try {
    const authUser = req.user;

    if (!authUser || !authUser._id) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Missing user info." });
    }

    // Get start of today (00:00:00)
    const startOfTomorrow = new Date();
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    startOfTomorrow.setHours(0, 0, 0, 0);

    // Get end of the 15th day (23:59:59.999)
    const endOfFifteenthDay = new Date();
    endOfFifteenthDay.setDate(startOfTomorrow.getDate() + 14);
    endOfFifteenthDay.setHours(23, 59, 59, 999);

    // Find jobs where pucDue is within the date range and belongs to the current user
    const upcomingPUC = await Job.find({
      pucDue: {
        $gte: startOfTomorrow,
        $lte: endOfFifteenthDay,
      },
      "createdBy.userId": authUser._id, // 👈 Ensure it matches the current profile
    })
      .sort({ pucDue: 1 }) // Ascending order by due date
      .select("customerName customerPhone registrationNumber   pucDue");

    res.status(200).json({
      success: true,
      message: "Upcoming PUC due within 15 days",
      count: upcomingPUC.length,
      data: upcomingPUC,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming PUC due",
      error: error.message,
    });
  }
};

// get all ac services due
const UpcomingACServiceDue = async (req, res) => {
  try {
    const authUser = req.user;

    if (!authUser || !authUser._id) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Missing user info." });
    }

    // Set start of today (00:00:00)
    const startOfTomorrow = new Date();
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    startOfTomorrow.setHours(0, 0, 0, 0);

    // Get end of the 15th day (23:59:59.999)
    const endOfFifteenthDay = new Date();
    endOfFifteenthDay.setDate(startOfTomorrow.getDate() + 14);
    endOfFifteenthDay.setHours(23, 59, 59, 999);

    // Find jobs where acServiceDue is within today to 15 days ahead and belongs to the user
    const upcomingACServices = await Job.find({
      acServiceDue: {
        $gte: startOfTomorrow,
        $lte: endOfFifteenthDay,
      },
      "createdBy.userId": authUser._id, // Filter based on profile
    })
      .sort({ acServiceDue: 1 }) // Ascending order
      .select("customerName customerPhone registrationNumber  totalInvoiceAmountacServiceDue");

    res.status(200).json({
      success: true,
      message: "Upcoming AC service due within 15 days",
      count: upcomingACServices.length,
      data: upcomingACServices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming AC service due",
      error: error.message,
    });
  }
};

// get all battery service due
const UpcomingBatteryServiceDue = async (req, res) => {
  try {
    const authUser = req.user;

    if (!authUser || !authUser._id) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Missing user info." });
    }

    // Get start of today (00:00:00)
    const startOfTomorrow = new Date();
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    startOfTomorrow.setHours(0, 0, 0, 0);

    // Get end of the 15th day (23:59:59.999)
    const endOfFifteenthDay = new Date();
    endOfFifteenthDay.setDate(startOfTomorrow.getDate() + 14);
    endOfFifteenthDay.setHours(23, 59, 59, 999);

    // Find jobs where batteryExpiryDate is within the range and belongs to the user
    const upcomingBatteryServices = await Job.find({
      batteryExpiryDate: {
        $gte: startOfTomorrow,
        $lte: endOfFifteenthDay,
      },
      "createdBy.userId": authUser._id,
    })
      .sort({ batteryExpiryDate: 1 })
      .select("customerName customerPhone registrationNumber batteryExpiryDate");

    res.status(200).json({
      success: true,
      message: "Upcoming battery service due within 15 days",
      count: upcomingBatteryServices.length,
      data: upcomingBatteryServices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming battery service due",
      error: error.message,
    });
  }
};

// get all tyre service due
const UpcomingTyreServiceDue = async (req, res) => {
  try {
    const authUser = req.user;

    if (!authUser || !authUser._id) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Missing user info." });
    }

    // Set start of today (00:00:00)
    const startOfTomorrow = new Date();
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    startOfTomorrow.setHours(0, 0, 0, 0);

    // Get end of the 15th day (23:59:59.999)
    const endOfFifteenthDay = new Date();
    endOfFifteenthDay.setDate(startOfTomorrow.getDate() + 14);
    endOfFifteenthDay.setHours(23, 59, 59, 999);

    // Find jobs within date range AND created by current user
    const upcomingTyreServices = await Job.find({
      wheelAlignmentBalancingDate: {
        $gte: startOfTomorrow,
        $lte: endOfFifteenthDay,
      },
      "createdBy.userId": authUser._id,
    })
      .sort({ wheelAlignmentBalancingDate: 1 }) // Ascending order by date
      .select("customerName customerPhone registrationNumber wheelAlignmentBalancingDate");

    res.status(200).json({
      success: true,
      message:
        "Upcoming tyre service (wheel alignment & balancing) due within 15 days",
      count: upcomingTyreServices.length,
      data: upcomingTyreServices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming tyre service due",
      error: error.message,
    });
  }
};

export {
  UpcomingServices,
  UpcomingInsuranceDue,
  UpcomingPUCDue,
  UpcomingACServiceDue,
  UpcomingBatteryServiceDue,
  UpcomingTyreServiceDue,
};
