import React, { useState, useRef } from "react";
import CharacterBuild from "./CharacterBuild/CharacterBuild";
import InventoryItem from "./InventoryItem/InventoryItem";

import "./Inventory.css";

export default function Inventory({ inventory, profile }) {
    if (!inventory || !profile) {
        inventory = new Array(64).fill({ id: 0, count: 0, img: "" });
        profile = {};
    }

    let [items, setItems] = useState(inventory);
    let [active, setActive] = useState({});
    return (
        <div className="inventory">
            <div className="inventory-profile">
                <div className="inventory-profile-name">
                    <span>{profile.name || "No Name"}</span>
                    <span>Lvl. {profile.level || 1}</span>
                </div>
                <div className="inventory-profile-build">
                    <div className="inventory-profile-top">
                        <InventoryItem item={profile.leftHand} slot={1} />
                        <InventoryItem item={profile.head} slot={2} />
                        <InventoryItem item={profile.backPiece} slot={3} />
                        <InventoryItem item={profile.legs} slot={4} />
                    </div>
                    <div className="inventory-profile-center">
                        <div className="inventory-profile-center-container">
                            <CharacterBuild profile={profile} />
                        </div>
                    </div>
                    <div className="inventory-profile-bottom">
                        <InventoryItem item={profile.rightHand} slot={5} />
                        <InventoryItem item={profile.chest} slot={6} />
                        <InventoryItem item={profile.feet} slot={7} />
                    </div>
                </div>
            </div>
            <div className="inventory-items">
                <ul>
                    {items.map((item, index) => {
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

function setSlot(slots, item, slot) {

}