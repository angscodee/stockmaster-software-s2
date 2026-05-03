// PDF generation is handled by PDFKit in the controllers.
// This file is kept for backwards compatibility.
module.exports = {
  generatePDF: async () => {
    throw new Error('Use PDFKit controllers instead of pdfGenerator');
  }
};
