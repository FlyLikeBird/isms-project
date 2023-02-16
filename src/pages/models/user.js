import { routerRedux } from 'dva/router';
import { login, userAuth, agentUserAuth, getNewThirdAgent, changePwd, changeActionPwd, checkPwd, setCompanyLogo, getWeather, getThirdAgentInfo, getCameraAccessToken } from '../services/userService';
// import { uploadImg } from '../services/alarmService';
import { message, notification } from 'antd';
import { md5, encryptBy, decryptBy } from '../utils/encryption';
import moment from 'moment';

const reg = /\/info_manage_menu\/manual_input\/([^\/]+)\/(\d+)/;
const companyReg =  /\?pid\=0\.\d+&&userId=(\d+)&&companyId=(\d+)/;
const agentReg = /\?agent=(.*)/;
const agentReg2 = /env-(.*)/;
let energyList = [
    { type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'},
    { type_name:'水', type_code:'water', type_id:'2', unit:'m³'},
    { type_name:'气', type_code:'gas', type_id:'3', unit:'m³' }
];
let date = new Date();
// 初始化socket对象，并且添加监听事件
function createWebSocket(url, data, companyId, fromAgent, dispatch){
    let ws = new WebSocket(url);
    // console.log(data);
    ws.onopen = function(){
        //中台商
        if ( data.agent_id ){
            ws.send(`environment:${data.user_id}`);
        } else {
            // 企业端
            ws.send(`environment:${data.user_id}`);       
        }
    };
    // ws.onclose = function(){
    //     console.log('socket close...');
    //     reconnect(url, data, companyId, dispatch);
    // };
    ws.onerror = function(){
        console.log('socket error...');
        reconnect(url, data, companyId, dispatch);
    };
    ws.onmessage = (e)=>{    
        if ( dispatch ) {   
            if ( e.data === 'offline') {
                // dispatch({ type:'user/loginOut'});
                // notification.open({
                //     message: '下线通知',
                //     description:'该账号已在其他终端登录，您已退出登录',
                //     duration:0,
                //     className:'custom-info'
                //     // icon: <InfoCircleOutlined style={{ color: '#108ee9' }} />
                // });
                return;
            } else {
                let data = JSON.parse(e.data); 
                dispatch({ type:'setMsg', payload:{ data }});             
            }
                                  
        }
    }
    return ws;
}
function reconnect(url, data, companyId, dispatch){
    if(reconnect.lock) return;
    reconnect.lock = true;
    setTimeout(()=>{
        createWebSocket(url, data, companyId, dispatch);
        reconnect.lock = false;
    },2000)
}
let socket = null;

const initialState = {
    userInfo:{},
    userMenu:[],
    companyList:[],
    currentProject:'',
    // 全局的公司id
    company_id:'1',
    currentCompany:{},
    currentMenu:{},
    // 配置动态路由
    routePath:[],
    routeConfig:{},
    authorized:false,
    // socket实时告警消息
    msg:{},
    agentMsg:{},
    //  当前页面的location
    currentPath:'',
    prevPath:'',
    weatherInfo:'',
    // 全局告警消息
    alarmList:[],
    // 页面总宽度
    containerWidth:0,
    collapsed:false,
    pagesize:0,
    // 判断是否是中台打开的子窗口
    fromAgent:false,
    // 其他中台商ID，根据这个ID对登录页做特殊判断
    thirdAgent:{},
    newThirdAgent:{},
    // 浅色主题light 深色主题dark 
    theme:'dark',
    startDate:moment(date),
    endDate:moment(date),
    timeType:'1',
    AMap:null,
    // 打开用户音频权限
    audioAllowed:false
};
export default {
    namespace:'user',
    state:initialState,
    subscriptions:{
        setup({ dispatch, history }) {
            history.listen(( location )=>{
                let pathname = location.pathname;
                // 全屏窗口，不请求数据
                if ( pathname === '/login_spec' || pathname === 'login_mogu' || pathname === '/global_fullscreen' || pathname === '/pdf-viewer' ) return;
                // 新版第三方代理商特殊处理
                if ( location.pathname === '/login' ) {
                    let str = window.location.host.split('.');
                    let matchResult = agentReg2.exec(str[0]);
                    let temp = matchResult ? matchResult[1] : '';
                    dispatch({ type:'fetchNewThirdAgent', payload:temp });
                    return ;
                }
               
                if ( pathname !== '/login') {
                    new Promise((resolve, reject)=>{
                        dispatch({type:'userAuth', payload: { dispatch, query:location.search, resolve, pathname }})
                    })
                    .then(()=>{
                        dispatch({type:'setRoutePath', payload:{ pathname }});       
                    })
                }               
            })
        }
    },
    effects:{
        *userAuth(action, {call, select, put, all}){ 
            try {
                let { user: { userInfo, authorized, newThirdAgent }} = yield select();
                let { dispatch, query, pathname, resolve, reject } = action.payload || {};
                // 如果是第三方服务商
                let thirdAgent;
                if ( localStorage.getItem('third_agent') ){
                    thirdAgent = JSON.parse(localStorage.getItem('third_agent'));
                    yield put({ type:'setThirdAgentInfo', payload:{ data:thirdAgent }});
                }
                if ( !authorized ){
                    // 判断是否是服务商用户新开的公司标签页
                    let matchResult = companyReg.exec(query);
                    let company_id = matchResult ? matchResult[2] : null;
                    let user_id = matchResult ? matchResult[1] : null;
                    if ( user_id ){
                        localStorage.setItem('user_id', user_id);
                    }
                    let { data } = yield call( matchResult ? agentUserAuth : userAuth, matchResult ? { app_type:7, company_id } : { app_type:7 } );
                   
                    if ( data && data.code === '0' ){
                        // 先判断是否是第三方代理商账户
                        if ( !Object.keys(newThirdAgent).length ) {
                            let str = window.location.host.split('.');
                            let matchResult = agentReg2.exec(str[0]);
                            let temp = matchResult ? matchResult[1] : '';
                            yield put({ type:'fetchNewThirdAgent', payload:temp });
                        }
                        yield put({type:'setUserInfo', payload:{ data:data.data, company_id, pathname, fromAgent:matchResult ? true : false } });
                        yield put({ type:'setContainerWidth' });
                        yield put({type:'weather'});
                        if ( resolve && typeof resolve === 'function') resolve();
                        // websocket 相关逻辑
                        if ( !WebSocket ) {
                            window.alert('当前浏览器不支持websocket,推荐使用chrome浏览器');
                            return ;
                        }
                        let config = window.g || {};
                        let socketCompanyId = company_id ? company_id : data.data.companys[0] ? data.data.companys[0].company_id : null ;

                        socket = createWebSocket(`ws://${config.socketHost}:${config.socketPort}`, data.data, socketCompanyId, matchResult ? true : false, dispatch );
                    } else {
                        // 登录状态过期，跳转到登录页重新登录(特殊账号跳转到特殊登录页)
                        yield put({ type:'loginOut'});
                    }
                } 
                if ( resolve && typeof resolve === 'function') resolve();
            } catch(err){
                console.log(err);
            }
        },
        *login(action,{ call, put, select }){
            try {
                let { user_name, password } = action.payload;
                let { user:{ thirdAgent} } = yield select();
                let { resolve, reject } = action;
                if ( localStorage.getItem('user_id')){
                    message.info('已有登录用户，如要登录新用户请先退出再登录')
                    return;
                }
                password = md5(password, user_name);
                var { data }  = yield call(login, { user_name, password, app_type:'7' });
                if ( data && data.code === '0'){   
                    let { user_id, user_name, agent_id, companys } = data.data;
                    // let companysMap = companys.map((item)=>{
                    //     return { [encodeURI(item.company_name)]:item.company_id };
                    // })
                    let timestamp = parseInt(new Date().getTime()/1000);
                    //  保存登录的时间戳,用户id,公司id 
                    localStorage.setItem('timestamp', timestamp);
                    localStorage.setItem('user_id', user_id);
                    localStorage.setItem('user_name', user_name);
                    // localStorage.setItem('companysMap', JSON.stringify(companysMap));
                    localStorage.setItem('agent_id', agent_id);
                    localStorage.setItem('third_agent', JSON.stringify(thirdAgent));
                    yield put({ type:'setAudioAllowed' });
                    //  登录后跳转到默认页面              
                    yield put(routerRedux.push('/'));
                    
                } else {
                    if (reject) reject( data && data.msg );
                }
            } catch(err){
                console.log(err);
            }
        },
        *weather(action,{call, put}){
            let { data } = yield call(getWeather);
            if ( data && data.code === '0' ) {
                yield put({type:'getWeather', payload:{data:data.data}});
            }
        },
        *loginOut(action, { call, put, select }){
            if ( socket && socket.close ){
                socket.close();
                socket = null;
            }
            let audio = document.getElementById('my-audio');
            if ( audio && audio.pause ){
                audio.pause();
            }
            yield put({type:'clearUserInfo'});
            yield put({ type:'gateway/reset'});
            yield put(routerRedux.push('/login'));
            
        },
        *thirdAgentAuth(action, { call, put}){
            let { pathname, search } = action.payload || {};
            if ( search ){
                let match = agentReg.exec(search);
                if ( match && match.length ){
                    let param = match[1];
                    let agentId = decryptBy(param);
                    let { data } = yield call(getThirdAgentInfo, { agent_id:agentId });
                    if ( data && data.code === '0'){
                        yield put({ type:'setThirdAgentInfo', payload:{ data:data.data }});
                    }
                }
            }
        },
        *fetchNewThirdAgent(action, { put, select, call}){
            let { data } = yield call(getNewThirdAgent, { agent_code:action.payload });
            if ( data && data.code === '0'){
                yield put({ type:'getNewThirdAgent', payload:{ data:data.data }});
            } else {

            }
        },
        *changeCompanyLogo(action, { put, call, select }){
            try {
                let { user:{ company_id }} = yield select();
                let { logoData, thumbLogoData, resolve, reject } = action.payload || {};
                let { data } = yield call(setCompanyLogo, { company_id, head_logo_path:logoData.filePath, mini_logo_path:thumbLogoData.filePath });
                if ( data && data.code === '0'){
                    let { user:{ currentCompany }} = yield select();
                    yield put({ type:'updateLogo', payload:{ ...currentCompany, head_logo_path:logoData.url, mini_logo_path:thumbLogoData.url }});
                    if ( resolve && typeof resolve === 'function') resolve();
                } else {
                    if ( reject && typeof reject === 'function') reject(data.msg);
                }
            } catch(err){   
                console.log(err);
            }
        },
        *changePwd(action, { put, call, select }){
            let { type, user_id, old_password, password, confirm_password, resolve, reject } = action.payload || {};
            let { data } = yield call( type === 'login' ? changePwd : changeActionPwd, { user_id, old_password, password, confirm_password });
            if ( data && data.code === '0') {
                if ( resolve && typeof resolve === 'function') resolve();
            } else {
                if ( reject && typeof reject === 'function' ) reject(data.msg);
            }
        },
        *checkActionPwd(action, { put, call, select }){
            try {
                let { user:{ userInfo }} = yield select();
                let { resolve, reject, oper_password } = action.payload || {};
                let { data } = yield call(checkPwd, { user_id:userInfo.user_id, oper_password });
                if ( data && data.code === '0') {
                    if ( resolve && typeof resolve === 'function') resolve();
                } else {
                    if ( reject && typeof reject === 'function' ) reject(data.msg);
                }
            } catch(err){
                console.log(err);
            }
        }
    },
    reducers:{
        setUserInfo(state, { payload:{ data, company_id, pathname, fromAgent }}){
            let { menuData, companys } = data;
            let currentCompany = company_id ? companys.filter(i=>i.company_id == company_id)[0] : companys[0] ;
            currentCompany = currentCompany || {};
            return { ...state, userInfo:data, userMenu:menuData, companyList:companys || [], company_id:currentCompany.company_id, currentCompany, fromAgent, authorized:true };
        },
        setRoutePath(state, { payload:{ pathname }}){
            let currentMenu;
            if ( pathname === '/' || pathname === '/index') {
                currentMenu = state.userMenu[0];
            } else {
                currentMenu = state.userMenu.filter(i=>i.menu_code === pathname.substring(1, pathname.length ))[0] || {}
            } 
            return { ...state, currentMenu:currentMenu || {} };
        },
        getWeather(state, { payload :{data}}){
            return { ...state, weatherInfo:data }
        },
        setMsg(state, { payload : { data } }){
            // 根据count 字段判断是否需要更新告警信息
            if ( state.msg.count !== data.count ){
                return { ...state, msg:data };
            } else {
                return state;
            }
        },
        setAgentMsg(state, { payload:{ data }}){
            return { ...state, agentMsg:data.detail };
        },
        setContainerWidth(state, { payload }){
            // let containerHeight = window.innerHeight;
            // let isSmallDevice = containerWidth < 1440 ? true : false;
            // // 内容区高度 = 页面总高度 - header高度 - nav高度
            // let contentHeight = Math.round(containerHeight - ( isSmallDevice ? 50 : 70 ));
            // // 内容区高度 - 内容区padding - 表格标题高度 - 表头的高度 - 分页符的高度
            // let tbodyHeight =  contentHeight  - 28 - 40 - 20 - 50 - 120 - 50;
            // let pagesize = Math.ceil( tbodyHeight / 40 );
            // console.log(tbodyHeight, pagesize);
            return { ...state, containerWidth:payload };
        },
        toggleTheme(state, { payload }) {
            return { ...state, theme:payload };
        },
        toggleTimeType(state, { payload }){
            let start, end;
            var date = new Date();
            if ( payload === '3'){
                // 切换为年维度
                start = moment(date).startOf('year');
                end = moment(date).endOf('year');   
            } else if ( payload === '2'){
                // 切换为月维度
                start = moment(date).startOf('month');
                end = moment(date).endOf('month');
            } else {
                // 切换为日维度
                start = end = moment(date);
            }
            return { ...state, timeType:payload, startDate:start,  endDate:end };
        },
        setDate(state, { payload:{ startDate, endDate }}){
            return { ...state, startDate, endDate };
        },
        toggleCollapsed(state){
            return { ...state, collapsed:!state.collapsed };
        },
        toggleCurrentMenu(state, { payload }){
            return { ...state, currentMenu:payload };
        },
        setThirdAgentInfo(state, { payload:{ data }}){
            return { ...state, thirdAgent:data };
        },
        getNewThirdAgent(state, { payload:{ data }}){
            return { ...state, thirdAgent:data };
        },
        updateLogo(state, { payload }){
            return { ...state, currentCompany:payload };
        },
        setFromWindow(state, { payload:{ timeType, beginDate, endDate }}) {
            return { ...state, timeType, startDate:moment(new Date(beginDate)), endDate:moment(new Date(endDate))};
        },
        setAudioAllowed(state){
            return { ...state, audioAllowed:true };
        },
        setMap(state, { payload }){
            return { ...state, AMap:payload };
        },
        clearUserInfo(state){
            localStorage.clear();
            return initialState;
        }
    }
}

