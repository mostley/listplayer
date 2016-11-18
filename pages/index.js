import React from 'react'
import css from 'next/css'
import Head from 'next/head'
import Spotify from '../utils/spotify';

import Playlist from '../components/playlist';

export default class ContentContainer extends React.Component {
  constructor(props) {
    super(props);

    this.stateKey = 'spotify_auth_state';
    this.clientId = '9bce96a638ae4f3b9b884ff64ba89bd8';
    this.redirectUri = 'http://localhost:3000';
    this.playlistId = '2UlpDJ338voO34EWEIx29d';
    this.state = { loggedin: false };

    this.spotify = new Spotify();
  }

  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  generateRandomString(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  loadUserData() {
    console.log('loadUserData');
    return this.spotify.getUserData()
      .then(response => {
        window.location.hash = '';

        this.setState({
          loggedin: true,
          userId: response.id,
          username: response.display_name,
          userimages: response.images
        });
      })
      .catch(err => {
        console.error('No longer authenticated');
        this.spotify.setAccessToken(null);
        this.setState({
          loggedin: false
        });
      });
  }

  loadPlaylist() {
    return this.spotify.getPlaylist(this.state.userId, this.playlistId)
      .then(playlist => {
        this.setState({
          playlistTitle: playlist.name,
          playlistTracks: playlist.tracks.items.map(item => item.track)
        });
      });
  }

  componentDidMount() {
    this.spotify.init();
    this.spotify.isLoggedIn()
      .then(loggedIn => {
        if (!loggedIn) {
          var params = this.getHashParams();

          var access_token = params.access_token,
              state = params.state,
              storedState = localStorage.getItem(this.stateKey);

          if (access_token && (state == null || state !== storedState)) {
            console.error('There was an error during the authentication', access_token, state, storedState);
            this.setState({ loggedin: false, error: 'There was an error during the authentication' });
          } else {
            localStorage.removeItem(this.stateKey);
            this.spotify.setAccessToken(access_token);
          }
        } else {
          this.loadUserData()
            .then(() => {
              return this.loadPlaylist();
            })
        }
      });
  }

  onLoginClicked() {
    var state = this.generateRandomString(16);

    localStorage.setItem(this.stateKey, state);
    var scope = 'user-read-private user-read-email';

    var url = 'https://accounts.spotify.com/authorize';
    url += '?response_type=token';
    url += '&client_id=' + encodeURIComponent(this.clientId);
    url += '&scope=' + encodeURIComponent(scope);
    url += '&redirect_uri=' + encodeURIComponent(this.redirectUri);
    url += '&state=' + encodeURIComponent(state);

    window.location = url;
  }

  render() {
    let loginControl = null;
    let loggedinControl = null;

    if (!this.state.loggedin) {
      loginControl = <div>
        <button className="btn btn-primary" onClick={this.onLoginClicked.bind(this)}>Log in with Spotify</button>
      </div>;
    } else {
      loggedinControl = <div id="loggedin">
        <div id="user-profile">
          <h1>Logged in as {this.state.username}</h1>
          <img className="avatar" src={this.state.userimages[0].url} />
        </div>
      </div>
    }

    return <div>
      <Head>
        <title>ListPlayer</title>

        <link rel="stylesheet" href="static/main.css" />
      </Head>

      <h1>ListPlayer</h1>
      <div className="container">
        <div className="error">{this.state.error}</div>
        {loginControl}
        {loggedinControl}

        <Playlist spotify={this.spotify} title={this.state.playlistTitle} tracks={this.state.playlistTracks}/>
      </div>
    </div>;
  }
};
