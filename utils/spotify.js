export default class Spotify {
  constructor() {
    this.access_token_key = 'spotify_access_token';
    this.currentTrack = null;
  }

  setAccessToken(access_token) {
    this.access_token = access_token;
    if (!access_token) {
      localStorage.removeItem(this.access_token_key);
    } else {
      localStorage.setItem(this.access_token_key, this.access_token);
    }
  }

  init() {
    this.audio = new Audio();
    this.access_token = localStorage.getItem(this.access_token_key);
  }

  isLoggedIn() {
    return Promise.resolve(!!this.access_token);
  }

  playTrack(track) {
    this.currentTrack = track;
    this.audio.src = track.preview_url;
    this.audio.play();
  }

  playSong(songName, artistName) {
    var query = songName;
    if (artistName) {
      query += ' artist:' + artistName;
    }

    return this.searchTracks(query);
  }

  searchTracks(query) {
    return fetch(`https://api.spotify.com/v1/search?type=track&q=${query}`)
    .then(res => res.json())
    .then(data => {
      if (data.tracks.items.length) {
        var track = data.tracks.items[0];
        console.log(track);
        this.playTrack(track);

        return track;
      }
    });
  }

  getPlaylist(userId, playlistId) {
    return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}`, {
        headers: {
          'Authorization': 'Bearer ' + this.access_token
        }
      })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        return data;
      });
  }

  getUserData() {
    if (!this.access_token) {
      console.error('set access token first');
      return;
    }

    return fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': 'Bearer ' + this.access_token
        }
      })
      .then(res => res.json());
  }
};
