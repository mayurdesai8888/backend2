import Template from "../models/managetemplate_model.js";
// helper: basic field validator
const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;
// ───────────────────────────────────────────────────────────
// POST /api/templates
export const createTemplate = async (req, res) => {
  try {
    const { templateType, templateImage, templateName, templateDescription } =
      req.body;
    // Basic validation
    const errors = [];
    if (!isNonEmptyString(templateType))
      errors.push("templateType is required");
    if (!isNonEmptyString(templateImage))
      errors.push("templateImage is required");
    if (!isNonEmptyString(templateName))
      errors.push("templateName is required");
    if (errors.length) {
      return res.status(400).json({ message: "Validation failed", errors });
    }
    const newTemplate = await Template.create({
      templateType,
      templateImage,
      templateName,
      templateDescription,
    });
    return res.status(201).json(newTemplate);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to create template", error: error.message });
  }
};
// ───────────────────────────────────────────────────────────
// GET /api/templates
export const getTemplates = async (_req, res) => {
  try {
    const templates = await Template.find();
    return res.status(200).json(templates);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch templates", error: error.message });
  }
};
