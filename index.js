import express from 'express';
const app = express();
const fcUrl = "https://www.ea.com/games/ea-sports-fc/fc-24/news";
const fcJson = "fcArticles.json";
const maddenUrl = "https://www.ea.com/games/madden-nfl/madden-nfl-24/news";
const maddenJson = "maddenArticles.json";
import { getArticles } from './getArticles.js';
const html = String.raw;

app.set('view engine', 'ejs');
app.use('/public', express.static('public'))

async function handleEaArticlesRequest(url, jsonFile, req, res) {
  try {
    const articles = await getArticles(url, jsonFile);
    return articles;
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
    throw error;
  }
}

app.get('/', async (req, res) => {
  try {
    const maddenArticles = await handleEaArticlesRequest(maddenUrl, maddenJson, req, res);
    const fcArticles = await handleEaArticlesRequest(fcUrl, fcJson, req, res);
    const allArticles = maddenArticles.concat(fcArticles);
    const renderedArticles = res.render('articles', { articles: allArticles, imageSrc: '../AllIn.png' });
    res.send(renderedArticles);
}catch (error) {
    console.log(error);
  }
});

app.listen(3000, () => {
  console.log('Express server initialized');
});
