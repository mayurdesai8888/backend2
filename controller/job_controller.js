import Client from "../models/auth_model.js";
import Job from "../models/job_model.js";
import VehicleCateogries from "../models/vehicle_categories_model.js";
import Workshop from "../models/workshop_model.js";

import generatePdfFile from "../utils/generatePdfFile.js";

// save job
const saveJob = async (req, res) => {
  // console.log(req.body);
  try {
    const {
      vehicleCategory,
      jobType,
      customerName,
      customerPhone,
      customerLocation,
      customerAddress,
      fuelType,
      registrationNumber,
      vinNumber,
      rcImage,
      make,
      model,
      variant,
      fuelLevel,
      odometerImage,
      odometerReading,
      insuranceDue,
      pucDue,
      PRIInspection,
      serviceNote,
      tyreType,
      tyreCondition,
      spareTyre, // ✅ new field
      wheelAlignmentBalancingDate,
      batteryCondition,
      batteryExpiryDate,
      acCooling,
      acServiceDue,
      assignedTechnicians,
      services,
      parts,
      serviceDue,
      partPayments = [],
      diagnosticReport,
    } = req.body;
    console.log("**************************************");
    console.log(req.body);
    console.log("**************************************");
    if (req.user.jobCards == 0 && !req.user.isPlanActive) {
      return res.status(401).json({
        message: "you dont have free jobCards or dont have any active plan",
      });
    }

    const authUser = req.user;

    const hierarchy = await VehicleCateogries.findOne({
      category: vehicleCategory,
    });

    if (!hierarchy) {
      return res.status(400).json({ message: "Invalid vehicle category." });
    }

    console.log("Hierarchy is as follow", hierarchy);

    console.log("Hierarchy is as follow", make);

    const brand = hierarchy.makes.find((b) => b.name == make.name);

    if (!brand) {
      return res.status(400).json({ message: "Invalid vehicle make." });
    }

    const selectedModel = brand.models.find((m) => m.name === model.name);
    if (!selectedModel) {
      return res.status(400).json({ message: "Invalid vehicle model." });
    }
    console.log("Hierarchy is as follow", selectedModel);
    console.log("Hierarchy is as follow", variant);

    const selectedVariant = selectedModel.variants.filter(
      (v) => v.name === variant.name
    );
    if (!selectedVariant) {
      return res.status(400).json({ message: "Invalid vehicle variant." });
    }
    console.log(selectedVariant);

    let assignedTechnicianData = null;

    if (assignedTechnicians?.technicianOrMechanicId) {
      const workshop = await Workshop.findOne({
        $or: [
          { "mechanics._id": assignedTechnicians.technicianOrMechanicId },
          { "technicians._id": assignedTechnicians.technicianOrMechanicId },
        ],
      });

      if (!workshop) {
        console.log(" workshop ");
        return res
          .status(400)
          .json({ message: "Invalid technician or mechanic ID." });
      }

      let technicianOrMechanicName = "";
      const foundMechanic = workshop.mechanics.find(
        (m) => m._id.toString() === assignedTechnicians.technicianOrMechanicId
      );
      const foundTechnician = workshop.technicians.find(
        (t) => t._id.toString() === assignedTechnicians.technicianOrMechanicId
      );

      if (foundMechanic) {
        technicianOrMechanicName = foundMechanic.mechanicName;
      } else if (foundTechnician) {
        technicianOrMechanicName = foundTechnician.technicianName;
      } else {
        console.log("Technician or mechanic not found in workshop.");
        return res
          .status(400)
          .json({ message: "Technician or mechanic not found in workshop." });
      }

      assignedTechnicianData = {
        technicianOrMechanicId: assignedTechnicians.technicianOrMechanicId,
        technicianOrMechanicName,
      };
    }

    if (!Array.isArray(services) || services.length === 0) {
      console.log("services");
      return res
        .status(400)
        .json({ message: "At least one service is required." });
    }

    const formattedServices = services.map((service) => {
      if (!service.serviceName || !service.serviceCharges) {
        throw new Error("Incomplete service information.");
      }

      return {
        serviceName: service.serviceName,
        serviceDescription: service.serviceDescription,
        serviceCharges: service.serviceCharges,
      };
    });

    const formattedParts = (parts || []).map((part) => {
      if (!part.partName || !part.partQuantity || !part.partPrice) {
        throw new Error("Incomplete part information.");
      }

      return {
        partName: part.partName,
        partQuantity: part.partQuantity,
        partPrice: part.partPrice,
      };
    });

    // === Calculate totals ===
    const totalServiceCharges = formattedServices.reduce(
      (sum, s) => sum + (s.serviceCharges || 0),
      0
    );

    const totalPartCost = formattedParts.reduce(
      (sum, p) => sum + (p.partQuantity || 0) * (p.partPrice || 0),
      0
    );

    const totalInvoiceAmount = totalServiceCharges + totalPartCost;

    const totalDiscount = partPayments.reduce(
      (sum, p) => sum + (p.discount || 0),
      0
    );
    const totalPaid = partPayments.reduce(
      (sum, p) => sum + (p.paymentAmount || 0),
      0
    );

    const netAmount = totalInvoiceAmount - totalDiscount;
    const pendingAmount = netAmount - totalPaid;
    const paymentConsent = pendingAmount <= 0;

    const newJob = new Job({
      vehicleCategory,
      jobType,
      customerName,
      customerPhone,
      customerLocation,
      customerAddress,
      fuelType,
      registrationNumber,
      vinNumber,
      rcImage,
      make: make.name,
      model: model.name,
      variant: variant.name,
      fuelLevel,
      odometerImage,
      odometerReading,
      insuranceDue,
      pucDue,
      PRIInspection,
      serviceNote,
      tyreType,
      tyreCondition,
      spareTyre,
      wheelAlignmentBalancingDate,
      batteryCondition,
      batteryExpiryDate,
      acCooling,
      acServiceDue,
      assignedTechnicians: assignedTechnicianData,
      services: formattedServices,
      parts: formattedParts,
      serviceDue,
      partPayments,
      diagnosticReport,
      totalAmount: totalInvoiceAmount,
      totalInvoiceAmount,
      pendingPayment: pendingAmount,
      paymentConsent,
      createdBy: {
        userId: authUser._id,
        phone: authUser.phone,
        role: authUser.role,
        sessionId: req.header("Session-Id"),
      },
    });
    //remaining save the invoice to document
    await newJob.save();

    if (req.user.jobCards > 0) {
      await Client.findByIdAndUpdate(req.user._id, {
        $inc: { jobCards: -1 },
      });
    }

    const newUrl = await generatePdfFile(newJob);

    console.log("newUrl", newUrl);
    return res.status(201).json({
      message: "Job saved successfully",
      job: newJob,
      PRIUrl: newUrl,
    });
  } catch (error) {
    console.error("Save Job Error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

//  getJob By Id
const getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;
    const authUser = req.user;

    // Find job and check ownership
    const job = await Job.findOne({
      _id: jobId,
      "createdBy.userId": authUser._id,
    }).populate("assignedTechnicians.technicianOrMechanicId", "workshopName");

    // if (!job) {
    //   return res
    //     .status(404)
    //     .json({ message: "Job not found or access denied" });
    // }

    return res.status(200).json({
      message: "Job retrieved successfully",
      job,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// get all the jobs
const getAllJobs = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Missing user ID." });
    }

    // Fetch only jobs created by the currently logged-in user
    const jobs = await Job.find({ "createdBy.userId": userId });

    // if (!jobs || jobs.length === 0) {
    //   return res
    //     .status(404)
    //     .json({ message: "No jobs found for this profile." });
    // }
    console.log("jobs", jobs);
    return res.status(200).json({ message: "Jobs fetched successfully", jobs });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const updatePayment = async (req, res) => {
  try {
    const authUser = req.user;
    const { jobId } = req.params;
    const { paymentAmount, discount = 0, paymentDate } = req.body;

    if (!jobId || paymentAmount == null || paymentAmount < 0 || discount < 0) {
      return res.status(400).json({
        message: "Valid job ID, payment amount, and discount are required.",
      });
    }

    if (!authUser || !authUser._id) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Missing user info." });
    }

    // Fetch job belonging to current user
    const job = await Job.findOne({
      _id: jobId,
      "createdBy.userId": authUser._id,
    });

    if (!job) {
      return res
        .status(404)
        .json({ message: "Job not found or access denied." });
    }

    const appliedDate = paymentDate || new Date();

    // Check if the payment + discount exceeds the pendingPayment
    const totalPaymentAttempt = paymentAmount + discount;
    if (totalPaymentAttempt > job.pendingPayment) {
      return res.status(400).json({
        message: `Total of payment (${paymentAmount}) and discount (${discount}) exceeds pending amount (${job.pendingPayment}).`,
      });
    }

    // All good — apply the payment
    const updatedPending = job.pendingPayment - totalPaymentAttempt;
    const paymentConsent = updatedPending <= 0;

    const newPayment = {
      paymentAmount,
      discount,
      paymentDate: appliedDate,
    };

    job.partPayments.push(newPayment);
    job.pendingPayment = updatedPending;
    job.paymentConsent = paymentConsent;

    await job.save();

    return res.status(200).json({
      message: "Payment updated successfully",
      totalInvoiceAmount: job.totalInvoiceAmount,
      pendingAmount: job.pendingPayment,
      paymentConsent: job.paymentConsent,
      paymentHistory: job.partPayments,
    });
  } catch (error) {
    console.error("Update Payment Error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// get all pending payment
const getAllPendingPayments = async (req, res) => {
  try {
    const authUser = req.user;

    if (!authUser || !authUser._id) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Missing user info." });
    }

    // Fetch jobs created by the logged-in user where pendingPayment > 0
    const pendingJobs = await Job.find({
      "createdBy.userId": authUser._id,
      pendingPayment: { $gt: 0 },
    });

    if (!pendingJobs.length) {
      return res.status(200).json({
        message: "No pending payments found for this profile",
        jobs: [],
      });
    }

    return res.status(200).json({
      message: "Pending payment jobs fetched successfully",
      jobs: pendingJobs,
    });
  } catch (error) {
    console.error("Error fetching pending payments:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const searchVehicle = async (req, res) => {
  try {
    const authUser = req.user;
    const { query } = req.query;

    if (!authUser || !authUser._id) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Missing user info." });
    }

    if (!query || typeof query !== "string") {
      return res.status(400).json({ message: "Search query is required." });
    }

    const searchRegex = new RegExp(query, "i"); // case-insensitive search

    const jobs = await Job.find({
      "createdBy.userId": authUser._id,
      $or: [
        { registrationNumber: { $regex: searchRegex } },
        { _id: query.match(/^[0-9a-fA-F]{24}$/) ? query : null }, // search by valid ObjectId
      ],
    }).sort({ createdAt: -1 });

    if (!jobs.length) {
      return res.status(404).json({ message: "No matching jobs found." });
    }

    return res.status(200).json({
      message: "Search results fetched successfully",
      jobs,
    });
  } catch (error) {
    console.error("Search Jobs Error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export {
  saveJob,
  getJobById,
  getAllJobs,
  updatePayment,
  searchVehicle,
  getAllPendingPayments,
};
