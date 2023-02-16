import React, { useEffect, useRef, useState, Component } from 'react';
import { InfoCircleFilled, BarChartOutlined } from '@ant-design/icons';
import companyBg from '../../../public/index_scene_bg.jpg';
import pointBg from '../../../public/index-icon-point.png';
import style from './PageIndex.css';
let canvas = null, ctx = null;
let imgWidth = 0, imgHeight = 0;
let currentKey = '';
let lock = false;
let boxRect = null;
let infoPadding = 15;
let infoWidth = 200, infoHeight = 240 + infoPadding;
let attrs = [
    { key:'ele', title:'电流', value:10.0, unit:'A' },
    { key:'volte', title:'电压', value:30.0, unit:'V' },
    { key:'power', title:'有功功率', value:459, unit:'kw'},
    { key:'useless', title:'无功功率', value:375, unit:'kVar'},
    { key:'factor', title:'功率因素', value:0.33, unit:'cosΦ'},
    { key:'energy', title:'用电量', value:1000, unit:'kwh'}
];
const iconMaps = {
    'ele':<BarChartOutlined />,
    'volte':<BarChartOutlined />,
    'power':<BarChartOutlined />,
    'useless':<BarChartOutlined />,
    'factor':<BarChartOutlined />,
    'energy':<BarChartOutlined />
}
let objects = [
    { key:3, title:'A栋楼2层区域', status:'normal', points:[
        {x: 0.364, y: 0.421},
        {x: 0.397, y: 0.459},
        {x: 0.487, y: 0.351},
        {x: 0.489, y: 0.38},
        {x: 0.398, y: 0.486},
        {x: 0.364, y: 0.435},
        { x:0.364, y:0.421 }
    ] },
    {
        key:2, title:'B栋大楼区域', status:'normal', points:[
            { x:0.540, y:0.715 }, { x:0.548, y:0.701 }, { x:0.552, y:0.710 }, { x:0.616, y:0.614 }, { x:0.616, y:0.600 }, { x:0.633, y:0.576 }, { x:0.682, y:0.639}, { x:0.676, y:0.657 }, { x:0.671, y:0.728 }, { x:0.583, y:0.871 }, { x:0.535, y:0.815 }
        ]
    }
];
function getCrossingNumber(point, points){
    let count = 0;
    for ( var i=0;i<points.length;i++){
        let p1 = points[i];
        let p2 = points[i === points.length - 1 ? 0 : i + 1];
        
        if ( p1.y === p2.y ) continue;
        if ( point.y < Math.min(p1.y,p2.y)) continue;
        if ( point.y > Math.max(p1.y, p2.y)) continue;
        let x = ( point.y - p1.y) * ( p2.x - p1.x) / ( p2.y - p1.y) + p1.x;
        if ( x > point.x ) {
            count++;
        }
    }
    return count;
}

function paintSelection(ctx, points, canvas, is_warning){    
    if ( points.length ){
        ctx.beginPath();
        ctx.moveTo(points[0].x * canvas.width, points[0].y * canvas.height);
        points.forEach((point, i)=>{
            ctx.lineTo(point.x * canvas.width, point.y * canvas.height);
        });
        ctx.closePath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = is_warning ? '#f12d49' : '#1860ff';
        ctx.fillStyle = is_warning ? 'rgba(241, 45, 73, 0.35)' : 'rgba(25, 96, 255, 0.35)';
        ctx.stroke();
        ctx.fill();
    }
}
function getObjPos(points, canvas){
    let minX = 0, maxX = 0, minY = 0, maxY = 0, direc = 'top';
    if ( points.length ){
        let xPos = points.map(i=>i.x);
        let yPos = points.map(i=>i.y);
        xPos.sort();
        yPos.sort();
        minX = xPos[0] * canvas.width;
        maxX = xPos[xPos.length - 1] * canvas.width;
        minY = yPos[0] * canvas.height;
        maxY = yPos[yPos.length - 1] * canvas.height;
        // direc字段判断浮窗相对于对象的定位方位
        if ( minY > infoHeight ) {
            direc = 'top';
        } else if ( ( canvas.height - maxY ) > infoHeight ) {
            direc = 'bottom';
        } 
    }
    return { direc, left:minX, top:minY, width:maxX - minX, height:maxY - minY };
}

class InfoPoint extends Component {
    render(){
        <InfoCircleFilled />
    }
}
function CanvasContainer(){
    const canvasRef = useRef();
    let [info, setInfo] = useState({});
    useEffect(()=>{
        let img = new Image();
        canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.left = '0';
        canvas.style.top = '0';
        ctx = canvas.getContext('2d');
        let container = document.getElementById('page-index');
        img.src = companyBg;
        // 加载拟态图
        img.onload = ()=>{
            imgWidth = img.width;
            imgHeight = img.height;
            img.style.width = '100%';
            img.style.height = '100%';
            handleResize();
            canvasRef.current.appendChild(img);
            canvasRef.current.appendChild(canvas);
            // 绘制绑定数据的区域点
            // objects.map((item)=>{
            //     let point = document.createElement('div');
            //     let pos = getObjPos(item.points, canvas);
            //     item.pos = pos;
            //     point.classList.add(style['info-point']);
            //     point.style.left = pos.left + pos.width/2 + 'px';
            //     point.style.top = pos.top + pos.height/2 + 'px';
            //     point.style.transform = 'translate(-50%, -50%)';
            //     point.innerHTML = '<img src=' + pointBg + ' /><span style="margin-left:4px;text-shadow:2px 2px 4px #000000;">' + item.title + '</span>';
            //     canvasRef.current.appendChild(point); 
            // });
        }
        
        function handleResize(e){
            let ratioX = imgWidth / container.offsetWidth;
            let ratioY = imgHeight / container.offsetHeight;
            // let finalRatio = ratioX < ratioY ? ratioX < 1 ? 1/ratioX : ratioX : ratioY < 1 ? 1/ratioY : ratioY  ; 
            // let canvasWidth = isHorizon ? container.offsetWidth : imgWidth * finalRatio;
            // let canvasHeight = isHorizon ? imgHeight * finalRatio : container.offsetHeight;
            let canvasWidth = imgWidth * ratioX;
            let canvasHeight = imgHeight * ratioX;
            // 拟态图适配窗口大小，监听窗口的宽高变化
            canvasRef.current.style.width = container.offsetWidth + 'px';  
            canvasRef.current.style.height = container.offsetHeight + 'px'; 
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
            boxRect = container.getBoundingClientRect();
            let points = document.getElementsByClassName(style['info-point']);
            if ( points.length ){
                objects.map((item, index)=>{
                    let point = points[index];
                    let pos = getObjPos(item.points, canvas);
                    item.pos = pos;
                    point.style.left = pos.left + pos.width/2 + 'px';
                    point.style.top = pos.top + pos.height/2 + 'px';
                });
            }
            
        }
        window.addEventListener('resize', handleResize);     
        // before 616 * 371 0.264 * 0.668
        // after 740 * 371   0.265     * 0.668
        function handleMouseMove(e){
            // console.log(e.clientX, e.clientY);
            // console.log(boxRect);
            for ( let i=0;i<objects.length;i++){    
                if ( !boxRect ) return;       
                let result = getCrossingNumber({ x:(e.clientX - boxRect.left)/canvas.width, y:(e.clientY - boxRect.top)/canvas.height }, objects[i].points );
                // 考虑多个对象的层叠关系和渲染优先级
                if ( ( result % 2 === 1 ) ) {
                    // 判断悬浮点是否在标记的图形对象区间内
                    if ( !lock ){
                        if ( objects[i].is_warning ) {
                            
                        } else {
                            paintSelection(ctx, objects[i].points, canvas);
                        }
                        
                        setInfo({ pos:objects[i].pos, data:attrs });
                        lock = true;
                        currentKey = objects[i].key;
                    }
                    break;
                } else if ( currentKey === objects[i].key ) {
                    // 清除绘制的状态选择框
                    if ( lock ){
                        if ( objects[i].is_warning ){
                        } else {
                            let pos = objects[i].pos;
                            ctx.clearRect(pos.left - 5, pos.top - 5, pos.width + 6, pos.height + 6);
                        }
                        lock = false;
                        currentKey = '';
                        setInfo({});
                    }                    
                }
            }
        }
        // let clickPoints = [];
        // function handleAnchor(e){
        //     clickPoints.push({ x:Number((e.clientX/canvas.width).toFixed(3)), y:Number((e.clientY/canvas.height).toFixed(3)) });
        //     console.log(clickPoints);
        // }
        // document.addEventListener('click', handleAnchor);
        // document.addEventListener('mousemove', handleMouseMove);
        return ()=>{
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mousemove', handleMouseMove);
            canvas = null;
            ctx = null;
        }
    },[]);
    return (
        <div style={{ height:'100%' }}>
            <div className={style['info-container']} style={{ 
                display:info.pos ? 'block' : 'none',
                left:info.pos ? info.pos.left + info.pos.width / 2 + 'px' : 0,
                top:info.pos ? info.pos.direc === 'top' ? info.pos.top - infoPadding + 'px' : info.pos.top + info.pos.height + infoPadding + 'px' : 0,
                transform:info.pos ? info.pos.direc === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)' : 'none'
            }}>
                {
                    info.data && info.data.length 
                    ?
                    info.data.map((item,index)=>(
                        <div className={style['info-item-wrapper']} key={index}>
                            <div className={style['info-item']}>
                                <div className={style['info-item-label']}>{iconMaps[item.key]}{ item.title }</div>
                                <div className={style['info-item-value']}>
                                    <span>{ item.value }</span>
                                    <span className={style['unit']}>{ item.unit }</span>
                                </div>
                            </div>
                        </div>
                    ))
                    :
                    null
                }
            </div>
            <div className={style['canvas-container']} ref={canvasRef} ></div>
        </div>
    )
}


export default CanvasContainer;