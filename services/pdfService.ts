
import { jsPDF } from "jspdf";

export const generatePdf = (title: string, summary: string) => {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 72; // 1 inch margin
  const usableWidth = pageWidth - (margin * 2);

  // Creates a filesystem-safe filename from the video title.
  const safeTitle = title.replace(/[\/\\?%*:|"<>]/g, '-').trim();
  const fileName = `${safeTitle}.pdf`;

  // --- APA-Style Configuration ---
  const FONT_FAMILY = {
    heading: "times",
    body: "times",
  };
  const FONT_SIZES = {
    title: 18,
    h1: 14,
    h2: 13,
    body: 12,
  };
  const COLORS = {
    title: [0, 0, 0],
    heading: [0, 0, 0],
    body: [0, 0, 0],
  };

  // Line height multipliers (relative to font size)
  const LINE_HEIGHT_MULTIPLIERS = {
    title: 1.5,
    heading: 1.5,
    body: 2.0, // Double spacing
  };

  const SPACING = {
    paragraph: 24, // Space after paragraph
    heading_before: 24,
    heading_after: 12,
    list_item: 12,
  };

  let currentY = margin;

  // Helper to add a page if needed
  // Returns true if a new page was added
  const checkAndAddPage = (heightNeeded: number) => {
    if (currentY + heightNeeded > pageHeight - margin) {
      doc.addPage();
      currentY = margin;
      return true;
    }
    return false;
  };

  // --- Main Title ---
  doc.setFont(FONT_FAMILY.heading, "bold");
  doc.setFontSize(FONT_SIZES.title);
  doc.setTextColor(COLORS.title[0], COLORS.title[1], COLORS.title[2]);

  const splitTitle = doc.splitTextToSize(title, usableWidth);
  // Calculate height manually: number of lines * font size * multiplier
  const titleLineHeight = FONT_SIZES.title * LINE_HEIGHT_MULTIPLIERS.title;
  const titleBlockHeight = splitTitle.length * titleLineHeight;

  checkAndAddPage(titleBlockHeight);

  // Render title lines manually to ensure consistent spacing
  splitTitle.forEach((line: string) => {
    doc.text(line, pageWidth / 2, currentY, { align: 'center' });
    currentY += titleLineHeight;
  });

  currentY += 24; // Extra space after title

  // --- Process Summary Content ---
  const cleanSummary = summary.replace(/\\n/g, '\n').trim();
  const lines = cleanSummary.split('\n');

  lines.forEach(line => {
    line = line.trim();
    if (!line) return; // Skip empty lines

    // Strip markdown formatting
    const cleanLineText = line
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/`([^`]+)`/g, '$1');

    let isHeading = false;
    let headingLevel = 0;

    // Detect headings
    const headingMatch = line.match(/^(#+)\s+(.*)/);
    if (headingMatch) {
      isHeading = true;
      headingLevel = headingMatch[1].length;
      line = cleanLineText.replace(/^(#+)\s+/, '');
    } else {
      line = cleanLineText;
    }

    if (isHeading) {
      const fontSize = headingLevel === 1 ? FONT_SIZES.h1 : FONT_SIZES.h2;
      const lineHeight = fontSize * LINE_HEIGHT_MULTIPLIERS.heading;

      currentY += SPACING.heading_before;

      doc.setFont(FONT_FAMILY.heading, "bold");
      doc.setFontSize(fontSize);
      doc.setTextColor(COLORS.heading[0], COLORS.heading[1], COLORS.heading[2]);

      const splitHeading = doc.splitTextToSize(line, usableWidth);
      const blockHeight = splitHeading.length * lineHeight;

      checkAndAddPage(blockHeight);

      splitHeading.forEach((headingLine: string) => {
        doc.text(headingLine, margin, currentY);
        currentY += lineHeight;
      });

      currentY += SPACING.heading_after;

    } else if (line.startsWith('* ') || line.startsWith('- ')) {
      // List Item
      const bulletPoint = '• ';
      const listItemText = line.replace(/^[\*\-]\s+/, '');
      const textIndent = 24;

      doc.setFont(FONT_FAMILY.body, "normal");
      doc.setFontSize(FONT_SIZES.body);
      doc.setTextColor(COLORS.body[0], COLORS.body[1], COLORS.body[2]);

      const fontSize = FONT_SIZES.body;
      const lineHeight = fontSize * LINE_HEIGHT_MULTIPLIERS.body;

      const splitItem = doc.splitTextToSize(listItemText, usableWidth - textIndent);
      const blockHeight = splitItem.length * lineHeight;

      checkAndAddPage(blockHeight);

      // Draw bullet
      doc.text(bulletPoint, margin + 10, currentY);

      // Draw text lines
      splitItem.forEach((itemLine: string) => {
        doc.text(itemLine, margin + textIndent, currentY);
        currentY += lineHeight;
      });

      currentY += SPACING.list_item;

    } else {
      // Standard Paragraph
      doc.setFont(FONT_FAMILY.body, "normal");
      doc.setFontSize(FONT_SIZES.body);
      doc.setTextColor(COLORS.body[0], COLORS.body[1], COLORS.body[2]);

      const fontSize = FONT_SIZES.body;
      const lineHeight = fontSize * LINE_HEIGHT_MULTIPLIERS.body;

      const splitPara = doc.splitTextToSize(line, usableWidth);
      const blockHeight = splitPara.length * lineHeight;

      checkAndAddPage(blockHeight);

      splitPara.forEach((paraLine: string) => {
        doc.text(paraLine, margin, currentY);
        currentY += lineHeight;
      });

      currentY += SPACING.paragraph;
    }
  });

  doc.save(fileName);
};
