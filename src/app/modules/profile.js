import {render, avatar, renderProfile, renderOrd} from './render';
import {qSel} from './qSel';
import {randomSting} from './randStr';
import {popup, popupClose} from './popup';
import { log } from './login';
import { sell } from './sell';
import { phpPath } from './php';
import { setting } from './setting';

// получить innerHtml активной вкладки
let thisTab;
export function profile (){
    qSel('#', 'info');
    circle();
    avatar().then((avatar)=>{
        document.querySelector('#avatar').innerHTML = avatar;
    });
    window.onresize = circle;
    
    document.querySelector('#outBtn').onclick = () => {
        logout();
    }
    let tabs = document.querySelectorAll('.profileItem');//вкладки
    // первая вкладка активна
    tabs[0].classList.add('active');
    // получить innerHtml активной вкладки
    thisTab = document.querySelector('.active').getAttribute('data-tab');
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
}

function toggleTab() {
    switch (thisTab) {
        case 'orders':
            render(thisTab, false).then((html)=>{
                window.el.info.innerHTML = html;
                let orderList = document.querySelector('#ordersList');
                renderOrd().then((orders)=>{
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
            break;
        case 'sell':
            render(thisTab, false).then((html)=>{
                window.el.info.innerHTML = html;
                sell();
            });

            break;
        case 'settings':
            render(thisTab, false).then((html)=>{
                window.el.info.innerHTML = html;
                setting();
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
                console.log(window.el.main.onsroll);
                console.log(window.el.main.onwheel);
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