import React, { useEffect, useState } from 'react';
import { history } from 'umi';
import { RightOutlined, CloseCircleOutlined } from '@ant-design/icons';
import style from './PageIndex.css';
import warningBg from '../../../public/index-icon-warning.png';
let timer = null;
function WarningInfo({ msg }){
    let [info, setInfo] = useState({});
    useEffect(()=>{
        if ( Object.keys(msg).length ) {
            if ( msg.detail && msg.detail.length ){
                clearTimeout(timer);
                timer = setTimeout(()=>{
                    setInfo(msg.detail[0]);
                },1000)
            }
        }
    },[msg]);
    useEffect(()=>{
        return ()=>{
            clearInterval(timer);
            timer = null;
        }
    },[])
    return (
        Object.keys(info).length 
        ?
        <div className={style['warning-container']} style={{ backgroundImage:`url(${warningBg})`}}>
            {/* <img src={warningBg} /> */}
            <div className={style['warning-info']}>
                <div className={style['warning-info-title']}>{ info.type_name + '告警' }</div>
                <div>
                    <span className={style['warning-info-subtext']}>地点</span>
                    <span className={style['warning-info-text']}>{ info.company_name + '-' + info.attr_name }</span>
                </div>
                <div>
                    <span className={style['warning-info-subtext']}>时间</span>
                    <span className={style['warning-info-text']}>{ info.date_time }</span>
                </div>
                <div className={style['warning-info-value']}>{`${info.type_name}限定值:${info.warning_info}${info.unit_name} ; 实际值:${info.warning_value}${info.unit_name}`}</div>
                <div className={style['warning-info-btn']} onClick={()=>{
                    history.push('/alarm_monitor');
                }}>查看详情<RightOutlined /></div>
            </div>
            <div className={style['warning-close-btn']} onClick={()=>{
                setInfo({})
            }}><CloseCircleOutlined /></div>
        </div>
        :
        null
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.msg !== nextProps.msg ){
        return false;
    } else {
        return true;
    }
}

export default React.memo(WarningInfo, areEqual);