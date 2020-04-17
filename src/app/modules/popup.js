import {render} from './render';
import {log} from './login';
import {profile} from './profile';

function popup(error,btn='oK'){
    const main = document.querySelector('main');
    document.querySelector('#errors').innerHTML += `<div class="popup">
    <div class="errorPopup">${error}</div>
    <div class="footerPopup"><button class="btnPopup">${btn}</button></div>
    </div>`;
    setTimeout(() => {
        document.querySelector('.popup').style.left = '0';
        if(btn == 'login'){
            document.querySelector('.popup button').onclick = ()=>{
                render('profile').then(html => {
                    window.homeToLogin = true;

                    document.querySelectorAll('main >:not(#color)').forEach(e=>{ e.remove();});
                    
                    window.el.main.innerHTML += html;
                    if(window.thisLogin) log();
                    if(window.thisProfile) profile();
                });
            }
        }else
            document.querySelector('.popup button').onclick = popupClose;
    }, 100);
    setTimeout(() => {
        popupClose();
    }, 5000);
}
function popupClose(){
    let popup = document.querySelector('.popup');
    popup.style.left = '200%';
    setTimeout(() => {
        popup.remove();
    }, 1000);
}

let sure = (text = 'Вы уверены?')=>{
    document.querySelector('#root').insertAdjacentHTML('beforeEnd',
                                                       '<div class="sure">'+
                                                            '<div class="sureText">'+text+'</div>'+
                                                            '<div class="surefooter"><button data-confirm="ok">Ok</button><button data-confirm="cancel">Отмена</button></div>'+
                                                       '</div>'
    );
    // fade
    setTimeout(() => {
        document.querySelector('.sure').style.opacity = 1;
    }, 0.1);


    let elem = document.querySelector('.sure');
    
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


    // return true\false on click
    let promise;
    return promise = new Promise((resolve) => {
        document.querySelector('.surefooter button[data-confirm="ok"]').onclick = ()=>{resolve(true);}
        document.querySelector('.surefooter button[data-confirm="cancel"]').onclick = ()=>{resolve(false);}
      
    });

}

export {popup, popupClose, sure}