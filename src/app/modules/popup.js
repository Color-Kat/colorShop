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
export {popup, popupClose}