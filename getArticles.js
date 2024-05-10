import cheerio from 'cheerio';
import fetch from 'node-fetch';
import path from 'path';
import { promises as fs } from 'fs';

async function getArticles(url, jsonFileName) {
  try {
    const jsonFilePath = path.join(process.cwd(), jsonFileName);
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const articles = [];

    const articlePromises = $('ea-tile').map(async function () {
      const titleText = $(this).find('h3').text().trim();
      let title = titleText;
      if (titleText.includes(':')) {
        const colonIndex = titleText.indexOf(':');
        title = titleText.substring(0, colonIndex + 1) + '\n' + titleText.substring(colonIndex + 1);
      }
      const date = $(this).attr('eyebrow-text');
      const description = $(this).find('ea-tile-copy').text().trim();
      const image = $(this).attr('media');
      const relativeUrl = $(this).find('ea-cta a').attr('href');
      const articleUrl = 'https://www.ea.com' + relativeUrl;
      const dataname = url.split('/')[4];

      const response2 = await fetch(articleUrl);
      const html2 = await response2.text();
      const $2 = cheerio.load(html2);
      const paragraphs = $2('ea-text').map(function () {
        return $(this).text().trim();
      }).get();

      return {
        title,
        date,
        description,
        image,
        url: articleUrl,
        dataname,
        paragraphs
      };
    }).get();

    const resolvedArticles = await Promise.all(articlePromises);

    articles.push(...resolvedArticles);

    await fs.writeFile(jsonFilePath, JSON.stringify(articles, null, 2));

    return articles;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export { getArticles };
