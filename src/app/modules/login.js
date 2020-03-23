import {render} from './render';
import {rand} from './random';
import {profile} from './profile';
import {randomString} from './randStr';
import {popup, popupClose} from './popup';
import { phpPath } from './php';

let registr7 = false,//текущая страница(login/registration)
    reg2Page = false,
    placeholder;
const main = document.querySelector('main');

function log() {
    registr7 = false;
    reg2Page = false;
    window.thisLogin = true;

    document.querySelector('.reg').onclick = reg;

    let inputs = document.querySelectorAll('.inp');
    checkInp(inputs);
}

function reg (){
    render('registration', false).then((html) => {
        document.querySelectorAll('main >:not(#color)').forEach(e=>{ e.remove();});
        main.innerHTML += html;

        document.querySelector('.reg').onclick = ()=>{
            render('login', false).then((html)=>{
                document.querySelectorAll('main >:not(#color)').forEach(e=>{ e.remove();});
                main.innerHTML += html;
                
                log();
            });
        };
        let inputs = document.querySelectorAll('.inp');
        checkInp(inputs);
        registr7 = true;
        reg2Page = false;
    });
} 
// проверка инпутов
function checkInp(inputs){
    // regex для почты
    let mailMas = {
        "ename" : /^[A-Z0-9._%+-]/i,
        "edog"  : /^[A-Z0-9._%+-]+@/i,
        "ecom"  : /^[A-Z0-9._%+-]+@[A-Z0-9-]+[.]+[A-Z]{2,4}$/i
    },
    // regex для пароля
    pasMas = {
        "pasNum" : /(?=.*[0-9])/,
        "pasLetter": /(?=.*[a-z])/i,
        "pasFull": /[0-9a-z]{6,}/i
    },
    // regex для имя
    nameMas = /^[a-zA-Zа-яёА-ЯЁ]+$/u;
    //ошибки
    let errorsOut = document.querySelectorAll('.errors');
    let trueForm  = [false, false],
        trueForm2 = [false, false];
    let email, epass, name, surname;
    // очистить ошибки
    for(let i=0; i<inputs.length; i++){
        errorsOut[i].style.cssText = 
        'opacity: 0;margin-top: -20px;';
    }
    inputs[0].oninput = e => {
        if(!reg2Page){
            email = e.target.value;
            try {//почта (страница 1)
                // если почта написана правильно
                trueForm[0] = false;
                if(isEmail(email)){
                    outError(0);
                    trueForm[0] = true;
                }
            } catch (error) {
                // почта написана не правильно
                errorsOut[0].innerHTML = error;
                errorsOut[0].style.cssText = 
                'opacity: 1;margin-top: 5px;';
            }
        }else{

            //имя (страница 2)
            name = e.target.value;
            try {
                // если имя написано правильно
                trueForm[0] = false;
                trueForm2[0] = false;
                if(isName(name)){
                    outError(0);
                    trueForm2[0] = true;
                }
            } catch (error) {
                // имя написано не правильно
                errorsOut[0].innerHTML = error;
                errorsOut[0].style.cssText = 
                'opacity: 1;margin-top: 5px;';
            }

        }
    }
    inputs[1].addEventListener('input', e => {
        if(!reg2Page){
            //пароль (страница 1)
            epass = e.target.value;
            try {
                // если пароль написан правильно
                trueForm[1] = false;
                if(isPass(epass)){
                    outError(1);
                    trueForm[1] = true;
                }
            } catch (error) {
                // пароль написан не правильно
                errorsOut[1].innerHTML = error;
                errorsOut[1].style.cssText = 
                'opacity: 1;margin-top: 5px;';
            }  
        }else{

            //фамилия(страница 2)
            surname = e.target.value;
            try {
                // если фамилия написана правильно
                trueForm2[1] = false;
                trueForm[1] = false;
                if(isSurname(surname)){
                    outError(1);
                    trueForm2[1] = true;
                }
            } catch (error) {
                // фамилия написана не правильно
                errorsOut[1].innerHTML = error;
                errorsOut[1].style.cssText = 
                'opacity: 1;margin-top: 5px;';
            }

        }
    });
    // проверка email
    function isEmail(mail){    
        if(!mailMas.ename.test(mail)) throw String('Переключите раскладку');
        else if(!mailMas.edog.test(mail)) throw String('Отсутствует @');
        else if(!mailMas.ecom.test(mail)) throw String('Отсутствует домен');
        else if(mailMas.ecom.test(mail)) return 'true';
    }
    // Проверка пароля
    function isPass(pass){
        if(pass.length < 6) throw String('Нужно 6+ символов');
        else if(!pasMas.pasNum.test(pass)) throw String('Отсутствуют цифры');
        else if(!pasMas.pasLetter.test(pass)) throw String('Отсутствуют латинские буквы');
        else if(pasMas.pasFull.test(pass)) return 'true';
    }
    function isName(name){
        if(!nameMas.test(name)) throw String('Неверное имя');
        else if(nameMas.test(name)) return 'true';
    }
    function isSurname(surname){
        if(!nameMas.test(surname)) throw String('Неверная фамилия');
        else if(nameMas.test(surname)) return 'true';
    }

    document.querySelectorAll('.loginBtn').forEach(e => {
        e.addEventListener('click', ()=>{
            for (let i=0; i < inputs.length; i++) {
                if(inputs[i].value == ''){
                    document.querySelectorAll('.errors')[i].innerHTML = '';
                    errorsOut[i].innerHTML = 'Поле не заполненно!';
                    errorsOut[i].style.cssText = 
                    'opacity: 1;margin-top: 5px;';
                    break;
                }else if(trueForm.every(e => e === true)){
                    // если авторизация
                    if(!registr7){
                        doLogin(email, epass);
                    }
                    // если регистрация
                    if(registr7){
                        trueForm2.every(e => e = true);
                        register1(inputs);
                    }
                    break;
                }
                else if(trueForm2.every(e => e === true)){
                   doRegister(email, epass, name, surname);
                   break;
                }
            }
        });
    });
    function outError(id){
        errorsOut[id].innerHTML   = randomString('Всё верно:)','Верно','Хорошо!','Отлично');
        errorsOut[id].style.color = '#4BB543';
        setTimeout(() => {
            errorsOut[id].style.cssText = 
            'opacity: 0;margin-top: -20px;';
        }, 2000);
    }
}
function register1(inputs) {
    let placeholder = document.querySelectorAll('.placeholder');
    for (let i=0; i < inputs.length; i++) {
        placeholder[i].style.cssText = 
            'margin-right: -1500px;';
        inputs[i].value = '';
    }
    setTimeout(() => {
        placeholder[0].innerHTML = 'Your name';
        placeholder[1].innerHTML = 'Surname';
        inputs[1].setAttribute('type','text');
        for (let i=0; i < inputs.length; i++) {
            placeholder[i].style.cssText = 
                'margin-right: 0;';
        }
        reg2Page = true;
    }, 400);
}

function doLogin(email, epass) {
    let loginPost = {
        'action': 'login',
        'email' : email,
        'epass' : epass
    }
    let bodyForLogin = new FormData();
    for(let variable in loginPost) bodyForLogin.append(variable, loginPost[variable]);
    
    fetch(phpPath,{
        method : 'post',
        mode   : 'cors',
        credentials: 'include',
        body   : bodyForLogin
    }).then(response => {
        return response.text();
    }).then(res => {
        console.log(res);
        
        if(res){
            render('profile',false).then(html => {
                window.thisLogin = false;
                window.thisProfile = true;
                document.querySelectorAll('main >:not(#color)').forEach(e=>{ e.remove();});
                main.innerHTML += html;
                profile();
            });
        }else{
            log();
            popup(res);
        }
    });
}

function doRegister(email, epass, name, surname){
    let regPost = {
        'action'  : 'registration',
        'email'   : email,
        'epass'   : epass,
        'name'    : name,
        'surname' : surname
    }
    let bodyForReg = new FormData();
    for(let variable in regPost) bodyForReg.append(variable, regPost[variable]);
    fetch(phpPath,{
        method : 'post',
        mode   : 'cors',
        body   : bodyForReg
    }).then(response => {
        return response.text();
    }).then(res => {
        if(res == 'true' || res == 1){
            log();
        }else{
            popup(res);
            placeholder = document.querySelectorAll('.placeholder');
            for (let i=0; i < 2; i++) {
                placeholder[i].style.cssText = 
                    'margin-right: -1500px;';
            }
            setTimeout(() => {
                placeholder[0].innerHTML = 'Your Email';
                placeholder[1].innerHTML = 'Think password';
                for (let i=0; i < 2; i++) {
                    placeholder[i].style.cssText = 
                        'margin-right: 0;';
                }
                reg2Page = false;
            }, 400);
            setTimeout(() => {
                reg();
            }, 2500);
        }
    });
}
export {log}