import { 
    getRoomList,
    getRoomDetail,
    getLayout, setLayout, getBindMachs, getMachStatus
} from '../services/sceneMonitorService';
import { uploadImg } from '../services/gatewayService';
import moment from 'moment';
const date = new Date();

const initialState = {
    // currentDate:moment(date).subtract(1,'months'),
    // card / list / scene
    mode:'card',
    isLoading:true,
    sourceData:[],
    currentPage:1,
    total:0,
    roomDetail:{},
    // 所有可绑定的设备列表
    allBindMachs:[],
    
    layout:{}
};

export default {
    namespace:'sceneMonitor',
    state:initialState,
    effects:{
        *cancelable({ task, payload, action }, { call, race, take}) {
            yield race({
                task:call(task, payload),
                cancel:take(action)
            })
        },
        *cancelAll(action, { put }){
            yield put({ type:'reset'});
        },
        *initRoom(action, { put, select, call, all }){
            yield put.resolve({ type:'fields/init'});
            yield put({ type:'fetchRoomList'});
        },
        *fetchRoomList(action, { put, select, call }){
            let { user:{ company_id }, fields:{ currentAttr }, sceneMonitor:{ mode }} = yield select();
            let { currentPage } = action.payload || {};
            currentPage = currentPage || 1;
            let pageSize = mode === 'card' ? 5 : 14;
            yield put({ type:'toggleLoading'});
            let { data } = yield call(getRoomList, { company_id, attr_id:currentAttr.key, page:currentPage, page_size:pageSize })
            if ( data && data.code === '0'){
                yield put({ type:'getRoomListResult', payload:{ data:data.data, currentPage, total:data.count }});
            }
        },
        *fetchRoomDetail(action, { put, select, call }){
            let { mach_id, time_date } = action.payload || {};
            let { data } = yield call(getRoomDetail, { mach_id, time_date:time_date.format('YYYY-MM-DD') });
            if ( data && data.code === '0'){
                yield put({ type:'getRoomDetailResult', payload:{ data:data.data } });
            }
        },
        *fetchRoomScene(action, { put, select, call }){
            yield put({ type:'fetchLayout'});
            yield put({ type:'fetchBindMachs'});
        },
        *fetchBindMachs(action, { put, select, call }){
            let { user:{ company_id }, fields:{ currentAttr }} = yield select();
            let { data } = yield call(getBindMachs, { company_id, attr_id:currentAttr.key });
            if ( data && data.code === '0'){
                yield put({ type:'getMachsResult', payload:{ data:data.data }});
            }
        },
        *fetchLayout(action, { put, select, call }){
            let { user:{ company_id }, fields:{ currentAttr }} = yield select();
            let { data } = yield call(getLayout, { company_id, attr_id:currentAttr.key });
            if ( data && data.code === '0'){
                yield put({ type:'getLayoutResult', payload:{ data:data.data }});
            }
        },
        *setLayoutAsync(action, { put, select, call }){
            let { user:{ company_id }, fields:{ currentAttr }} = yield select();
            let { needsUpdate, resolve, reject, content, img_path } = action.payload;
            let values = { company_id, attr_id:currentAttr.key, content };
            if ( img_path ) {
                values['img_path'] = img_path;
            }
            let { data } = yield call(setLayout, values);
            if ( data && data.code === '0'){
                if ( needsUpdate ){
                    yield put({ type:'fetchLayout'});
                }
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.msg);
            }
        },
        *setBgAsync(action, { put, select, call }){
            let { user:{ userInfo, company_id }, fields:{ currentAttr }} = yield select();
            let { resolve, reject, file, content, img_path  } = action.payload || {};
            let values = { company_id, attr_id:currentAttr.key, content, resolve, reject };
            if ( file ) {
                let { data }= yield call(uploadImg, { file })
                values.img_path = data.data.filePath;
            }
            if ( img_path ) {
                values.img_path = img_path;
            }
            yield put({ type:'setLayoutAsync', payload:{ ...values, needsUpdate:true }});
            
        },
        *fetchMachStatus(action, { put, select, call}){
            let { user:{ company_id }} = yield select();
            let { resolve, reject, mach_id } = action.payload;
            let { data } = yield call(getMachStatus, { company_id, mach_id });
            if ( data && data.code === '0'){
                if ( resolve ) resolve(data.data);
            } else {
                if ( reject ) reject(data.msg);
            }
            
            
        }
    },
    
    reducers:{    
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        getRoomListResult(state, { payload:{ data, currentPage, total }}){
            return { ...state, sourceData:data, currentPage, total, isLoading:false };
        },
        getRoomDetailResult(state, { payload:{ data }}){
            return { ...state, roomDetail:data };
        },
        setMode(state, { payload }){
            return { ...state, mode:payload };
        },
        getLayoutResult(state, { payload:{ data }}){
            return { ...state, layout:data };
        },
        getMachsResult(state, { payload:{ data }}){
            return { ...state, allBindMachs:data };
        },
        setCurrentPage(state, { payload }){
            return { ...state, currentPage:payload };
        },
        resetDetail(state, { payload }){
            return { ...state, roomDetail:{}};
        },
        reset(state){
            return initialState;
        } 
    }
}


