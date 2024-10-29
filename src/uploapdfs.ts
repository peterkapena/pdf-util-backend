import { PDFDocument, PageSizes, degrees } from 'pdf-lib';
import fs from 'fs';

// Global constants for A3 and A4 page dimensions
const A3_PAGE = { width: PageSizes.A3[0], height: PageSizes.A3[1] };
const A4_PAGE = { width: PageSizes.A4[0], height: PageSizes.A4[1] };

async function mergePdfsWithScaling(pdfs: Buffer[]): Promise<Uint8Array> {
    const mergedPdf = await PDFDocument.create();

    // Load the first PDF to determine target page size (A3 or A4)
    const firstPdf = await PDFDocument.load(pdfs[0]);
    const firstPage = firstPdf.getPage(0);
    const firstPageWidth = firstPage.getWidth();
    const targetPageSize = firstPageWidth >= A3_PAGE.width ? A3_PAGE : A4_PAGE;

    // console.log(firstPageWidth)
    // console.log(A3_PAGE.width)
    // console.log(A4_PAGE.width)

    // Add each PDF to the merged document with scaling and rotation adjustments
    for (const pdfBytes of pdfs) {
        const pdf = await PDFDocument.load(pdfBytes);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

        pages.forEach(page => {
            const pageWidth = page.getWidth();
            const pageHeight = page.getHeight();

            // Check if the page needs to be rotated to fit the target orientation
            let rotationAngle = 0;
            if (pageWidth > pageHeight) { // Landscape orientation
                rotationAngle = 90; // Rotate to portrait
            }

            // Calculate the scaling factor to fit the page within target size
            const scaleX = targetPageSize.width / (rotationAngle ? pageHeight : pageWidth);
            const scaleY = targetPageSize.height / (rotationAngle ? pageWidth : pageHeight);
            // const scale = Math.min(scaleX, scaleY); // Uniform scaling to fit the target size

            // Apply rotation, scaling, and positioning
            page.setRotation(degrees(rotationAngle));
            page.scale(scaleX, scaleY);

            // Add the page to the document
            mergedPdf.addPage(page);
        });
    }

    return await mergedPdf.save();
}

(async () => {
    const pdfBuffers = [
        fs.readFileSync('uploads/1.pdf'),
        fs.readFileSync('uploads/2.pdf'),
    ];

    const mergedPdfBytes = await mergePdfsWithScaling(pdfBuffers);
    fs.writeFileSync('merged.pdf', mergedPdfBytes);
})();
