let select = function () {
    let selectHeader = document.querySelectorAll('.select__header');
    let selectItem = document.querySelectorAll('.select__item');

    selectHeader.forEach(item => {
        item.addEventListener('click', selectToggle)
    });

    selectItem.forEach(item => {
        item.addEventListener('click', selectChoose)
    });

    function selectToggle() {
        let body = document.querySelector('.select__body').scrollHeight;
        
        if(!this.parentElement.classList.contains('is-active'))
            this.parentElement.style.height = body+67 + 'px';
        else    
            this.parentElement.style.height = '67px';

        
        this.parentElement.classList.toggle('is-active');

        let icon = document.querySelector('.select__icon span');
    }

    function selectChoose() {
        window.categorie = this.getAttribute('data-value');
        let text = this.innerText,
            select = this.closest('.select'),
            currentText = select.querySelector('.select__current');
        select.style.height = '67px';
        currentText.innerText = text;
        
        setTimeout(() => {
            select.classList.remove('is-active');
        }, 200);
    }

};
export {select}