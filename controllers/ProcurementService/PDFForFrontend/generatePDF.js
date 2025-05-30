import puppeteer from "puppeteer";
import ejs from "ejs";
import path from "path";
import fs from "fs";

const __dirname = path.resolve();

let LogoImage;

async function generatePDF(htmlFilePath, dynamicData = {}, outputPath) {
  // Load the logo and add it to dynamicData unconditionally
  const LogoImagePath = path.join(
    __dirname,
    "Images",
    "edprowiseLogoImages",
    "EdProwiseNewLogo.png"
  );

  if (!LogoImage) {
    const imageBuffer = fs.readFileSync(LogoImagePath);
    const imageType = path.extname(LogoImagePath).replace(".", "");
    LogoImage = `data:image/${imageType};base64,${imageBuffer.toString(
      "base64"
    )}`;
  }

  dynamicData.LOGO_IMAGE = LogoImage;

  const template = fs.readFileSync(htmlFilePath, "utf8");
  const htmlContent = ejs.render(template, dynamicData);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({ path: outputPath, format: "A4" });

  await browser.close();
  return pdfBuffer;
}

export default generatePDF;
