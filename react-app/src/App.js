import React, { Component } from 'react';
import franceBackgroundImage from './france_background.jpg';
import logo from './logo.svg';
import './App.css';

const words = ["Word1", "Word2", "Word3", "Word4", "Word5"];
const languages = {
  french: {
    description: "add a ",
    imageUrl: ""
  }
}

const getRandomWord = () => {
  console.log(Math.random() * words.length);
  return words[Math.floor(Math.random() * words.length)];
}

class App extends Component {
  state = {
    wordToShow: null,
    backgroundImgUrl: franceBackgroundImage
  };

  componentDidMount() {
    const word = getRandomWord();
    console.log(word);
    this.setState({
      wordToShow: word
    });
  }

  render() {
    return (
      <div className="App" style={{
        backgroundImage: `url('${this.state.backgroundImgUrl}')`
      }}>
        <header className="App-header">
          <h1 className="App-title">Learn: <u>French</u>!</h1>
        </header>
        <p className="App-intro">
          {this.state.wordToShow} -> {this.state.wordToShow}
        </p>
        <p className="sub-paragraph"> Open a new tab or refresh for a different word. </p>
      </div>
    );
  }
}

export default App;
