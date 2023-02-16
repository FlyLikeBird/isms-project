import { 
    getMonitorInfo
} from '../services/monitorService';
import moment from 'moment';
const date = new Date();

const initialState = {
    // currentDate:moment(date).subtract(1,'months'),
    // card / list / scene
    isLoading:true,
    monitorInfo:{}
};

export default {
    namespace:'monitor',
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
        *fetchMonitorInfo(action, { put, select, call }){
            let { user:{ company_id }} = yield select();
            yield put({ type:'toggleLoading'});
            let { data } = yield call(getMonitorInfo, { company_id })
            if ( data && data.code === '0'){
                yield put({ type:'getMonitorResult', payload:{ data:data.data }});
            }
        }
    },
    
    reducers:{    
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        getMonitorResult(state, { payload:{ data }}){
            data.infoList = [
                { title:'洁净室', unit:'间', value:data.deviceInfo.roomCnt },
                { title:'终端总数', unit:'台', value:data.deviceInfo.machCnt },
                { title:'在线终端', unit:'台', value:data.deviceInfo.machInlineCnt },
                { title:'离线终端', unit:'台', value:data.deviceInfo.machOutlineCnt }
            ];
            return { ...state, monitorInfo:data, isLoading:false }
        },
        getRoomDetailResult(state, { payload:{ data }}){
            return { ...state, roomDetail:data };
        },
        setMode(state, { payload }){
            return { ...state, mode:payload };
        },
        setCurrentPage(state, { payload }){
            return { ...state, currentPage:payload };
        },
        reset(state){
            return initialState;
        } 
    }
}


