import React, { useEffect } from 'react';
import { connect } from 'dva';
import { Pagination } from 'antd';
import { HomeOutlined, HomeFilled } from '@ant-design/icons';
import style from './SceneMonitor.css';
import IndexStyle from '@/pages/IndexPage.css';
import { attrs } from '@/pages/utils/array';

function checkAttrIsWarning(obj){
    let isWarning = false;
    attrs.forEach(attr=>{
        let warningValue = Number(obj.warning[attr.key]);
        if ( warningValue && obj[attr.key] >= warningValue ) {
            isWarning = true;
        }
    });
    return isWarning;
}
function RoomList({ data, currentAttr, currentPage, total, onSelected }){
    return (
        <div className={style['inline-container']}>
            <div className={style['inline-content']}>
            {
                data.map((item,index)=>{
                    let isWarning = checkAttrIsWarning(item);
                    item.isWarning = isWarning;
                    return (<div className={style['inline-item-wrapper']} key={index}>
                        <div className={style['inline-item']} onClick={()=>onSelected(item)}>
                            <div className={style['inline-item-title']}>
                                <div>
                                    <HomeFilled style={{ marginRight:'4px' }} />{ currentAttr.title + '-' + item.attr_name }
                                    <div className={style['sub-text']}>数据更新时间 : { item.record_time }</div>
                                </div>
                                <div className={ isWarning ? IndexStyle['tag-off'] : item.online_status ? IndexStyle['tag-on'] : IndexStyle['tag-off']}>{ isWarning ? '告警' : item.online_status ? '在线' :'离线' } </div>
                            </div>
                            <div className={style['inline-item-content']}>
                                {
                                    
                                    attrs.map((attr, j)=>{
                                        let warningValue = Number(item.warning[attr.key]);
                                        let maxValue = warningValue + warningValue/2 ;     
                                        let barValue =  item[attr.key]/maxValue * 100; 
                                                           
                                        return (<div className={style['progress-item'] + ' ' + ( warningValue && item[attr.key] >= warningValue ? style['warning'] : '' )} key={j}>
                                           
                                            <div className={style['progress-item-title']}>
                                                <div className={style['sub-text']} style={{ color:'rgba(255, 255, 255, 0.45)' }}>{ attr.title }</div>
                                                <div>
                                                    <span className={style['data']}>{ item[attr.key] || 0.0 }</span>
                                                    <span className={style['sub-text']} style={{ margin:'0 4px' }}>{ attr.unit }</span>
                                                </div>
                                            </div>
                                            <div className={style['progress-item-content']}>
                                                <div className={style['progress-item-track']}></div>                                                    
                                                <div className={style['progress-item-bar']} style={{ 
                                                    width: warningValue ? `${ barValue > 100 ? 100 : barValue }%` : '0'
                                                }}></div>
                                                {
                                                    warningValue
                                                    ?
                                                    <div className={style['progress-item-pointer']} style={{ left:warningValue / maxValue * 100 + '%'}}></div>
                                                    :
                                                    null 
                                                }
                                            </div>
                                        </div>)
                                    })
                                    
                                }
                            </div>
                        </div>
                    </div>)
                })
            }
            </div>
            <div className={style['inline-footer']}>
                <Pagination className={IndexStyle['custom-pagination']} total={total} current={currentPage} />
            </div>
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

export default React.memo(RoomList, areEqual);