import React, { Component } from 'react';

import './App.css';
import { MainGame } from '../game';
import { ChatBox } from './chatbox/ChatBox';

export class App extends Component {

    constructor() {
        super();

        this.state = {
            started: false,
        };
        
        this.chatbox = React.createRef();
    }

    render() {
        return (
            <div className="main">
                <div className={`main-first ${this.state.started ? "hidden" : ""}`}>
                    <button id="startButton" onClick={() => {
                        this.startGame.bind(this)();
                    }}>Start</button>
                </div>
                <div className={`main-second ${this.state.started ? "" : "hidden"}`}>
                    <ChatBox ref={this.chatbox}/>
                </div>
            </div>
        );
    }

    startGame() {
        this.setState({ started: true });

        let game = new MainGame();
        MainGame.instance.onMessage = (data) => {
            this.chatbox.current.chat(data);
        };
        game.start();
    }
}