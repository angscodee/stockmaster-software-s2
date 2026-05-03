const puppeteer = require('puppeteer');
const handlebars = require('handlebars');

const generatePdf = async (htmlTemplate, data) => {
  let browser;
  try {
    // Compile template with handlebars
    const template = handlebars.compile(htmlTemplate);
    const html = template(data);

    // Launch puppeteer
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set content
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF with Puppeteer:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

module.exports = { generatePdf };
