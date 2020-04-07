import {render, avatar, renderProfile, renderOrd} from './render';
import {qSel} from './qSel';
import {randomSting} from './randStr';
import {popup, popupClose} from './popup';
import { log } from './login';
import { sell } from './sell';
import { phpPath } from './php';
import { chatList } from './chat';
import { push } from './WS';

// получить innerHtml активной вкладки
let thisTab;
export function profile (toChat = false){
    qSel('#', 'info');
    // avatar image
    circle();
    avatar().then((avatar)=>{
        document.querySelector('#avatar').innerHTML = avatar;
    });
    // avatar is circle
    window.onresize = circle;
    
    // logout
    document.querySelector('#outBtn').onclick = () => {
        logout();
    }

    // togle tabs
    let tabs = document.querySelectorAll('.profileItem');//вкладки
    // первая вкладка активна
    tabs[0].classList.add('active');
    // получить innerHtml активной вкладки
    if ( !toChat ) thisTab = document.querySelector('.active').getAttribute('data-tab');
    else thisTab = "chats";
    toggleTab();
    
    for (let i=0; i<tabs.length; i++) {
        tabs[i].onclick = e => {
            // сделать все вкладки неактивными
            tabs.forEach(e=>{
                e.classList.remove('active');
            });
            // сделать вкладку активной
            e.target.classList.add('active');
            // получить innerHtml текущей вкладки
            thisTab = document.querySelector('.active').getAttribute('data-tab');
            toggleTab();
        } 
    }

    // pushs count in tab
    let pushCount = document.querySelector('#profile .push').innerHTML;
    if (pushCount != ''){
        document.querySelector('.profileItem .push').innerText = pushCount;
        document.querySelector('.profileItem .push').setAttribute('data-push', 'true');
    }
    
}

function toggleTab() {
    switch (thisTab) {
        case 'orders':
            render(thisTab, false).then((html)=>{
                window.el.info.innerHTML = html;
                let orderList = document.querySelector('#ordersList');
                renderOrd().then((orders)=>{
                    document.querySelector('.hello').innerHTML = orders['myName']['name'] +' '+orders['myName']['surname'] 
                    delete orders["myName"];

                    for(let order in orders){
                        let ord = orders[order];
                        orderList.innerHTML += 
                        `<div class="orderItem item" data-good="${ord.id}" onclick="openGood(this.getAttribute('data-good'))">
                            <img src="./goods/${ord.img}" alt="">
                            <div class="orderInfo">
                                <div class="orderName">${ord.goodName}</div>
                                <div class="orderDesc">${ord.descr}</div>
                                <div class="orderCost">${ord.cost}₽</div>
                            </div>
                            <div class="orderSettins">⋮</div>
                        </div>`;
                    }
                });
            });
            // new onmessage for push
            window.currentChat = false;
            window.lockPush = false;
            break;
        case 'sell':
            render(thisTab, false).then((html)=>{
                window.el.info.innerHTML = html;
                sell();
            });
            // new onmessage for push
            window.currentChat = false;
            window.lockPush = false;

            break;
        case 'chats': 
            render(thisTab, false).then((html)=>{
                window.el.info.innerHTML = html;
                chatList();    
                
                // disable notification label
                document.querySelectorAll('.profileItem .push, #profile .push').forEach(item => {
                    item.innerText = '';
                    item.setAttribute('data-push', 'false');
                });
 
                window.lockPush = true;
            });

            break;
      }
}

function logout(){
    // logout
    let logout = {
        'action' : 'logout'
    }
    let bodyLogout = new FormData();
    for(let variable in logout) bodyLogout.append(variable, logout[variable]);

    fetch(phpPath,{
        method : 'post',
        mode   : 'cors',
        credentials: 'include',
        body   : bodyLogout
    }).then(response => {
        return response.text();
    }).then(res => {
        if(res == true){
            window.thisProfile = false;
            window.thisLogin = true;
            render('login', false).then(html => {
                document.querySelectorAll('main >:not(#color)').forEach(e=>{ e.remove();});
                window.el.main.innerHTML += html;
                log();
            });
        }
    });
}

function circle(){
    let circle = document.querySelector('#avatar');
    if(circle){
        let height = window.getComputedStyle(circle, null).height;
        circle.style.width = height;
    }
}