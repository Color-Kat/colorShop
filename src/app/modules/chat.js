import { phpPath, websocketPath } from './php';
import { render, historyUp, renderByUrl } from './render';
import { popup } from './popup';
import { wsSend } from './WS';
import { react } from './home';

function chatList(byId = false){
    // action is page name
    window.action = 'Chats';

    // delete all items except home
    document.querySelectorAll('main >:not(#color)').forEach(e=>{ e.remove();});

    // this page isn't good pфпу
    window.thisGood = false;
    
    // this page isn't profile or login
    window.thisLogin = false;
    window.thisProfile = false;

    // home isn't open
    window.homeOpening = false;

    render(action).then(html => {
        // insert content
        window.el.main.innerHTML += html;
        
        // get my chats
        if (!byId){
            // full chat list
            fullChatList();
        }
    });

    // home page is hidden
    window.el.main.style.overflowY = 'hidden';
}

function openChat (byId, buyer, seller, goodId) {
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

                // websocket connect
                window.conn = new WebSocket(websocketPath);

                
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
                    let sender  = chat['me'];
                    let room    = chat['data']['chatId'];

                    websocketDATA['message'] = message;
                    websocketDATA['sender']  = sender;
                    websocketDATA['room']    = room;

                    // send data (websocket)
                    if ( interlocutor != myChatId ) 
                        // i'm buyer, send message to seller 
                        wsSend(JSON.stringify({command: "message", to: interlocutor, from: myChatId, message: message}));
                    else 
                        // i'm seler, send message to buyer 
                        wsSend(JSON.stringify({command: "message", to: chat['data']['buyerId'] + chat['data']['chatId'], from: myChatId, message: message}));

                    // display my message on the right
                    chatBlock.innerHTML += '<div class="chatItem me">'+message+'</div>';
                    messInput.value = '';
                }

                // IN WORK
            }
        });
    });
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
        if (res == 'login') console.log('login');
    });
}

export { openChat, chatList }