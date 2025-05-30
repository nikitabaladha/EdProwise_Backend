import passwordUpdateEmailTemplate from "../../../models/EmailTeamplates/passwordUpdateEmailTemplate.js";

const createAndUpdate = async (req, res) => {
  try {
    const { subject, content, mailFrom } = req.body;

    if (!subject || !content) {
      return res
        .status(400)
        .json({ hasError: true, message: "All fields are required." });
    }

    let passwordTemplate = await passwordUpdateEmailTemplate.findOne();

    if (passwordTemplate) {
      passwordTemplate.mailFrom = mailFrom;
      passwordTemplate.subject = subject;
      passwordTemplate.content = content;
    } else {
      passwordTemplate = new passwordUpdateEmailTemplate({
        mailFrom: mailFrom,
        subject,
        content,
      });
    }

    await passwordTemplate.save();
    res.status(200).json({
      hasError: false,
      message: "Password template saved successfully!",
    });
  } catch (error) {
    res
      .status(500)
      .json({ hasError: true, message: "Password template Not saved" });
  }
};

export default createAndUpdate;
