import Workshop from "../models/workshop_model.js";
import Client from "../models/auth_model.js";

// create workshop
const createWorkshop = async (req, res) => {
  try {
    const {
      workshopName,
      workshopAddress,
      workshopLocation,
      workshopImages,
      workshopGSTIN_No,
      workshopLogo,
      workshopFrontPhoto,
      workshopOwnerPhoto,
      mechanics,
      technicians,
    } = req.body;

    // Validate required fields
    if (!workshopName || !workshopAddress || !workshopLocation) {
      return res.status(400).json({
        message: "Workshop Name, Address, and Location are required.",
      });
    }

    // Validate images count (Min 5 images, Max 20 images)
    if (
      !Array.isArray(workshopImages) ||
      workshopImages.length < 5 ||
      workshopImages.length > 20
    ) {
      return res.status(400).json({
        message:
          "Workshop must have a minimum of 5 and a maximum of 20 images.",
      });
    }

    // Validate mechanics and technicians
    const validateEntries = (arr) =>
      Array.isArray(arr) &&
      arr.every(
        (entry) =>
          entry.name &&
          entry.address &&
          entry.location &&
          entry.contact &&
          entry.skillType
      );

    if (!validateEntries(mechanics) || !validateEntries(technicians)) {
      return res.status(400).json({
        message:
          "Each mechanic and technician must have name, address, location, contact, and skillType.",
      });
    }

    // Ensure at least one mechanic or technician is added
    if (
      (!mechanics || mechanics.length === 0) &&
      (!technicians || technicians.length === 0)
    ) {
      return res.status(400).json({
        message: "At least one mechanic or technician is required.",
      });
    }

    // Get the user by phone
    const user = await Client.findOne({ phone: req.user.phone });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Allow mechanics & technicians to reuse their GSTIN when creating a workshop
    let finalWorkshopGSTIN_No = null;

    if (workshopGSTIN_No) {
      if (user.role === "mechanic" || user.role === "technician") {
        // If the mechanic/technician already has a GSTIN, allow them to reuse it
        if (
          user.workshopGSTIN_No &&
          user.workshopGSTIN_No !== workshopGSTIN_No
        ) {
          return res.status(400).json({
            message: "You can only reuse your existing GSTIN.",
          });
        }

        // If they don't have a GSTIN yet, allow setting it for the first time
        if (!user.workshopGSTIN_No) {
          user.workshopGSTIN_No = workshopGSTIN_No;
          await user.save();
        }

        finalWorkshopGSTIN_No = user.workshopGSTIN_No;
      } else {
        // For workshop owners, GSTIN can be assigned normally
        finalWorkshopGSTIN_No = workshopGSTIN_No;
      }
    }

    // Create new workshop
    const newWorkshop = new Workshop({
      phone: user.phone,
      role: "workshop",
      workshopName,
      workshopAddress,
      workshopLocation,
      workshopGSTIN_No: finalWorkshopGSTIN_No,
      workshopImages,
      workshopLogo: workshopLogo || null,
      workshopFrontPhoto: workshopFrontPhoto || null,
      workshopOwnerPhoto: workshopOwnerPhoto || null,
      mechanics,
      technicians,
    });

    await newWorkshop.save();

    res.status(201).json({
      message: "Workshop created successfully",
      workshop: newWorkshop,
    });
  } catch (error) {
    console.error("Error creating workshop:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// update workshop
const updateWorkshop = async (req, res) => {
  try {
    const phone = req.user.phone; // Get phone from authenticated user
    const updateFields = req.body;

    // Prevent updating the role
    if (updateFields.role) {
      return res.status(400).json({ message: "Role cannot be updated." });
    }

    // Fetch user by phone
    const user = await Client.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Fetch existing workshop details
    const existingWorkshop = await Workshop.findOne({ phone });

    if (!existingWorkshop) {
      return res.status(404).json({ message: "Workshop not found." });
    }

    // Prevent updating the GSTIN number
    // if ("workshopGSTIN_No" in updateFields) {
    //   return res.status(400).json({ message: "GSTIN cannot be updated once provided." });
    // }

    // Validate images (if provided)
    if (updateFields.workshopImages) {
      if (
        !Array.isArray(updateFields.workshopImages) ||
        updateFields.workshopImages.length < 5 ||
        updateFields.workshopImages.length > 20
      ) {
        return res.status(400).json({
          message: "Workshop must have between 5 and 20 images.",
        });
      }
    }

    console.log(updateFields.mechanics);
    console.log(updateFields.technicians);
    
    // Ensure at least one mechanic or technician is present after update
    const mechanicsCount = updateFields.mechanics
      ? updateFields.mechanics.length
      : existingWorkshop.mechanics.length || 0;

    const techniciansCount = updateFields.technicians
      ? updateFields.technicians.length
      : existingWorkshop.technicians.length || 0;

    if (mechanicsCount === 0 && techniciansCount === 0) {
      return res.status(400).json({
        message: "At least one mechanic or technician is required.",
      });
    }

    // Update the workshop
    const updatedWorkshop = await Workshop.findOneAndUpdate(
      { phone }, // Find by phone
      { $set: updateFields } // Update only provided fields
      // { new: true, runValidators: true } // Return updated document & validate
    );

    res.status(200).json({
      message: "Workshop updated successfully!",
      workshop: updatedWorkshop,
    });
  } catch (error) {
    console.error("Error updating workshop:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// view workshop Profile
const viewWorkshopProfile = async (req, res) => {
  try {
    const phone = req.user.phone; // Get phone number from the token

    // Find the workshop by phone
    const workshop = await Workshop.findOne({ phone });

    if (!workshop) {
      return res.status(404).json({ message: "Workshop not found." });
    }
    console.log(workshop);

    res
      .status(200)
      .json({ message: "Workshop profile fetched successfully!", workshop });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export { createWorkshop, updateWorkshop, viewWorkshopProfile };