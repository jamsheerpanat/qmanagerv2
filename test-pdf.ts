import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set the content to reproduce the issue
  await page.setContent(`
    <html>
      <head>
        <style>
          @page { size: A4; margin: 0; }
          body { margin: 0; padding: 0; background: gray; }
          .pdf-page {
            width: 210mm;
            height: 297mm;
            background: red;
          }
        </style>
      </head>
      <body>
        <div class="pdf-container" style="display: block;">
          <div class="pdf-page">Test</div>
        </div>
      </body>
    </html>
  `);
  
  await page.pdf({
    path: 'test.pdf',
    format: 'A4',
    printBackground: true,
    margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
  });
  
  await browser.close();
}

main().catch(console.error);
