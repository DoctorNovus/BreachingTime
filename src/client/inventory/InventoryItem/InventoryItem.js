import React from "react";

import "./InventoryItem.css";

export default function InventoryItem({ item, active, setActive, slot }) {
    if (!item) {
        item = {};
    }

    if (slot)
        return (
            <div className="inventory-slot" id={`slot${slot}`}>
                <div className="inventory-item-image">
                    {item.img ? (
                        <img src={item.img} alt="slotItem" />
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
                    {item.img ? (
                        <img src={item.img} alt="slotItem" />
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