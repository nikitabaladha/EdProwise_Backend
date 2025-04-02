import RequestForDemo from "../../models/RequestForDemo.js";
import RequestForDemoValidator from "../../validators/RequestForDemoValidation.js";

async function create(req, res) {
  try {
    const { error } = RequestForDemoValidator.requestForDemoCreate.validate(
      req.body
    );
    if (error) {
      const errorMessages = error.details.map((err) => err.message).join(", ");
      return res.status(400).json({
        hasError: true,
        message: errorMessages,
      });
    }

    const newDemoRequest = new RequestForDemo({
      name: req.body.name,
      schoolName: req.body.schoolName,
      designation: req.body.designation,
      email: req.body.email,
      phone: req.body.phone,
      demoDateTime: new Date(req.body.demoDateTime),
      selectedServices: req.body.selectedServices,
      note: req.body.note || "",
    });

    const savedRequest = await newDemoRequest.save();

    return res.status(201).json({
      hasError: false,
      message: "Demo request submitted successfully!",
      data: savedRequest,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        hasError: true,
        message: "A demo request with this email already exists.",
      });
    }

    console.error("Error submitting demo request:", error);
    return res.status(500).json({
      hasError: true,
      message: "Internal server error. Please try again later.",
    });
  }
}

export default create;
