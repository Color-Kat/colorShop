import { phpPath, websocketPath, pathToMusic } from './php';

// websocket sending interface
let wsSend = function(param) {
    console.log(param);
    if(!conn.readyState){
        setTimeout(function (){
            wsSend(param);
        },100);
    }else{ conn.send(param); }
};

function push (){
    // websocket connect
    window.conn = new WebSocket(websocketPath);

    conn.onopen = function(e) { console.log("Connection established!"); };
    conn.onclose = function(e) { console.log("Connection is closed"); };
    conn.onerror = function(e) {
        console.log("ERROR:" + e.message);
        popup("Временная ошибка: "+e.message);
    };

    conn.onmessage = function(e) {
        let mess = JSON.parse(e.data);
        console.log(mess);
        
        // chat is open
        if (window.currentChat == mess.to) onmessChat(mess);
        else onmessPush(mess)
    }; 

    getMyChats().then(chats => {
        if (chats == 'login') return;
        for (let uid of chats){
            wsSend(JSON.stringify({ command: "register", userId: uid }));
        }
    });
}

function onmessChat(data) {
    let chatBlock = document.querySelector('#chatList');
    console.log(data);

    // display a message from my interlocutor
    if (data['message'] != 'readed') {
        chatBlock.innerHTML += '<div class="chatItem he">'+data['message']+'<div class="chatDate">'+data['date']+'</div></div>';

       
        // i'm buyer, send message to seller 
        wsSend(JSON.stringify ({command: "message", 
                                to: data['from'],
                                from: data['to'],
                                message: "readed"}));
    }else {
        document.querySelectorAll('.readed[data-readed="false"]').forEach(e=>{
            e.setAttribute('data-readed', 'true');
            e.innerHTML = 'прочитанно';
        });
    }
    
    // scroll to bottom
    chatBlock.scrollTop = chatBlock.scrollHeight + 10;

    savePushs(true, data['to'], data['sender']);
}
function onmessPush(mess) {
    getMyChats().then(chats => {
        if (chats == 'login') return;
        if(mess['message'] == 'readed') return;

        // if i don't send message
        if ( !chats.some(notMyPush) ) {
            window.pushHandler(mess);
            
            if (window.notificationSound == 'true') {
                let audio = new Audio();
                audio.preload = 'auto';
                audio.src = pathToMusic + 'push.mp3';
                audio.play();
            }
        }
    }); 

    function notMyPush (arr) { return arr == mess['from']; }
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
    if (window.pushs == 'empty') window.pushs = {};

    if (window.pushs[mess.to] == undefined)
        window.pushs[mess.to] = [];

    window.pushs[mess.to].push(true);

    let pushs = document.querySelector('#profile .push').innerHTML;
    parseInt(pushs);

    if(pushs == '') pushs = 0;
    // new push!!!
    pushs++;

    // notification label
    if (!window.lockPush){
        document.querySelectorAll('.profileItem .push, #profile .push').forEach(item => {
            item.innerText = pushs;
            item.setAttribute('data-push', 'true');
        });
    }

    let notificationСhat = document.querySelector(`.pushItem[data-chatId="${mess.to}"]`);
    if (notificationСhat != null){
        notificationСhat.innerHTML = +notificationСhat.innerHTML + 1;
        notificationСhat.setAttribute('data-push', 'true');
    }

    // save pushs
    savePushs();
}

function savePushs(upStatus = false, id = false, sender = false) {
    console.log(sender);
    let param;
    if (!upStatus) {
        param = {
            'action' : 'savePushs',
            'pushs'  : JSON.stringify(window.pushs)
        }
    }else{
        param = {
            'action' : 'savePushs',
            'id'     : id,
            'sender' : sender,
            'pushs'  : JSON.stringify(window.pushs)
        }
    }

    let body = new FormData();
    for(let variable in param) body.append(variable, param[variable]);

    fetch(phpPath,{
        method : 'post',
        mode   : 'cors',
        credentials: 'include',
        body   : body
    }).then(response => {
        return response.text();
    }).then(res => {
        console.log(res);
        // return res;
    });
}

export {wsSend, push, savePushs}