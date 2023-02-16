import React, { useEffect, useState } from 'react';
import style from './PageIndex.css';


let interval = 3000;
let timer = null;
let count = 0;
function ScrollList({ data }){
    useEffect(()=>{
        let items = document.getElementsByClassName(style['scroll-item']);
        if ( data.length > 1 ) {
            timer = setInterval(()=>{
                // 保证滚动到一屏的最后位置再复位 
                let scrollNum = data.length > 3 ? Math.round(data.length / 3) * 3 : 3;
                if ( count === scrollNum ) {
                    count = 0;
                    items.forEach((item, index)=>{
                        item.style.transition = 'none';
                        item.style.transform = `translateY(9rem)`;
                    });
                    return ;
                }
                count++;
                items.forEach((item, index)=>{
                    if ( count - 1 === index ) {
                        item.style.opacity = 1;
                    } else {
                        item.style.opacity = 0.25;
                    }
                    item.style.transition = 'transform 1s';
                    item.style.transform = `translateY(${9 - count * 3}rem)`;
                })
            }, interval)
        } else {
            items.forEach((item, index)=>{
                item.style.opacity = 1;
                item.style.transform = `translateY(0)`;
            })
        }
        return ()=>{
            clearInterval(timer);
            timer = null;
            count = 0;
        }
    },[])
    return (
        <div className={style['scroll-container']}>
            {
                data.map((item,index)=>{
                    let timeArr = item.last_warning_time.split(' ');
                    return (<div className={style['scroll-item']} key={index}>
                        <div style={{ width:'10%' }}>
                            <span className={style['scroll-item-icon']}>{ index + 1 }</span>
                        </div>
                        <div className={style['scroll-item-title']} style={{ width:'26%'}}>{ item.attr_name }</div>
                        <div style={{ width:'26%' }}>
                            <span className={style['tag-off']} style={{ fontSize:'1rem' }}>{ item.type_name + '告警' }</span>
                        </div>
                        <div className={style['scroll-item-time']} style={{ width:'40%'}}>{ item.last_warning_time }</div>
                            {/* <div>{ timeArr[1] }</div>
                            <div>{ timeArr[0] }</div> */}
                    </div>)
                })
            }
        </div>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data ){
        return false;
    } else {
        return true;
    }
}
export default React.memo(ScrollList, areEqual);