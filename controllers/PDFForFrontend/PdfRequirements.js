import path, { dirname } from "path";
import fs from "fs";
import SchoolRegistration from "../../models/School.js";
import generatePDF from "./generatePDF.js";

async function PdfRequirements(req, res) {
  try {
    const { schoolId } = req.query;

    if (!schoolId) {
      return res.status(400).json({
        hasError: true,
        message: "School ID is required.",
      });
    }

    const school = await SchoolRegistration.findOne({
      schoolId,
    }).select(
      "schoolName schoolEmail schoolMobileNo panNo schoolAddress schoolLocation landMark schoolPincode"
    );

    if (!school) {
      return res.status(404).json({
        hasError: true,
        message: "School not found with the provided ID.",
      });
    }

    const fileName = "PDF-Format.ejs";
    const __dirname = path.resolve();

    // C:\Users\Nikita\Desktop\Merged-Code-Edprowise-Latest\Edprowise-backend\EdProwise_Backend\controllers\PDFForFrontend\PDF-Format.ejs

    const htmlPath = path.join(
      __dirname,
      "controllers",
      "PDFForFrontend",
      fileName
    );

    //C:\Users\Nikita\Desktop\Merged-Code-Edprowise-Latest\Edprowise-backend\EdProwise_Backend\temp

    const outputFileName = fileName
      // .replace(".", `-${Date.now()}.`)
      .replace("ejs", "pdf");
    const outputPath = path.join(__dirname, "temp", outputFileName);
    await generatePDF(htmlPath, school, outputPath);

    const fileData = fs.readFileSync(outputPath, { encoding: "binary" });
    // fs.unlinkSync(outputPath);
    // res.set({
    //   "Content-Type": "application/pdf", // or image/png, application/zip, etc.
    //   "Content-Disposition": 'attachment; filename="downloaded-file.pdf"', // change filename and extension
    // });
    // return res.status(200).send(fileData);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}document.pdf"`,
      "Content-Length": fileData.length,
    });

    res.send(fileData);
  } catch (error) {
    console.error("Error retrieving details:", error);
    return res.status(500).json({
      message: "Failed to retrieve details.",
      error: error.message,
    });
  }
}

export default PdfRequirements;
