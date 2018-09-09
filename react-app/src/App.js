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

/**
 * Returns the Levenshtein distance between two strings
 * {@param a} and {@param b}.
 *
 * {@author http://rosettacode.org/wiki/Levenshtein_distance}
 */
const levenshteinDistance = (a, b) => {
    a = a.toLowerCase();
    b = b.toLowerCase();
    let t = [], u, i, j, m = a.length, n = b.length;
    if (!m) { return n; }
    if (!n) { return m; }
    for (j = 0; j <= n; j++) { t[j] = j; }
    for (i = 1; i <= m; i++) {
        for (u = [i], j = 1; j <= n; j++) {
            u[j] = a[i - 1] === b[j - 1] ? t[j - 1] : Math.min(t[j - 1], t[j], u[j - 1]) + 1;
        } t = u;
    } return u[n];
};

const words = ["Bonjour", "Salut", "Merci", "Je", "Tu", "Suis", "Oui", "Non" ];

class App extends Component {
    state = {
        wordToShow: null,
        translatedWord: null,
        questionWord: null,
        answer: "",
        correctAnswer: null,
        isCorrect: false,
        isKindaCorrect: false,
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
                    // const frenchCollection = mongo.db("frenchwords").collection("basic");
                    this.setState({ words: results });
                })
                .then(() => {
                    return this.translationDuplicateCheck();
                })
                .then(() => {
                    return this.translationDuplicateCheck2();
                })
                .then(() => {
                    const userCollection = mongo.db("userdata").collection("users");
                    return userCollection.updateOne({"userName": "test"}, {"lastCursor": this.state.wordObject.word });
                })
                .then(result => {
                    const userCollection = mongo.db("userdata").collection("users");
                    return userCollection.find();
                })
                .then(({proxy}) => proxy.executeRead())
                .then(res => console.log(res[0]))
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
        const answer = e.target.value;
        this.setState(() => ({answer}));
        if (e) {
            e.preventDefault();
        }
    };

    submitAnswer = e => {
        this.setState(() => ({
            isCorrect: false,
            isKindaCorrect: true,
            isWrong: false
        }));
        const {correctAnswer, answer} = this.state;
        console.log("correctAnswer: ", correctAnswer);
        console.log("answer: ", answer);
        const distance = levenshteinDistance(correctAnswer, answer);
        console.log("distance: ", distance);
        if (distance <= 0) {
            this.setState(() => ({
                isCorrect: true,
                isKindaCorrect: false,
                isWrong: false
            }));
        } else if (distance <= 1) {
            this.setState(() => ({
                isCorrect: false,
                isKindaCorrect: true,
                isWrong: false
            }));
        } else {
            this.setState(() => ({
                isCorrect: false,
                isKindaCorrect: false,
                isWrong: true
            }));
        }
        if (e) {
            e.preventDefault();
        }
    };

    translationDuplicateCheck() {
        const word = this.getRandomWord();
        return translateFrench(word.word)
            .then(translatedWord => {
                if (translatedWord !== word.word) {
                    return new Promise(resolve => {
                        this.setState({
                            wordToShow: word.word,
                            translatedWord,
                            wordObject: word
                        }, () => resolve(this.state));
                    });
                }
                else {
                    return this.translationDuplicateCheck();
                }
            });
    }

    translationDuplicateCheck2() {
        const word = this.getRandomWord();
        return translateFrench(word.word)
            .then(translatedWord => {
                if (translatedWord !== word.word) {
                    return new Promise(resolve => {
                        this.setState({
                            questionWord: word.word,
                            correctAnswer: translatedWord
                        }, () => resolve(this.state));
                    });
                } else {
                    return this.translationDuplicateCheck2();
                }
            });
    }

    render() {
        return (
            <div className="App" style={{
                backgroundImage: `url('${this.state.backgroundImgUrl}')`
            }}>
                <header className="App-header">
                    <h1 className="App-title">Learn: <b>{this.state.languageChoice}!</b></h1>
                </header>
                {this.state.translatedWord ? <p className="App-intro">
                    {this.state.wordToShow} <img src={arrow} className="word-arrow" /> {this.state.translatedWord}
                </p> : null }
                <button onClick={this.execute}>EXECUTE</button>
                {this.state.translatedWord ? <p className="sub-paragraph"> Open a new tab for a different word</p> : null }
                <img className="settings" src={settingsIcon} data-toggle="modal" data-target="#settingsModal" alt="Settings" />

                {
                    this.state.correctAnswer &&
                    this.state.questionWord &&
                    <form onSubmit={this.submitAnswer}>
                        <div className="form-row align-items-center text-center">
                            <p>Quiz: What is the French translation of {this.state.questionWord}?</p>
                        </div>
                        <div className="form-group text-center">
                            <input
                                type="text"
                                id="txtAnswer"
                                className="form-control"
                                value={this.state.answer}
                                placeholder="Enter your answer"
                                onChange={this.changeAnswer}
                            />
                            <button type="submit" className="btn btn-primary" onClick={this.submitAnswer}>Submit answer</button>
                            {this.state.isCorrect && <p className="text-success">Correct!</p>}
                            {this.state.isKindaCorrect && <p className="text-info">Close enough! The correct answer is {this.state.correctAnswer}</p>}
                            {this.state.isWrong && <p className="text-danger">Oh no! The correct answer is {this.state.correctAnswer}</p>}
                        </div>
                    </form>
                }


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
