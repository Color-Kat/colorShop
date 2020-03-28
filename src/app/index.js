// STYLES
import '../style/head-style.css';

// Helps Function
import {render, renderByUrl, getUrl, sessionDelete, historyUp} from './modules/render';
import {setBg} from './modules/bg';
import {qSel} from './modules/qSel';
import {randomString} from './modules/randStr';
import {phpPath, websocketPath} from './modules/php';
import {push} from './modules/WS';
import {getPushs} from './modules/chat';

// Modules
import {log} from './modules/login';
import {profile} from './modules/profile';
import {home} from './modules/home';
import {like} from './modules/like';
import {cart} from './modules/cart';
import {goBottom, openGood, wheelFunc} from './modules/home';

// get recovery title
let thisTitle = document.title;
// if the user left the page replace title
window.onblur = function() {
    thisTitle = document.title;
    document.title = randomString('Вернись!','Ну ты куда?','Мы тебя ждем', 'Вернись', 'Ну ты где?', 'Ушёл(', 'Жду', 'Ждем');
}
// recovery title
window.onfocus = function () {
    document.title = thisTitle;
}
    
// array with elements
window.el = {};
qSel('<', 'main');

// disabled action for like and cart
window.likeToLogin = false;
window.cartToLogin = false;
window.homeToLogin = false;
window.homeLoaded  = false;

    // START NOTIFICATIONS 
window.pushing = false;
async function pushFilling(){
    window.pushs = await getPushs();
}
pushFilling();
push();
    // END NOTIFICATIONS

setBg();
window.action = renderByUrl(); //thisPage
        // HISTORY START
    //moving throught history
let prevPage;
window.onpopstate = function(event) {
    window.el.main.onwheel = null;
    push();
    
    prevPage = event.state;
    if(prevPage != null){
        story = true;

        // if the page is normal
        if(!Number.isInteger(parseInt(prevPage.page_name))){
            // if a simple page is open
            if (!Number.isInteger(parseInt(prevPage.page_name.replace("chats/", "")))){
                if(prevPage.page_name == 'home' && window.homeLoaded){
                    action = 'home';
                    clickToHome();
                }else{
                    window.thisGood = false;
                    render(prevPage.page_name).then(html => {
                        console.log(prevPage.page_name);
                        if (prevPage.page_name != 'profile'){ window.thisLogin = false; window.thisProfile = false; }
                        
                        if(window.thisLogin)   { window.thisProfile = false; }
                        if(!window.thisGood)   { document.querySelectorAll('main >:not(#color)').forEach(e=>{ e.remove();});window.el.main.innerHTML += html; action = 'Good'}
                        if(window.thisLogin)   { log();     action = 'profile'; }
                        if(window.thisProfile) { profile(); action = 'Profile'; }
                        if(prevPage.page_name == 'like')    { like();    action = 'Like';}
                        if(prevPage.page_name == 'cart')    { cart();    action = 'Cart';}    
                        if(prevPage.page_name == 'home') {home(); action = 'Home';}
                        window.homeOpening = false;         
                    });
                }
            }
            // if chat page is open
            else {
                let chatId = parseInt(prevPage.page_name.replace("chats/", ""));

                // open chat by chatId
                window.openChat(chatId)
            }
        }
       
        // if the page is goodPage
        else window.openGood(prevPage.page_name, false);
    }
};
        // HISTORY END
 
        // RENDER START
if (!Number.isInteger(action)) {
    // if a simple page is open
    if (!Number.isInteger(parseInt(action.replace("/chats/", "")))){
        render(action).then(html => {
            window.el.main.innerHTML = html;
            if(window.thisLogin) log();
            if(window.thisProfile) profile();
            if(action == 'home') home();
            if(window.thisLike) like();
            if(window.thisCart) cart();
        });
    }
    // if chat page is open
    else {
        let chatId = parseInt(action.replace("/chats/", ""));

        // open chat by chatId
        window.openChat(chatId)

    }
}else window.openGood(action);

// if home is loaded
function clickToHome(){
    // stop work if the home one is open
    if(window.homeOpening && !window.isBottom)                return false;
    if((window.homeOpening && !window.isBottom) == undefined) return false;

    // home page is visible
    let color = document.querySelector('#color');
    if(color) color.style.visibility = 'visible';

    // restoring scoll
    window.el.main.style.overflowY = 'auto';

    // footer is normal
    document.querySelector('footer').style.display = 'flex'; 

    // delete all items except #color
    document.querySelectorAll('main >:not(#color)').forEach(e=>{ e.remove();});
    window.thisHome = true;

    window.enterToHome = true;

    // если страница прокручена, то ставим lock
    if (window.isBottom) window.lockScroll = true;
    else window.lockScroll = false;

    // if home page is open and clicked on home, then render home
    // если главная открыта и мы кликаем по ней, то открывается главная страница без товаров, и удаляется сессия с запросами
    if(window.homeOpening == true && window.isBottom) {
        render('Home').then(html => {
            home();
            window.el.main.innerHTML = html;
            document.title = "Color shop";
            document.querySelector('footer').style.cssText = 
            'height:5%;opacity: 1;z-index:0';
            document.querySelector('#bottom').style.opacity = 1;

            window.startPos = 0
            window.isBottom = false;
            window.lockScroll = false;

            // delete session search
            sessionDelete();
            return false;
        });
    }

    // restore bottom after clicking tab
    // window.isBottom = true;

    historyUp('home');
    wheelFunc();

    // home is open
    window.homeOpening = true;
}
// ^^^^CLICK TO HOME ^^^^



let btns = document.querySelectorAll('header .tab');
btns.forEach(e => {
    e.onclick = () =>{
        window.el.main.onwheel = null;
        push();

        // if there are these variables, then action = profile
        // to ensure that the user is authorized
        if(window.cartToLogin) action = 'profile';
        if(window.likeToLogin) action = 'profile';
        if(window.homeToLogin) action = 'profile';

        //if ation is a number, then action = good
        try{
            action = action[0].toUpperCase() + action.slice(1);
        }catch {
            action = 'good';
        }
        // click to home
        // and home is loaded
        if(e.getAttribute('data-tab') == 'Home' && window.homeLoaded){
            action = e.getAttribute('data-tab');

            // this page is not 'login' or 'profile'
            if (action != 'Profile'){ window.thisLogin = false; window.thisProfile = false; }

            clickToHome();
        }
        // click to tab
        // and if home is not loaded
        else if (action != e.getAttribute('data-tab')){
            document.querySelectorAll('main >:not(#color)').forEach(e=>{ e.remove();});

            window.thisGood = false;
            
            action = e.getAttribute('data-tab');
            if (action != 'Profile'){ window.thisLogin = false; window.thisProfile = false; }

            window.homeOpening = false;

            render(action).then(html => {
                window.el.main.innerHTML += html;
                if(window.thisLogin)   log();
                if(window.thisProfile) profile();
                if(action == 'Home')   home();
                if(window.thisLike)    like();
                if(window.thisCart)    cart();
            });

            window.el.main.style.overflowY = 'hidden';
        }
    }
});
        // RENDER END

        //SEARCH START
let searchOpen = false;

function searchClose() {
    document.querySelector('#black').style.display = 'none';
    document.querySelector('#search').style.cssText = "display:flex;top:-100%;";
    setTimeout(() => {
        document.querySelector('#search').style.cssText = "display:none;top:-100%;";
    }, 500);
    searchOpen = false;
}

document.querySelector('#search-btn').onclick = function (){
    if (!searchOpen){
        closeCat();
            //OPEN
        document.querySelector('#black').style.display = 'block';
        document.querySelector('#search').style.cssText = "display:flex;top:-100%;";
        
        setTimeout(() => {
            if(window.matchMedia("(max-width: 720px)").matches) 
                 document.querySelector('#search').style.cssText = "display:flex;top:22%;";
            else document.querySelector('#search').style.cssText = "display:flex;top:17%;";
        }, 100);

        document.querySelector('#search input').focus(); // set cursor to input

        document.querySelector('#search span').onclick = search;//SEARCH ONCLICK

        // SEARCH ENTER
        document.querySelector('#root').onkeydown = (e)=>{
            // #root чтобы не пересикалось с document)
            if(e.keyCode == 13){//enter
                search();

                document.querySelector('#root').onkeydown = null;
            }
        }

        searchOpen = true;

            // CLOSE
        document.querySelector('#black').onclick = ()=>{
            searchClose();
        }
        
            // CLOSE esc
        document.onkeydown = (e)=>{
            if(e.keyCode == 27){//esc
                searchClose();

                document.onkeydown = null;
            }
        }
    }else{
            // CLOSE
        searchClose();
    }
}

function search(params) {
    let val   = document.querySelector('#search input').value;
    window.startPos = 0;
    
    if(val != ''){
        let query = {
            'action' : 'search',
            'query'  : val
        }
        let bodySearch = new FormData();
        for(let variable in query) bodySearch.append(variable, query[variable]);
        // fetch('core/core.php',{
        return fetch(phpPath,{
            method : 'post',
            mode   : 'cors',
            credentials: 'include',
            body   : bodySearch
        }).then(response => {
            return response.text();
        }).then(res => {
            render('home').then(html => {
                window.el.main.innerHTML = html;
                action = 'Home';
                if(window.thisHome) home();

                if(document.querySelector('#goods'))document.querySelector('#goods').innerHTML = ''; 
                if(res) goBottom();
            });
        });
    }
}
        //SEARCH END

        // CATEGORIE START
let catOpen = false;

function closeCat(){
    document.querySelector('#black').style.display = 'none';
    document.querySelector('#selCategorie').style.cssText = "display:flex;top:-100%;";
    setTimeout(() => {
        document.querySelector('#selCategorie').style.cssText = "display:none;top:-100%;";
    }, 500);
    catOpen = false;
}

document.querySelector('#cat-btn').onclick = function () {
    if (!catOpen){
            //OPEN
        searchClose();//Close search box

        document.querySelector('#black').style.display = 'block';
        document.querySelector('#selCategorie').style.cssText = "display:flex;top:-100%;";

        
        setTimeout(() => {
            if(window.matchMedia("(max-width: 720px)").matches) 
                 document.querySelector('#selCategorie').style.cssText = "display:flex;top:22%;";
            else document.querySelector('#selCategorie').style.cssText = "display:flex;top:17%;";
        }, 100);

        // shows all categories
        showCategories();

        catOpen = true;

            // CLOSE
            document.querySelector('#black').onclick = ()=>{
            closeCat();
        }
            // CLOSE esc
        document.onkeydown = (e)=>{
            if(e.keyCode == 27){//esc
                closeCat();
                document.onkeydown = null;
            }
        }
            //Close
    }else closeCat(); 
}

// shows available categories
function showCategories(){
    let showCat = {
        'action' : 'showCat'
    }
    let bodyShowCat = new FormData();
    for(let variable in showCat) bodyShowCat.append(variable, showCat[variable]);
    // fetch('core/core.php',{
    return fetch(phpPath,{
        method : 'post',
        mode   : 'cors',
        body   : bodyShowCat
    }).then(response => {
        return response.json();
    }).then(categories => {
        document.querySelector('#selCategorie').innerHTML = '<h2>Выберите категорию:</h2>';
        
        for(let cat in categories){;
            if(categories[cat]['rusName'] != 'not indicated'){
                document.querySelector('#selCategorie')
                .innerHTML +=  `<div class="form_radio_btn" data-categorie="${categories[cat]['cat_name']}">
                                    <input id="radio-${cat}" type="radio" name="radio" value="${categories[cat]['rusName']}">
                                    <label for="radio-${cat}">${categories[cat]['rusName']}</label>
                                </div>`;
            }else{
                document.querySelector('#selCategorie')
                .innerHTML +=  `<div class="form_radio_btn" data-categorie="${categories[cat]['cat_name']}">
                                    <input id="radio-${cat}" type="radio" name="radio" value="${categories[cat]['rusName']}" checked>
                                    <label for="radio-${cat}">${categories[cat]['rusName']}</label>
                                </div>`;
            }
        }
    
        document.querySelectorAll('.form_radio_btn').forEach(e=>{e.onclick = searchByCategorie}) ;
    });
}

function searchByCategorie(){
    window.startPos = 0;
    let thisCat = this.getAttribute('data-categorie');
    if((thisCat != 'not indicated')){
        let queryCat = {
            'action' : 'searchByCat',
            'cat'  : thisCat
        }

        let bodySearchByCat = new FormData();
        for(let variable in queryCat) bodySearchByCat.append(variable, queryCat[variable]);
        
        return fetch(phpPath,{
            method : 'post',
            mode   : 'cors',
            credentials: 'include',
            body   : bodySearchByCat
        }).then(response => {
            return response.text();
        }).then(res => {
            render('home').then(html => {
                window.el.main.innerHTML = html;
                action = 'Home';
                if(window.thisHome) home();

                if(document.querySelector('#goods'))document.querySelector('#goods').innerHTML = ''; 
                if(res) goBottom();
            });
        });
    }else closeCat();
}
        // CATEGORIE END


        // SMOOTH SCROLLING


        // END SMOOTH SCROLLING











