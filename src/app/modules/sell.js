import {randomString} from './randStr';
import {popup} from './popup';
import {phpPath} from './php';
import MaskInput from 'mask-input';

let name = '',
    description = '',
    cost = '',
    image = '',
    adr   = '';

let current_input_number = 1;

export function sell(){
    let goBtn = document.querySelector('#goCreate');
    goBtn.value = randomString('Вперед!','Повесить','Написать', 'Создать', 'Отправить', 'Записать', 'Продать', 'Ок');
    // image
    document.querySelector('#createImg').oninput = (e)=>{readFile(e.target)};
    // name
    document.querySelector('#createName').oninput = (e)=>{readName(e.target.value)};
    // description
    document.querySelector('#createDescr').oninput = (e)=>{description = e.target.value};
    // cost
    document.querySelector('#createCost').oninput = (e)=>{readCost(e.target.value)};
    // location
    document.querySelector('#location').oninput = (e)=>{
        readAdress(e.target.value).then((adresses)=>{
            adresses = adresses['suggestions'];

            // adresses is empty
            document.querySelector('#adresses').innerHTML = '';

            for (let adr in adresses){
                document.querySelector('#adresses').innerHTML += `<div onclick="adressUp(event)">${adresses[adr].value}<div class='blackOut'></div></div>`;
            }
            document.querySelector('#adresses').style.height = '175px';
        })
        
    };
    // number
    const maskInput = new MaskInput(document.querySelector('#numberPhone'), {
        mask: '+0(000)000-00-00',
        alwaysShowMask: true,
        maskChar: '_',
    });

    // specifications
    document.querySelector('#specifications').onclick = (e)=>{
        document.querySelector('#specList').innerHTML += `<div class="specItem"><input name="specs[${current_input_number}][name]" type="text" placeholder="Характеристика" class="spec"><span class="spec-val">:</span><input name="specs[${current_input_number}][value]" type="text" placeholder="Значение" class="specVal"></div>`;

        current_input_number++;

        openSpec(e)
    };
        
    function openSpec(e){
        if(e.target.id != 'open') return false;
        document.querySelector('#specifications').style.height = 'auto';
        
        document.querySelector('#specifications').onclick = (e)=>{closeSpec(e)};
        
        document.querySelector('#createGood').scrollTop = document.querySelector('#createGood').scrollHeight
    }
    function closeSpec(e){
        if(e.target.id != 'open') return false;
        document.querySelector('#specifications').style.height = '40px';
        
        document.querySelector('#specifications').onclick = (e)=>{openSpec(e)};
    }

    goBtn.onclick = hang;

    showCategories();
}

let specList = [];

window.addSpec = () => {
    // if the last of the characteristic item is not empty, then add a new item
    let lastSpec = document.querySelector('.specItem:last-child .spec').value;
    let lastSpecVal = document.querySelector('.specItem:last-child .specVal').value;

    if (lastSpec != '' && lastSpecVal != ''){
        document.querySelector('#specList').insertAdjacentHTML('beforeend', `<div class="specItem"><input name="specs[${current_input_number}][name]" type="text" placeholder="Характеристика" class="spec"><span class="spec-val">:</span><input name="specs[${current_input_number}][value]" type="text" placeholder="Значение" class="specVal"></div>`);
        // specList[]['specName'] = 
        current_input_number++;
    }else{
        document.querySelector('#specList').insertAdjacentHTML('beforeend', '<div class="specItem" id="deleted">Заполните предыдущие поля</div>');
        setTimeout(() => {
            document.querySelector('#deleted').style.opacity = 0;
        }, 100);
        setTimeout(() => {
            document.querySelector('#deleted').remove();
        }, 2000);
    }
}

window.adressUp = (e) => {
    adr = e.target.innerText;
    document.querySelector('#location').value = adr;
}

function readFile(input) {
    if (input.files && input.files[0]) {    
        let reader = new FileReader();
        reader.onload = function(e) {
            document.querySelector('#protoImg').setAttribute('src', e.target.result);
            let protoImg = e.target.result;
            image = true;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function readName(val){
    name = val;
    document.querySelector('#protoName').innerText = name;
}

function readCost(val){
    cost = val;
    document.querySelector('#protoCost').innerText = cost+'₽';
}

function readAdress (query){
    const Dadata = require('dadata-suggestions');
    const dadata = new Dadata('79ca61aff84638efce953599d59b4058d44e4ec6');

    return dadata.address({ query: query, count: 5 })
        .then((data) => {
            return data;
        })
        .catch(console.error);
}

function hang(e){
    let number = document.querySelector('#numberPhone').value.search('_');
    // if(cost!='' && name!='' && description!='' && image!='' && window.adr != '' && number == -1){
        document.querySelector('#sellForm').addEventListener('submit', function(e){
            e.preventDefault();

            let bodySell = new FormData(this);
            bodySell.append('action', 'sell');
        
            fetch(phpPath,{
                method : 'post',
                mode   : 'cors',
                credentials: 'include',
                body   : bodySell
            }).then(response => {
                return response.text();
            }).then(res => {
                console.log(res);
                if(res == 'type')
                    popup('Тип изображения может быть только jpg(jpeg) или png');
                else if (res == 'size')
                    popup('Размер не должен превышать 3Мб');
                if(res == true)
                    this.reset(); // очищаем поля формы 

                e.preventDefault();
                // clear protoImg
                document.querySelector('#protoImg').setAttribute('src', "./svg/nonePhote.svg");
            });
        });
    // }else
    //     e.preventDefault();
}

function showCategories(){
    let showCat = {
        'action' : 'showCat'
    }
    let bodyShowCat = new FormData();
    for(let variable in showCat) bodyShowCat.append(variable, showCat[variable]);
   
    fetch(phpPath,{
        method : 'post',
        mode   : 'cors',
        body   : bodyShowCat
    }).then(response => {
        return response.text();
    }).then(res => {
        res=JSON.parse(res);
        let select = document.querySelector('#categorie');

        for(let i=0; i<res.length; i++){
            select.innerHTML += `<option value="${res[i]['cat_name']}" selected>${res[i]['rusName']}</option>`;
        }
    });
}