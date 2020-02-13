import {render,renderCart} from './render';
import {loginPath, phpPath} from './php';
import {randomString} from './randStr';

import {log} from './login';
import {profile} from './profile';

export function cart(){
    window.cartToLogin = false;
    let cartList = document.querySelector('#cartList');

    renderCart().then((goods)=>{
        if(goods.length == 0){
            cartList.innerHTML = `<div class="empty">Пусто:(<br>${randomString('Вам ничего не выбрали?','Вам нужно что-то купить','А где покупки?','Вам обязательно что-то понравится')}</div>`;
        }else if( goods == 'login' ){
            let footer = document.querySelector('#cartFooter');
            footer.innerHTML = '<button class="enterBtn">Login</button>';
            cartList.innerHTML = '<h2 class="dontLogin">Вы не авторизовались<br><br><span class="icon-enter"></span></h2>';

            footer.children[0].onclick = ()=>{
                render('profile').then(html => {
                    window.cartToLogin = true;
                    window.el.main.innerHTML = html;
                    if(window.thisLogin) log();
                    if(window.thisProfile) profile();
                });
            }
        }else{
            for(let good in goods){
                let g = goods[good];
                if(g.del == false){
                    cartList.innerHTML += 
                        `<div class="cartItem" data-goodId="${g.id}">
                            <img src="./goods/${g.img}" alt="">
                            <div class="cartInfo">
                                <span class="icon-cancel-circle canselIcon" onclick="cartHandler(event)"></span>
                                <div class="cartName">${g.goodName}</div>
                                <div class="cartDesc">${g.descr}</div>
                                <div class="cartCost">${g.cost}₽</div>
                            </div>
                        </div>`;
                }else{
                    cartList.innerHTML += 
                        `<div class="cartItem">
                            <img src="./svg/nonePhote.svg" alt="">
                            <div class="cartInfo">
                                <div class="cartName">Товар удалён:(</div>
                                <div class="cartDesc">Автор решил удалить этот товар(
                                                    или продал его</div>
                                <div class="cartCost">:p</div>
                            </div>
                        </div>`;
                }
            }
        }
    });
}

window.cartHandler = (e)=>{
    let delElem = e.target.parentNode.parentNode.getAttribute('data-goodId');
    let elem    = e.target;

    deleteFromCart(delElem, elem);
}

function deleteFromCart (itemId, elem){
    let delCart = {
        'action' : 'deleteCartItem',
        'goodId'  : itemId
    }
    let bodyDelCart = new FormData();
    for(let variable in delCart) bodyDelCart.append(variable, delCart[variable]);

    return fetch(phpPath,{
        method : 'post',
        mode   : 'cors',
        credentials:'include',
        body   : bodyDelCart
    }).then(response => {
        return response.text();
    }).then(res => {
        let cartList = document.querySelector('#cartList');

        if(res == true) elem.parentNode.parentNode.remove();
        
        if(cartList.childNodes.length == 0) cartList.innerHTML = `<div class="empty">Пусто:(<br>${randomString('Вам ничего не выбрали?','Вам нужно что-то купить','А где покупки?','Вам обязательно что-то понравится')}</div>`;
    });
}