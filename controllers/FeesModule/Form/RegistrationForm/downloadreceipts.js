import puppeteer from 'puppeteer';

const genratereceipts = async (req, res) => {
  let browser; // Declare browser outside try block
  try {
    const { student, feeTypeName, className } = req.body;

    // Input validation
    if (!student || !feeTypeName || !className) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!student.receiptNumber || !student.firstName || !student.lastName) {
      return res.status(400).json({ error: 'Invalid student data' });
    }

    // HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: black; margin: 0; }
          .container { padding: 20px; }
          .border { border: 1px solid black; padding: 20px; }
          .text-center { text-align: center; }
          .bg-light { background-color: #f8f9fa; padding: 10px; }
          .row { display: flex; flex-wrap: wrap; margin-bottom: 20px; }
          .col-4 { flex: 1; min-width: 200px; padding: 10px; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .table th, .table td { border: 1px solid black; padding: 10px; text-align: center; }
          .text-end { text-align: right; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="border">
            <div class="text-center">
              <h6><strong>[School Letterhead]</strong></h6>
            </div>
            <h6 class="text-center bg-light"><strong>Registration Fees Receipt</strong></h6>
            <div class="row">
              <div class="col-4">
                <p><strong>Receipt No:</strong> ${student.receiptNumber}</p>
                <p><strong>Student Name:</strong> ${student.firstName} ${student.lastName}</p>
                <p><strong>Registration No:</strong> ${student.registrationNumber || 'N/A'}</p>
              </div>
              <div class="col-4">
                <p><strong>Class:</strong> ${className}</p>
              </div>
              <div class="col-4">
                <p><strong>Date:</strong> ${new Date(student.registrationDate).toLocaleDateString('en-GB')}</p>
                <p><strong>Academic Year:</strong> ${(() => {
                  const year = new Date(student.registrationDate).getFullYear();
                  return `${year}-${year + 1}`;
                })()}</p>
              </div>
            </div>
            <div class="row" style="border-top: 2px solid black; margin: 10px 0;"></div>
            <table class="table">
              <thead>
                <tr>
                  <th>Type of Fees</th>
                  <th>Registration Fees Amount</th>
                  <th>Concession</th>
                  <th>Final Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${feeTypeName}</td>
                  <td>${student.registrationFee || 0}</td>
                  <td>${student.concessionAmount || 0}</td>
                  <td>${student.finalAmount || 0}</td>
                </tr>
              </tbody>
            </table>
            <div class="row">
              <div class="col-4">
                <p><strong>Payment Mode:</strong> ${student.paymentMode || 'N/A'}</p>
                <p><strong>Date of Payment:</strong> ${new Date(student.registrationDate).toLocaleDateString('en-GB')}</p>
                <p><strong>Transaction No./Cheque No.:</strong> ${student.transactionNumber || student.chequeNumber || 'N/A'}</p>
              </div>
              <div class="col-4 text-end">
                <p><strong>Signature of Collector</strong></p>
                <p><strong>Name:</strong> ${student.name || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Create PDF buffer
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    await browser.close();

    // Send PDF
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="receipt_${student.receiptNumber}.pdf"`,
    });
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating PDF:', error);
    if (browser) await browser.close();
    res.status(500).json({ error: 'Failed to generate receipt', details: error.message });
  }
};

export default genratereceipts;
