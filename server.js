import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/check-pnr', async (req, res) => {
  const { pnr, lastName } = req.body;

  if (!pnr || !lastName) {
    return res.status(400).json({ error: 'PNR and Last Name required' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto('https://www.goindigo.in/member/my-booking.html', {
      waitUntil: 'networkidle2'
    });

    // Fill PNR and Last Name
    await page.type('#pnr', pnr);
    await page.type('#lastName', lastName);
    await page.click('button[type="submit"]');

    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Now scrape booking info
    const content = await page.content();
    await browser.close();

    res.send({ success: true, html: content }); // You can parse specific data instead
  } catch (error) {
    console.error('Error fetching PNR:', error);
    res.status(500).json({ error: 'Failed to fetch PNR details' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
