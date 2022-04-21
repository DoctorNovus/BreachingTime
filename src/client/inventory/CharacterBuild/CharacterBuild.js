import React from "react";

import "./CharacterBuild.css";

export default function CharacterBuild({ profile }) {
    if (!profile) {
        return <></>
    }

    let char = buildCharacter(profile);

    return (
        <div className="character-showcase">
            <div className="character-showcase-base">
                <img src="/assets/animations/idle/idle1.png" alt="character" />
            </div>
        </div>
    );
}

function buildCharacter(profile) {

}