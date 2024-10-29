import { PDFDocument, degrees } from 'pdf-lib';
import fs from 'fs';

/**
 * Rotates specified pages of a PDF by a given angle in a clockwise direction.
 * @param filePath - Path to the input PDF file.
 * @param rotation - Rotation angle in degrees (e.g., 90, 180, 270). Positive values rotate clockwise.
 * @param pages - Array of page numbers to rotate. If omitted, all pages are rotated.
 */
async function rotatePdfPages(filePath: string, rotation: number, ...pages: number[]) {
    try {
        // Read the PDF file
        const pdfBytes = fs.readFileSync(filePath);
        const pdfDoc = await PDFDocument.load(pdfBytes);

        // Normalize rotation angle to 0-360 degrees
        const rotationAngle = (rotation % 360 + 360) % 360;

        // Check if specific pages are provided
        if (pages.length > 0) {
            // Rotate only specified pages
            pages.forEach((pageIndex) => {
                console.log(pageIndex)
                const page = pdfDoc.getPage(pageIndex - 1); // Pages are zero-indexed
                const currentRotation = page.getRotation().angle; // Get the current rotation
                page.setRotation(degrees((currentRotation + rotationAngle) % 360)); // Apply cumulative rotation
            });
        } else {
            // Rotate all pages
            pdfDoc.getPages().forEach((page) => {
                const currentRotation = page.getRotation().angle;
                page.setRotation(degrees((currentRotation + rotationAngle) % 360));
            });
        }

        // Save the modified PDF back to the file
        const modifiedPdfBytes = await pdfDoc.save();
        fs.writeFileSync(filePath, modifiedPdfBytes);

        console.log('PDF pages rotated and saved successfully!');
    } catch (error) {
        console.error('Error rotating PDF pages:', error);
    }
}

// Usage example:
// Rotate all pages by 90 degrees
rotatePdfPages('merged.pdf', 180, 6);

