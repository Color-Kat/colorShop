export function qSel(type = '#',...args){
    if(type == '#'){
        for(const arg of args) {
            window.el[arg] = document.querySelector('#'+arg);
        }
    }else if(type == '.'){
        for(const arg of args) {
            window.el[arg] = document.querySelector('.'+arg);
        }
    }else if(type == '<'){
        for(const arg of args) {
            window.el[arg] = document.querySelector(arg);
        }
    }
}