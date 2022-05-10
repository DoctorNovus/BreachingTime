import React, { useState, useRef } from "react";
import CharacterBuild from "./CharacterBuild/CharacterBuild";
import InventoryItem from "./InventoryItem/InventoryItem";

import "./Inventory.css";
import { MainGame } from "../../game";
import { Network } from "../../game/Network/Network";

export default function Inventory({ inventory, profile, shown, active, setActive }) {
    let [selected, setSelected] = useState(null);
    let [seen, setSeen] = useState(false);

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

    MainGame.instance.setOptionsSelected = setSelected;
    MainGame.instance.setOptionsSeen = setSeen;

    return (
        <div className="inv">
            <div className={`inventory ${shown ? "" : "hidden"}`}>
                <div className="inventory-profile">
                    <img className="inventory-profile-bg" src="/assets/ui/inventory0.png" alt="inv-prof-bg" />
                    <div className="inventory-profile-name">
                        <span>{profile.name || "No Name"}</span>
                        <span>Lvl. {profile.level || 1}</span>
                    </div>
                    <div className="inventory-profile-build">
                        <div className="inv-prof-upper">
                            <div className="inventory-profile-left">
                                <div className="inventory-profile-left-container">
                                    <InventoryItem item={profile.slots && profile.slots[0]} active={active} setActive={setActive} slot={1} />
                                    <InventoryItem item={profile.slots && profile.slots[1]} active={active} setActive={setActive} slot={2} />
                                    <InventoryItem item={profile.slots && profile.slots[2]} active={active} setActive={setActive} slot={3} />
                                    <InventoryItem item={profile.slots && profile.slots[3]} active={active} setActive={setActive} slot={4} />
                                </div>
                            </div>
                            <div className="inventory-profile-center">
                                <div className="inventory-profile-center-container">
                                    <CharacterBuild profile={profile} />
                                </div>
                            </div>
                            <div className="inventory-profile-right">
                                <div className="inventory-profile-right-container">
                                    <InventoryItem item={profile.slots && profile.slots[0]} active={active} setActive={setActive} slot={5} />
                                    <InventoryItem item={profile.slots && profile.slots[1]} active={active} setActive={setActive} slot={6} />
                                    <InventoryItem item={profile.slots && profile.slots[2]} active={active} setActive={setActive} slot={7} />
                                    <InventoryItem item={profile.slots && profile.slots[3]} active={active} setActive={setActive} slot={8} />
                                </div>
                            </div>
                        </div>
                        <div className="inv-prof-lower">
                            <div className="inventory-profile-bottom">
                                <InventoryItem item={profile.slots && profile.slots[4]} active={active} setActive={setActive} slot={9} />
                                <InventoryItem item={profile.slots && profile.slots[5]} active={active} setActive={setActive} slot={10} />
                                <InventoryItem item={profile.slots && profile.slots[6]} active={active} setActive={setActive} slot={11} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="inventory-items">
                    <img src="/assets/ui/inventory3.png" alt="inv-items-bg" />
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
            <div className={`option-selector ${seen ? "" : "hidden"}`}>
                <ul className="inv-options" style={{ position: "absolute", left: (selected && selected.position && selected.position.x || 0) + "px", top: (selected && selected.position && selected.position.y || 0) + "px" }}>
                    {selected && selected.options && selected.options.map((option, index) => {
                        return (
                            <li key={index} className="inv-option-info" onClick={() => {
                                Network.instance.send({
                                    type: "itemOptionSelect",
                                    data: {
                                        item: selected,
                                        option: option
                                    }
                                });

                                MainGame.instance.setOptionsSeen(false);

                            }}>
                                <span>{option.name}</span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}