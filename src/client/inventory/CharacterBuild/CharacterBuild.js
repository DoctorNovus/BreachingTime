import React from "react";

export default function CharacterBuild({ profile }){
    if(!profile){
        return <></>
    }
    
    let char = buildCharacter(profile);

    return (
        <></>
    );
}

function buildCharacter(profile){

}