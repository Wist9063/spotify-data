const fetch = require('node-fetch');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const b64 = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_SECRET_ID}`).toString('base64');
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: process.env.SPOTIFY_REFRESH_TOKEN
  });
  const token = await fetch('https://accounts.spotify.com/api/token', {method: 'post', body: body, headers: {'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': `Basic ${b64}`}});
  const getToken = await token.json();

  let playing, send;
  try {
    const nowPlaying = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {headers: {'Authorization': `Bearer ${getToken.access_token}`}});
    playing = await nowPlaying.json();
    send = {
      name: playing.item.name,
      url: playing.item.external_urls.spotify,
      artist: playing.item.artists[0].name,
      formatted: `${playing.item.name} by ${playing.item.artists[0].name}`
    };
  } catch (e) {
    send = {
      name: 'not playing',
      url: null,
      artist: 'not playing',
      formatted: 'not playing'
    };
  }

  res.send(send);
};