import React, { Component } from 'react';
import franceBackgroundImage from './media/france_background.jpg';
import spainBackgroundImage from './media/spain_background.jpg';
import {Stitch, RemoteMongoClient, AnonymousCredential} from "mongodb-stitch-browser-sdk";
import arrow from './media/arrow.jpg';
import settingsIcon from './settings_icon.png';
import './App.css';
import {translate} from "./translate";
import basicSpanishWords from "./basicSpanishWords";

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
        words: [],
        score: 0,
        wrongOnce: false,
        translateCode: "fr"
    };

    componentDidMount() {
        this.queryWords();
        this.queryScore();
    }

    cleanDatabase = () => {
      client.auth
      .loginWithCredential(new AnonymousCredential())
      .then(user => {
          const wordCollection = mongo.db(this.state.languageChoice + "words").collection("basic");
          return wordCollection.find({});
      })
      .then(results => {
        const {proxy} = results;
        return proxy.executeRead();
      })
      .then(console.log)
      .catch(console.error)
    }

    updateDatabase = () => {
      client.auth
      .loginWithCredential(new AnonymousCredential())
      .then(user => {
          const wordCollection = mongo.db("spanishwords").collection("basic");
          return wordCollection.insertMany(basicSpanishWords.map(word => ({word})));
      })
    }

    updateScore = (score) => {
        console.log("New score: ", score);
        client.auth
            .loginWithCredential(new AnonymousCredential())
            .then(user => {
                const userCollection = mongo.db("userdata").collection("score");
                return userCollection.updateOne({}, {"score": score });
            })
            .then(result => {
                this.setState(() => ({score}));
                console.log("Updated score: ", result);
            })
            .catch(console.error)
    };


    queryScore = () => {
        client.auth
            .loginWithCredential(new AnonymousCredential())
            .then(user => {
                const userCollection = mongo.db("userdata").collection("score");
                return userCollection.find();
            })
            .then(results => {
                const {proxy} = results;
                return proxy.executeRead();
            })
            .then(results => {
                console.log("Score Query: ", results[0]);
                this.setState(() => ({ score: results[0].score }));
            })
            .catch(console.error)
    };

    getRandomWord = () => {
        return this.state.words[Math.floor(Math.random() * this.state.words.length)];
    };

    saveChanges = () => {
        console.log("The selected language is", this.state.languageChoice);
    };

    selectLanguage = event => {
        this.setState({ languageChoice: event.target.value});
        let lang = "fr";
        let img = franceBackgroundImage;
        if (event.target.value === "spanish") {
          lang = "es"
          img = spainBackgroundImage;
        }
        this.setState(() => ({ translateCode: lang, backgroundImgUrl: img }));
        this.queryWords();
    };

    queryWords = event => {
        this.setState(() => ({isLoading: true}));
        if (!this.state.isLoading) {
            client.auth
                .loginWithCredential(new AnonymousCredential())
                .then(user => {
                    const wordCollection = mongo.db(this.state.languageChoice + "words").collection("basic");
                    // return wordCollection.insertMany(basicWords.map(word => ({word})));
                    return wordCollection.find();
                    // return wordCollection.deleteMany({});
                })
                .then(results => {
                    const {proxy} = results;
                    return proxy.executeRead();
                })
                .then(results => {
                    // const wordCollection = mongo.db(this.state.languageChoice + "words").collection("basic");
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
            this.translationDuplicateCheck2();
            this.setState(() => ({answer: ""}));
            if (!this.state.wrongOnce) {
              this.updateScore(this.state.score + 2);
            }
        } else if (distance <= 1) {
            this.setState(() => ({
                isCorrect: false,
                isKindaCorrect: true,
                isWrong: false
            }));
            if (!this.state.wrongOnce) {
              this.updateScore(this.state.score + 1);
            }
        } else {
            this.setState(() => ({
                isCorrect: false,
                isKindaCorrect: false,
                isWrong: true,
                wrongOnce: true
            }));
            if (this.state.score - 1 >= 0) {
              this.updateScore(this.state.score - 1);
            }
        }
        setTimeout(() => this.setState(() => ({
            isCorrect: false,
            isKindaCorrect: false,
            isWrong: false
        })), 5000);
        if (e) {
            e.preventDefault();
        }
    };

    translationDuplicateCheck() {
        const word = this.getRandomWord();
        
        return translate(word.word, this.state.translateCode)
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
        return translate(word.word, this.state.translateCode)
            .then(translatedWord => {
                if (translatedWord !== word.word) {
                    return new Promise(resolve => {
                        this.setState({
                            questionWord: word.word,
                            correctAnswer: translatedWord,
                            wrongOnce: false
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
                    <h1 className="App-title">Learn: <span className='App-title-language'>{this.state.languageChoice}!</span></h1>
                </header>
                {this.state.translatedWord ? <p className="App-intro">
                    {this.state.wordToShow} <img src={arrow} className="word-arrow" alt="arr"/> {this.state.translatedWord}
                </p> : null }
                <img className="settings" src={settingsIcon} data-toggle="modal" data-target="#settingsModal" alt="Settings" />
                <div className="score-display"><h3>Score:<br/><span className="score-number">{this.state.score}</span></h3></div>
                {
                    this.state.correctAnswer &&
                    this.state.questionWord &&
                    <form className="answerform" onSubmit={this.submitAnswer}>
                        <div className="form-row align-items-center text-center">
                            <div className="col-auto">
                                <p>Quiz: What is the English translation of the {this.state.languageChoice.charAt(0).toUpperCase() + this.state.languageChoice.slice(1)} word <b>{this.state.questionWord}</b>?</p>
                            </div>
                        </div>
                        <div className="form-row align-items-center text-center">
                            <div className="col-auto">
                                <input
                                    type="text"
                                    id="txtAnswer"
                                    className="form-control"
                                    value={this.state.answer}
                                    placeholder="Enter your answer"
                                    onChange={this.changeAnswer}
                                />
                            </div>
                            <div className="col-auto">
                                <button type="submit" className="btn btn-primary" onClick={this.submitAnswer}>Submit answer</button>
                            </div>
                        </div>
                        <div className="form-row align-items-center text-center" style={{marginTop: 20}}>
                            <div className="col-12 font-weight-bold">
                                {this.state.isCorrect && <p className="text-success">Correct!</p>}
                                {this.state.isKindaCorrect && <p className="text-info">Close enough! The correct answer is {this.state.correctAnswer}</p>}
                                {this.state.isWrong && <p className="text-danger">Oh no! The correct answer is {this.state.correctAnswer}</p>}
                            </div>
                        </div>
                    </form>
                }


                <div className="modal fade" id="settingsModal" tabIndex="-1" role="dialog" aria-labelledby="settingsModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="settingsModalLabel">Preferences</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <h3>Select Language:</h3>
                                <select value={this.state.languageChoice} onChange={this.selectLanguage}>
                                    <option id="french">french</option>
                                    <option id="spanish">spanish</option>
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                                {/* <button type="button" className="btn btn-primary" onClick={this.saveChanges}>Save changes</button> */}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        );
    }
}

export default App;
