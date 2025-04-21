// import SignUpEmailTemplate from "../../../models/SignUpEmailTemplate.js";
// import juice from "juice";

// const createTemplate = async (req, res) => {
//     try {
//         const { subject, content, mailFrom } = req.body;

//         if (!subject || !content ) {
//             return res.status(400).json({ hasError: true, message: "All fields are required." });
//         }

//         let signUpTemplate = await SignUpEmailTemplate.findOne();
        
//         if (signUpTemplate) {
//             signUpTemplate.mailFrom = mailFrom;
//             signUpTemplate.subject = subject;
//             signUpTemplate.content = content;
//         } else {
//             signUpTemplate = new SignUpEmailTemplate({ mailFrom: mailFrom , subject, content });
//         }

//         await signUpTemplate.save();
//         res.status(200).json({ hasError: false, message: "SignUp Email template saved successfully!" });

//     } catch (error) {
//         res.status(500).json({ hasError: true, message: "SignUp Email template Not saved" });
//     }
// };

// export default createTemplate;

import SignUpEmailTemplate from "../../../models/SignUpEmailTemplate.js";
import juice from "juice";
import { JSDOM } from "jsdom";
import sanitizeHtml from 'sanitize-html';

const createTemplate = async (req, res) => {
  try {
    const { subject, content, mailFrom } = req.body;

    if (!subject || !content || !mailFrom) {
      return res.status(400).json({ 
        hasError: true, 
        message: "Subject, content, and sender name are required." 
      });
    }

    // Step 1: Sanitize the HTML content
    const sanitizedContent = sanitizeHtml(content, {
      allowedTags: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'div', 'span', 'br', 'hr',
        'strong', 'em', 'u', 's', 'b', 'i',
        'ul', 'ol', 'li',
        'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'th', 'td'
      ],
      allowedAttributes: {
        '*': ['style', 'class', 'align'],
        'a': ['href', 'target', 'rel'],
        'img': ['src', 'alt', 'width', 'height']
      },
      allowedStyles: {
        '*': {
          'color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
          'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
          'font-size': [/^\d+(?:px|pt|em|%)$/],
          'font-family': [/^[a-z\-,"\s]+$/i],
          'background-color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/]
        }
      }
    });

    // Step 2: Clean and normalize the HTML structure
    const dom = new JSDOM(sanitizedContent);
    const document = dom.window.document;

    // Clean empty paragraphs
    document.querySelectorAll('p').forEach(p => {
      if (!p.textContent.trim() && !p.querySelector('img, br')) {
        p.remove();
      }
    });

    // Convert divs to paragraphs when appropriate
    document.querySelectorAll('div').forEach(div => {
      if (!div.hasAttribute('class') && !div.hasAttribute('id')) {
        const p = document.createElement('p');
        p.innerHTML = div.innerHTML;
        div.replaceWith(p);
      }
    });

    const cleanedContent = document.body.innerHTML;

    // Step 3: Wrap in email-compatible structure
    // In your createTemplate function, update the emailHtml template's style section:

const emailHtml = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style type="text/css">
    /* Base styles */
    body {
      font-family: Arial, sans-serif;
      line-height: 1.4;
      color: #333333;
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    
    /* Content styles */
    .email-content {
      font-family: Arial, sans-serif;
      color: #333333;
      line-height: 1.5;
    }
    .email-content h1 {
      color: #2c3e50;
      margin-top: 0;
    }
    .email-content p {
      margin-bottom: 1em;
      margin-top: 0;
    }
    
    /* Table styles */
    .credentials-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    .credentials-table th,
    .credentials-table td {
      padding: 8px;
      border: 1px solid #ddd;
      text-align: left;
    }
    .credentials-table th {
      background-color: #f2f2f2;
    }
    
    /* Button styles */
    .button-container {
      margin: 20px 0;
    }
    .login-button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #3498db;
      color: white;
      text-decoration: none;
      border-radius: 4px;
    }
    .login-button:hover {
      background-color: #2980b9;
    }
    
    /* Responsive styles */
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        padding: 10px !important;
      }
      .credentials-table {
        font-size: 14px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-content">
      ${cleanedContent}
    </div>
  </div>
</body>
</html>
`;
    // Step 4: Inline CSS for email compatibility
    const inlinedContent = juice(emailHtml, {
      applyStyleTags: true,
      removeStyleTags: true,
      preserveMediaQueries: true,
      preserveFontFaces: false,
      applyWidthAttributes: true,
      applyHeightAttributes: true,
      applyAttributesTableElements: true,
      inlinePseudoElements: true,
      xmlMode: true
    });

    // Step 5: Save to database
    let signUpTemplate = await SignUpEmailTemplate.findOne();

    if (signUpTemplate) {
      signUpTemplate.mailFrom = mailFrom;
      signUpTemplate.subject = subject;
      signUpTemplate.content = inlinedContent;
    } else {
      signUpTemplate = new SignUpEmailTemplate({
        mailFrom,
        subject,
        content: inlinedContent,
      });
    }

    await signUpTemplate.save();

    return res.status(200).json({
      hasError: false,
      message: "Email template saved successfully!",
      data: {
        subject,
        mailFrom,
        content: inlinedContent
      }
    });
  } catch (error) {
    console.error("Error saving template:", error);
    return res.status(500).json({
      hasError: true,
      message: "Failed to save email template",
      error: error.message
    });
  }
};

export default createTemplate;