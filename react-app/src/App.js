/*global chrome*/
import React, { Component } from 'react';
import franceBackgroundImage from './france_background.jpg';
import {Stitch, RemoteMongoClient, AnonymousCredential} from "mongodb-stitch-browser-sdk";
import arrow from './media/arrow.jpg';
import settingsIcon from './settings_icon.png';
import './App.css';
import {translateFrench} from "./translate";

const APP_ID = "auto-linguo-xaqwa";
const client = Stitch.initializeDefaultAppClient(APP_ID);
const mongo = client.getServiceClient(RemoteMongoClient.factory, "mongodb-atlas");

const words = ["Bonjour", "Salut", "Merci", "Je", "Tu", "Suis", "Oui", "Non" ];

class App extends Component {
    state = {
        wordToShow: null,
        translatedWord: null,
        questionWord: null,
        answer: null,
        correctAnswer: null,
        isCorrect: false,
        isWrong: false,
        backgroundImgUrl: franceBackgroundImage,
        languageChoice: "french",
        words: []
    };

    componentDidMount() {
        this.queryWords();
    }

    getRandomWord = () => {
        return this.state.words[Math.floor(Math.random() * this.state.words.length)];
    };

    saveChanges = () => {
        console.log("The selected language is", this.state.languageChoice);
    };

    selectLanguage = event => {
        this.setState({ selectLanguage: event.target.value });
    };

    queryWords = event => {
      this.setState(() => ({isLoading: true}));
      if (!this.state.isLoading) {
        client.auth
            .loginWithCredential(new AnonymousCredential())
            .then(user => {
                const frenchCollection = mongo.db("frenchwords").collection("basic");
                // return frenchCollection.insertMany(basicWords.map(word => ({word})));
                return frenchCollection.find();
                // return frenchCollection.deleteMany({});
            })
            .then(results => {
                const {proxy} = results;
                return proxy.executeRead();
            })
            .then(results => {
                console.log("Results2: ", results);
                // const frenchCollection = mongo.db("frenchwords").collection("basic");
                this.setState({ words: results });
            })
            .then(() => {
              const word = this.getRandomWord();
              translateFrench(word.word)
                  .then(translatedWord => this.setState({
                      wordToShow: word.word,
                      translatedWord
                  }));
              const userCollection = mongo.db("usedata").collection("users");
              return userCollection.find({ "userName": "test" });
            })
            .then(user => {
              user
            })
            .catch(console.error)
            .finally(() => {
      this.setState(() => ({isLoading: false}));
            })
      }
        
        if (event) {
            event.preventDefault();
        }
    };

    changeAnswer = e => {
        this.setState(() => ({answer: e.target.value}));
        if (e) {
            e.preventDefault();
        }
    };

    submitAnswer = e => {
        this.setState(() => ({}));

        if (e) {
            e.preventDefault();
        }
    };

    render() {
        return (
            <div className="App" style={{
                backgroundImage: `url('${this.state.backgroundImgUrl}')`
            }}>
                <header className="App-header">
                    <h1 className="App-title">Learn: <b>{this.state.languageChoice}!</b></h1>
                </header>
                <p className="App-intro">
                    {this.state.wordToShow} <img src={arrow} className="word-arrow" /> {this.state.translatedWord}
                </p>
                <button onClick={this.execute}>EXECUTE</button>
                <p className="sub-paragraph"> Open a new tab for a different word</p>
                <img className="settings" src={settingsIcon} data-toggle="modal" data-target="#settingsModal" alt="Settings" />

                <p className="sub-paragraph" style={{}}>Quiz: What is the French translation of {this.state.questionWord}</p>
                <input
                    type="text"
                    className="input"
                    placeholder="Enter your answer"
                    onChange={this.changeAnswer}
                />
                <button onClick={this.submitAnswer}>Submit answer</button>
                {this.state.isCorrect && <p className="text-success">Correct!</p>}
                {this.state.isWrong && <p className="text-danger">Oh no! The correct answer is</p>}


                <div className="modal fade" id="settingsModal" tabIndex="-1" role="dialog" aria-labelledby="settingsModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="settingsModalLabel">Language Preferences</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <select onChange={this.selectLanguage}>
                                    <option id="french">French</option>
                                    <option id="spanish">Spanish</option>
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                                <button type="button" className="btn btn-primary" onClick={this.saveChanges}>Save changes</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        );
    }
}

export default App;
