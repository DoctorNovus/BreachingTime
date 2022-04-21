import React from "react";
import { BlockIndex } from "../../../game/Indexes/BlockIndex";

import "./InventoryItem.css";

export default function InventoryItem({ item, active, setActive, slot }) {

    let iName = "";

    if (!item) {
        item = {};
    } else if (item.id != 0) {
        console.log(item);
        iName = BlockIndex.blocks[item.id];
        console.log(iName);
    }

    if (slot)
        return (
            <div className="inventory-slot" id={`slot${slot}`}>
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
    else
        return (
            <div className={`inventory-item ${active.id == (item.id || 0) ? "glow" : ""}`} onClick={() => setActive(item)}>
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