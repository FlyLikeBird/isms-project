import React, { useEffect, useState, useRef } from 'react';
import { Modal, DatePicker } from 'antd';
import { UserOutlined, MobileOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import AvatarBg from '../../../public/avatar-bg.png';
import PointerBg from '../../../public/pointer.png';
import badgeBg from '../../../public/badge-symbol.png';
import RadarChart from './RadarChart';
import LineChart from './LineChart';
import style from './SceneMonitor.css';
import IndexStyle from '@/pages/IndexPage.css';
import datePickerStyle from '@/pages/components/CustomDatePicker/CustomDatePicker.css';
import { attrs, getBase64, downloadPDF } from '@/pages/utils/array';
import moment from 'moment';
import zhCN from 'antd/es/date-picker/locale/zh_CN';

function checkChartWarning(arr, attr, warningInfo){
    let isWarning = false;
    if ( arr.length ){
        for ( let i=0; i < arr.length; i++){
            if ( Number(warningInfo[attr.key]) && Number(arr[i]) >= Number(warningInfo[attr.key]) ) {
                isWarning = true;
                break;
            }
        }
    }
    return isWarning;
}
function RoomDetail({ dispatch, data, currentRoom, currentAttr }){
    const [selectedAttr, setSelectedAttr] = useState({});
    let [currentDate, setCurrentDate] = useState(moment(new Date()));
    let { arr, date, machInfo, lastRecord, warning, level } = data;
    useEffect(()=>{
        dispatch({ type:'sceneMonitor/fetchRoomDetail', payload:{ mach_id:currentRoom.mach_id, time_date:currentDate }});
    },[]);
    return (
        <div style={{ height:'100%' }} className={style['room-detail-container']}>
            <div className={IndexStyle['card-container-wrapper']} style={{ width:'24%'}}>
                <div className={IndexStyle['card-container']} style={{ backgroundImage:'linear-gradient(to Bottom, #06a0fd, #3076f2)'}}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginTop:'2rem' }}>
                        <div className={style['avatar-container']}><img src={AvatarBg} /></div>
                        <div style={{ margin:'0.4rem 0', color:'#fff' }}>
                            <UserOutlined style={{ marginRight:'4px' }} />
                            <span>车间负责人 : </span>
                            <span>{ machInfo ? machInfo.link_name : '-- --' }</span>
                        </div>
                        <div style={{ margin:'0.4rem 0', color:'#fff' }}>
                            <MobileOutlined style={{ marginRight:'4px' }} />
                            <span>电话 : </span>
                            <span>{ machInfo ? machInfo.link_mobile : '-- --' }</span>
                        </div>
                    </div>
                    {/* 设备概况 */}
                    <div style={{ padding:'0 1rem'}}>
                        <div style={{ fontSize:'1.2rem', color:'#fff', margin:'1rem 0' }}>设备概况</div>
                        <div style={{ display:'flex', justifyContent:'space-between', color:'#fff', borderBottom:'1px solid rgba(255, 255, 255, 0.25)', padding:'0.8rem 0' }}>
                            <span style={{ color:'rgba(255, 255, 255, 0.65)' }}>设备在线情况</span>
                            <span>{ machInfo ? machInfo.online_status ? '在线' : '离线' : '-- --' }</span>
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-between', color:'#fff', borderBottom:'1px solid rgba(255, 255, 255, 0.25)', padding:'0.8rem 0' }}>
                            <span style={{ color:'rgba(255, 255, 255, 0.65)' }}>注册码</span>
                            <span>{ machInfo ? machInfo.register_code : '-- --' }</span>
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-between', color:'#fff', borderBottom:'1px solid rgba(255, 255, 255, 0.25)', padding:'0.8rem 0' }}>
                            <span style={{ color:'rgba(255, 255, 255, 0.65)' }}>上次保养时间</span>
                            <span>{ machInfo ? machInfo.last_maintain_date : '-- --' }</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className={IndexStyle['card-container-wrapper']} style={{ width:'76%', paddingRight:'0' }}>
                <div className={IndexStyle['card-container-wrapper']} style={{ height:'30%' }}>
                    <div className={IndexStyle['card-container']} style={{ overflow:'hidden', display:'flex', alignItems:'center', padding:'0 2rem' }}>
                        <div style={{ width:'50%', height:'100%' }}><RadarChart /></div>
                        <div style={{ width:'50%', textAlign:'center' }}>
                            <div className={style['badge-container']} style={{ backgroundImage:`url(${badgeBg})` }}>
                                <div className={style['badge-text']}>{ level === 'null' ? '--' : level === '100w' ? '百万' : level === '10w' ? '十万' : '万' }</div>
                                <div className={style['badge-subtext']}>目前洁净度为{ level === 'null' ? '-- --' : level === '100w' ? '百万' : level === '10w' ? '十万' : '万' }级</div>
                            </div>
                            <div className={style['indicator-container']}>
                                <div className={style['indicator-track']}></div>
                                {
                                    level === 'null' 
                                    ?
                                    null 
                                    :
                                    <div className={style['indicator-pointer']} style={{ backgroundImage:`url(${PointerBg})`, left: level === '100w' ? '83%' : level === '10w' ? '50%' : '17%' }}></div>
                                }
                            </div>
                        </div>
                        
                    </div>
                </div>
                <div style={{ height:'70%' }}>
                    {
                        attrs.map((attr,index)=>{
                            let isWarning = checkChartWarning( arr ? arr[attr.key] : [], attr, warning)

                            return (
                            <div className={IndexStyle['card-container-wrapper']} style={{ width:'33.3%', height:'25%' }} key={index}>
                                <div className={IndexStyle['card-container'] + ' ' + ( isWarning ? IndexStyle['warning'] : '') } style={{ overflow:'hidden', display:'flex', alignItems:'center', padding:'0.4rem 1rem' }} onClick={()=>setSelectedAttr(attr)}>
                                    <div style={{ width:'40%'}}>
                                        <div>{ attr.title }<span className={ isWarning ? IndexStyle['tag-off'] : IndexStyle['tag-on']} style={{ margin:'0 4px' }}>{ isWarning ? '告警' : '正常'}</span></div>
                                        <div>
                                            <span style={{ fontSize:'1.6rem', color:'#fff', fontWeight:'bold' }}>{ lastRecord ? lastRecord[attr.key] : '-- --' }</span>
                                            <span className={style['sub-text']} style={{ margin:'0 4px' }}>{ attr.unit }</span>
                                        </div>
                                    </div>
                                    <div style={{ width:'60%' }}>
                                        <LineChart xData={date || [] } yData={ arr ? arr[attr.key] : []}  />
                                    </div>
                                </div>
                            </div>)
                        })
                    }
                </div>
            </div>
            <Modal
                width='960px'
                height='540px'
                visible={Object.keys(selectedAttr).length}
                footer={null}
                onCancel={()=>setSelectedAttr({})}
                className={IndexStyle['custom-modal']}
            > 
                <div style={{ position:'absolute', right:'4rem', top:'1rem', zIndex:'2' }}>
                    <div style={{ display:'inline-flex', marginLeft:'6px' }}>
                        <div className={datePickerStyle['date-picker-button-left'] + ' ' + datePickerStyle['small'] } onClick={()=>{
                            let temp = new Date(currentDate.format('YYYY-MM-DD'));
                            let result = moment(temp).subtract(1,'days');
                            setCurrentDate(result);
                            dispatch({ type:'sceneMonitor/fetchRoomDetail', payload:{ mach_id:currentRoom.mach_id, time_date:result }});
                        }}><LeftOutlined /></div>
                    
                        <DatePicker size='small' locale={zhCN} allowClear={false} className={datePickerStyle['date-picker-container']} value={currentDate} onChange={value=>{
                            setCurrentDate(value);
                            dispatch({ type:'sceneMonitor/fetchRoomDetail', payload:{ mach_id:currentRoom.mach_id, time_date:value }});
                        }} />
                        
                    <div className={datePickerStyle['date-picker-button-right'] + ' ' + datePickerStyle['small']} onClick={()=>{
                        let temp = new Date(currentDate.format('YYYY-MM-DD'));
                        let result = moment(temp).add(1,'days');
                        setCurrentDate(result);
                        dispatch({ type:'sceneMonitor/fetchRoomDetail', payload:{ mach_id:currentRoom.mach_id, time_date:result }});
                    }}><RightOutlined /></div>
            </div>
                </div>
             
                <LineChart 
                    xData={date || [] } 
                    yData={ arr ? arr[selectedAttr.key] : []} 
                    forModal={true} 
                    attrKey={selectedAttr.key} 
                    unit={selectedAttr.unit}
                    title={`${currentAttr.title + '-' + currentRoom.attr_name + '-' + selectedAttr.title }`} 
                    warningValue={warning ? warning[selectedAttr.key] : 0 }
                />
            </Modal>
        </div>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(RoomDetail, areEqual);