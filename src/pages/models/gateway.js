import { 
    getPageIndex,
    getCompanyTree,
    getDeviceModel, getGasCompanys, getGateways, addGateway, updateGateway, deleteGateway, 
    getDevices, addDevice, updateDevice, delDevice,
    exportDevice, importDevice,
    getDeviceRecord,
    uploadImg
} from '../services/gatewayService';
const initialState = {
    treeLoading:true,
    treeData:[],
    sourceTreeData:{},
    // 企业树状结构的当前节点，值为 省|市|区|企业终端
    currentNode:{},
    companyList:[],
    currentCompany:{},
    gasCompanys:[],
    sceneType:0,
    gatewayModelList:[],
    combustModelList:[],
    smokeModelList:[],
    isLoading:true,
    currentPage:1,
    total:0,
    gatewayList:[],
    // combust-可燃气体探测器 smoke-烟感探测器
    deviceList:[],
    recordList:[],
    monitorInfo:{}
}

export default {
    namespace:'gateway',
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
            yield put({ type:'reset'});
        },
        *fetchIndex(action, { call, put }){
            yield put.resolve({ type:'fetchCompanyTree', payload:{ keepNode:{ key:'zh' }} });
            let { data } = yield call(getPageIndex, { safe_type:window.g.forSmoke ? '2' : '1'});
            if ( data && data.code === '0'){
                yield put({ type:'getPageIndexResult', payload:{ data:data.data }});
            } 
        },
        *initGateway(action, { put, call, all }){
            yield put.resolve({ type:'fetchCompanyTree' });
            yield all([
                put({ type:'fetchModel', payload:{ is_gateway:1 }}),
                put({ type:'fetchModel', payload:{ is_network:1, safe_type:'1' }}),
                put({ type:'fetchModel', payload:{ is_network:1, safe_type:'2' }}),
                put({ type:'region/fetchManagerList'}),
                // put({ type:'fetchGasCompanys'}),
                window.g.forSmoke 
                ?
                put({ type:'fetchDevices'})
                :
                put({ type:'fetchGateway'})
            ])
        },
        *fetchCompanyTree(action, { put, call, select }){
            let { gateway:{ treeData, sourceTreeData }} = yield select();
            let { single, keepNode, forceUpdate } = action.payload || {};
            if ( !treeData.length || forceUpdate ){
                yield put({ type:'toggleTreeLoading'});
                let { data } = yield call(getCompanyTree);
                if ( data && data.code === '0'){
                    yield put({ type:'getCompanyTreeResult', payload:{ data:data.data, single, keepNode }});
                }
            } else {
                // 更新缓存里的树状图结构
                yield put({ type:'getCompanyTreeResult', payload:{ data:sourceTreeData, single, keepNode } });
            }
        },
        *fetchModel(action, { put, call, select }){
            let { is_gateway, is_network, safe_type } = action.payload || {};
            let { data } = yield call(getDeviceModel, { is_gateway, is_network, safe_type });
            if ( data && data.code === '0'){
                if ( is_gateway === 1 ) {
                    yield put({ type:'getGatewayModelResult', payload:{ data:data.data }});
                } else if ( is_network === 1 && safe_type === '1'  ) {
                    yield put({ type:'getCombustModelResult', payload:{ data:data.data }});
                } else if ( is_network === 1 && safe_type === '2' ) {
                    yield put({ type:'getSmokeModelResult', payload:{ data:data.data }});
                }
            }
        },
        *fetchGasCompanys(action, { put, call, select }){
            // 请求燃气公司列表
            let { data } = yield call(getGasCompanys);
            if ( data && data.code === '0'){
                yield put({ type:'getGasCompanysResult', payload:{ data:data.data }});
            }
        },
        *fetchGateway(action, { put, call, select }){
            try {
                let { user:{ userInfo, company_id }, gateway:{ activeKey, sceneType, currentNode }} = yield select();
                let { keyword, currentPage } = action.payload || {};
                currentPage = currentPage || 1;   
                let obj = { page:currentPage, pagesize:14 };
                if ( sceneType ){
                    obj['scene_type'] = sceneType;
                }
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
                yield put({ type:'toggleLoading'});
                let { data } = yield call(getGateways, obj);
                if ( data && data.code === '0'){
                    yield put({ type:'getGatewaysResult', payload:{ data:data.data, currentPage, total:data.count }});
                }              
            } catch(err){
                console.log(err);
            }  
        },
        *addGatewayAsync(action, { put, call, select }){
            try {
                let { values, resolve, reject, forEdit } = action.payload || {};
                let { user:{ userInfo, company_id }, gateway:{ currentNode }} = yield select();  
                if ( !userInfo.agent_id ) {
                    values['company_id'] = company_id;     
                }
                let { data } = yield call( forEdit ? updateGateway : addGateway, values );
                if ( data && data.code === '0'){
                    yield put({ type:'fetchGateway' });
                    if ( resolve && typeof resolve === 'function' ) resolve();
                } else {
                    if ( reject && typeof reject === 'function' ) reject(data.msg);
                }
            } catch(err){
                console.log(err);
            }
           
        },
        *delGatewayAsync(action, { put, call, select }){
            try {
                let { user:{ company_id }} = yield select();
                let { resolve, reject, mach_id } = action.payload || {};
                let { data } = yield call(deleteGateway, { company_id, mach_id });
                if ( data && data.code === '0'){
                    yield put({ type:'fetchGateway' });
                    yield put({ type:'fetchDevices'});
                    if ( resolve && typeof resolve === 'function' ) resolve();
                } else {
                    if ( reject && typeof reject === 'function' ) reject(data.msg);
                }
            } catch(err){
                console.log(err);
            }
        },      
        // 探测器设备
        *fetchDevices(action, { select, put, call }){
            let { user:{ userInfo, company_id }} = yield select();
            let { currentPage } = action.payload || {};
            currentPage = currentPage || 1;            
            yield put({ type:'toggleLoading'});
            let { data } = yield call(getDevices, {  company_id, page:currentPage, page_size:14 });
            if ( data && data.code === '0'){
                yield put({ type:'getDevicesResult', payload:{ data:data.data, currentPage, total:data.count }});
            }
        },      
        *addDeviceAsync(action, { put, select, call }){
            let { user:{ userInfo, company_id }, gateway:{ currentNode }} = yield select();
            let { values, resolve, reject, forEdit } = action.payload || {};
            values.company_id = company_id;
            if ( values.link_img ) {
                let { data }= yield call(uploadImg, { file:values.link_img })
                values.link_img = data.data.filePath;
            }
            let { data } = yield call( forEdit ? updateDevice : addDevice, values);
            if ( data && data.code === '0'){
                yield put({ type:'fetchDevices' });
                if ( resolve && typeof resolve === 'function' ) resolve();
            } else {
                if ( reject && typeof reject === 'function') reject(data.msg);
            }
        },
        *delDeviceAsync(action, { put, select, call }){
            let { resolve, reject, mach_id } = action.payload || {};
            let { data } = yield call(delDevice, { mach_id });
            if ( data && data.code === '0'){
                yield put({ type:'fetchDevices' });
                if ( resolve && typeof resolve === 'function' ) resolve();
            } else {
                if ( reject && typeof reject === 'function') reject(data.msg);
            }
        },
        *fetchDeviceRecord(action, { put, select, call }){
            let { user:{ company_id }} = yield select();
            let { resolve, reject, mach_id, type } = action.payload || {};
            let { data } = yield call(getDeviceRecord, { company_id, mach_id, type });
            if ( data && data.code === '0'){
                yield put({ type:'getRecordResult', payload:{ data:data.data }});
                if ( resolve && typeof resolve === 'function' ) resolve();
            } else {
                if ( reject && typeof reject === 'function') reject(data.msg);
            }
        },
        *export(action, { put, select, call }){
            let { user:{ company_id }} = yield select();
            let { data }= yield call(exportDevice, { company_id });
            // data是返回的二进制数据流  
            let url = URL.createObjectURL(data);
            let link = document.createElement('a');
            document.body.appendChild(link);
            link.download = '设备档案填写模板' + '.xlsx';
            link.href = url;
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        },
        *import(action, { put, select, call}){
            let { user:{ company_id }} = yield select();
            let { file, resolve, reject } = action.payload ;
            let { data } = yield call(importDevice, { company_id, file });
            if ( data && data.code === '0'){
                yield put({ type:'fetchDevices'});
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.msg);
            }
        }
    },
    reducers:{
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        toggleTreeLoading(state){
            return { ...state, treeLoading:true };
        },
        getPageIndexResult(state, { payload:{ data }}){
            let infoList = [];
            infoList.push({ title:'用户数', value:data.info.totalCompany || 0, unit:'个' });
            infoList.push({ title:'终端数量', value:data.info.totalMach || 0, unit:'个' });
            infoList.push({ title:'告警设备', value:data.info.warningMach || 0, unit:'个', color:'#fd0606' });
            infoList.push({ title:'总告警数', value:data.info.warningCnt || 0, unit:'件', color:'#f2b949' });
            data.infoList = infoList;
            return { ...state, monitorInfo:data };
        },
      
        getGatewayModelResult(state, { payload:{ data }}){
            return { ...state, gatewayModelList:data };
        },
        getCombustModelResult(state, { payload:{ data }}){
            return { ...state, combustModelList:data };
        },
        getSmokeModelResult(state, { payload:{ data }}){
            return { ...state, smokeModelList:data };
        },
        setCompany(state, { payload:{ company_id }}){
            let temp = state.companyList.filter(i=>i.key === company_id )[0];
            return { ...state, currentCompany:temp || {}};
        },
        setActiveKey(state, { payload }){
            return { ...state, activeKey:payload };
        },
        toggleCurrentNode(state, { payload }){
            return { ...state, currentNode:payload };
        },
        setSceneType(state, { payload }){
            return { ...state, sceneType:payload }; 
        },
        getGasCompanysResult(state, { payload:{ data }}){
            return { ...state, gasCompanys:data };
        },
        getGatewaysResult(state, { payload:{ data, currentPage, total }}){
            let { gateways } = data;
            return { ...state, gatewayList:gateways, isLoading:false, currentPage, total };
        },
        getDevicesResult(state, { payload:{ data, currentPage, total, activeKey }}){
            return { ...state, deviceList:data, isLoading:false, currentPage, total };
        },
        
        toggleGateway(state, { payload }){
            return { ...state, currentGateway:payload };
        },
        getRecordResult(state, { payload :{ data }}){
            return { ...state, recordList:data };
        },
        resetMonitorInfo(state){
            return { ...state, monitorInfo:{}};
        },
        reset(state){
            return initialState;
        }
    }
}

