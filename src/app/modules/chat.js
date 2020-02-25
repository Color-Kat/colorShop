import { phpPath } from './php';
import {render, historyUp} from './render';
import {react} from './home';

function chatList(){
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
    });

    // home page is hidden
    window.el.main.style.overflowY = 'hidden';
}

function openChat (byId, buyer, seller, goodId, viewer) {
    // Chat data to open\create
    // open by buyer, seller, goodId
    let currentChat = {};

    if (!byId) {
        console.log('not by Id');
        currentChat = {
            'action' : 'openChat',
            'buyer'  : buyer,
            'seller' : seller,
            'goodId' : goodId
        }
    }
    // open by chat id
    else{
        console.log('byId');
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
        return response.text();
    }).then(chat => {
        console.log(chat);
        window.action = 'Chat';

        return;
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

            // insert the adress with id into the history
            let url = 'chats/'+chat['chatId'];
            window.story = false;
            historyUp(url);


        });
    });

    
}

export { openChat, chatList }