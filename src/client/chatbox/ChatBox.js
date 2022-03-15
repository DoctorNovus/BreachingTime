import React, { Component } from "react";
import { Network } from "../../game/Network/Network";

import "./ChatBox.css";

export class ChatBox extends Component {
    constructor() {
        super();

        this.state = {
            messages: [],
        };
    }

    render() {
        return (
            <div className="chatbox">
                <div className="chatbox-header">
                    <div className="chatbox-header-title">Chat</div>
                    <div className="chatbox-header-close">X</div>
                </div>
                <div className="chatbox-body">
                    <div className="chatbox-body-messages">
                        {this.state.messages.map((message, index) => {
                            return (
                                <div className="chatbox-body-message" key={index}>
                                    <div className="chatbox-body-message-name">{message.name + ": "}</div>
                                    <div className="chatbox-body-message-text">{message.message}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="chatbox-footer">
                    <div className="chatbox-footer-input">
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            this.sendMessage(e.target[0].value);
                        }}>
                            <label htmlFor="cb-content">Message: </label>
                            <input name="cb-content" id="cb-content" type="text" placeholder="Type a message..." />
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    chat(data){
        this.setState({
            messages: [...this.state.messages, data]
        });
    }

    sendMessage(message) {
        if (message.length > 0) {
            Network.instance.send({
                type: "chat",
                data: {
                    message
                }
            });
        }
    }
}