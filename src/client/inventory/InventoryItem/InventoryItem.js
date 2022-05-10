import React from "react";
import { MainGame } from "../../../game";
import { BlockIndex } from "../../../game/Indexes/BlockIndex";
import { Network } from "../../../game/Network/Network";
import ReactDOM from "react-dom";

import "./InventoryItem.css";

export default function InventoryItem({ item, active, setActive, slot, hotbar }) {

    let iName = "";

    if (!item) {
        item = {};
    } else if (item.id != 0) {
        iName = BlockIndex.blocks[item.id];
    }

    return (
        <div className={`inventory-${slot ? "slot" : hotbar ? "hotbar" : "item"}`} id={slot ? `slot${slot}` : hotbar ? `hotbar${hotbar}` : null} onClick={(e) => {
            e.stopPropagation();
            handleCurrent(active, setActive, item, slot, hotbar)
        }} onContextMenu={(e) => handleContext(e, active, item)}>
            <img className="inv-slot-bg" src="/assets/ui/inventory2.png" alt="inv-slot" />
            {/* <div className={`${active && active.id && active.id == item.id && active.id != 0 ? "inv-selected" : ""}`}></div> */}
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
        Network.instance.send({
            type: "moveSlot",
            data: {
                item,
                active,
                slot
            }
        });
    } else if (hotbar) {
        Network.instance.send({
            type: "moveHotbar",
            data: {
                item,
                active,
                hotbar
            }
        });
    } else {
        // TODO : Move Inventory
    }

    if (item && item.id != 0) {
        setActive({ id: item.id });
        MainGame.instance.activeSelector = { id: item.id };
    }
}

function handleContext(e, active, item) {
    Network.instance.send({
        type: "openInvSelect",
        data: {
            item
        }
    });

    MainGame.instance.onInvSelectOptions = (item) => {
        item.position = { x: e.clientX, y: e.clientY };
        MainGame.instance.setOptionsSelected(item);
        MainGame.instance.setOptionsSeen(true);
    }
}