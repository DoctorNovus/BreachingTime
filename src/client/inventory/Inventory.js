import React, { useState, useRef } from "react";
import CharacterBuild from "./CharacterBuild/CharacterBuild";
import InventoryItem from "./InventoryItem/InventoryItem";

import "./Inventory.css";

export default function Inventory({ inventory, profile, shown }) {
    if (!inventory)
        inventory = new Array(64).fill({ id: 0, count: 0, img: "" });
    else if(inventory.length < 64){
        inventory = inventory.concat(new Array(64 - inventory.length).fill({ id: 0, count: 0, img: "" }));
    }

    if (!profile)
        profile = {};

    let [active, setActive] = useState({});

    return (
        <div className={`inventory ${shown ? "" : "hidden"}`}>
            <div className="inventory-profile">
                <div className="inventory-profile-name">
                    <span>{profile.name || "No Name"}</span>
                    <span>Lvl. {profile.level || 1}</span>
                </div>
                <div className="inventory-profile-build">
                    <div className="inventory-profile-top">
                        <InventoryItem item={profile.slots && profile.slots.leftHand} slot={1} />
                        <InventoryItem item={profile.slots && profile.slots.head} slot={2} />
                        <InventoryItem item={profile.slots && profile.slots.backPiece} slot={3} />
                        <InventoryItem item={profile.slots && profile.slots.legs} slot={4} />
                    </div>
                    <div className="inventory-profile-center">
                        <div className="inventory-profile-center-container">
                            <CharacterBuild profile={profile} />
                        </div>
                    </div>
                    <div className="inventory-profile-bottom">
                        <InventoryItem item={profile.slots && profile.slots.rightHand} slot={5} />
                        <InventoryItem item={profile.slots && profile.slots.chest} slot={6} />
                        <InventoryItem item={profile.slots && profile.slots.feet} slot={7} />
                    </div>
                </div>
            </div>
            <div className="inventory-items">
                <ul>
                    {inventory.map((item, index) => {
                        return (
                            <li key={index}>
                                <InventoryItem item={item} active={active} setActive={setActive} />
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}