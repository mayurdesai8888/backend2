import express from "express";
import VehicleCategories from "../models/vehicle_categories_model.js"

const router = express.Router();

// GET all makes by category
router.get("/:category/makes", async (req, res) => {
  const { category } = req.params;
  const data = await VehicleCategories.findOne({ category });
  if (!data) return res.json({ makes: [] });
  res.json({ makes: data.makes.map((m) => m.name) });
});

// GET models by make
router.get("/:category/:make/models", async (req, res) => {
  const { category, make } = req.params;
  const record = await VehicleCategories.findOne({ category });
  if (!record) return res.json({ models: [] });

  const makeData = record.makes.find((m) => m.name === make);
  if (!makeData) return res.json({ models: [] });

  res.json({ models: makeData.models.map((m) => m.name) });
});

// GET variants by model
router.get("/:category/:make/:model/variants", async (req, res) => {
  const { category, make, model } = req.params;
  const record = await VehicleCategories.findOne({ category });
  if (!record) return res.json({ variants: [] });

  const makeData = record.makes.find((m) => m.name === make);
  if (!makeData) return res.json({ variants: [] });

  const modelData = makeData.models.find((mod) => mod.name === model);
  if (!modelData) return res.json({ variants: [] });

  res.json({ variants: modelData.variants.map((v) => v.name) });
});

// POST: Add or update hierarchy (make/model/variant)
router.post("/:category/add", async (req, res) => {
  const { category } = req.params;
  const { make, model, variant } = req.body;

  let vehicle = await VehicleCategories.findOne({ category });
  if (!vehicle) {
    vehicle = new VehicleCategories({ category, makes: [] });
  }

  let makeObj = vehicle.makes.find((m) => m.name === make);
  if (!makeObj) {
    makeObj = { name: make, models: [] };
    vehicle.makes.push(makeObj);
  }

  let modelObj = makeObj.models.find((m) => m.name === model);
  if (!modelObj) {
    modelObj = { name: model, variants: [] };
    makeObj.models.push(modelObj);
  }

  if (!modelObj.variants.find((v) => v.name === variant)) {
    modelObj.variants.push({ name: variant });
  }

  await vehicle.save();
  res.json({ message: "Hierarchy updated successfully" });
});

export default router;
