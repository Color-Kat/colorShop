function wathPage(btns){ 
    return new Promise(resolve => {
        btns.forEach(e => {
            e.onclick = () =>{
                resolve(e.innerHTML);
            }
        });
    });
}
export {wathPage};