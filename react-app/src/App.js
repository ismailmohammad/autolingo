import React, { Component } from 'react';
import franceBackgroundImage from './france_background.jpg';
import {Stitch, RemoteMongoClient, AnonymousCredential} from "mongodb-stitch-browser-sdk";
import settingsIcon from './settings_icon.png';
import logo from './logo.svg';
import './App.css';

const APP_ID = "auto-linguo-xaqwa";
const client = Stitch.initializeDefaultAppClient(APP_ID);
const mongo = client.getServiceClient(RemoteMongoClient.factory, "mongodb-atlas");

const words = ["Bonjour", "Salut", "Merci", "Je", "Tu", "Suis", "Oui", "Non" ];
const languages = {
    french: {
        description: "add a ",
        imageUrl: ""
    }

};

const getRandomWord = () => {
    console.log(Math.random() * words.length);
    return words[Math.floor(Math.random() * words.length)];
};

class App extends Component {
    state = {
        wordToShow: null,
        backgroundImgUrl: franceBackgroundImage,
        languageChoice: "french"
    };

    componentDidMount() {
        const word = getRandomWord();
        console.log(word);
        this.setState({
            wordToShow: word
        });
    }

    saveChanges = () => {
        console.log("The selected language is", this.state.languageChoice);
    };

    selectLanguage = (event) => {
        this.setState({ selectLanguage: event.target.value });
    };

    execute = event => {
        client.auth
            .loginWithCredential(new AnonymousCredential())
            .then(user => {
                console.log("Logged in to mongodb as user: ", user);
                const frenchCollection = mongo.db("dictionary").collection("french");
                return frenchCollection.insertMany(words);
            })
            .then(results => {
                console.log("Inserted words into french dictionary with results: ", results);
            })
            .catch(console.error);
        if (event) {
            event.preventDefault();
        }
    };

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
                <button onClick={this.execute}>Auth test</button>
                <p className="sub-paragraph"> Open a new tab or refresh for a different word. </p>
                <img className = "settings" src={settingsIcon} data-toggle="modal" data-target="#settingsModal" />
                <div className="modal fade" id="settingsModal" tabIndex="-1" role="dialog" aria-labelledby="setting sModalLabel" aria-hidden="true">
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
