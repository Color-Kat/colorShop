import {render, avatar, renderProfile, renderOrd} from './render';
import {qSel} from './qSel';
import {randomSting} from './randStr';
import {popup, popupClose, sure} from './popup';
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
                        `<div class="orderItem item" data-good="${ord.id}" onclick="openGood(this.getAttribute('data-good'), event)">
                            <img src="./goods/${ord.img}" alt="">
                            <div class="orderInfo">
                                <div class="orderName">${ord.goodName}</div>
                                <div class="orderDesc">${ord.descr}</div>
                                <div class="orderCost">${ord.cost}₽</div>
                            </div>
                            <div class="orderSettins" data-good="${ord.id}" onclick="editGood(this.getAttribute('data-good'), event)">⋮</div>
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



window.editGood = function (id, e) {
    // delete previos block
    function clear(){ 
        if (document.querySelector('#orderSetList'))
            document.querySelector('#orderSetList').remove();
    }

    clear();

    // insert new block
    document.querySelector('#root').insertAdjacentHTML ('beforeend',
                                                        `<div id="orderSetList" data-id="${id}">
                                                            <div class="setItem" data-action="delete">Удалить</div>
                                                            <div class="setItem" data-action="edit">Редактировать</div>
                                                            <div class="setItem" data-action="sold">Продано</div>
                                                        </div>`);
        
    let elem = document.querySelector('#orderSetList');

    // close block when outside click
    function outsideClickListener(event) {
        if (!elem.contains(event.target)) {  // проверяем, что клик не по элементу и элемент виден
            elem.style.opacity = 0;
            document.removeEventListener('click', outsideClickListener);

            setTimeout(() => {
                elem.remove();
            }, 200);
        }
    }
    setTimeout(() => {
        document.removeEventListener('click', outsideClickListener);
        document.addEventListener('click', outsideClickListener);
    }, 10);



    // place block on mouse coordinates
    document.querySelector('#orderSetList').style.top = e.clientY+'px';
    document.querySelector('#orderSetList').style.left = e.clientX-150 + 'px';

    // hide the block when scrolling
    document.querySelector('#info').onscroll = function () {
        if (document.querySelector('#orderSetList')) {
            // smooth reduction
            document.querySelector('#orderSetList').style.height = 0;

            // remove
            setTimeout(() => {
                if (document.querySelector('#orderSetList'))
                    document.querySelector('#orderSetList').remove();
            }, 200);
        }   
    };

    document.querySelectorAll('.setItem').forEach (elem => {
        // check action
        elem.onclick = () => {
            switch (elem.getAttribute('data-action')) {
                case 'delete':
                    setDelete();
                    break;
                case 'edit':
                    setEdit();
                break;
                case 'sold':
                    setSold();
                break;
            }
        }
    });

    async function setDelete() {
        let sured = await sure('Удалить товар?');

        document.querySelector('.sure').style.opacity = 0;
            setTimeout(() => {
                document.querySelector('.sure').remove();
            }, 200);

        if ( sured == true ) {
            let del = {
                'action' : 'deleteMyGood',
                'id' : id
            }
            let body = new FormData();
            for(let variable in del) body.append(variable, del[variable]);
        
            fetch(phpPath,{
                method : 'post',
                mode   : 'cors',
                credentials:'include',
                body   : body
            }).then(response => {
                return response.text();
            }).then(res => {
                console.log(res);
                document.querySelector('.orderItem[data-good="'+id+'"]').remove();

                console.log('deleted');
            });
        }
    }
    async function setEdit() {
        // new onmessage for push
        window.currentChat = false;
        window.lockPush = false;

        let sured = await sure('Изменить товар?');

        document.querySelector('.sure').style.opacity = 0;
            setTimeout(() => {
                document.querySelector('.sure').remove();
            }, 200);

        if ( sured == true ) {
            let edit = {
                'action' : 'editMyGood',
                'id' : id
            }
            let body = new FormData();
            for(let variable in edit) body.append(variable, edit[variable]);
        
            fetch(phpPath,{
                method : 'post',
                mode   : 'cors',
                credentials:'include',
                body   : body
            }).then(response => {
                return response.json();
            }).then(res => { 
                render('sell', false).then((html)=>{
                    window.el.info.innerHTML = html;
                    // not new good - update old good
                    sell('update').then(()=>{
                        // insert name
                        
                        document.querySelector('#protoName').innerText = res['goodName'];
                        // description
                        document.querySelector('#createDescr').value = res['descr'];
                        // cost
                        document.querySelector('#createCost').value = res['cost'];
                        document.querySelector('#protoCost').innerText = res['cost']+'₽';
                        // location adress
                        document.querySelector('#location').value = res['sellerAdress'];
                        // phone number
                        document.querySelector('#numberPhone').value = res['sellerNumber'];

                        // image
                        document.querySelector('#createImg').setAttribute('value', 'goods/'+res['img']);
                        document.querySelector('#protoImg').setAttribute('src', 'goods/'+res['img']);
    
                        // restore categorie
                        window.categorie = res['categorie'];
                        // show current category
                        let currentText = document.querySelector('.select__current');
                        let cat = document.querySelector('.select__item[data-value="'+window.categorie+'"]');
                        if (cat != null){
                            let text = cat.innerHTML;
                            currentText.innerText = text;
                        }
                            

                        // add specs
                        if (res['specList'] != '') {
                            let specList = res['specList'].split(',');
                            for (let specItem of specList) {
                                let spec = specItem.split('---');
                                window.addSpec(spec[0], spec[1]);
                            }

                                // specs is visible
                            document.querySelector('#specifications').style.height = 'auto';
                            document.querySelector('#specifications').onclick = (e)=>{window.closeSpec(e)};
                        }
                    });
                });
            });
        }
    }
    async function setSold() {
        // new onmessage for push
        window.currentChat = false;
        window.lockPush = false;

        let sured = await sure('Товар продан?');

        document.querySelector('.sure').style.opacity = 0;
            setTimeout(() => {
                document.querySelector('.sure').remove();
            }, 200);

        if ( sured == true ) {
            // let edit = {
            //     'action' : 'editMyGood',
            //     'id' : id
            // }
            // let body = new FormData();
            // for(let variable in edit) body.append(variable, edit[variable]);
        
            // fetch(phpPath,{
            //     method : 'post',
            //     mode   : 'cors',
            //     credentials:'include',
            //     body   : body
            // }).then(response => {
            //     return response.json();
            // }).then(res => { 
                
               
            // });
        }
    }
}
