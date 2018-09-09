import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

const words = ["1", "2", "3", "4", "5"];
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
    wordToShow: null
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
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Learn: <u>French</u></h1>
        </header>
        <p className="App-intro">
          {this.state.wordToShow}
        </p>
      </div>
    );
  }
}

export default App;
