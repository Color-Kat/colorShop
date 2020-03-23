import { phpPath, websocketPath } from './php';

// websocket sending interface
let wsSend = function(param) {
    if(!conn.readyState){
        setTimeout(function (){
            wsSend(param);
        },100);
    }else{
        // conn.send(data);
        // let thisRoom = parseInt(renderByUrl().replace("/chats/", ""));

        conn.send(param);

        // conn.send(JSON.stringify({command: "subscribe", channel: "global"}));
        // conn.send(JSON.stringify({command: "groupchat", message: "hello glob", channel: "global"}));
        // conn.send(JSON.stringify({command: "message", to: "84", from: chat['meId'], message: "it needs xss protection"}));
        // conn.send(JSON.stringify({command: "register", userId: 21}));
    }
};

function push (){



    // websocket connect
    window.conn = new WebSocket(websocketPath);

    conn.onopen = function(e) {
        console.log("Connection established!");
    };
    conn.onmessage = function(e) {
        console.log('push');
    }; 

    getMyChats().then(chats => {
        for (let uid of chats){
            wsSend(JSON.stringify({ command: "register", userId: uid }));
        }
    });
}

function getMyChats() {
    let body = new FormData;
    body.append('action', 'getMyChats');
    return fetch(phpPath,{
        method : 'post',
        mode   : 'cors',
        credentials: 'include',
        body   : body
    }).then(response => {
        return response.json();
    }).then(res => {
        return res;
    });
}

export {wsSend, push}