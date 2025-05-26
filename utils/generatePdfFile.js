import ejs from "ejs";
import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import UploadToCloud from "./UploadToCloud.js";
import puppeteerCore from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";
import fs from "fs";

// Comment out the following two lines when deploying to Vercel (they're used only in local development or using es module)

 const __filename = fileURLToPath(import.meta.url);
 const __dirname = dirname(__filename);



const generatePdf = async (data) => {
  let browser;

  const templateFile = path.resolve(__dirname, "./html/prInspection.ejs");
  const isProd =
    process.env.NODE_ENV === "production";
  const outputPath = isProd ? "/tmp/output.pdf" : "./output.pdf"; // /tmp is writable on Vercel
  try {
    // Launch Puppeteer (core in prod, full in dev)
    if (isProd) {
      console.log("*************************11111111111111")
      const executablePath = await chromium.executablePath(
        "https://github.com/Sparticuz/chromium/releases/download/v133.0.0/chromium-v133.0.0-pack.tar"
      );
      browser = await puppeteerCore.launch({
        executablePath,
        args: chromium.args,
        headless: chromium.headless,
        defaultViewport: chromium.defaultViewport,
      });
      console.log("*************************11111111111111");
    } else {
      console.log("*************************2222222222*********");
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }
    // Render HTML from EJS
    const html = await ejs.renderFile(templateFile, { data });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    // Generate PDF
    await page.pdf({
      printBackground: true,
      path: outputPath,
      format: "A4",
      margin: {
        top: "20px",
        left: "10px",
        right: "10px",
      },
    });
    await browser.close();
    // Upload PDF to cloud
    const url = await UploadToCloud({
      name: new Date().toISOString(),
      filePath: outputPath,
    });
    // Optionally delete local file
    if (!isProd && fs.existsSync(outputPath)) {
      await fs.promises.unlink(outputPath);
    }
    return url;
  } catch (err) {
    if (browser) await browser.close();
    console.error(":x: PDF generation failed:", err);
    throw err;
  }
};
export default generatePdf;
