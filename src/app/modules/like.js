import {renderLike, render} from './render';
import {loginPath} from './php';
import {phpPath} from './php';
import {randomString} from './randStr';

import {log} from './login';
import {profile} from './profile';
import {action} from '../index';

export function like(){
    window.likeToLogin = false;
    let likeList = document.querySelector('#likeList');

    renderLike().then((likes)=>{

        if(likes.length == 0){
            likeList.innerHTML = `<div class="empty">Пусто:(<br>${randomString('Вам ничего не нравится?','Вам нужно пошопиться','Шопинг - залог здоровья','Вам обязательно что-то понравится')}</div>`;
        }else if(likes == 'login'){
            let footer = document.querySelector('#likeFooter');
            footer.innerHTML   = '<button class="enterBtn">Login</button>';
            likeList.innerHTML = '<h2 class="dontLogin">Вы не авторизовались<br><br><span class="icon-enter"></span></h2>';

            footer.children[0].onclick = ()=>{
                render('profile').then(html => {
                    window.el.main.innerHTML = html;
                    window.likeToLogin = true;
                    if(window.thisLogin) log();
                    if(window.thisProfile) profile();
                });
            }
        }else{
            for(let like in likes){
                let l = likes[like];
                if(l.del == false){
                    likeList.innerHTML += 
                        `<div class="likeItem" data-goodLike="${l.id}" onclick="openGood(this.getAttribute('data-goodLike'), true, event)">
                            <img src="./goods/${l.img}" alt="">
                            <div class="likeInfo">
                                <span data-empty="false" class="icon-cancel-circle canselIcon" onclick="deleteLikeItem(event)"></span>
                                <div class="likeName">${l.goodName}</div>
                                <div class="likeDesc">${l.descr}</div>
                                <div class="likeCost">${l.cost}₽</div>
                            </div>
                        </div>`;
                }else{
                    likeList.innerHTML += 
                        `<div class="likeItem">
                            <img src="./svg/nonePhote.svg" alt="">
                            <div class="likeInfo">
                                <div class="likeName">Товар удалён:(</div>
                                <div class="likeDesc">Автор решил удалить это объявление</div>
                                <div class="likeCost">:p</div>
                            </div>
                        </div>`;
                }
            }
        }
    });
}

window.deleteLikeItem = (e) => {
    deleteLike( 
        e.target.parentNode.parentNode.getAttribute('data-goodLike'),
        e.target
    );
}

window.deleteLike = (id, likeElem)=>{
    let like = {
        'action' : 'deleteLikeItem',
        'liked'  : id
    }
    let bodyLike = new FormData();
    for(let variable in like) bodyLike.append(variable, like[variable]);

    return fetch(phpPath,{
        method : 'post',
        mode   : 'cors',
        credentials:'include',
        body   : bodyLike
    }).then(response => {
        return response.text();
    }).then(res => {
        let likeList = document.querySelector('#likeList');

        if(res == true)
            likeElem.parentNode.parentNode.remove();


        if(likeList.childNodes.length == 0) likeList.innerHTML = `<div class="empty">Пусто:(<br>${randomString('Вам ничего не нравится?','Вам Нужно пошопится','Шопинг - залог здоровья','Вам обязательно что-то понравится')}</div>`;
    });
}