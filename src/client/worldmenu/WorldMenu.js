import React from 'react';
import { Network } from '../../game/Network/Network';

import "./WorldMenu.css";

export default function WorldMenu({ worlds, shown, setSelected, mode }) {
    let [area, setArea] = React.useState(0);

    return (
        <div className={`world-menu-main ${shown ? "" : "hidden"}`}>
            <div className="world-menu-side">
                <div className="world-menu-sub" onClick={() => setArea(0)}>
                    <div className="world-menu-title">
                        <img src="/assets/ui/panel0.png" alt="bg" />
                        <p>Explore</p>
                    </div>
                </div>
                <div className="world-menu-sub" onClick={() => setArea(1)}>
                    <div className="world-menu-title">
                        <img src="/assets/ui/panel0.png" alt="bg" />
                        <p>Personal</p>
                    </div>
                </div>
                <div className="world-menu-sub" onClick={() => setArea(2)}>
                    <div className="world-menu-title">
                        <img src="/assets/ui/panel0.png" alt="bg" />
                        <p>Search</p>
                    </div>
                </div>
            </div>
            <div className="world-menu-container">
                <div className={`world-menu-explore ${!mode || mode == "explore" ? "" : "hidden"}`}>
                    <div>
                        <div className={`world-menu-worlds ${area != 0 ? "hidden" : ""}`}>
                            <div className="fd">
                                <select className="world-menu-sort" onChange={(e) => selectFilter(e)}>
                                    <option>PVP</option>
                                    <option>Popular</option>
                                    <option>Unexplored</option>
                                    <option>Developed</option>
                                    <option>Trade</option>
                                </select>
                            </div>
                            <div className="sd">
                                <ul className="world-menu-worldList" id="worldList">
                                    {worlds.map((world, i) => {
                                        return (
                                            <li key={i} onClick={() => {
                                                setSelected(world.name);
                                                Network.instance.send({
                                                    type: "worldSelect",
                                                    data: {
                                                        name: world.name
                                                    }
                                                });
                                            }}>
                                                <div className="world-menu-world">
                                                    <div className="world-menu-world-name">
                                                        <p>{world.name}</p>
                                                    </div>
                                                    <div className="world-menu-world-info">
                                                        <p>{world.players}/{world.maxPlayers}</p>
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                        <div className={`world-menu-personal ${area != 1 ? "hidden" : ""}`}>

                        </div>
                        <div className={`world-menu-search ${area != 2 ? "hidden" : ""}`}>
                            <form onSubmit={(e) => { e.preventDefault(); searchWorld() }}>
                                <div className="world-menu-search-input">
                                    <input name="search" id="searchWorld" type="text" placeholder="World Name..." />
                                </div>
                                <div className="world-menu-search-button">
                                    <img src="/assets/ui/panel1.png" alt="bg" />
                                    <button type="submit">Search</button>
                                </div>
                            </form>
                            <div className="world-menu-search-results">
                                <ul className="world-menu-search-results-list">
                                    {worlds.map((world, i) => {
                                        return (
                                            <li key={i} onClick={() => {
                                                setSelected(world.name);
                                                Network.instance.send({
                                                    type: "worldSelect",
                                                    data: {
                                                        name: world.name
                                                    }
                                                });
                                            }
                                            }>
                                                <div className="world-menu-world">
                                                    <div className="world-menu-world-name">
                                                        <p>{world.name}</p>
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function selectFilter(e) {
    let filter = e.target.value;
    console.log(filter);
}

export function searchWorld() {
    let world = document.getElementById("searchWorld").value;
    console.log(world);
}