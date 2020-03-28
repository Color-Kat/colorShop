import {rand} from './random';
import { phpPath, thisPath } from './php';
import {action as indexAct} from '../index';

function render(action, addH = true, sessionDel = false) {
    document.title = action[0].toUpperCase() + action.slice(1);
    action = action.toLowerCase();

    // footer
    if(action != 'home') {
        window.el.main.style.height = '85%';
        document.querySelector('footer').style.display = 'none';// footer is hidden
        let color = document.querySelector('#color');
        if( window.homeLoaded && color) color.style.visibility = 'hidden'; //home page is hidden
    }else {
        window.homeLoaded = true;
        window.lockScroll = true;
    }
    
    if(action != 'profile'){
        // вернуть контент страницы action .html
        if(action == 'prof') action = 'profile';
        return fetch(`${thisPath}pages/${action}.html`)
        .then(response => {
            return response.text();
        }).then(html => {
            let parser = new DOMParser();
            let doc = parser.parseFromString(html, "text/html");

            if(addH) historyUp(action);
            else if (action == 'profile' || action == 'login') historyUp('profile');
            
            if (action == 'like') window.thisLike = true;
            else window.thisLike = false;

            if (action == 'cart') window.thisCart = true;
            else window.thisCart = false;

            if (action == 'profile') window.thisProfile = true;
            else window.thisProfile = false;
            

            // delete session search
            if(sessionDel) sessionDelete();
            
            return doc.body.innerHTML;
        });
    }else{
        // регистрация|вход/профиль
        let profile = {
            'action' : action
        }
        let bodyProfile = new FormData();
        for(let variable in profile) bodyProfile.append(variable, profile[variable]);
        
        return fetch(phpPath,{
            method : 'post',
            mode   : 'cors',
            credentials: 'include',
            body   : bodyProfile
        }).then(response => {
            return response.text();
        }).then(res => {
            console.log(res);
            action = res;
            if (action == 'login') window.thisLogin = true;
            else {window.logged = false; window.thisLogin = false;}

            return render(action, false);
        });
    }
}

window.story = false;
function historyUp(action, goodOpenning = false) {
    if(!story){
        let state = { 'page_name': action};
        let title = action;
        let url = thisPath+title;
        history.pushState(state, title, url);
    }
    if(goodOpenning){
        window.el.main.onwheel = null;
        window.thisGood = true;
        window.enterToHome= false;
    }
    window.story = false;
}

function renderByUrl(){
    //by url choose content
    let footer = document.querySelector('footer');
    let url = getUrl();

    //render home by url
    if(url.pathname == "/" || url.pathname == "/home"){
        footer.style.display = 'flex';//добавить футер
        return 'home';
    }else if(url.pathname == "/like"){
        footer.style.display = 'none';//убрать футер
        return 'like';
    }else if(url.pathname == "/profile" || url.pathname == "/login"){
        footer.style.display = 'none';//убрать футер
        return 'profile';
    }else if(url.pathname == "/cart"){
        footer.style.display = 'none';//убрать футер
        return 'cart';
    }else if(Number.isInteger(parseInt(url.pathname.replace("/chats/", "")))){
        footer.style.display = 'none';//убрать футер
        return url.pathname;
    }else if(url.pathname == "/chats"){
        footer.style.display = 'none';//убрать футер
        return 'chats';
    }else if(url.pathname.replace(/[0-9]/g, "").trim() == "/"){
        let goodId = url.pathname;
        goodId = parseInt(goodId.match(/\d+/));
        return goodId;
    }
}

function getUrl(){
    let getLocation = function(href) {    
        let l = document.createElement("a");
        l.href = href;
        return l;
    };
    let url = getLocation(window.location.href);
    return url
}

function sessionDelete(){
    let del = {
        'action' : 'deleteSessionSearch'
    }
    let bodyDel = new FormData();
    for(let variable in del) bodyDel.append(variable, del[variable]);
    // fetch('core/core.php',{
    return fetch(phpPath,{
        method : 'post',
        mode   : 'cors',
        credentials: 'include',
        body   : bodyDel
    }).then(response => {
        return response.text();
    }).then(res => {
        // console.log(res);
    });
}

function avatar(){
    let avatar = {
        'action' : 'avatar'
    }
    let bodyAvatar = new FormData();
    for(let variable in avatar) bodyAvatar.append(variable, avatar[variable]);
    // fetch('core/core.php',{
    return fetch(phpPath,{
        method : 'post',
        mode   : 'cors',
        credentials: 'include',
        body   : bodyAvatar
    }).then(response => {
        return response.json();
    }).then(res => {
        res = `<img src="avatars/${res.avatar}" alt=""></img>`;
        return res;
    });
}

function renderProfile(tab){
    let tabAct = {
        'action' : tab
    }
    let bodyTab = new FormData();
    for(let variable in tabAct) bodyTab.append(variable, tabAct[variable]);
    // fetch('core/core.php',{
    return fetch(phpPath,{
        method : 'post',
        mode   : 'cors',
        body   : bodyTab
    }).then(response => {
        return response.text();
    }).then(res => {
        console.log(res);
        return res;
    });
}

function renderGoods(startPos) {
    // товары
    let goods = {
        'action'   : 'goods',
        'startPos' : startPos
    }
    let bodyGoods = new FormData();
    for(let variable in goods) bodyGoods.append(variable, goods[variable]);
    // fetch('core/core.php',{
    return fetch(phpPath,{
        method : 'post',
        mode   : 'cors',
        credentials:'include',
        body   : bodyGoods
    }).then(response => {
        return response.text();
    }).then(res => {
        if(res != 0){
            res = JSON.parse(res);
            return res;
        }else return 0;
    });
}

function renderOrd() {
    let ord = {
        'action' : 'orders'
    }
    let bodyOrd = new FormData();
    for(let variable in ord) bodyOrd.append(variable, ord[variable]);
    // fetch('core/core.php',{
    return fetch(phpPath,{
        method : 'post',
        mode   : 'cors',
        credentials: 'include',
        body   : bodyOrd
    }).then(response => {
        return response.json();
    }).then(res => {
        return res;
    });
}

function renderLike() {
    let like = {
        'action' : 'like'
    }
    let bodyLike = new FormData();
    for(let variable in like) bodyLike.append(variable, like[variable]);

    return fetch(phpPath,{
        method : 'post',
        mode   : 'cors',
        credentials: 'include',
        body   : bodyLike
    }).then(response => {
        return response.text();
    }).then(res => {
        if(res == 'login') return 'login';
        else return JSON.parse(res);
    });
}

function renderCart() {
    let cart = {
        'action' : 'cart'
    }
    let bodyCart = new FormData();
    for(let variable in cart) bodyCart.append(variable, cart[variable]);

    return fetch(phpPath,{
        method : 'post',
        mode   : 'cors',
        credentials: 'include',
        body   : bodyCart
    }).then(response => {
        return response.text();
    }).then(res => {
        if(res == 'login') return 'login';
        else return JSON.parse(res);
    });
}

function getMyId() {
    let body = new FormData();
    body.append('action', 'getMyId');

    return fetch(phpPath,{
        method : 'post',
        mode   : 'cors',
        credentials: 'include',
        body   : body
    }).then(response => {
        return response.text();
    }).then(res => {
        return res;
    });
}



export {render, renderGoods, renderByUrl, historyUp, getUrl,
        sessionDelete, avatar, renderProfile, renderOrd,
        renderLike, renderCart, getMyId}