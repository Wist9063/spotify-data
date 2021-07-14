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

  let send;
  try {
    const nowPlaying = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {headers: {'Authorization': `Bearer ${getToken.access_token}`}});
    const playing = await nowPlaying.json();
    if (req.query.redirect) {
      res.redirect(playing.item.external_urls.spotify);
    } else {
      send = {
        schemaVersion: 1,
        label: 'listening to',
        message: `${playing.item.name} By ${playing.item.artists[0].name}`,
        namedLogo: 'Spotify',
        color: '1db954',
        logoColor: 'white'
      };
      return res.send(send);
    }
  } catch (e) {
    send = {
      schemaVersion: 1,
      label: 'listening to',
      message: 'nothing',
      namedLogo: 'Spotify',
      color: '1db954',
      logoColor: 'white'
    };
    return res.send(send);
  }

};