import { phpPath, websocketPath } from './php';
import { render, historyUp, getMyId } from './render';
import { popup } from './popup';
import { wsSend, savePushs } from './WS';
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
    console.log(chats);

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

                chatList.innerHTML +=  `<div class="item" data-chatId="${chat.chatId}" onclick="openChat(event, this.getAttribute('data-chatId'))">
                    <div class="pushItem" data-chatId="${myId+chat.chatId}" data-push="true">${pushCount}</div>
                    <img src="./goods/${chat.img}" alt="">
                        <div class="likeInfo">
                            <span data-empty="false" class="icon-cancel-circle canselIcon"></span>
                            <div class="likeName">${chat.goodName}</div>
                        </div>
                    </div>`;
            }else {
                chatList.innerHTML +=  `<div class="item" data-chatId="${chat.chatId}" onclick="openChat(event, this.getAttribute('data-chatId'))">
                <div class="pushItem" data-chatId="${myId+chat.chatId}" data-push="false"></div>
                    <img src="./goods/${chat.img}" alt="">
                        <div class="likeInfo">
                            <span data-empty="false" class="icon-cancel-circle canselIcon"></span>
                            <div class="likeName">${chat.goodName}</div>
                        </div>
                    </div>`;
            }
            
        }
    }else {
        for (let chat of chats){
            chatList.innerHTML +=  `<div class="item" data-chatId="${chat.chatId}" onclick="openChat(event, this.getAttribute('data-chatId'))">
                <div class="pushItem" data-chatId="${myId+chat.chatId}" data-push="false"></div>
                <img src="./goods/${chat.img}" alt="">
                    <div class="likeInfo">
                        <span data-empty="false" class="icon-cancel-circle canselIcon"></span>
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
    }).then(res => {
        console.log(res);
        return res;
    });
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

window.openChat = function (thisEl, byId, buyer, seller, goodId) {
    if (thisEl != false) {
        if (thisEl.target.tagName == 'SPAN'){
            // console.log('del');
            deleteChat(byId);
            return; 
        }
    }

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
                chatBlock.innerHTML = '<div class="empty">Нет такого чата</div>';
            else if (chat == 'belong') 
                chatBlock.innerHTML = '<div class="empty">Вы не входите в чат</div>';
            else if (chat == 'login')
                chatBlock.innerHTML = '<div class="empty">Войдите</div>';
            else {
                // good name and good image in chat window
                document.querySelector('#infoChat div').innerHTML = chat['goodData']['goodName'];
                document.querySelector('#infoChat img').setAttribute('src', '../goods/'+chat['goodData']['img']);
                
                // userId = my id + chat id ( 21 + 20 = 2120 ) 
                let myChatId     = chat['data']['meId'] + chat['data']['chatId'];
                let interlocutor = chat['data']['sellerId'] + chat['data']['chatId'];

                // to determine which срфе is open now
                // messages will be processed only for it
                window.currentChat = myChatId;
                // read
                delete window.pushs[myChatId];
                savePushs();

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
                            chatBlock.innerHTML += '<div class="chatItem me">'+chat['message'][i]+'<div class="chatDate">'+chat['date'][i]+'</div></div>';
                        }
                        // seller messege
                        else{
                            chatBlock.innerHTML += '<div class="chatItem he">'+chat['message'][i]+'<div class="chatDate">'+chat['date'][i]+'</div></div>';
                        }
                    }
                }

                let messInput = document.querySelector('#myMessage');
                let sendBtn   = document.querySelector('.sendMessage');
                let chatList  = document.querySelector('.chatList');

                sendBtn.onclick = sender;
                document.querySelector('#chat').onkeydown = (e)=>{
                    if(e.keyCode == 13)
                        //enter
                        sender();
                }

                function sender(){
                    let message = messInput.value;
                    if (message != '') {
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

                            // scroll to bottom
                            chatBlock.scrollTop = chatBlock.scrollHeight + 10;
                        });
                    }
                }

                // scroll to bottom
                chatBlock.scrollTop = chatBlock.scrollHeight + 10;
            }
        });
    });
}

function deleteChat(chatId){
    let chatList = {
        'action' : 'deleteChat',
        'chatId' : chatId
    }
    let bodyChatList = new FormData();
    for(let variable in chatList) bodyChatList.append(variable, chatList[variable]);
    fetch(phpPath,{
        method : 'post',
        mode   : 'cors',
        credentials:'include',
        body   : bodyChatList
    }).then(response => {
        return response.text();
    }).then(res => {
        delete window.pushs[chatId];
        savePushs();

        document.querySelector('.item[data-chatId="'+chatId+'"]').remove();
        // return res;
    });
}

export { chatList, getPushs }