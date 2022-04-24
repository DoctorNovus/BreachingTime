import React, { useState, useRef } from "react";
import CharacterBuild from "./CharacterBuild/CharacterBuild";
import InventoryItem from "./InventoryItem/InventoryItem";

import "./Inventory.css";

export default function Inventory({ inventory, profile, shown, active, setActive }) {
    if (!inventory)
        inventory = new Array(64).fill({ id: 0, count: 0, img: "" });
    else if (inventory.length < 64) {
        inventory = inventory.concat(new Array(64 - inventory.length).fill({ id: 0, count: 0, img: "" }));
    }

    if (!profile)
        profile = {};

    if (!profile.hotbar)
        profile.hotbar = [];

    if (profile.hotbar.length < 9) {
        profile.hotbar = profile.hotbar.concat(new Array(9 - profile.hotbar.length).fill({ id: 0, count: 0, img: "" }));
    }

    return (
        <div className="inv">
            <div className={`inventory ${shown ? "" : "hidden"}`}>
                <div className="inventory-profile">
                    <div className="inventory-profile-name">
                        <span>{profile.name || "No Name"}</span>
                        <span>Lvl. {profile.level || 1}</span>
                    </div>
                    <div className="inventory-profile-build">
                        <div className="inventory-profile-top">
                            <InventoryItem item={profile.slots && profile.slots[0]} active={active} setActive={setActive} slot={1} />
                            <InventoryItem item={profile.slots && profile.slots[1]} active={active} setActive={setActive} slot={2} />
                            <InventoryItem item={profile.slots && profile.slots[2]} active={active} setActive={setActive} slot={3} />
                            <InventoryItem item={profile.slots && profile.slots[3]} active={active} setActive={setActive} slot={4} />
                        </div>
                        <div className="inventory-profile-center">
                            <div className="inventory-profile-center-container">
                                <CharacterBuild profile={profile} />
                            </div>
                        </div>
                        <div className="inventory-profile-bottom">
                            <InventoryItem item={profile.slots && profile.slots[4]} active={active} setActive={setActive} slot={5} />
                            <InventoryItem item={profile.slots && profile.slots[5]} active={active} setActive={setActive} slot={6} />
                            <InventoryItem item={profile.slots && profile.slots[6]} active={active} setActive={setActive} slot={7} />
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
            <div className={`hotbar ${shown ? "" : "solo"}`}>
                {profile.hotbar.map((item, index) => {
                    return (
                        <div key={index}>
                            <InventoryItem item={item} active={active} setActive={setActive} hotbar={index + 1} />
                        </div>
                    )
                })}
            </div>
        </div>
    );
}