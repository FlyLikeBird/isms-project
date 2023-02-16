import React, { useEffect, useState, useRef } from 'react';
import { Button, Modal, Select, Radio, Tooltip, List, Popconfirm, message } from 'antd';
import { AimOutlined, LinkOutlined, DisconnectOutlined, FileImageOutlined, DeleteOutlined, HomeFilled, ClearOutlined, UndoOutlined, SaveOutlined } from '@ant-design/icons';
import normalIcon from '../../../public/room-normal-icon.png';
import onlineIcon from '../../../public/room-online-icon.png';
import offlineIcon from '../../../public/room-offline-icon.png';
import style from './SceneMonitor.css';
import IndexStyle from '@/pages/IndexPage.css';
import { attrs } from '@/pages/utils/array';
import UploadSceneBg from './UploadSceneBg';

const { Option } = Select;
let timer = null;
let id = 1;
let containerWidth = 0, containerHeight = 0;
let originWidth = 0, originHeight = 0;
let defaultAbsolutePath = 'http://api.h1dt.com/images/example/attr_layout.png';
let defaultRelativePath = '/images/example/attr_layout.png';
function getStyle(element,attribute){
    //先获取需要获取样式的元素对象
    var style = window.getComputedStyle ? window.getComputedStyle(element) : element.currentStyle
    //再获取元素属性
    return style[attribute]
}
function checkAttrIsWarning(obj){
    let isWarning = false;
    if ( obj && obj.warning ) {
        attrs.forEach(attr=>{
            let warningValue = Number(obj.warning[attr.key]);
            if ( warningValue && obj[attr.key] >= warningValue ) {
                isWarning = true;
            }
        });
    }
    return isWarning;
}
function createPoint( dispatch, width, height, x, y, handleSelect, handleShowDetail, pointId, fromJSON){
    let div = document.createElement('div');
    let finalId = fromJSON ? pointId : id;
    div.className = style['point-container'] + ' ' + finalId;
    let offsetX = fromJSON ? x : (x/width * 100).toFixed(3);
    let offsetY = fromJSON ? y : (y/height * 100).toFixed(3);
    div.style.left = offsetX + '%';
    div.style.top = offsetY + '%';
    for ( var i=0;i<5;i++){
        let span = document.createElement('span');
        span.style.setProperty('--i', i);
        div.appendChild(span);
    }
    let image = new Image();
    image.src = normalIcon;
    image.onmouseenter = e=>{
        // 如果锚点有绑定设备ID,则鼠标移入显示绑定设备信息
        if ( div.mach_id ) {
            new Promise((resolve, reject)=>{
                dispatch({ type:'sceneMonitor/fetchMachStatus', payload:{ resolve, reject, mach_id:div.mach_id }})
            })
            .then((data)=>{
                // console.log(data);
                let result = data;
                result.direc = y <= 140 ? 'top' : y >= 350 ? 'bottom' : 'middle';
                result.x = Number(offsetX);
                result.y = result.direc === 'top' || result.direc === 'middle' ? Number(offsetY) : 100 - Number(offsetY);
                result.isWarning = checkAttrIsWarning(result);
                handleShowDetail(result);
            })
            
        }
    }
    image.onmouseleave = e=>{
        console.log('image leave');
        handleShowDetail({});
    }
    // image.onclick = e=>{
    //     e.stopPropagation();
    //     // 选中某个锚点，添加选中样式
    //     let allPoints = document.getElementsByClassName(style['point-container']);
    //     for(let i=0;i<allPoints.length ;i++){
    //         allPoints[i].classList.remove(style['selected']);
    //     }
    //     div.className = div.getAttribute('class') + ' ' + style['selected'];
    //     handleSelect({ offsetX, offsetY, pointId:finalId });
    //     console.log('image click');
    // }
    div.appendChild(image);
    // 给锚点定义绑定数据源和删除的操作
    if ( !fromJSON ) {
        id++;
    }
    return { dom:div, point:{ x:offsetX, y:offsetY, pointId:finalId }};
}

function calcRatio(parent){
    let xRatio = originWidth / containerWidth ;
    let yRatio = originHeight / containerHeight;
    let finalRatio = xRatio < yRatio ? yRatio : xRatio;
    // 判断是以X轴还是Y轴Ratio为基准
    let isHorizon = xRatio < yRatio ? false : true;
    let imgWidth = isHorizon ? containerWidth : originWidth * ( 1/ finalRatio );
    let imgHeight = isHorizon ? originHeight * ( 1 / finalRatio ) : containerHeight;
    parent.style.width = imgWidth + 'px';
    parent.style.height = imgHeight + 'px';
    // parent.style.background = 'blue';
    parent.style.margin = `${ isHorizon ? ( containerHeight - imgHeight)/2 : 0 }px ${ isHorizon ? 0 : ( containerWidth - imgWidth)/2 }px`;
}
function createImg(src, parent){
    let img = new Image();
    img.src = src;
    img.className = style['scene-bg'];
    img.onload = ()=>{
            // console.log('img load');
            originWidth = img.width;
            originHeight = img.height;
            calcRatio(parent);
            parent.appendChild(img);
            // console.log(originWidth, originHeight);
            // console.log(imgWidth, imgHeight);
            // console.log(xRatio, yRatio);
    }
}

function RoomScene({ dispatch, layout, allBindMachs, currentAttr, screenWidth }){
    let containerRef = useRef();
    let contentRef = useRef();
    let imgRef = useRef();
    let [anchoring, setAnchoring] = useState(false);
    let [currentTarget, setCurrentTarget] = useState({});
    let [machList, setMachList] = useState([]);
    let [machInfo, setMachInfo] = useState({});
    let [detailInfo, setDetailInfo] = useState({});
    let [pointList, setPointList] = useState([]);
    let [bgVisible, setBgVisible] = useState(false);
    let anchoringRef = useRef();
    let pointListRef = useRef();
    useEffect(()=>{
        pointListRef.current = pointList;
        // 每次锚点信息变化时，自动更新到服务器
        new Promise((resolve, reject)=>{
            // console.log(layout);
            dispatch({ type:'sceneMonitor/setLayoutAsync', payload:{ resolve, reject, content:pointList, img_path:layout.img_path }})
        })
        .then(()=>{})
        .catch(msg=>message.error(msg));
        // console.log(allBindMachs);
        // console.log(pointList);
        let pointMachIds = pointList.map(i=>i.mach_id);
        let result = allBindMachs.filter(i=>!pointMachIds.includes(i.mach_id));
        setMachList(result);
    },[pointList])
    useEffect(()=>{
        if ( Object.keys(layout).length ) {
            let { content } = layout;
            let points = content ? JSON.parse(content) : content;
            let pointMachIds = points.map(i=>i.mach_id);
            let result = allBindMachs.filter(i=>!pointMachIds.includes(i.mach_id));
            setMachList(result);
        }
    },[allBindMachs])
    useEffect(()=>{
        let parent = imgRef.current;
        if ( anchoring ){
            parent.style.cursor = 'crosshair';
        } else {
            parent.style.cursor = 'default';
        }
        anchoringRef.current = anchoring;
    },[anchoring]);
    useEffect(()=>{
        let container = containerRef.current;
        let content = contentRef.current;
        if ( container && screenWidth ){
            // console.log('resize');
            // 监听窗口的SIZE变化，自动更新拟态图容器的宽高
            containerWidth = container.offsetWidth * 0.75;
            containerHeight = container.offsetHeight * 0.8;
            // 根据容器初始化的大小设定好背景图的缩放标准
            content.style.width = containerWidth + 'px';
            content.style.height = containerHeight + 'px';
            // content.style.background = '#ccc';
            let imgContainer = imgRef.current;
            calcRatio(imgContainer);
        }
    },[screenWidth])
    useEffect(()=>{
        // console.log('mounted');
        let container = containerRef.current;
        containerWidth = container.offsetWidth * 0.75;
        containerHeight = container.offsetHeight * 0.8;
        let imgContainer = imgRef.current;
        var handleClick = e=>{
            if ( anchoringRef.current ){
                let { dom, point } = createPoint(dispatch, imgContainer.offsetWidth, imgContainer.offsetHeight, e.offsetX, e.offsetY, (obj)=>setCurrentTarget(obj), (obj)=>setDetailInfo(obj), 0, false );
                imgContainer.appendChild(dom);
                let newArr = [...pointListRef.current];
                newArr.push(point);
                setPointList(newArr);
            } 
            console.log('click');
        }
        var handleOpenMenu = e=>{
            if ( e.which === 3 ) {
                // 判断目标对象是锚点对象
                if ( e.target.nodeName === 'IMG' && e.target.getAttribute('class') !== style['scene-bg'] ) {
                    let target = e.target.parentNode;
                    let left = getStyle(target, 'left');
                    let top = getStyle(target, 'top');
                    let className = target.getAttribute('class');
                    setCurrentTarget({ offsetX:left, offsetY:top, pointId:Number(className.split(' ')[1]) });
                }
            }
        }
        // 注册新增锚点事件
        if ( imgContainer ){
            imgContainer.addEventListener('click', handleClick);
            imgContainer.addEventListener('mousedown', handleOpenMenu);
            imgContainer.oncontextmenu = function(){ return false };
        }
       
        return ()=>{
            imgContainer.removeEventListener('click', handleClick);
            imgContainer.removeEventListener('mousedown', handleOpenMenu);
            clearTimeout(timer);
            imgContainer.oncontextmenu = null;
            timer = null;
            id = 1;
            containerWidth = 0;
            containerHeight = 0;
            originWidth = 0;
            originHeight = 0;
        }
    },[]);
    useEffect(()=>{
        // console.log('layout');
        if ( Object.keys(layout).length ) {
            let { content, img_path_link } = layout;
            let points = content ? JSON.parse(content) : content;
            let imgContainer = imgRef.current;
            let img = imgContainer.getElementsByClassName(style['scene-bg'])[0];
            let prevPoints = imgContainer.getElementsByClassName(style['point-container']);
            // console.log(prevPoints);
            if ( prevPoints.length ){
                for ( let i=prevPoints.length - 1;i >=0 ;i--) {
                    imgContainer.removeChild(prevPoints[i]);
                }
            }
            if ( !img || ( img && img.src !== img_path_link )) {            
                if ( img ){
                    // 删除之前的拟态图
                    imgContainer.removeChild(img);
                }
                createImg(img_path_link, imgContainer);
            }
            // console.log(points);
            if ( points && points.length ) {
                // 求出锚点最大ID值，保证ID递增不重复
                let maxIdObj = points.concat().sort((a,b)=>b.pointId - a.pointId)[0];
                id = maxIdObj.pointId + 1;
                // 判断解析后的所有锚点信息的当前状态
                Promise.all(
                    points.map((point,index)=>{
                        return point.mach_id 
                        ?
                        new Promise((resolve, reject)=>{
                            dispatch({ type:'sceneMonitor/fetchMachStatus', payload:{ resolve, reject, mach_id:point.mach_id }})
                        })
                        :
                        Promise.resolve()
                    })
                )
                .then(([...result])=>{
                    // console.log(result);
                    result.forEach((item, index)=>{
                        let { dom } = createPoint(dispatch, imgContainer.offsetWidth, imgContainer.offsetHeight, points[index].x, points[index].y, (obj)=>setCurrentTarget(obj), (obj)=>setDetailInfo(obj), points[index].pointId, true );
                        if ( item ) {
                            dom.mach_id = points[index].mach_id;
                        }
                        let isWarning = checkAttrIsWarning(item);
                        dom.className = style['point-container'] + ' ' + points[index].pointId  +  ' ' + ( item ? isWarning || !item.online_status  ? style['warning'] : style['online'] : '');
                        let img = dom.getElementsByTagName('img')[0];
                        if ( img ) {
                            img.src = item ? isWarning || !item.online_status ? offlineIcon : onlineIcon : normalIcon;
                        }
                        imgContainer.appendChild(dom);
                    })
                    setPointList(points);

                })
               
            } else {
                id = 1;
                setPointList([]);
            }
            
        }
    },[layout])
    return (
        <div className={style['room-scene-container']} ref={containerRef}>
            <div className={style['room-content-container']} ref={contentRef}>
                <div className={style['room-img-container']} ref={imgRef}>
                    {/* 锚点右键菜单选项 */}
                    <div className={style['info-container']} onMouseLeave={()=>setCurrentTarget({})} style={{
                        display:Object.keys(currentTarget).length ? 'block' : 'none',
                        left:Object.keys(currentTarget).length ? `calc(${currentTarget.offsetX} + 40px)`  : '',
                        top:Object.keys(currentTarget).length ? currentTarget.offsetY : '',
                        zIndex:'3'
                    }}>
                        <div className={style['info-item']} onClick={()=>setMachInfo({ pointId:currentTarget.pointId })}><LinkOutlined style={{ marginRight:'4px' }} />绑定设备</div>
                        <div className={style['info-item']} onClick={()=>{
                            let dom = imgRef.current.getElementsByClassName(style['point-container'] + ' ' + currentTarget.pointId)[0];
                            if ( dom ){
                                let img = dom.getElementsByTagName('img')[0];
                                let newArr = pointList.map(item=>{
                                    if ( item.pointId === currentTarget.pointId ) {
                                        item.mach_id = '';
                                    }
                                    return item;
                                });
                                
                                setPointList(newArr);
                                if (img){
                                    img.src = normalIcon;
                                }
                                dom.mach_id = null;
                                dom.className = style['point-container'] + ' ' + currentTarget.pointId;
                            }
                        }}><DisconnectOutlined style={{ marginRight:'4px' }} />解绑设备</div>
                        <div className={style['info-item']} onClick={()=>{
                            let dom = imgRef.current.getElementsByClassName(style['point-container'] + ' ' + currentTarget.pointId)[0];
                            if ( dom ){
                                imgRef.current.removeChild(dom);
                                let newArr = pointList.filter(i=>i.pointId !== currentTarget.pointId);
                                // console.log(pointList);
                                // console.log(newArr);
                                setCurrentTarget({});
                                setPointList(newArr);
                            }
                        }}><DeleteOutlined style={{ marginRight:'4px' }} />删除锚点</div>
                    </div>
                    {/* 绑定状态数据浮窗 */}
                    <div className={style['info-container']} style={{
                        display:Object.keys(detailInfo).length ? 'block' : 'none',
                        left:(detailInfo.x + 4) + '%',
                        top:detailInfo.direc ==='top' || detailInfo.direc === 'middle' ? detailInfo.y + '%' : 'unset',
                        bottom:detailInfo.direc === 'bottom' ? detailInfo.y + '%' : 'unset',
                        transform:detailInfo.direc === 'middle' ? 'translateY(-50%)' : 'none'
                    }}>
                    {
                        Object.keys(detailInfo).length 
                        ?
                        <div className={style['inline-container']}>
                            <div className={style['inline-content']} style={{ height:'100%' }}>
                                <div className={style['inline-item-wrapper']} style={{ width:'260px', padding:'0' }}>
                                    <div className={style['inline-item']}>
                                        <div className={style['inline-item-title']}>
                                            <div>
                                                <HomeFilled style={{ marginRight:'4px' }} />{ currentAttr.title + '-' + ( detailInfo.attr_name || '-- --') }
                                                <div className={style['sub-text']}>数据更新时间 : { detailInfo.record_time || '-- --' }</div>
                                            </div>
                                            <div className={ detailInfo.isWarning ? IndexStyle['tag-off'] : detailInfo.online_status ? IndexStyle['tag-on'] : IndexStyle['tag-off']}>{ detailInfo.isWarning ? '告警' : detailInfo.online_status ? '在线' :'离线' } </div>
                                        </div>
                                        <div className={style['inline-item-content']}>
                                            {   
                                                attrs.map((attr, j)=>{
                                                    let warningValue = 0, maxValue = 0 , barValue = 0;
                                                    if ( detailInfo.warning ){
                                                        warningValue = Number(detailInfo.warning[attr.key]);
                                                        maxValue = warningValue + warningValue/2 ;     
                                                        barValue =  detailInfo[attr.key]/maxValue * 100; 
                                                    }                                           
                                                    return (<div className={style['progress-item'] + ' ' + ( warningValue && detailInfo[attr.key] >= warningValue ? style['warning'] : '' )} key={j}>
                                                        <div className={style['progress-item-title']}>
                                                            <div className={style['sub-text']} style={{ color:'rgba(255, 255, 255, 0.45)' }}>{ attr.title }</div>
                                                            <div>
                                                                <span className={style['data']}>{ detailInfo[attr.key] || 0.0 }</span>
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
                                </div>
                            </div>
                        </div>
                        :
                        null
                    }
                    </div> 
                </div>
            </div> 
            {/* 全局控制菜单 */}
            <div className={style['room-scene-btns']}>          
                <Tooltip title={anchoring ? '取消锚点' : '添加锚点'}>
                    <div onClick={()=>setAnchoring(!anchoring) } style={{ background:anchoring ? '#ebebeb' : '#1890ff', color:anchoring ? 'rgba(0, 0, 0, 0.65)' : '#fff' }}>
                    <AimOutlined  />
                    </div>
                </Tooltip>
                <Tooltip title='清空所有锚点'>
                    <div onClick={()=>{
                        let imgContainer = imgRef.current;
                        let prevPoints = imgContainer.getElementsByClassName(style['point-container']);
                        if ( prevPoints.length ){
                            for ( let i=prevPoints.length - 1;i >=0 ;i--) {
                                imgContainer.removeChild(prevPoints[i]);
                            }
                        }
                        setPointList([]);
                    }}><ClearOutlined /></div>
                </Tooltip>
                {/* 切换拟态背景 */}
                <Tooltip title='切换拟态图'><div onClick={()=>setBgVisible(true)}><FileImageOutlined /></div></Tooltip>
                {/* 重置拟态背景 */}
                
                <Popconfirm
                    title='重置默认拟态图会清空当前拟态图中所有锚点'
                    cancelText='取消'
                    okText='确定'
                    onConfirm={()=>{
                        console.log('confirm');
                        new Promise((resolve, reject)=>{
                            dispatch({ type:'sceneMonitor/setBgAsync', payload:{ resolve, reject, content:[], img_path:defaultRelativePath }})
                        })
                        .then(()=>{})
                        .catch(msg=>message.error(msg))
                    }}
                >
                    <div><UndoOutlined  /></div>
                </Popconfirm>
            </div>
            <Modal
                visible={Object.keys(machInfo).length ? true : false }
                title='可选设备列表'
                onMouseEnter={()=>console.log('enter modal')}
                onCancel={()=>setMachInfo({})}
                footer={null}
            >
                <List
                    bordered
                    dataSource={machList}
                    onClick={(event)=>{
                        let container = imgRef.current;
                        if ( container ){
                            let target = container.getElementsByClassName(style['point-container'] + ' ' + machInfo.pointId)[0];
                            let attr = event.target.getAttribute('data-mach');
                            if ( target ){
                                let img = target.getElementsByTagName('img')[0];
                                new Promise((resolve, reject)=>{
                                    dispatch({ type:'sceneMonitor/fetchMachStatus', payload:{ resolve, reject, mach_id:attr }})
                                })
                                .then((data)=>{
                                    // console.log(data);
                                    data.isWarning = checkAttrIsWarning(data);
                                    // handleShowDetail(result);
                                    target.className = style['point-container'] + ' ' + machInfo.pointId + ' ' + ( data.isWarning || !data.online_status ? style['warning'] : style['online']);
                                    target.mach_id = Number(attr);
                                    if ( img ){
                                        img.src = data.isWarning || !data.online_status ? offlineIcon : onlineIcon;
                                    }
                                    let newArr = pointList.map(item=>{
                                        if ( item.pointId === machInfo.pointId){
                                            item.mach_id = Number(attr);
                                        } 
                                        return item;
                                    });                                
                                    setPointList(newArr);
                                    setMachInfo({});
                                })
                                .catch(msg=>message.error(msg));
                            }
                        }
                    }}
                    renderItem={(item) => (
                      <List.Item data-mach={item.mach_id}>
                         { item.meter_name }
                      </List.Item>
                    )}
                />
            </Modal>
            <UploadSceneBg visible={bgVisible} onVisible={value=>setBgVisible(value)} dispatch={dispatch} pointList={pointList}  />
        </div>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.layout !== nextProps.layout || prevProps.allBindMachs !== nextProps.allBindMachs || prevProps.screenWidth !== nextProps.screenWidth  ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(RoomScene, areEqual);