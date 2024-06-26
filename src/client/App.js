import React from 'react';

import './App.css';
import { MainGame } from '../game';
import { ChatBox } from './chatbox/ChatBox';
import WorldMenu from './worldmenu/WorldMenu';
import Inventory from './inventory/Inventory';

const chatbox = React.createRef();
const status = React.createRef();

export function App() {
    const [loginMode, setLoginMode] = React.useState(true);
    const [loggedIn, setLoggedIn] = React.useState(false);
    const [started, setStarted] = React.useState(false);
    const [username, setUsername] = React.useState("");
    const [selected, setSelected] = React.useState("");
    const [worlds, setWorlds] = React.useState([]);
    const [character, setCharacter] = React.useState({});
    const [kb, setKb] = React.useState({ kb: [] });
    let [active, setActive] = React.useState({});

    return (
        <div className="main">
            <div className={`main-first ${started ? "hidden" : ""}`}>
                <div className={`main-first-login ${loggedIn ? "hidden" : ""}`}>
                    <div className={`main-first-login-body`}>
                        <h1>{`${loginMode ? "Login" : "Register"}`}</h1>
                        <form onSubmit={(e) => online.bind(this)(e, loginMode, setLoggedIn, setUsername)}>
                            <label ref={status}></label>
                            <label htmlFor="uname">Username</label>
                            <input autoComplete="false" className="uname" type="text" name="uname" />
                            <div className={`main-first-login-body-email ${loginMode ? "hidden" : ""}`}>
                                <label htmlFor="email">Email</label>
                                <input autoComplete="false" className="email" type="email" name="email" />
                            </div>
                            <label htmlFor="pass">Password</label>
                            <input autoComplete="false" className="pass" type="password" name="pass" />
                            <input className="submitEntry" type="submit" value={`${loginMode ? "Login" : "Register"}`} />
                            <span onClick={() => {
                                setLoginMode(!loginMode);
                            }}>Switch to {`${loginMode ? "Register" : "Login"}`}?</span>
                        </form>
                    </div>
                </div>
                <div className={`main-first-game ${loggedIn ? "" : "hidden"}`} onClick={() => {
                    startGame.bind(this)(setStarted, username, setSelected, setWorlds, character, setCharacter, kb, setKb, active, setActive);
                }}>
                    <img src="/assets/ui/startBG.png" alt="startBG" />
                    <em id="startButton">Click the screen to start...</em>
                </div>
            </div>
            <div className={`main-second ${started ? "" : "hidden"}`}>
                <WorldMenu worlds={worlds} setSelected={setSelected} shown={selected.length == 0 ? true : false} />
                <div className={`${selected.length == 0 ? "hidden" : ""}`}>
                    {/* <ChatBox ref={chatbox} shown={selected.length > 0 ? true : false} /> */}
                    <Inventory inventory={character.inventory} profile={character.profile} shown={kb.kb.includes("i")} active={active} setActive={setActive} />
                </div>
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

export function startGame(setStarted, username, setSelected, setWorlds, character, setCharacter, keybinds, setKeybindElems, active, setActive) {
    setStarted(true);

    let game = new MainGame();

    MainGame.instance.onMessage = (data) => {
        chatbox.current.chat(data);
    };

    MainGame.instance.onWorldMenu = (data) => {
        let { worlds } = data;
        setWorlds(worlds);
    };

    MainGame.instance.onInventory = (data) => {
        let { items, profile } = data;
        setCharacter({ inventory: items, profile });
    }

    MainGame.instance.onSlotChange = (data) => {
        let { slot, item, profile: prof, inventory: inv } = data;
        let { inventory, profile } = character;

        if (!inventory)
            inventory = inv;

        if (!profile)
            profile = prof;

        profile.slots[slot] = item;
        setCharacter({ inventory, profile });
        setActive({ id: 0 });
    };

    MainGame.instance.onHotbarChange = (data) => {
        let { hotbar, item, profile: prof, inventory: inv } = data;
        let { inventory, profile } = character;
        if (!inventory)
            inventory = inv;

        if (!profile)
            profile = prof;

        profile.hotbar[hotbar] = item;
        setCharacter({ inventory, profile });
        setActive({ id: 0 })
    }

    MainGame.instance.onKeybind = (data) => {
        let kb = keybinds.kb;

        if (!kb.includes(data)) {
            kb.push(data);
        } else {
            kb.splice(kb.indexOf(data), 1);
        }

        setKeybindElems({ kb });
    }

    MainGame.instance.setSelected = setSelected;

    game.start(username);
}