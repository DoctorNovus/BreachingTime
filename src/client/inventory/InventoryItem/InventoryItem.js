import React from "react";
import { BlockIndex } from "../../../game/Indexes/BlockIndex";

import "./InventoryItem.css";

export default function InventoryItem({ item, active, setActive, slot, hotbar }) {

    let iName = "";

    if (!item) {
        item = {};
    } else if (item.id != 0) {
        iName = BlockIndex.blocks[item.id];
    }

    return (
        <div className="inventory-slot" id={slot ? `slot${slot}` : hotbar ? `hotbar${hotbar}` : null} onClick={() => handleCurrent(active, setActive, item, slot, hotbar)}>
            <div className={`${active && active.id && active.id == item.id && active.id != 0 ? "inv-selected" : ""}`}></div>
            <div className="inventory-item-image">
                {iName && iName.trim().length > 0 ? (
                    <img src={`assets/blocks/${iName}.png`} alt="slotItem" />
                ) : (
                    <div className="inventory-item-image-empty">
                    </div>
                )}
            </div>
            <div className="inventory-item-count">
                {item.count && item.count > 0 ? (
                    <span>{item.count}</span>
                ) : (
                    <span></span>
                )}
            </div>
        </div>
    )
}

function handleCurrent(active, setActive, item, slot, hotbar) {
    if (slot) {
        console.log("Selected slot");
    } else if (hotbar) {
        console.log(`Selected hotbar`);
    } else {
        console.log("Selected item");
    }

    if (item && item.id != 0)
        setActive({ id: item.id });
}