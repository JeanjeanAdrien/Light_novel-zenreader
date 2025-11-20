import puppeteer from 'puppeteer';

export async function scrapeChapter(url) {
    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setRequestInterception(true);
        page.on('request', r => ['image', 'font', 'stylesheet'].includes(r.resourceType()) ? r.abort() : r.continue());

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForSelector('#chr-content, .chr-c', { timeout: 15000 });

        const data = await page.evaluate(() => {
            const root = document.querySelector('#chr-content, .chr-c');
            root.querySelectorAll('script, style, iframe, .ads').forEach(el => el.remove());

            const paragraphs = Array.from(root.querySelectorAll('p'))
                .map(p => p.innerText.trim())
                .filter(t => t.length > 0);

            const title = document.querySelector('.chr-title, .chr-text')?.innerText.trim() || "Chapitre Inconnu";
            const next = document.querySelector('#next_chap')?.href;
            const prev = document.querySelector('#prev_chap')?.href;

            return { title, paragraphs, next, prev };
        });

        await browser.close();
        return data;

    } catch (error) {
        if (browser) await browser.close();
        throw error;
    }
}
