import React, { useState } from 'react';
import style from './PageIndex.css';
import iconImg from '../../../public/index-icon-3.png';

function RankBarChart({ data }){
    let max = data.concat().sort((a,b)=>b.count - a.count)[0];
    return (
        <div className={style['bar-container']}>
            {
                data.map((item, index)=>(
                    <div className={style['bar-item']} key={index}>
                        <div className={style['bar-item-title'] + ' ' + ( index === 0 || index === 1 || index === 2 ? style['top'] : '')} >
                            <div>
                                <span className={style['bar-item-title-icon']} style={{
                                    backgroundImage:`url(${iconImg})`,
                                    backgroundPosition:`${ index === 0 || index === 1 || index === 2 ? 0 : -17}px 0`,
                                    textAlign:'center',
                                    color:'#fff'
                                }}>{ index + 1 }</span>
                                <span>{ item.attr_name }</span>
                            </div>
                            <div>
                                <span style={{ fontSize:'1.2rem' }}>{ item.count }</span>
                                <span style={{ fontSize:'0.8rem', margin:'0 4px' }}>件</span>
                            </div>
                        </div>
                        <div className={style['bar-item-content']}>
                            <div className={style['bar-item-track']}></div>
                            <div className={style['bar-item-progcess'] + ' ' + ( index === 0 || index === 1 || index === 2 ? style['top'] : '')} style={{ width:( item.count / max.count * 100 ) + '%' }}></div>
                        </div>
                    </div>
                ))
            }
        </div>
            
        
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data  ){
        return false;
    } else {
        return true;
    }
}

export default React.memo(RankBarChart, areEqual);