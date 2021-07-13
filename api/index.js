const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const b64 = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_SECRET_ID}`).toString('base64');
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: process.env.SPOTIFY_REFRESH_TOKEN
  });
  const token = await fetch('https://accounts.spotify.com/api/token', {method: 'post', body: body, headers: {'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': `Basic ${b64}`}});
  const getToken = await token.json();

  const nowPlaying = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {headers: {'Authorization': `Bearer ${getToken.access_token}`}});
  const playing = await nowPlaying.json();

  const send = {
    name: playing.item.name,
    url: playing.item.external_urls.spotify,
    artist: playing.item.artist[0].name,
    formatted: `${playing.item.name} - ${playing.item.artists[0].name}`
  };

  res.send(send);
};