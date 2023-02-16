import { 
    getAlarmList, getAlarmAnalyze,
    getHistoryLog, getLogType, confirmRecord, getProgressLog, uploadImg,
    getMachs, 
    getRuleTpl, addTpl, updateTpl, delTpl, 
    getRuleList, getRuleType, addRule, updateRule, deleteRule 
} from '../services/alarmService';
const initialState = {
    sourceData:[],
    isLoading:true,
    currentPage:1,
    total:0,
    cateCode:'0',
    logTypes:[],
    progressLog:[],
    historyLog:[],
    chartLoading:true,
    chartInfo:{},
    // 告警规则状态
    ruleTpls:[],
    ruleList:[],
    ruleType:[],
    ruleMachs:[]
}

export default {
    namespace:'alarm',
    state:initialState,
    effects:{
        *cancelable({ task, payload, action }, { call, race, take}) {
            yield race({
                task:call(task, payload),
                cancel:take(action)
            })
        },
        // 统一取消所有action
        *cancelAll(action, { put }){
            console.log('all');
           
            yield put({ type:'reset'});
        },
        *initAlarmList(action, { put }){
            yield put({ type:'user/toggleTimeType', payload:'3' });
            yield put.resolve({ type:'fields/init'});
            yield put({ type:'fetchLogType'});
            yield put({ type:'fetchAlarmList'});            
        },
        *fetchAlarmList(action, { put, call, select }){
            try {
                let { user:{ userInfo, startDate, endDate, company_id }, fields:{ currentAttr }} = yield select();
                let { page, status, cateCode } = action.payload || {};
                page = page || 1;
                let obj = { begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD'), page, pagesize:14 };
                // 中台账号
                if ( userInfo.agent_id ){
                    obj['agent_id'] = userInfo.agent_id;
                    if ( currentNode.type === 'province') {
                        obj['province'] = currentNode.title;
                    }
                    if ( currentNode.type === 'city') {
                        obj['city'] = currentNode.title;
                    }
                    if ( currentNode.type === 'area') {
                        obj['area'] = currentNode.title;
                    }
                    if ( currentNode.type === 'company') {
                        obj['company_id'] = currentNode.key;
                    }
                } else {
                    // 企业账号
                    obj['company_id'] = company_id;
                }
                if ( status ){
                    obj['status'] = status;
                }
                if ( cateCode ) {
                    obj['cate_code'] = cateCode;
                }
                yield put({ type:'toggleLoading'});
                let { data } = yield call(getAlarmList, obj);
                if ( data && data.code === '0'){
                    yield put({ type:'getAlarmListResult', payload:{ data:data.data, currentPage:page, total:data.count }});
                }
            } catch(err){
        
            }
        },
        *initAlarmAnalyze(action, { call, put, select }){
            yield put.resolve({ type:'fields/init'});
            yield put({ type:'fetchAlarmAnalyze'});
        },
        *fetchAlarmAnalyze(action, { call, put, select }){
            try {
                let { user:{ userInfo, company_id, startDate, endDate, timeType }, fields:{ currentAttr }} = yield select();
                let obj = { begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD'), time_type:timeType };
                obj['attr_id'] = currentAttr.key;
                if ( userInfo.agent_id ){
                    obj['agent_id'] = userInfo.agent_id;
                    if ( currentNode.type === 'province') {
                        obj['province'] = currentNode.title;
                    }
                    if ( currentNode.type === 'city') {
                        obj['city'] = currentNode.title;
                    }
                    if ( currentNode.type === 'area') {
                        obj['area'] = currentNode.title;
                    }
                    if ( currentNode.type === 'company') {
                        obj['company_id'] = currentNode.key;
                    }
                    // // 兼容运行报告切换企业终端
                    // if ( company_id ){
                    //     obj['company_id'] = company_id;
                    // }
                } else {
                    // 企业账号
                    obj['company_id'] = company_id;
                }
                yield put({ type:'toggleChartLoading'});
                let { data } = yield call(getAlarmAnalyze, obj);
                if ( data && data.code === '0'){
                    yield put({ type:'getAnalyzeResult', payload:{ data:data.data }});
                }
            } catch(err){
        
            }
        },
        *fetchLogType(action, { put, call }){
            let { data } = yield call(getLogType);
            if ( data && data.code === '0'){
                yield put({ type:'getLogType', payload:{ data:data.data }});
            }
        },
        *fetchProgressInfo(action, { call, put}){
            try {
                let { data } = yield call(getProgressLog, { record_id:action.payload, action_type:'2' });
                if ( data && data.code === '0' ){
                    yield put({type:'getProgress', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchHistoryLog(action, { call, put }){
            let { data } = yield call(getHistoryLog, { attr_id:action.payload });
            if ( data && data.code === '0'){
                yield put({ type:'getHistoryResult', payload:{ data:data.data }});
            }
        },
        *confirmRecord(action, { select, call, put, all }){
            try {
                let { alarm:{ currentPage }} = yield select();
                let { resolve, reject, values, company_id, status, cateCode } = action.payload;
                // photos字段是上传到upload接口返回的路径
                let uploadPaths;
                if ( values.photos && values.photos.length ) {
                    let imagePaths = yield all([
                        ...values.photos.map(file=>call(uploadImg, { file }))
                    ]);
                    uploadPaths = imagePaths.map(i=>i.data.data.filePath);
                } 
                let { data } = yield call(confirmRecord, { company_id, record_id:values.record_id, action_type:'2', photos:uploadPaths, log_desc:values.log_desc, oper_code:values.oper_code, type_id:values.type_id });                 
                if ( data && data.code === '0'){
                    resolve();
                    yield put({ type:'fetchAlarmList', payload:{ page:currentPage, status, cateCode }});
                } else {
                    reject(data.msg);
                }
            } catch(err){
                console.log(err);
            }
        },
        
        *initAlarmSetting(action, { call, put }){
            yield put.resolve({ type:'fields/init'});
            yield put({ type:'fetchRule'});
            yield put({ type:'fetchRuleTpl'});
        },
        *fetchRuleTpl(action, { call, put, select }){
            let { data } = yield call(getRuleTpl);
            if ( data && data.code === '0'){
                yield put({ type:'getTplResult', payload:{ data:data.data }});
            }
        },
        *addTplAsync(action, { call, put, select }){
            let { user:{ company_id }} = yield select();
            let { values, resolve, reject, forEdit } = action.payload || {};
            values.company_id = company_id;
            let { data } = yield call( forEdit ? updateTpl : addTpl, values);
            if ( data && data.code === '0'){
                yield put({ type:'fetchRuleTpl'});
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.msg);
            }
        },
        *delTplAsync(action, { call, put, select }){
            let { user:{ company_id }} = yield select();
            let { tpl_id, resolve, reject } = action.payload ;
            let { data } = yield call(delTpl, { company_id, tpl_id });
            if ( data && data.code === '0'){
                yield put({ type:'fetchRuleTpl'});
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.msg);
            }
        },
        // 安全设置相关code
        *fetchRule(action, { select, call, put }){
            try {
                let { user:{ company_id }, fields:{ currentAttr }} = yield select();
                let { currentPage } = action.payload || {};
                currentPage = currentPage || 1;
                yield put({ type:'toggleLoading'});
                let { data } = yield call(getRuleList, { company_id, attr_id:currentAttr.key, page:currentPage, page_size:14 });
                if ( data && data.code === '0'){
                    yield put({type:'getRule', payload:{ data:data.data, currentPage, total:data.count }});
                }
            } catch(err) {  
                console.log(err);
            }
        },
        *fetchMachs(action, { select, call, put}){
            try{
                let { user:{ company_id }} = yield select();
                let { data } = yield call(getMachs, { company_id });
                if ( data && data.code === '0'){
                    yield put({ type:'getMachs', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchRuleType(action, { select, call, put}){
            try {
                let { user:{ company_id }} = yield select();
                let { data } = yield call(getRuleType, { company_id });
                if ( data && data.code === '0'){
                    yield put({type:'getRuleType', payload: { data:data.data }})
                }
            } catch(err){
                console.log(err);
            }
        },
        *addRule(action, { select, call, put}){
            try {
                let { user:{ company_id }} = yield select();
                let { values, resolve, reject } = action.payload;
                values.company_id = company_id;
                let { data } = yield call(addRule, values);
                if ( data && data.code === '0'){
                    yield put({type:'fetchRule'});
                    if ( resolve && typeof resolve === 'function' ) resolve();
                } else {
                    if ( reject && typeof reject === 'function' ) reject(data.msg);
                }
            } catch(err){
                console.log(err);
            }
        },
        *updateRule(action, { call, put, select }){
            try {
                let { user:{ company_id }} = yield select();
                let { values, resolve, reject } = action.payload;
                values.company_id = company_id;
                let { data } = yield call(updateRule, values);
                if ( data && data.code === '0'){
                    yield put({type:'fetchRule'});
                    if ( resolve ) resolve();
                } else {
                    if ( reject ) reject(data.msg);
                }
            } catch(err){
                console.log(err);
            }
        },
        *deleteRule(action , { call, put}){
            try {
                let rule_id = action.payload;
                let { data } = yield call(deleteRule, { ids:[rule_id] });
                if ( data && data.code === '0'){
                    yield put({type:'fetchRule'});
                } 
            } catch(err){
                console.log(err);
            }
        }
    },
    reducers:{
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        toggleChartLoading(state){
            return { ...state, chartLoading:true };
        },
        getAlarmListResult(state, { payload:{ data, currentPage, total }}){
            return { ...state, sourceData:data, currentPage, total, isLoading:false };
        },
        getAnalyzeResult(state, { payload :{ data }}){
            return { ...state, chartInfo:data, chartLoading:false };
        },
        getLogType(state, { payload:{ data }}){
            return { ...state, logTypes:data };
        },
        getProgress(state, { payload :{ data }}){
            return { ...state, progressLog:data };
        },
        getHistoryResult(state, { payload:{ data }}){
            return { ...state, historyLog:data };
        },
        getRule(state, { payload : { data, currentPage, total }}){
            return { ...state, ruleList:data, currentPage, total, isLoading:false };
        },
        getTplResult(state, { payload:{ data }}){
            return { ...state, ruleTpls:data };
        },
        getRuleType(state, { payload:{data}}){
            return { ...state, ruleType:data };
        },
        getMachs(state, { payload:{ data }}){
            return { ...state, ruleMachs:data };
        },
        setPage(state, { payload }){
            return { ...state, currentPage:payload };
        },
        reset(state){
            return initialState;
        }
    }
}