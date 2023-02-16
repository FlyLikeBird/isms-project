import request, { requestImg } from '../utils/request';
import { translateObj } from '../utils/translateObj';
import { apiToken } from '../utils/encryption';

export function getRoomList(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Environment/rootmonitor', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
export function getRoomDetail(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Environment/machmonitor', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
// 拟态图锚点相关接口
export function setLayout(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Environment/setAttrLayout', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
export function getLayout(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Environment/getAttrLayout', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
export function getBindMachs(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Environment/getAttrBindMach', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
export function getMachStatus(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Environment/monitorbymach', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
