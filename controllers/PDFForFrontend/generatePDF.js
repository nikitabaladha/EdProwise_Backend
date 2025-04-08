import puppeteer from "puppeteer";
import ejs from "ejs";
import fs from "fs";

// Function to generate PDF
async function generatePDF(htmlFilePath, dynamicData, outputPath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Render the EJS template with dynamic data
  const template = fs.readFileSync(htmlFilePath, "utf8");
  const htmlContent = ejs.render(template, dynamicData);

  // Set the generated HTML content
  await page.setContent(htmlContent);

  // Generate the PDF
  const pdfBuffer = await page.pdf({ path: outputPath, format: "A4" });

  await browser.close();

  return pdfBuffer;
}

export default generatePDF;
