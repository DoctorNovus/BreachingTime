import React, { Component } from 'react';

import './App.css';
import { MainGame } from '../game';
import { ChatBox } from './chatbox/ChatBox';

const chatbox = React.createRef();
const status = React.createRef();

export function App() {
    const [loginMode, setLoginMode] = React.useState(true);
    const [loggedIn, setLoggedIn] = React.useState(false);
    const [started, setStarted] = React.useState(false);
    const [username, setUsername] = React.useState("");

    return (
        <div className="main">
            <div className={`main-first ${started ? "hidden" : ""}`}>
                <div className={`main-first-login ${loggedIn ? "hidden" : ""}`}>
                    <div className={`main-first-login-body`}>
                        <h1>{`${loginMode ? "Login" : "Register"}`}</h1>
                        <form onSubmit={(e) => online.bind(this)(e, loginMode, setLoggedIn, setUsername)}>
                            <label ref={status}></label>
                            <label htmlFor="uname">Username</label>
                            <input type="text" name="uname" />
                            <div className={`main-first-login-body-email ${loginMode ? "hidden" : ""}`}>
                                <label htmlFor="email">Email</label>
                                <input type="email" name="email" />
                            </div>
                            <label htmlFor="pass">Password</label>
                            <input type="password" name="pass" />
                            <input type="submit" value={`${loginMode ? "Login" : "Register"}`} />
                            <span onClick={() => {
                                setLoginMode(!loginMode);
                            }}>Switch to {`${loginMode ? "Register" : "Login"}`}?</span>
                        </form>
                    </div>
                </div>
                <div className={`main-first-game ${loggedIn ? "" : "hidden"}`}>
                    <button id="startButton" onClick={() => {
                        startGame.bind(this)(setStarted, username);
                    }}>Start</button>
                </div>
            </div>
            <div className={`main-second ${started ? "" : "hidden"}`}>
                <ChatBox ref={chatbox} />
            </div>
        </div>
    );
}

export async function online(e, loginMode, setLoggedIn, setUsername) {
    e.preventDefault();
    if (loginMode) {
        await login.bind(this)(e, setLoggedIn, setUsername);
    } else {
        await register.bind(this)(e, setLoggedIn, setUsername);
    }
}

export async function login(e, setLoggedIn, setUsername) {
    e.preventDefault();

    let uname = document.querySelector("input[name=uname]");
    let pass = document.querySelector("input[name=pass]");

    let res = await fetch("/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            uname: uname.value,
            pass: pass.value
        })
    });

    res = await res.json();

    if (res.success) {
        console.log(res.user.name);
        setLoggedIn(true);
        setUsername(res.user.name);
    } else {
        status.current.innerHTML = res.message;
    }
}

export async function register(e, setLoggedIn, setUsername) {
    e.preventDefault();

    let uname = document.querySelector("input[name=uname]");
    let email = document.querySelector("input[name=email]");
    let pass = document.querySelector("input[name=pass]");

    let res = await fetch("/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            uname: uname.value,
            email: email.value,
            pass: pass.value
        })
    });

    res = await res.json();

    if (res.success) {
        setLoggedIn(true);
        setUsername(res.user.name);
    } else {
        status.current.innerHTML = res.message;
    }
}

export function startGame(setStarted, username) {
    setStarted(true);

    let game = new MainGame();
    MainGame.instance.onMessage = (data) => {
        chatbox.current.chat(data);
    };
    game.start(username);
}