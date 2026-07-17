const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateReceiptPDF = async (receiptData) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      });

      // Create filename with timestamp
      const filename = `receipt_${receiptData.receiptNo}_${Date.now()}.pdf`;
      const filePath = path.join(__dirname, "../uploads/receipts", filename);

      // Ensure directory exists
      const dir = path.join(__dirname, "../uploads/receipts");
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Create write stream
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // ===== DESIGN THE RECEIPT =====

      // Header - College Name
      doc
        .fontSize(22)
        .font("Helvetica-Bold")
        .fillColor("#1a56db")
        .text("FEE MANAGEMENT SYSTEM", { align: "center" });

      doc
        .fontSize(12)
        .font("Helvetica")
        .fillColor("#6b7280")
        .text("Official Payment Receipt", { align: "center" });

      // Divider line
      doc
        .moveDown(0.5)
        .strokeColor("#e5e7eb")
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();

      // Receipt Details
      doc.moveDown(1);

      // Receipt No and Date on same line
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor("#374151")
        .text(`Receipt No: `, { continued: true })
        .font("Helvetica")
        .fillColor("#6b7280")
        .text(`${receiptData.receiptNo || "N/A"}`);

      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor("#374151")
        .text(`Date: `, { continued: true })
        .font("Helvetica")
        .fillColor("#6b7280")
        .text(
          receiptData.date
            ? new Date(receiptData.date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "N/A",
        );

      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor("#374151")
        .text(`Transaction ID: `, { continued: true })
        .font("Helvetica")
        .fillColor("#6b7280")
        .text(`${receiptData.transactionId || "N/A"}`);

      doc.moveDown(1);

      // Student Information Section
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor("#1a56db")
        .text("STUDENT INFORMATION", { underline: true });

      doc.moveDown(0.5);

      // Student Details Table
      const studentData = receiptData.student || {};
      const studentDetails = [
        { label: "Student Name", value: studentData.name || "N/A" },
        { label: "Course", value: studentData.course || "N/A" },
        { label: "Semester", value: studentData.semester || "N/A" },
        { label: "Enrollment No", value: studentData.enrollmentNo || "N/A" },
        { label: "Email", value: studentData.email || "N/A" },
        { label: "Phone", value: studentData.phone || "N/A" },
      ];

      // Create a styled table for student info
      const col1X = 50;
      const col2X = 200;
      const col3X = 350;
      const col4X = 450;
      let yPos = doc.y;

      doc.fontSize(10).font("Helvetica-Bold").fillColor("#374151");

      // Table headers
      doc.text("Field", col1X, yPos, { width: 120 });
      doc.text("Value", col3X, yPos, { width: 200 });

      doc
        .strokeColor("#e5e7eb")
        .lineWidth(0.5)
        .moveTo(col1X, yPos + 15)
        .lineTo(550, yPos + 15)
        .stroke();

      yPos += 20;

      // Table rows
      studentDetails.forEach((item, index) => {
        doc
          .font("Helvetica")
          .fillColor("#4b5563")
          .text(item.label, col1X, yPos, { width: 120 })
          .font("Helvetica")
          .fillColor("#1f2937")
          .text(item.value || "N/A", col3X, yPos, { width: 200 });

        yPos += 20;

        // Add line after each row except last
        if (index < studentDetails.length - 1) {
          doc
            .strokeColor("#f3f4f6")
            .lineWidth(0.5)
            .moveTo(col1X, yPos)
            .lineTo(550, yPos)
            .stroke();
        }
      });

      doc.moveDown(1);

      // Fee Details Section
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor("#1a56db")
        .text("FEE DETAILS", { underline: true });

      doc.moveDown(0.5);

      // Fee Breakdown Table
      const feeItems = [
        { label: "Fee Type", value: receiptData.feeType || "N/A" },
        { label: "Payment Method", value: receiptData.paymentMethod || "N/A" },
        {
          label: "Amount",
          value: `₹${receiptData.amount?.toLocaleString() || 0}`,
        },
        { label: "Status", value: receiptData.status || "Completed" },
      ];

      yPos = doc.y;

      feeItems.forEach((item, index) => {
        doc
          .font("Helvetica-Bold")
          .fillColor("#374151")
          .text(`${item.label}:`, 50, yPos, { width: 120 })
          .font("Helvetica")
          .fillColor("#1f2937")
          .text(item.value, 170, yPos, { width: 380 });

        yPos += 20;
      });

      doc.moveDown(1);

      // Total Amount Box
      const totalBoxY = doc.y;
      doc.fillColor("#e0e7ff").rect(50, totalBoxY, 500, 50).fill();

      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .fillColor("#1a56db")
        .text("TOTAL AMOUNT PAID:", 70, totalBoxY + 12, { width: 200 })
        .fillColor("#dc2626")
        .text(
          `₹${receiptData.amount?.toLocaleString() || 0}`,
          300,
          totalBoxY + 12,
          { width: 200, align: "right" },
        );

      doc.moveDown(3);

      // Footer
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#9ca3af")
        .text("This is a system-generated receipt. No signature required.", {
          align: "center",
        });

      doc
        .fontSize(9)
        .fillColor("#d1d5db")
        .text(
          `Generated on ${new Date().toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}`,
          { align: "center" },
        );

      // Finalize the PDF
      doc.end();

      stream.on("finish", () => {
        resolve({
          filename,
          filePath,
          url: `/uploads/receipts/${filename}`,
        });
      });

      stream.on("error", (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = generateReceiptPDF;
