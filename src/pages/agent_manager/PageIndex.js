import React, { useRef, useEffect, useState } from 'react';
import { connect } from 'dva';
import { Spin } from 'antd';
import iconsImg from '../../../public/index-icon-1.png';
import icons2Img from '../../../public/index-icon-2.png';
import FullscreenHeader from '@/pages/components/FullscreenHeader';
import style from './PageIndex.css';
import IndexStyle from '@/pages/IndexPage.css';
import PieChart from './PieChart';
import LineChart from './LineChart';
import RankBarChart from './RankBarChart';
import ScrollList from './ScrollList';
import CanvasContainer from './CanvasContainer';
import WarningInfo from './WarningInfo';

function isFullscreen(){
    return document.fullscreenElement    ||
           document.msFullscreenElement  ||
           document.mozFullScreenElement ||
           document.webkitFullscreenElement || false;
}
function PageIndex({ dispatch, user, monitor }){
    let { msg } = user;
    let { monitorInfo } = monitor;
    let loaded = Object.keys(monitorInfo).length ? true : false;
    useEffect(()=>{
        dispatch({ type:'monitor/fetchMonitorInfo'});
    },[])
    
    let isFulled = isFullscreen();
    return (
        <div id='page-index' className={style['container']}>
            { loaded && <div className={style['mask-x']}></div> }
            { loaded && <div className={style['mask-y']}></div> }
            {
                isFulled
                ?
                <FullscreenHeader title='精密环境监测系统' />
                :
                null
            }
            {/* 告警信息窗口 */}
            <WarningInfo msg={msg} />
            {/* 中间信息区 */}
            <div className={style['float-middle']} style={{ top:isFulled ? '70px' : '10px', height:isFulled ? 'calc( 100% - 70px)' : '100%' }}>
                {
                    monitorInfo.infoList && monitorInfo.infoList.length 
                    ?
                    <div className={style['flex-container']}>
                        {
                            monitorInfo.infoList.map((item, index)=>(
                                <div className={style['flex-item']} key={index}>
                                    <div className={style['flex-icon']} style={{
                                        backgroundImage:`url(${icons2Img})`,
                                        backgroundPosition:`-${index * 49}px 0`
                                    }}></div>
                                    <div className={style['flex-content']}>
                                        <div>
                                            <span style={{ fontSize:'1.8rem', color:'#fff', fontWeight:'bold' }}>{ item.value }</span>
                                            <span className={style['sub-text']} style={{ color:'#fff', margin:'0 4px' }}>{ item.unit }</span>
                                        </div>
                                        <div style={{ color:'rgba(255, 255, 255, 0.65)' }}>{ item.title }</div>
                                    </div>
                                </div>
                            ))
                        }
                        
                    </div>
                    :
                    null
                }
            </div>
            
            {/* 左侧不同级别颗粒物状态 */}
            <div className={style['float-left']} style={{ top:isFulled ? '70px' : '10px', height:isFulled ? 'calc( 100% - 70px)' : '100%' }}>
                <div className={style['icon-container']}>
                {
                    loaded
                    ?
                    monitorInfo.warningDetailType.map((item,index)=>(
                        <div className={style['icon-item']} key={index}>
                            <div className={style['icon-symbol']} style={{
                                backgroundImage:`url(${iconsImg})`,
                                backgroundPosition:`-${index * 64}px ${item.cnt ? '-64px' : '0'}`
                            }}></div>
                            <div className={style['icon-content']}>
                                <div className={style['sub-text']}>{ item.type_name }</div>
                                <span className={item.cnt ? style['tag-off'] : style['tag-on']}>
                                    { item.cnt ? '告警' : '正常' }
                                </span>
                                <span style={{ color:'red' }}>{ item.cnt ? item.cnt + '件' :'' }</span>
                            </div>
                        </div>
                    ))
                    :
                    null
                }
                </div>
            </div>
            {/* 右侧图表区 */}
            <div className={style['float-right']} style={{ top:isFulled ? '70px' : '10px', height:isFulled ? 'calc( 100% - 70px)' : '100%' }}>
                <div className={style['card-container']} style={{ height:'33.3%' }}>
                    <div className={style['card-title']}>
                        <div className={style['card-title-symbol']}></div>
                        近7天告警类型
                    </div>
                    <div className={style['card-content']}>
                        {
                            loaded 
                            ?
                            <PieChart data={monitorInfo.sevenWarning} />
                            :
                            <Spin className={IndexStyle['spin']} />
                        }
                    </div>
                </div>
                <div className={style['card-container']} style={{ height:'33.3%' }}>
                    <div className={style['card-title']}>
                        <div className={style['card-title-symbol']}></div>
                        近7天告警趋势
                    </div>
                    <div className={style['card-content']}>
                        {
                            loaded 
                            ?
                            <LineChart data={monitorInfo.sevenTrend} />
                            :
                            <Spin className={IndexStyle['spin']} />
                        }
                    </div>
                </div>
                <div className={style['card-container']} style={{ height:'33.3%' }}>
                    <div className={style['card-title']}>
                        <div className={style['card-title-symbol']}></div>
                        本月告警排名
                    </div>
                    <div className={style['card-content']}>
                        {
                            loaded 
                            ?
                            <RankBarChart data={monitorInfo.monthRankRecord} />
                            :
                            <Spin className={IndexStyle['spin']} />
                        }
                    </div>
                </div>
            </div>
            {/* 底部滚动告警区 */}
            {
                loaded 
                ?
                <ScrollList data={monitorInfo.warninglists} />
                :
                null
            }
            <CanvasContainer />
        </div>
    )
}

export default connect(({ user, monitor })=>({ user, monitor }))(PageIndex);