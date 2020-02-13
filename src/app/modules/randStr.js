import {rand} from './random';

export function randomString(){
    let random = rand(1, arguments.length-1);
    return arguments[random];
}