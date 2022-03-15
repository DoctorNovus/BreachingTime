import React, { Component } from 'react';

import './App.css';
import { MainGame } from '../game';

export class App extends Component {
    render() {
        return (
            <div className="main">
                <button id="startButton" onClick={() => this.startGame()}>Start</button>
            </div>
        );
    }

    startGame(){
        let startButton = document.getElementById("startButton");
        startButton.style.display = "none";

        let game = new MainGame();
        game.start();
    }
}