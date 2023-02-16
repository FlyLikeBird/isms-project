import request, { requestImg } from '../utils/request';
import { translateObj } from '../utils/translateObj';
import { apiToken } from '../utils/encryption';

export function getAlarmList(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Environment/getrecordlist', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
export function getAlarmAnalyze(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Environment/getwarninganalyz', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
export function getAlarmHistory(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/iotswitch/switchwarningrecord', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
// 告警处理接口
export function getLogType(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/warn/getlogtype', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function confirmRecord(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/warn/operwarning', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getHistoryLog(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/warn/getattrhistorylog', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getProgressLog(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    // /warn/getrecordlog
    // /warn/getattrhistorylog
    return request('/warn/getrecordlog', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function uploadImg(data={}){
    let token = apiToken();
    let { company_id, file } = data;
    let formData = new FormData();
    formData.append('file', file);
    formData.append('token',token);
    return request('/upload/upload', { 
        method:'POST',
        body:formData
        }); 
}
// 告警规则设置接口
export function getMachs(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/warn/getmach', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getRuleList(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/restEnvWarningRule', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        },'noPrefix'); 
}

export function getRuleTpl(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Environment/getStandardTpl', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
export function addTpl(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Environment/addStandardTpl', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
export function updateTpl(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Environment/updateStandardTpl', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
export function delTpl(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Environment/deleteStandardTpl', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
export function addRule(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/restEnvWarningRule/create', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        },'noPrefix'); 
}


export function updateRule(data = {}){
    data.token = apiToken();
    let str = translateObj(data);
    console.log(str);
    return request('/restEnvWarningRule/update/' + data.rule_id, { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }, 'noPrefix'); 
}

export function deleteRule(data = {}){
    let str = translateObj({ token:apiToken() });

    return request('/restEnvWarningRule/delete/' + data.ids.join(','), { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        },'noPrefix'); 
}
