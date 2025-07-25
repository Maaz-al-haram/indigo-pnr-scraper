import express from 'express';
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post('/api/check-pnr', async (req, res) => {
  const { pnr, lastName } = req.body;
  if (!pnr || !lastName) return res.status(400).json({ error: 'PNR and Last Name required' });

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    await page.goto('https://www.goindigo.in/member/my-booking.html', {
      waitUntil: 'networkidle2',
    });

    await page.type('#pnrNo', pnr);
    await page.type('#lastName', lastName);
    await page.click('#pnrBtn');

    await page.waitForSelector('.modifyBookingPage', { timeout: 10000 });

    const result = await page.evaluate(() => {
      return document.querySelector('.modifyBookingPage')?.innerText || 'Booking not found';
    });

    await browser.close();
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch PNR details', details: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
