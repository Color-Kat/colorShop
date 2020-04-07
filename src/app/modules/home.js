import { renderGoods, render, historyUp } from './render';
import { popup } from './popup';
import { phpPath } from './php';
import * as grid from 'masonry-layout'
import { profile } from './profile';
let imagesLoaded = require('imagesloaded');

const main        = document.querySelector('main'),
      footer      = document.querySelector('footer');
window.startPos   = 0;
window.lockScroll = false;
window.enterToHome= true;
// window.thisHome   = true;
let lockGoods     = false;

function home(){
    window.isBottom = false;

            // footer
    footer.style.cssText = 'height:5%;opacity: 1;z-index:0';
    bottom.style.opacity = 1;

            // restoring scoll
    window.el.main.style.overflowY = 'auto';

    //Add event at startup
    wheelFunc();

    let divGoods = document.querySelector('#goods');
    if (divGoods) divGoods.remove();
    
        // if good page is active 
    if(window.thisGood){
            // color is visible
        let color = document.querySelector('#color');
        if(color != undefined) color.style.visibility = 'visible';

            // overflow is normal
        window.el.main.style.overflowY = 'auto';

            // remove good element
        let goodCard = document.querySelector('#goodCard');
        if(goodCard != undefined) goodCard.remove();

        if(!window.enterToHome) footer.style.cssText = 'height:100%;opacity: 0;z-index:-1';

        window.thisGood = false;

        return;
        // end
    }

    //
    window.homeToLogin = false;
    //scroll is not needed
    main.onscroll = null;

    window.startPos = 0;
    window.lockScroll = false;
    document.querySelector('#bottom').onclick = goBottom;
}

function wheelHandler(e) {
    if(!window.lockScroll){
        // scroll bottom
        if(e.deltaY > 0)    goBottom();
        window.lockScroll = true;
    }
    if(e.deltaY < 0){
        if(main.scrollTop == 0){
            render('home').then(html => {
                window.el.main.innerHTML = html;
                home();
                document.title = "Color shop";
                footer.style.cssText = 
                'height:5%;opacity: 1;z-index:0';
                bottom.style.opacity = 1;

                window.startPos = 0
                // window.homeOpening = false;
                window.isBottom = false;
            });
        }
    }
}

function wheelFunc(){
    main.addEventListener('wheel', wheelHandler, { passive: true });
}

function goBottom () {
    main.onscroll = null;
    // window.homeOpening = true; //if true then onclick - sessionDelete()
    window.isBottom = true;

    lockGoods = false;

    if(document.querySelector('#goods'))document.querySelector('#goods').remove();

    footer.style.cssText = 
    'height:100%;opacity: 0;z-index:-1';
    bottom.style.opacity = 0;
    main.style.height = '85%';

    renderGoods(window.startPos).then(res => {
        let divGoods = document.createElement('div');
            divGoods.setAttribute("id", "goods");

        // not empty
        if(res != 0){
            for (let i=0; i<res.length; i++) {
                divGoods.innerHTML +=    
                `<div class="goods-card grid-sizer" data-good="${res[i]['id']}" onclick="handleGood(event)">
                    <img src="./goods/${res[i]['img']}" alt="" class="goodImg">
                    <div class="goodFooter">
                        <div class="goodName">${res[i]['goodName']}</div>
                        <div class="goodCost">${res[i]['cost']}₽</div>
                        <div class="goodLike" data-goodLike="${res[i]['iLike']}"><span class="icon-heart"></span></div>
                    </div>
                </div>`;
            }
            color.appendChild(divGoods);  
            
            main.onscroll = () => {
                if  (main.scrollTop >= main.scrollHeight - main.clientHeight - 300) 
                {
                    if(lockGoods == false) moreGoods(window.startPos);
                }
            }

            document.querySelector('#colorSvg').style.cssText = 'top: -50%;transition: all .5s ease-in-out;';
            setTimeout(() => {
                divGoods.style.display = 'none';

                divGoods.style.marginTop = '0';
                divGoods.style.height = '100%';
                color.style.width = '65%';
            }, 200);

            setTimeout(() => {
                divGoods.style.display = 'block';
                
                imagesLoaded( '#goods', function() {
                    // images have loaded
                    masonry(divGoods);
                });
            }, 500);
                
            window.startPos += 12;
        }
        // empty
        else{
            let empty = document.createElement('div');
                empty.setAttribute("class", "empty");
                empty.style.top = '70%';

                empty.innerHTML = `<h2>По вашему запросу ничего не найдено:(</h2>`;

                color.appendChild(empty);  

            document.querySelector('#colorSvg').style.cssText = 'top: -50%;transition: all .5s ease-in-out;';

                empty.style.display = 'none';
                empty.style.marginTop = '0';
                empty.style.height = '100%';
                color.style.width = '65%';

            setTimeout(() => {
                empty.style.display = 'block';
            }, 500);
        }
    });
    window.lockScroll = true;
}

function moreGoods(start){
    lockGoods = true;
    renderGoods(start)
    .then(result => {
        let divGoods = document.querySelector("#goods");

        if(result != 0){
            for (let i=0; i<result.length; i++) {
                if(divGoods){
                    divGoods.innerHTML +=    
                    `<div class="goods-card grid-sizer" data-good="${result[i]['id']}" onclick="handleGood(event)">
                        <img src="goods/${result[i]['img']}" alt="" class="goodImg">
                        <div class="goodFooter">
                            <div class="goodName">${result[i]['goodName']}</div>
                            <div class="goodCost">${result[i]['cost']}₽</div>
                            <div class="goodLike" data-goodLike="${result[i]['iLike']}"><span class="icon-heart"></span></div>
                        </div>
                    </div>`;
                }
            }
            if(divGoods){
                imagesLoaded( '#goods', function() {
                    // images have loaded
                    masonry(divGoods);
                });
            }
            window.startPos += 12;
            lockGoods = false;
        }else{
            if(divGoods){
                divGoods.innerHTML += `<div class="goods-card grid-sizer"">
                                        <h2>Ничего нет(</h2>            
                                       </div>`;
                imagesLoaded( '#goods', function() {
                    // images have loaded
                    masonry(divGoods);
                });
            }
        }
    });	
}

function masonry(divGoods) {
    let msnry = new grid( divGoods, {
        // options
        itemSelector: '.goods-card',
        columnWidth: '.grid-sizer',
        percentPosition: true
    });
}

// open good page
window.handleGood = (e) => {
    if(e.target.className == 'goodLike') addLike(e.target.parentNode.parentNode.getAttribute('data-good'),
                                                 e.target.getAttribute('data-goodlike'),
                                                 e.target);
    if(e.target.className == 'goods-card grid-sizer') openGood(e.target.getAttribute('data-good'));
}

window.addLike = (id, liked, likeElem)=>{
    let act = liked == "true" ? 'delLike': 'addLike';

    let like = {
        'action' : act,
        'liked'  : id
    }
    let bodyLike = new FormData();
    for(let variable in like) bodyLike.append(variable, like[variable]);
    // fetch('core/core.php',{
    return fetch(phpPath,{
        method : 'post',
        mode   : 'cors',
        credentials:'include',
        body   : bodyLike
    }).then(response => {
        return response.text();
    }).then(res => {
        if(res == true){
            if(act == 'delLike') likeElem.setAttribute('data-goodlike', false);
            else likeElem.setAttribute('data-goodlike', true);
        }else{
            popup('Войдите в аккаунт', 'login');
        }
    });
}


let thisSlide;

window.openGood = (id, e) => {
    if(e != undefined && e != false) if (e.target.tagName == 'SPAN') return false;
    window.action = 'Good';

    let openGood = {
        'action'   : 'openGood',
        'openable' : id
    }
    let bodyGood = new FormData();
    for(let variable in openGood) bodyGood.append(variable, openGood[variable]);
    
    return fetch(phpPath,{
        method : 'post',
        mode   : 'cors',
        credentials:'include',
        body   : bodyGood
    }).then(response => {
        return response.text();
    }).then(res => {
        thisSlide = 1;
        res = JSON.parse(res);
        console.log(res);

        // window.isBottom = false;
        window.homeOpening = false;

        res['goodName'] = res['goodName'][0].toUpperCase() + res['goodName'].slice(1);
        res['name'] = res['name'] ? res['name'][0].toUpperCase() + res['name'].slice(1) : 'Имя не указано';
        res['surname'] = res['surname'] ? res['surname'] : '';

        render('good', false).then(html => {// возвращает html код
            // color is hidden
            let color = document.querySelector('#color');
            if(color) color.style.visibility = 'hidden';
                      window.el.main.style.overflowY = 'hidden';
            
                // is good added?
            isAdded(res['id']).then((add)=>{
                console.log(res['id']);
                document.querySelectorAll('main >:not(#color)').forEach(e=>{ e.remove();});
                // insert var in html code
                window.el.main.innerHTML += react(html, {
                    goodName       : res['goodName'],
                    descr          : res['descr'],
                    img            : res['img'],
                    id             : res['id'],
                    cost           : res['cost'],
                    added          : add['cart'],
                    sellerName     : res['name'],
                    sellerLastName : res['surname'],
                    sellerId       : res['sellerId'],
                    categorie      : res['categorie'],
                    location       : res['sellerAdress'],
                    number         : res['sellerNumber'],
                    liked          : add['like'],
                    buyer          : res['myId']
                });

                // specs list
                let arrSpecList = res['specList'].split(',');
                if(arrSpecList != '') 
                {
                    for ( let spec of arrSpecList)
                    {
                        let arrSpec = spec.split('---');
                        document.querySelector('#specificationsH').insertAdjacentHTML('afterEnd', `<div class="bborder"><div id="type">${arrSpec[0]}</div><div class="answer">${arrSpec[1]}</div></div>`);
                    }
                }
                // none spec
                else { document.querySelector('#specificationsH').insertAdjacentHTML('afterEnd', 'не указано'); }

                    // added to cart
                if(add['cart'] == true){
                    // added
                    document.querySelector('.in').style.display = 'none';
                    document.querySelector('.out').style.display = 'block';
                }else if(add['cart'] == false){
                    // not added
                    document.querySelector('.in').style.display = 'block';
                    document.querySelector('.out').style.display = 'none';
                }else if (add == 'login'){
                    document.querySelector('.in').style.display = 'block';
                    document.querySelector('.in').innerHTML = 'Войдите'
                    document.querySelector('.out').style.display = 'none';
                }else if (add['cart'] == 'my'){
                    document.querySelector('.in').style.display = 'block';
                    document.querySelector('.in').innerHTML = 'Мой'
                    document.querySelector('.out').style.display = 'none';
                }
                    // added to like
                if (add['like'] == true){
                    // added
                    document.querySelector('.toLike').innerHTML = 'Добавить в избранное';
                }else if (add['like'] == false){
                    // not added
                    document.querySelector('.toLike').innerHTML = 'Убрать из избранного';
                }else if (add == 'login'){
                    document.querySelector('.toLike').innerHTML = 'Войдите';
                }

                    // chat inscription
                let chatInscr = document.querySelector('.write');   //inscription
                let chatBtns = document.querySelectorAll('.write'); //ALL
                // coco:21 --> coco
                res['seller'] = res['seller'].split(':')[0];
                // coco --> Coco
                if (res['seller'])
                    res['seller'] = res['seller'][0].toUpperCase() + res['seller'].slice(1);
                else res['seller'] = null;


                // The seller visited the page
                if(res['myId'] == res['sellerId']) {
                    chatInscr.innerText = 'Читать';
                    chatBtns[0].setAttribute('data-viewer', 'seller');
                    chatBtns[1].setAttribute('data-viewer', 'seller');
                }else{
                    chatBtns[0].setAttribute('data-viewer', 'buyer');
                    chatBtns[1].setAttribute('data-viewer', 'buyer');
                }

                    // chat
                chatBtns.forEach(e => {
                    e.onclick = () => {
                            // function responsible for 
                            // the operation of this page
                        let viewer = chatBtns[0].getAttribute('data-viewer');
                        let seller = chatBtns[0].getAttribute('data-seller');
                        let buyer  = chatBtns[0].getAttribute('data-buyer');
                        let goodId = chatBtns[0].getAttribute('data-good');

                        // if it opens buyers, then throws it into the chat
                        if (viewer == 'buyer')
                            // open by seller, buyer and goodId
                            openChat(false, false, buyer, seller, goodId, viewer);

                        // if the seller, then in the chat list
                        else if (viewer == 'seller'){
                            render('prof', true).then(html => {
                                if(color) color.style.visibility = 'hidden';
                                    window.el.main.style.overflowY = 'hidden';

                                document.querySelectorAll('main >:not(#color)').forEach(e=>{ e.remove();});
                                window.el.main.innerHTML += html;    

                                profile(true);
                            });
                        }
                    }
                })

                let left  = document.querySelector('#toLeft');//left arrow
                let right = document.querySelector('#toRight');//right arrow

                right.onclick = ()=>{
                    thisSlide = 2;
                    checkSlide(true);
                }
                left.onclick = ()=>{
                    thisSlide = 1;
                    checkSlide(true);
                }
                
                checkSlide();

                        // ADD TO HISTORY
                window.story = false;
                // if(addH)
                    historyUp(res['id'], true);

                        //Bottom button
                document.querySelectorAll('.details').forEach(element  => {
                    element.onclick = () => {
                        if(thisSlide == 1)       thisSlide = 2;
                        else if(thisSlide == 2) thisSlide = 1;
    
                        checkSlide(true);
                    }
                })

                        // add to like
                document.querySelectorAll('.toLike').forEach(element => {
                    element.onclick = (e) => { addToLikeGood(e); }
                });

                let isLiked = document.querySelector('.toLike').getAttribute('data-goodLike');
                
                if(isLiked == 'true')        document.querySelector('.toLike').innerHTML = 'Убрать из избранного';
                else if (isLiked == 'false') document.querySelector('.toLike').innerHTML = 'Добавить в избранное';

                // let hTopBLock = document.querySelector('#goodImage').naturalHeight;
                // document.querySelector('.miniToTop').style.height = hTopBLock+' !important';
                // console.log(hTopBLock);
            })
        });
    });
}

    //substitute variables
function react(template, vars) {
    let result = [...new Set(
        template.match(/\{(.*?)\}/g).map(
            e => e.replace(/[^a-zA-Z0-9]/g, "")
        ).filter(e => e.length > 0)
    )]
        
    .forEach(e => {
        let data = "";
        if(e in vars) 
            data = vars[e];
        else data = "Undefined: " + e;

        template = template.replace(RegExp(`{${e}}`, "g"), data);
    });

    return template;
}

// is good added?
function isAdded (id) {
    let added = {
        'action' : 'isAdded',
        'id'     : id
    }
    let bodyAdded = new FormData();
    for(let variable in added) bodyAdded.append(variable, added[variable]);

    return fetch(phpPath,{
        method : 'post',
        mode   : 'cors',
        credentials:'include',
        body   : bodyAdded
    }).then(response => {
        return response.text();
    }).then(res => {
        console.log(res);
        if(res != 'login') {
            res = JSON.parse(res);
            return res;
        }else{
            return 'login';
        }
    });
}

function checkSlide(transit = false){
    let slide_1 = document.querySelector('#slide_1');
    let slide_2 = document.querySelector('#slide_2');

    let left  = document.querySelector('#toLeft');//left arrow
    let right = document.querySelector('#toRight');//right arrow

    let transition = document.querySelector('#transition');


    if(thisSlide == 1) {
        // circle-left is hidden
        left.style.display = 'none';
        right.style.display = 'block';

        slide_1.style.left = '0';
        slide_2.style.left = '100%';

        slide_1.style.display = 'block';

        // transition
        if(transit){
            transition.style.width = '100%';
            transition.style.left = '0';
            setTimeout(() => {
                transition.style.left = 'auto';
                transition.style.right = '0';
                transition.style.width = '0';
            }, 200);
        }

    }
    if(thisSlide == 2) {
        // circle-right is hidden
        right.style.display = 'none';
        left.style.display = 'block';

        slide_2.style.left = '0';
        slide_1.style.left = '-100%';

        slide_2.style.display = 'block';

         // transition
         if(transit){
            transition.style.right = '0';
            transition.style.width = '100%';
            setTimeout(() => {
                transition.style.right = 'auto';
                transition.style.left = '0';
                transition.style.width = '0';
            }, 200);
        }
    }

}


window.buy = function (e) {
    let goodId = e.target.getAttribute('data-id');
    let act;

    if(e.target.getAttribute('data-added') == 'true') act = 'deleteCartItem';
    else if (e.target.getAttribute('data-added') == 'false') act = 'addToCart';
    else if (e.target.getAttribute('data-added') == 'my') return;

    let cart = {
        'action' : act,
        'goodId'  : goodId
    }
    let bodyCart = new FormData();
    for(let variable in cart) bodyCart.append(variable, cart[variable]);

    return fetch(phpPath,{
        method : 'post',
        mode   : 'cors',
        credentials:'include',
        body   : bodyCart
    }).then(response => {
        return response.text();
    }).then(res => {
        if (res != true) popup('Войдите в аккаунт', 'login');
        let cIn  = document.querySelector('.in');
        let cOut = document.querySelector('.out');
        if (act == 'addToCart') {
            cIn.style.display = 'none';
            cOut.style.display = 'block';
            cIn.setAttribute('data-added', 'true');
            cOut.setAttribute('data-added', 'true');
        }else if(act == 'deleteCartItem'){
            cIn.style.display = 'block';
            cOut.style.display = 'none';
            cIn.setAttribute('data-added', 'false');
            cOut.setAttribute('data-added', 'false');
        }
    });
}

window.addToLikeGood = function (e) {
    let goodId = e.target.getAttribute('data-id') || e.target.parentNode.getAttribute('data-id');
    let act;

    let isLikeEl = e.target.getAttribute('data-goodLike') || e.target.parentNode.getAttribute('data-goodLike');
    if(isLikeEl == 'true') act = 'delLike';
    else if (isLikeEl == 'false') act = 'addLike';
    else if (isLikeEl == 'undefined') {popup('Войдите в аккаунт', 'login');return false;}

    let like = {
        'action' : act,
        'liked'  : goodId
    }

    let body = new FormData();
    for(let variable in like) body.append(variable, like[variable]);

    return fetch(phpPath,{
        method : 'post',
        mode   : 'cors',
        credentials:'include',
        body   : body
    }).then(response => {
        return response.text();
    }).then(res => {
        if (res == 'login') popup('Войдите в аккаунт', 'login');
        else {
            let addToLike = document.querySelectorAll('.toLike');

            if (act == 'addLike') {
                addToLike[0].innerHTML = 'Убрать из избранного';
                addToLike[0].setAttribute('data-goodLike', 'true');
                addToLike[1].setAttribute('data-goodLike', 'true');
            }else if(act == 'delLike'){
                addToLike[0].innerHTML = 'Добавить в избранное';
                addToLike[0].setAttribute('data-goodLike', 'false');
                addToLike[1].setAttribute('data-goodLike', 'false');
            }
        }
    });
}

export {home, goBottom, wheelFunc, react, wheelHandler}