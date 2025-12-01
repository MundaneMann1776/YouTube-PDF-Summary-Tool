
import { jsPDF } from "jspdf";

export const generatePdf = async (title: string, summary: string) => {
  console.log("generatePdf called with title:", title);
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'pt',
    format: 'a4'
  });

  // Explicitly set default font to helvetica (standard PDF font)
  const currentFont = 'helvetica';
  doc.setFont(currentFont);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 72; // 1 inch margin (APA Standard)
  const usableWidth = pageWidth - (margin * 2);

  // Creates a filesystem-safe filename from the video title.
  const safeTitle = title.replace(/[\/\\?%*:|"<>]/g, '-').trim();
  const fileName = `${safeTitle}.pdf`;

  // --- APA Style Configuration ---
  const FONT_SIZES = {
    title: 12,
    h1: 12,
    h2: 12,
    body: 12,
    footer: 10,
  };
  const COLORS = {
    text: [0, 0, 0],
  };

  // Line height multipliers
  const LINE_HEIGHT_MULTIPLIERS = {
    general: 2.0,
  };

  const SPACING = {
    paragraph: 0,
    indent: 36,
  };

  let currentY = margin;

  // Helper to add a page if needed
  const checkAndAddPage = (heightNeeded: number) => {
    if (currentY + heightNeeded > pageHeight - margin) {
      addPageNumber(doc.getNumberOfPages());
      doc.addPage();
      currentY = margin;
      addPageNumber(doc.getNumberOfPages());
      return true;
    }
    return false;
  };

  const addPageNumber = (pageNumber: number) => {
    doc.setFont(currentFont, "normal");
    doc.setFontSize(FONT_SIZES.footer);
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.text(`${pageNumber}`, pageWidth - margin, margin - 20, { align: 'right' });
  };

  // --- Title Page ---
  addPageNumber(1);
  currentY += 100;

  doc.setFont(currentFont, "bold");
  doc.setFontSize(FONT_SIZES.title);
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);

  const splitTitle = doc.splitTextToSize(title, usableWidth);
  const lineHeight = FONT_SIZES.title * LINE_HEIGHT_MULTIPLIERS.general;

  splitTitle.forEach((line: string) => {
    doc.text(line, pageWidth / 2, currentY, { align: 'center' });
    currentY += lineHeight;
  });

  currentY += lineHeight;

  doc.setFont(currentFont, "normal");
  doc.text("AI Generated Summary", pageWidth / 2, currentY, { align: 'center' });

  doc.addPage();
  currentY = margin;
  addPageNumber(2);

  doc.setFont(currentFont, "bold");
  doc.setFontSize(FONT_SIZES.title);
  doc.text(title, pageWidth / 2, currentY, { align: 'center' });
  currentY += lineHeight;

  // --- Process Summary Content ---
  const cleanSummary = summary.replace(/\\n/g, '\n').trim();
  const lines = cleanSummary.split('\n');

  lines.forEach(line => {
    line = line.trim();
    if (!line) return;

    const cleanLineText = line
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/`([^`]+)`/g, '$1');

    let isHeading = false;
    let headingLevel = 0;

    const headingMatch = line.match(/^(#+)\s+(.*)/);
    if (headingMatch) {
      isHeading = true;
      headingLevel = headingMatch[1].length;
      line = cleanLineText.replace(/^(#+)\s+/, '');
    } else {
      line = cleanLineText;
    }

    const fontSize = FONT_SIZES.body;
    const lineSpace = fontSize * LINE_HEIGHT_MULTIPLIERS.general;

    if (isHeading) {
      checkAndAddPage(lineSpace * 2);
      doc.setFont(currentFont, "bold");
      doc.setFontSize(FONT_SIZES.h1);
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);

      const splitHeading = doc.splitTextToSize(line, usableWidth);
      splitHeading.forEach((headingLine: string) => {
        if (headingLevel === 1) {
          doc.text(headingLine, pageWidth / 2, currentY, { align: 'center' });
        } else {
          doc.text(headingLine, margin, currentY, { align: 'left' });
        }
        currentY += lineSpace;
      });

    } else if (line.startsWith('* ') || line.startsWith('- ')) {
      const bulletPoint = '•';
      const listItemText = line.replace(/^[\*\-]\s+/, '');
      const textIndent = SPACING.indent;

      doc.setFont(currentFont, "normal");
      doc.setFontSize(FONT_SIZES.body);
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);

      const splitItem = doc.splitTextToSize(listItemText, usableWidth - textIndent - 10);
      const blockHeight = splitItem.length * lineSpace;

      checkAndAddPage(blockHeight);
      doc.text(bulletPoint, margin + (textIndent / 2), currentY);

      splitItem.forEach((itemLine: string) => {
        doc.text(itemLine, margin + textIndent, currentY);
        currentY += lineSpace;
      });

    } else {
      doc.setFont(currentFont, "normal");
      doc.setFontSize(FONT_SIZES.body);
      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);

      const splitPara = doc.splitTextToSize(line, usableWidth);
      const blockHeight = splitPara.length * lineSpace;

      checkAndAddPage(blockHeight);

      splitPara.forEach((paraLine: string, index: number) => {
        let xOffset = margin;
        if (index === 0) {
          xOffset += SPACING.indent;
        }
        doc.text(paraLine, xOffset, currentY);
        currentY += lineSpace;
      });
    }
  });

  console.log("PDF content generated. Attempting to save via Blob...");
  try {
    // Robust download method: Create Blob -> Create Link -> Click -> Cleanup
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log("PDF download triggered successfully.");
  } catch (err) {
    console.error("Error saving PDF:", err);
    alert("Failed to save PDF. Please check the console for details.");
  }
};
