import express from "express";
import {
  createTemplate,
  getTemplates,
} from "../controller/managetemplate_controller.js";

const router = express.Router();

router.post("/createTemplate", createTemplate);
router.get("/getTemplate", getTemplates);

export default router;