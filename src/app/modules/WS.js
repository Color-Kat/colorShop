import { phpPath, websocketPath } from './php';

// websocket sending interface
let wsSend = function(param) {
    if(!conn.readyState){
        setTimeout(function (){
            wsSend(param);
        },100);
    }else{ conn.send(param); }
};

function push (){
    if (!window.pushing) {
        if (window.conn != undefined) {
            conn.onopen = null;
            conn.onmessage = null;
        }

        // websocket connect
        window.conn = new WebSocket(websocketPath);

        conn.onopen = function(e) {
            console.log("Connection established!");
        };
        conn.onmessage = function(e) {
            let mess = JSON.parse(e.data);

            getMyChats().then(chats => {
                // if i don't send message
                if ( !chats.some(notMyPush) ) { window.pushHandler(mess) }
            });

            function notMyPush (arr) { return arr == mess['from']; }
        }; 

        getMyChats().then(chats => {
            for (let uid of chats){
                wsSend(JSON.stringify({ command: "register", userId: uid }));
            }
        });
        // notification handlers installed
        window.pushing = true;
    }
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

window.pushHandler = function (mess) {
    console.log(window.pushs);
    if (window.pushs[mess.to] == undefined)
        window.pushs[mess.to] = [];

    window.pushs[mess.to].push(true);

    console.log(window.pushs);

    let pushs = document.querySelector('#profile #push').innerHTML;
    parseInt(pushs);

    if(pushs == '') pushs = 0;
    // new push!!!
    pushs++;

    document.querySelector('#profile #push').innerText = pushs;
    document.querySelector('#profile #push').setAttribute('data-push', 'true');

    // save pushs
    savePushs();
}

function savePushs() {
    let param = {
        'action' : 'savePushs',
        'pushs'  : JSON.stringify(window.pushs)
    }
    let body = new FormData();
    for(let variable in param) body.append(variable, param[variable]);

    fetch(phpPath,{
        method : 'post',
        mode   : 'cors',
        credentials: 'include',
        body   : body
    });
}

export {wsSend, push}