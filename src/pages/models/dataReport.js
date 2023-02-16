import React from 'react';
import { getRunningReport } from '../services/dataReportService';
import { attrs } from '@/pages/utils/array';
const initialState = {
    sourceData:[],
    isLoading:true,
    reportInfo:{},
    currentPage:1,
    total:0,
    columns:[],
    tableData:[],
    layout:'vertical'
}

export default {
    namespace:'dataReport',
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
        *initRunningReport(action, { put }){
            yield put.resolve({ type:'fields/init'});
            yield put({ type:'fetchRunningReport'});
        },
        *fetchRunningReport(action, { call, put, select }){
            try {
                yield put({ type:'toggleLoading'});
                let { user:{ company_id, startDate, endDate, timeType }, fields:{ currentAttr }, dataReport:{ layout }} = yield select();
                let { data } = yield call(getRunningReport, { company_id, attr_id:currentAttr.key, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD'), time_type:timeType });
                if ( data && data.code === '0'){
                    yield put({ type:'getResult', payload:{ data:data.data }});
                    yield put({ type:'setLayout', payload:{ layout }})
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
        getResult(state, { payload:{ data }}){
            return { ...state, reportInfo:data, isLoading:false };
        },
        setLayout(state, { payload:{ layout }}){
            let columns, tableData = [];    
            if ( state.reportInfo.dataInfo && state.reportInfo.dataInfo.length ){
                tableData = state.reportInfo.dataInfo.map(item=>{
                    let obj = {};
                    obj['attr_id'] = item.attr_id;
                    obj['attr_name'] = item.attr_name;
                    obj['view'] = item.view;
                    return obj
                });
            }        
            if ( layout === 'horizon') {
                let dateColumns = [];
                if ( state.reportInfo.date ){
                    state.reportInfo.date.forEach((key,index)=>{
                        dateColumns.push({
                            title:key,
                            children:attrs.map(attr=>{
                                let obj = {};
                                obj['title'] = attr.title + '(' + attr.unit + ')';
                                obj['width'] = '100px';
                                obj.dataIndex = 'view';
                                obj.render = (arr)=>{
                                    return React.createElement('div', null, arr[index][attr.key] || '-- --')
                                }
                                return obj;
                            })
                        })
                    });
                }
                columns = [
                    {
                        title:'序号',
                        width:'60px',
                        fixed:true,
                        render:(text,record,index)=>{
                            return `${ ( state.currentPage - 1) * 12 + index + 1}`;
                        },
                    },
                    {
                        title:'位置',
                        width:'120px',
                        ellipsis:true,
                        fixed:true,
                        dataIndex:'attr_name',
                    },
                    ...dateColumns
                ];
               
                let newListData = state.sourceData.map(item=>{
                    let obj = {};
                    obj.device_name = item.device_name;
                    obj.view = dateList.map(time=>{
                        return category.reduce((sum,cur)=>{
                            sum[cur.type] = item.view[time][cur.type];
                            return sum;
                        },{})
                    })
                    return obj;
                });
            } else {           
                columns = [
                    {
                        title:'序号',
                        width:'60px',
                        fixed:true,
                        render:(text,record,index)=>{
                            return `${ ( state.currentPage - 1) * 12 + index + 1}`;
                        }
                    },
                    {
                        title:'位置',
                        width:'120px',
                        fixed:true,
                        dataIndex:'attr_name'
                    },
                    {
                        title:'对比项',
                        width:'100px',
                        fixed:true,
                        className:'multi-table-cell',
                        render:()=>{
                            let child = attrs.map(item=>React.createElement('div', null, `${item.title}(${item.unit})`));
                            return React.createElement('div',null, ...child);
                        }
                    },
                    ...state.reportInfo.date.map((item,index)=>({
                        title:item,
                        width:'140px',
                        dataIndex:'view',
                        className:'multi-table-cell',
                        render:(arr)=>{
                            let child = attrs.map(item=>React.createElement('div', null, arr[index][item.key]));
                            return React.createElement('div', null, ...child)
                        }
                    }))
                ];  
            }
            return { ...state, columns, tableData, layout };
        },
        setPage(state, { payload }){
            return { ...state, currentPage:payload };
        },
        reset(state){
            return initialState;
        }
    }
}