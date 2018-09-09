import React, { Component } from 'react';
import franceBackgroundImage from './france_background.jpg';
import {Stitch, RemoteMongoClient, AnonymousCredential} from "mongodb-stitch-browser-sdk";
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
        backgroundImgUrl: franceBackgroundImage
    };

    componentDidMount() {
        const word = getRandomWord();
        console.log(word);
        this.setState({
            wordToShow: word
        });
    }

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
            <div
                className="App"
                style={{
                    backgroundImage: `url('${this.state.backgroundImgUrl}')`
                }}
            >
                <header className="App-header">
                    <h1 className="App-title">Learn: <u>French</u>!</h1>
                </header>
                <p className="App-intro">
                    {this.state.wordToShow} -> {this.state.wordToShow}
                </p>
                <button onClick={this.execute}>Click me</button>
                <p className="sub-paragraph"> Open a new tab or refresh for a different word. </p>
            </div>
        );
    }
}

export default App;
