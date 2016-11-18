import React from 'react'
import css from 'next/css'

import juration from '../utils/juration';

export default class Playlist extends React.Component {
  static defaultProps = {
    tracks: []
  };

  constructor(props) {
    super(props);

    this.state = {
      currentTrack: null
    };
  }

  playTrack(track, pos) {
    return fetch(`http://localhost:8888/play/${track.id}/${pos}`)
      .then(() => {
        this.setState({ currentTrack: track })
      });
  }

  updateTrackData(trackId, note, startPosition) {
    localStorage.setItem('track_data_' + trackId, JSON.stringify({
        note,
        startPosition
      }));

    this.setState({ invalidate: new Date() });
  }

  getTrackData(trackId) {
    var result = localStorage.getItem('track_data_' + trackId)
    if (result) {
      result = JSON.parse(result);
    }

    return result || { note: '', startPosition: 0, ...result };
  }

  renderTrack(track) {
    var trackData = this.getTrackData(track.id);
    return <li key={track.id}>
      <input className="track-note" value={trackData.note} onChange={e => this.updateTrackData(track.id, e.target.value, trackData.startPosition)}/>
      <input className="track-pos" type="range" min="0" value={trackData.startPosition} max={track.duration/1000} step="1" onChange={e => this.updateTrackData(track.id, trackData.note, e.target.value)}/>
      <label>{juration.stringify(trackData.startPosition) || '0 secs'}</label>
      <div className="track-title">{track.name} - {track.artists[0].name}</div>
      <button className="playbutton" onClick={() => this.playTrack(track, trackData.startPosition)}>Play</button>
    </li>;
  }

  render() {
    console.log('render');
    let playInfo = null;

    if (this.state.currentTrack) {
      let track = this.state.currentTrack;
      playInfo = <span className="track-info">
        {track.name} - {track.artists[0].name}
        <img className="track-image" src={track.album.images[1].url}/>
      </span>;
    }

    return <div className="playlist">
      <h2>{this.props.title} {playInfo}</h2>
      <ul>
        {this.props.tracks.map(this.renderTrack.bind(this))}
      </ul>
    </div>;
  }
};
