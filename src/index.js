/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npx wrangler dev src/index.js` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npx wrangler publish src/index.js --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

async function fetchToken() {
  const encoder = new TextEncoder();
  const u8 = encoder.encode(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_SECRET_ID}`)

  const decoder = new TextDecoder('utf8');
  const b64 = btoa(decoder.decode(u8));

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: SPOTIFY_REFRESH_TOKEN,
  });

  const data = {
    method: 'post',
    body: body,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${b64}`,
    },
  }

  const token = await fetch('https://accounts.spotify.com/api/token', data);

  return token.json();
}

async function getNowPlaying(response) {
  const data = {
    headers: {
      'Authorization': `Bearer ${response.access_token}`,
      'Content-Type': 'application/json'
    },
  }

  let nowPlaying;
  try {
    const playing = await (await fetch('https://api.spotify.com/v1/me/player/currently-playing', data)).json();

    nowPlaying = {
      name: playing.item.name ? playing.item.name : 'nothing',
      url: playing.item.external_urls.spotify ? playing.item.external_urls.spotify : null,
      artist: playing.item.artists[0].name ? playing.item.artists[0].name : 'nothing',
      formatted: playing.item.name? `${playing.item.name} by ${playing.item.artists[0].name}` : 'nothing',
    };
  } catch (e) {
    nowPlaying = {
      name: 'nothing',
      url: null,
      artist: 'nothing',
      formatted: 'nothing'
    }
  }
  return nowPlaying;
}

async function handleRequest() {
  const response = await fetchToken();
  const nowPlaying = await getNowPlaying(response);
  const data = {
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
  }

  return new Response(JSON.stringify(nowPlaying), data);
}

addEventListener('fetch', event => {
  return event.respondWith(handleRequest());
});