import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { Select, Table, Modal, Button, Spin, message } from 'antd';
import { SearchOutlined, FilePdfOutlined } from '@ant-design/icons';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import Loading from '@/pages/components/Loading';
import PieChart from './PieChart';
import MultiBarChart from './MultiBarChart';
import style from '@/pages/IndexPage.css';
import { getBase64, downloadPDF } from '@/pages/utils/array';

const { Option } = Select;

let canDownload = false;


function AlarmAnalyze({ dispatch, user, alarm }){
    let containerRef = useRef();
    let { authorized, userInfo, timeType, startDate, endDate } = user;
    let [finishLoading, setFinishLoading] = useState(false);
    useEffect(()=>{
        if ( authorized ) {
            dispatch({ type:'alarm/initAlarmAnalyze'});
        }
    },[authorized]);
   
    let { chartLoading, chartInfo } = alarm;
    const handleDownload = ()=>{
        let container = containerRef.current;
        if ( !chartLoading ) {
            if ( container ){
                getBase64(container)
                .then(base64Imgs=>{
                    // 3224 1598
                    let fileTitle = 
                        timeType === '1' 
                        ?
                        `${startDate.format('YYYY-MM-DD')}告警分析`
                        :
                        `${startDate.format('YYYY-MM-DD')}至${endDate.format('YYYY-MM-DD')}告警分析`;
                    downloadPDF(fileTitle, base64Imgs);
                    setFinishLoading(false);
                })
            }
        } else {
            message.info('数据正在加载中，请稍后下载...');
        }
        
    };
    return (
        <div style={{ height:'100%' }} >
            {
                finishLoading 
                ?
                <div className={style['mask']} onClick={e=>e.stopPropagation()}>
                    <div className={style['content']}>
                        <div style={{ color:'#fff' }}>生成pdf文档中,请稍后...</div>
                        <Spin size='large' />
                    </div>
                </div>
                :
                null
            }
            {
                chartLoading 
                ?
                <Loading />
                :
                null
            }
            <div style={{ height:'50px', color:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <CustomDatePicker onDispatch={()=>{
                    dispatch({ type:'alarm/fetchAlarmAnalyze'});
                }} />
                <Button type='primary' onClick={()=>{ setFinishLoading(true);handleDownload(); }}><FilePdfOutlined style={{ fontSize:'1.2rem', lineHeight:'1rem' }} /></Button>
            </div>
            <div style={{ height:'calc( 100% - 50px)'}} ref={containerRef}>
                <div style={{ height:'28%' }}>
                    <div className={style['card-container-wrapper']} style={{ width:'50%'}}>
                        <div className={style['card-container']} style={{ overflow:'hidden' }}>
                            <PieChart data={ chartInfo.cateGroupArr || {}} title='告警分析' />
                        </div>
                    </div>
                    <div className={style['card-container-wrapper']} style={{ width:'50%', paddingRight:'0' }}>
                        <div className={style['card-container']} style={{ overflow:'hidden' }}>
                            <PieChart data={ chartInfo.cateCodeArr || {}} title='处理进度' forStatus={true} />
                        </div>
                    </div>
                </div>
                <div style={{ height:'32%', paddingBottom:'1rem' }}>
                    <div className={style['card-container']} style={{ overflow:'hidden' }}>
                        <MultiBarChart timeType={timeType} data={ chartInfo.view ? chartInfo.view : {}} category={chartInfo.view && chartInfo.view.date ? chartInfo.view.date : []} title='告警趋势' theme='dark' />
                    </div>
                </div>
                <div style={{ height:'40%' }}>
                    <div className={style['card-container']} style={{ overflow:'hidden' }}>
                        <MultiBarChart forRank={true} timeType={timeType} data={chartInfo.warningRank ? { '告警数':chartInfo.warningRank.map(i=>i.cnt)} : {}} category={chartInfo.warningRank ? chartInfo.warningRank.map(i=>i.rankName) : []} title='告警区域排名' theme='dark' />
                    </div>
                </div>
            </div>
            
        </div>
    )
}

export default connect(({ user, alarm })=>({ user, alarm }))(AlarmAnalyze);