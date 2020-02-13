export function preloader(){
    document.body.onload = function(){
        document.querySelector('.preloader').style.display = 'none';
    }
}