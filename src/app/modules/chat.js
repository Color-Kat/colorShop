import { phpPath, websocketPath } from './php';
import { render, historyUp, getMyId } from './render';
import { popup } from './popup';
import { wsSend } from './WS';
import { react } from './home';

// get my chats
async function chatList(){ 
    let chatList = document.querySelector('#chatsList')

    // full chat list
    let chats = await fullChatList();
    // get pushs
    let pushs = await getPushs();
    let myId  = await getMyId();
    let pushCount;

    // objecte to array
    pushs = Object.entries(pushs);

    if (pushs != 'empty') {
        for (let chat of chats){
            // checks whether an element is even
            let even = (element) => {
                return element[0] == myId+chat.chatId;
            }

            if (pushs.some(even)) {
                // get the number of notifications for this chat
                for (let i in pushs){
                    if (pushs[i][0] == myId+chat.chatId) 
                        pushCount = pushs[i][1].length;
                }

                chatList.innerHTML +=  `<div class="item" data-chatId="${chat.chatId}" onclick="openChat(this.getAttribute('data-chatId'))">
                    <img src="./goods/${chat.img}" alt="">
                        <div class="likeInfo">
                            <span data-empty="false" class="icon-cancel-circle canselIcon" onclick="deleteChat(event)"></span>
                            <div class="likeName">${chat.goodName+'PUSH'+pushCount}</div>
                        </div>
                    </div>`;
            }else {
                chatList.innerHTML +=  `<div class="item" data-chatId="${chat.chatId}" onclick="openChat(this.getAttribute('data-chatId'))">
                    <img src="./goods/${chat.img}" alt="">
                        <div class="likeInfo">
                            <span data-empty="false" class="icon-cancel-circle canselIcon" onclick="deleteChat(event)"></span>
                            <div class="likeName">${chat.goodName}</div>
                        </div>
                    </div>`;
            }
            
        }
    }else {
        for (let chat of chats){
            chatList.innerHTML +=  `<div class="item" data-chatId="${chat.chatId}" onclick="openChat(this.getAttribute('data-chatId'))">
            <img src="./goods/${chat.img}" alt="">
                <div class="likeInfo">
                    <span data-empty="false" class="icon-cancel-circle canselIcon" onclick="deleteChat(event)"></span>
                    <div class="likeName">${chat.goodName}</div>
                </div>
            </div>`;
        }
    }
}

function fullChatList() {
    let chatList = {
        'action'   : 'chatList'
    }

    let bodyChatList = new FormData();
    for(let variable in chatList) bodyChatList.append(variable, chatList[variable]);

    return fetch(phpPath,{
        method : 'post',
        mode   : 'cors',
        credentials:'include',
        body   : bodyChatList
    }).then(response => {
        return response.json();
    }).then(res => {return res;});
}

function getPushs() {
    let body = new FormData;
    body.append('action', 'getPushs');
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

window.openChat = function (byId, buyer, seller, goodId) {
    // Chat data to open\create
    // open by buyer, seller, goodId
    let currentChat = {};

    if (!byId) {
        currentChat = {
            'action' : 'openChat',
            'buyer'  : buyer,
            'seller' : seller,
            'goodId' : goodId
        }
    }
    // open by chat id
    else{
        currentChat = {
            'action' : 'openChatById',
            'chatId'  : byId
        }
    }

    let body = new FormData();
    for(let variable in currentChat) body.append(variable, currentChat[variable]);
    
    return fetch(phpPath,{
        method : 'post',
        mode   : 'cors',
        credentials: 'include',
        body   : body
    }).then(response => {
        return response.json();
    }).then(chat => {
        console.log(chat);
        window.action = 'chat';

        // insert chat template in html
        render(action, false).then(html => {// возвращает html код
            // color is hidden
            let color = document.querySelector('#color');
            if(color) color.style.visibility = 'hidden';
                    window.el.main.style.overflowY = 'hidden';
            
            // delete everything except home
            document.querySelectorAll('main >:not(#color)').forEach(e=>{ e.remove();});

                // insert html in html code
            window.el.main.innerHTML += html;

            let chatBlock = document.querySelector('#chatList');

            // if chat doesn't exsist
            if (chat == 'null')
                chatBlock.innerHTML = 'Нет такого чата';
            else if (chat == 'belong') 
                chatBlock.innerHTML = 'Вы не входите в чат';
            else {
                // good name and good image in chat window
                document.querySelector('#infoChat div').innerHTML = chat['goodData']['goodName'];
                document.querySelector('#infoChat img').setAttribute('src', '../goods/'+chat['goodData']['img']);

                conn.onopen = null;
                conn.onmessage = null;
                // websocket connect
                window.conn = new WebSocket(websocketPath);

                // notification handlers doesn't installed
                window.pushing = false;
                
                // useкId = my id + chat id ( 21 + 20 = 2120 ) 
                let myChatId     = chat['data']['meId'] + chat['data']['chatId'];
                let interlocutor = chat['data']['sellerId'] + chat['data']['chatId'];

                wsSend(JSON.stringify({ command: "register", userId: myChatId }));

                // insert the adress with id into the history
                if (chat['data']['chatId'] != undefined){
                    
                    let url = 'chats/'+chat['data']['chatId'];

                    window.story = false;
                    historyUp(url);
                }


                // iterate over all chat elements (by message element), 
                // since elements 0 refer to 0,
                // elements 1 relate to elements 1
                if (chat['message'] != null){
                    for (let i=0; i<chat['message'].length; i++){
                        // if me is sender
                        if (chat['sender'][i] == chat['me']) {
                            // сustomer notice
                            chatBlock.innerHTML += '<div class="chatItem me">'+chat['message'][i]+'</div>';
                        }
                        // seller messege
                        else{
                            chatBlock.innerHTML += '<div class="chatItem he">'+chat['message'][i]+'</div>';
                        }
                    }
                }

                // IN WORK
                // openSocket();

                let messInput = document.querySelector('#myMessage');
                let sendBtn   = document.querySelector('.sendMessage');
                let chatList  = document.querySelector('.chatList');

                // send only if connected
                
                // if connection is established
                conn.onopen = function(e) {
                    console.log("Connection established!");
                };

                conn.onclose = function(e) {
                    console.log("Connection is closed");
                };
                conn.onerror = function(e) {
                    console.log("ERROR:" + e.message);
                    popup("Временная ошибка: "+e.message);
                };

                // if a message arrived
                conn.onmessage = function(e) {
                    let data = JSON.parse(e.data);
                    console.log(data);
                    
                    // display a message from my interlocutor
                    chatBlock.innerHTML += '<div class="chatItem he">'+data['message']+'</div>';
                }; 

                sendBtn.onclick = () => {
                    let websocketDATA = {};

                    let message = messInput.value;

                    // get user id
                    // because ratchet does not support sessions
                    getMyId().then(myId => {
                        // send data (websocket)
                        if ( interlocutor != myChatId ) 
                            // i'm buyer, send message to seller 
                            wsSend(JSON.stringify({command: "message",
                                                to: interlocutor,
                                                from: myChatId,
                                                message: message,
                                                sender: 0,
                                                myId: myId}));
                        else 
                            // i'm seler, send message to buyer 
                            wsSend(JSON.stringify({command: "message",
                                                to: chat['data']['buyerId'] + chat['data']['chatId'],
                                                from: myChatId,
                                                message: message,
                                                sender: 1,
                                                myId: myId}));

                        // display my message on the right
                        chatBlock.innerHTML += '<div class="chatItem me">'+message+'</div>';
                        messInput.value = '';
                    })
                }

                // IN WORK
            }
        });
    });
}

export { chatList, getPushs }