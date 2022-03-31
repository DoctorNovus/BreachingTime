import React from 'react';
import { Network } from '../../game/Network/Network';

import "./WorldMenu.css";

export default function WorldMenu({ worlds, shown, setSelected, mode }) {
    return (
        <div className={`world-menu-main ${shown ? "" : "hidden"}`}>
            <div className="world-menu-side">
                <div className="world-menu-sub">
                    <div className="world-menu-title">
                        <p>Explore</p>
                    </div>
                </div>
                <div className="world-menu-sub">
                    <div className="world-menu-title">
                        <p>Personal</p>
                    </div>
                </div>
                <div className="world-menu-sub">
                    <div className="world-menu-title">
                        <p>Search</p>
                    </div>
                </div>
            </div>
            <div className="world-menu-container">
                <div className={`world-menu-explore ${!mode || mode == "explore" ? "" : "hidden"}`}>
                    <div className="world-menu-sort">
                        <div className="world-menu-panel">
                            <p>Popular</p>
                        </div>
                        <div className="world-menu-panel">
                            <p>Unexplored</p>
                        </div>
                        <div className="world-menu-panel">
                            <p>Developed</p>
                        </div>
                        <div className="world-menu-panel">
                            <p>Trade</p>
                        </div>
                        <div className="world-menu-panel">
                            <p>PvP</p>
                        </div>
                    </div>
                    <div className="world-menu-worlds">
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
            </div>
        </div>
    )
}