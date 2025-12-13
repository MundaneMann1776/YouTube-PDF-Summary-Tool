import { jsPDF } from "jspdf";

interface TextSegment {
    text: string;
    bold: boolean;
    italic: boolean;
}

const parseMarkdown = (text: string): TextSegment[] => {
    const segments: TextSegment[] = [];
    // Regex to split by **bold** or *italic* markers
    // Captures the delimiters and the content
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
    const parts = text.split(regex);

    parts.forEach(part => {
        if (!part) return;

        if (part.startsWith('**') && part.endsWith('**')) {
            segments.push({ text: part.slice(2, -2), bold: true, italic: false });
        } else if (part.startsWith('*') && part.endsWith('*')) {
            segments.push({ text: part.slice(1, -1), bold: false, italic: true });
        } else {
            segments.push({ text: part, bold: false, italic: false });
        }
    });

    return segments;
};

export const generatePdf = async (title: string, summary: string) => {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4'
    });

    // Configuration
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 50; // Standard ~0.7 inch margin
    const usableWidth = pageWidth - (margin * 2);

    const fonts = {
        normal: 'times', // Times New Roman is standard for professional docs
        bold: 'times',
        italic: 'times',
        boldItalic: 'times'
    };
    
    // Explicitly check/set fonts if needed, but 'times' is standard in jspdf

    const styles = {
        title: { fontSize: 24, fontStyle: 'bold', align: 'center' as const, spacing: 40 },
        h1: { fontSize: 16, fontStyle: 'bold', align: 'left' as const, spacing: 15 },
        h2: { fontSize: 14, fontStyle: 'bold', align: 'left' as const, spacing: 12 },
        h3: { fontSize: 12, fontStyle: 'bold', align: 'left' as const, spacing: 10 },
        body: { fontSize: 11, fontStyle: 'normal', lineHeight: 1.4 },
        footer: { fontSize: 9, fontStyle: 'normal' }
    };

    let currentY = margin;

    const addPage = () => {
        doc.addPage();
        currentY = margin;
    };

    const checkPageBreak = (height: number) => {
        if (currentY + height > pageHeight - margin) {
            addPage();
            return true;
        }
        return false;
    };

    const printSegments = (segments: TextSegment[], x: number, maxWidth: number, fontSize: number, align: 'left' | 'center' = 'left') => {
        doc.setFontSize(fontSize);
        const lineHeight = fontSize * styles.body.lineHeight;
        
        // Measure words for wrapping
        let currentLine: any[] = [];
        let currentLineWidth = 0;

        const flushLine = () => {
            if (currentLine.length === 0) return;

            let startX = x;
            if (align === 'center') {
                startX = (pageWidth - currentLineWidth) / 2;
            }

            currentLine.forEach(seg => {
                doc.setFont(fonts.normal, seg.bold ? (seg.italic ? 'bolditalic' : 'bold') : (seg.italic ? 'italic' : 'normal'));
                doc.text(seg.text, startX, currentY);
                startX += doc.getTextWidth(seg.text);
            });
            
            currentY += lineHeight;
            checkPageBreak(lineHeight);
            currentLine = [];
            currentLineWidth = 0;
        };

        segments.forEach(seg => {
            const words = seg.text.split(/(\s+)/); // Split by whitespace but keep delimiters to preserve spacing
            
            words.forEach(word => {
                if (!word) return;
                
                // Determine style for measurement
                doc.setFont(fonts.normal, seg.bold ? (seg.italic ? 'bolditalic' : 'bold') : (seg.italic ? 'italic' : 'normal'));
                const wordWidth = doc.getTextWidth(word);

                if (currentLineWidth + wordWidth > maxWidth) {
                    flushLine();
                    // If word is whitespace and at start of new line, skip it
                    if (/^\s+$/.test(word)) return;
                }

                currentLine.push({ text: word, bold: seg.bold, italic: seg.italic });
                currentLineWidth += wordWidth;
            });
        });

        flushLine();
    };

    // --- Cover Page ---
    // Background accent
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Border
    doc.setDrawColor(50, 50, 50);
    doc.setLineWidth(2);
    doc.rect(margin, margin, usableWidth, pageHeight - (margin * 2), 'S');

    currentY = pageHeight / 3;

    // Title
    doc.setFont(fonts.bold, 'bold');
    doc.setFontSize(styles.title.fontSize);
    doc.setTextColor(33, 33, 33);
    
    const splitTitle = doc.splitTextToSize(title, usableWidth - 100);
    splitTitle.forEach((line: string) => {
        doc.text(line, pageWidth / 2, currentY, { align: 'center' });
        currentY += 30;
    });

    currentY += 40;
    doc.setFontSize(14);
    doc.setFont(fonts.normal, 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text("AI Generated Summary", pageWidth / 2, currentY, { align: 'center' });
    
    currentY += 20;
    doc.text(new Date().toLocaleDateString(), pageWidth / 2, currentY, { align: 'center' });

    // Footer on cover
    doc.setFontSize(10);
    doc.text("YouTube Video Summarizer", pageWidth / 2, pageHeight - margin - 20, { align: 'center' });

    addPage();

    // --- Content Pages ---
    const lines = summary.split('\n');

    lines.forEach(line => {
        line = line.trim();
        if (!line) {
             currentY += styles.body.fontSize; // Paragraph spacing
             checkPageBreak(styles.body.fontSize);
             return;
        }

        // Detect Headers
        let isHeader = false;
        let headerLevel = 0;
        let cleanLine = line;

        const headerMatch = line.match(/^(#+)\s+(.*)/);
        if (headerMatch) {
            isHeader = true;
            headerLevel = headerMatch[1].length;
            cleanLine = headerMatch[2];
        }

        if (isHeader) {
            currentY += 10; // Space before header
            checkPageBreak(30); // Ensure header isn't at bottom
            
            const style = headerLevel === 1 ? styles.h1 : (headerLevel === 2 ? styles.h2 : styles.h3);
            doc.setFont(fonts.bold, 'bold');
            doc.setFontSize(style.fontSize);
            doc.setTextColor(0, 0, 0);
            
            // Render Header
            const segments = parseMarkdown(cleanLine);
            printSegments(segments, margin, usableWidth, style.fontSize, style.align);
            
            currentY += 5; // Space after header
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
            // Lists
            const bulletText = line.substring(2);
            const segments = parseMarkdown(bulletText);
            
            doc.setFont(fonts.normal, 'normal');
            doc.setFontSize(styles.body.fontSize);
            
            // Draw bullet
            const bulletY = currentY;
            doc.text("•", margin + 10, bulletY);
            
            // Indent text
            printSegments(segments, margin + 25, usableWidth - 25, styles.body.fontSize);
        } else {
            // Body Text
            const segments = parseMarkdown(cleanLine);
            printSegments(segments, margin, usableWidth, styles.body.fontSize);
        }
    });

    // --- Page Numbering ---
    const pageCount = doc.getNumberOfPages();
    for (let i = 2; i <= pageCount; i++) { // Skip cover page
        doc.setPage(i);
        doc.setFont(fonts.normal, 'italic');
        doc.setFontSize(styles.footer.fontSize);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i - 1} of ${pageCount - 1}`, pageWidth - margin, pageHeight - 30, { align: 'right' });
    }

    // Save
    const safeTitle = title.replace(/[/\\?%*:|"<>]/g, '-').trim();
    doc.save(`${safeTitle}.pdf`);
};