import {rand} from './rand';
import {thisPath} from './php';

export function setBg(){
    let bgNum = rand(1,5);

    document.body.style.backgroundImage = 'url('+thisPath+'polygon/bg'+bgNum+'.jpg)';   
    
    resizeWindow();
    window.addEventListener("resize", resizeWindow);
}

function resizeWindow(){                
    let el = document.querySelector('#like')
    el = getComputedStyle(el);

    document.querySelectorAll('.dinText').forEach(elem => {
        elem.style.fontSize = el.height;
    });
}