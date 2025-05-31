import puppeteer from "puppeteer";
import ejs from "ejs";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let logoImageCache = null;

async function generatePDFMail(htmlFilePath, dynamicData = {}, outputPath) {
  let browser;
  try {
    // Validate inputs
    if (!htmlFilePath || !outputPath) {
      throw new Error("HTML template path and output path are required");
    }

    // Logo handling
    const logoPath = path.join(
      __dirname,
      "../../../Images/edprowiseLogoImages/EdProwiseNewLogo.png"
    );
    if (!fs.existsSync(logoPath)) {
      throw new Error(`Logo not found at ${logoPath}`);
    }

    if (!logoImageCache) {
      logoImageCache = `data:image/png;base64,${fs.readFileSync(
        logoPath,
        "base64"
      )}`;
    }
    dynamicData.LOGO_IMAGE = logoImageCache;

    // Verify template exists
    if (!fs.existsSync(htmlFilePath)) {
      throw new Error(`Template not found at ${htmlFilePath}`);
    }

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Render HTML
    const htmlContent = ejs.render(
      fs.readFileSync(htmlFilePath, "utf8"),
      dynamicData
    );

    // Generate PDF
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      timeout: 30000,
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    await page.pdf({
      path: outputPath,
      format: "A4",
      margin: { top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" },
      printBackground: true,
    });

    // Verify PDF creation
    if (!fs.existsSync(outputPath)) {
      throw new Error(`PDF not created at ${outputPath}`);
    }

    return fs.readFileSync(outputPath);
  } catch (error) {
    console.error("PDF Generation Failed:", {
      error: error.message,
      htmlFilePath,
      outputPath,
    });
    throw error;
  } finally {
    if (browser) await browser.close().catch(console.error);
  }
}

export default generatePDFMail;
