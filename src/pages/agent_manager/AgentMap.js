import React, { useState, useEffect } from 'react';
import { history } from 'umi';
import AMapLoader from '@amap/amap-jsapi-loader';
import { Spin } from 'antd';
import arrowNormal from '../../../public/arrow-normal-3.png';
import arrowNormal2 from '../../../public/arrow-normal-4.png';
import arrowError from '../../../public/arrow-warning-3.png';
import style from './AgentManager.css';
let map = null;
let timer = null;
let moveTimer = null;
let points = [];
let warningInfo = null;
let infoWindow = null;
// 标记定位点所在的省份;
let provinceList = [];
let polygonList = [];

function AgentMap({ companyList, msg, AMap, currentNode, userType, dispatch }) {
    let [info, setInfo] = useState({}); 
    
    useEffect(()=>{
        if ( !AMap ){
            AMapLoader.load({
                key:'26dbf93c4af827e4953d7b72390e3362',
                // version:'1.4.15',
                // 2.0版本对自定义地图的适配性更好，旧版本道路文字渲染不出来;
                version:'2.0',
            })
            .then((MapInfo)=>{                
                // 经纬度转换成容器内像素坐标
                let lng = 113.27324;
                let lat = 23.15792;
                // 添加canvas图层            
                // 添加标记点
                // 南宁（108.27331，22.78121），广州（113.27324，23.15792） 福州（119.27345，26.04769) 惠州(114.38257,23.08464)
                dispatch({ type:'user/setMap', payload:MapInfo });   
            })
        }
        window.handleProjectEntry = (id, name)=>{
            history.push({
                pathname:'/terminal_monitor',
                state:{
                    key:+id,
                    title:name,
                    type:'company'
                }
            })
        }
        return ()=>{
            if ( map && map.destroy ){
                map.destroy();
            }
            clearTimeout(timer);
            timer = null;
            clearTimeout(moveTimer);
            moveTimer = null;
            map = null;
            points = [];
            warningInfo = null;
            infoWindow = null;
            provinceList = [];
            polygonList = [];
            window.handleProjectEntry = null;
        }
    },[]);
    useEffect(()=>{
        if ( AMap ){
            if ( !map ){
                // 清除定位点
                map = new AMap.Map('my-map',{
                    resizeEnable:true,
                    // zoom:18,
                    // zoom 比例尺缩放级别   17.5-公司  11.12-区/镇  9.83-市 8.02-省 5.72-全国
                    viewMode:'3D',
                    // mapStyle: 'amap://styles/16612875d805eaf4ea70c9173129eb65',
                    mapStyle:'amap://styles/be84be2d3726a44041476b8929ccdf00',
                    // center:[company.lng, company.lat],
                    pitch:65,
                    showLabel:true,
                    features:['bg', 'road', 'building'],
                    // layers: [
                    //     new AMap.TileLayer(),
                    //     new AMap.Buildings({
                    //         zooms: [12, 20],
                    //         zIndex: 10,
                    //         opacity:1,
                    //         // heightFactor: 1//2倍于默认高度，3D下有效
                    //     })
                    // ],
                });
            }
            if ( points.length ) map.remove(points);
            function handleShowInfo(e){
                clearTimeout(timer);
                let target = e.target;
                let { lng, lat, company_name, company_id, totalMach, warningMach } = target._originOpts.extData;
                let pos = map.lngLatToContainer(new AMap.LngLat(lng, lat));
                setInfo({ x:pos.x, y:pos.y, company_name, company_id, totalMach, warningMach });
                timer = setTimeout(()=>{
                    setInfo({});
                },1000)                    
            }
            function handleHideInfo(e){
                clearTimeout(timer);
                timer = setTimeout(()=>{
                    setInfo({});
                },1000)
            }
            companyList.forEach(item=>{
                // 添加标记点
                if ( !provinceList.includes(item.province)) {
                    provinceList.push(item.province);
                }
                let marker = new AMap.Marker({
                    position:new AMap.LngLat(+item.lng, +item.lat),
                    title:'',
                    offset:new AMap.Pixel(-20, -20),
                    icon: item.combust_type === 5 ? arrowNormal2 : arrowNormal,
                    extData:{ province:item.province, city:item.city, area:item.area, lng:+item.lng, lat:+item.lat, company_name:item.company_name, company_id:item.company_id, totalMach:item.totalMach, warningMach:item.warningMach, combust_type:item.combust_type }
                });
                map.add(marker);
                points.push(marker);
                marker.on('mouseover', handleShowInfo);
            });
            // 将标记点所在的省份区分出来
            let allPromise = [];
            var opts = {
                subdistrict: 0,
                extensions: 'all',
                level: 'province'
            };
            //利用行政区查询获取边界构建Path路径
            AMap.plugin('AMap.DistrictSearch', function() {
                var district = new AMap.DistrictSearch(opts);
                provinceList.forEach(item=>{
                    let promise = new Promise((resolve, reject)=>{
                        district.search(item, function(status, result) {
                            var bounds = result.districtList[0].boundaries;  
                            bounds.province = item; 
                            bounds.type = 'province';                  
                            resolve(bounds);                         
                        })
                    })
                    allPromise.push(promise);
                })
            })
            Promise.all(allPromise).then(([...result])=>{
                result.forEach(bounds=>{
                    polygonList.push(new AMap.Polyline({
                        // 过滤掉一些小的离散点
                        path:bounds.filter(arr=>arr.length > 100),
                        // fillColor:'#23b9f8',
                        // fillOpacity:0.8,
                        strokeColor:'#23b9f8',
                        strokeWeight:2,
                        map:map,
                        province:bounds.province,
                        type:bounds.type
                    }))
                })
            })
            if ( msg.detail && msg.detail.length ){
                warningInfo = msg.detail[0];
                let marker = new AMap.Marker({
                    position:new AMap.LngLat(warningInfo.lng, warningInfo.lat),
                    title:'',
                    icon:arrowError,
                    offset:new AMap.Pixel(-20, -20),
                    // zIndex默认值100
                    zIndex:110,
                    extData:{ is_warning:true, province:warningInfo.province, city:warningInfo.city, area:warningInfo.area, lng:+warningInfo.lng, lat:+warningInfo.lat, company_name:warningInfo.company_name, company_id:warningInfo.company_id, totalMach:warningInfo.totalMach, warningMach:warningInfo.warningMach, combust_type:warningInfo.combust_type }
                });
                map.add(marker);
                points.push(marker);
                var content = `
                    <div class=${style['info-container-2']}>
                        <div class=${style['info-title']}>${ warningInfo.type_name }</div>
                        <div class=${style['info-content']}>
                            <div>
                                <span class=${style['sub-text']}>公司:</span>
                                <span class=${style['data']}>${warningInfo.company_name}</span>
                            </div>
                            <div>
                                <span class=${style['sub-text']}>地点:</span>
                                <span class=${style['data']}>${warningInfo.position_name || '--'}</span>
                            </div>
                            <div>
                                <span class=${style['sub-text']}>时间:</span>
                                <span class=${style['data']}>${warningInfo.date_time}</span>
                            </div>
                            <div>
                                <span class=${style['sub-text']}>设备:</span>
                                <span class=${style['data']}>${warningInfo.mach_name}</span>
                            </div>
                        </div>
                        
                        <div class=${style['info-result']}>${ ( warningInfo.warning_info || '--' ) + ' ' + ( warningInfo.warning_value || '--' )}</div>
                        <div style="text-align:center"><span class=${style['btn']} onclick="handleProjectEntry('${warningInfo.company_id}', '${warningInfo.company_name}')">进入项目</span></div>
                    </div>
                `;
                var position = new AMap.LngLat(warningInfo.lng, warningInfo.lat);
                infoWindow = new AMap.InfoWindow({
                    isCustom:true,
                    content,
                    offset: new AMap.Pixel(5,-50)
                });
                // console.log(infoWindow);
                infoWindow.open(map,position);
            
                moveTimer = setTimeout(()=>{
                    map.setCenter([warningInfo.lng, warningInfo.lat]);
                },1000) 
            } 
            map.setFitView();
        }
    },[msg, AMap]);
    useEffect(()=>{
        // 通过currentNode.type字段判断用户选择的节点
        if ( map && currentNode.type ) {
            // 清空旧的标记点
            if ( points.length ) {
                map.remove(points);
            }
            // 清空旧的PolygonList
            if ( polygonList.length ){
                map.remove(polygonList);
            }            
            let temp;
            // console.log(polygonList);
            let polygonData = [];
            // 更新告警信息框的状态
            // if ( warningInfo && infoWindow ){
                
            //     if ( (currentNode.type === 'company' && currentNode.key !== warningInfo.company_id) || ( currentNode.type === 'user' && ( warningInfo.combust_type !== userType )) ) {       
            //         console.log('a');
            //         infoWindow.close();
            //     } else {
            //         console.log('b');
            //         infoWindow.open(map, new AMap.LngLat(warningInfo.lng, warningInfo.lat))
            //     }
            // }
            if ( currentNode.key === 'zh' && currentNode.type === 'country' ) {
                temp = points;
                if ( warningInfo && infoWindow ) {
                    infoWindow.open(map, new AMap.LngLat(warningInfo.lng, warningInfo.lat))
                }
                polygonData = polygonList.filter(i=>i._opts.type === 'province' );
            } else {
                temp = points.filter(item=>{
                    let { is_warning, province, city, area, company_id, combust_type } = item._originOpts.extData;
                    // 告警信息  
                    if ( currentNode.type === 'province' ) {
                        return currentNode.key === province ;
                    } else if ( currentNode.type === 'city') {
                        return currentNode.key === city;
                    } else if ( currentNode.type === 'area' ) {
                        return currentNode.key === area;
                    } else if ( currentNode.type === 'company' ) {
                        return currentNode.key === company_id;
                    } else if ( currentNode.type === 'user' ) {
                        // 考虑告警信息窗的筛选
                        // type === 'user' 筛选企业/燃气公司/市局/家用终端
                        return combust_type === userType;
                    }
                }); 
                if ( warningInfo && infoWindow ){
                    infoWindow.close();
                }
            }   
            // 当切换树图省/市/区/时重置地图的层级和中心点         
            temp.forEach(item=>{
                map.add(item);
            });
            // 渲染当前选中区域图形
            var opts = {
                subdistrict: 0,
                extensions: 'all',
                level:'city'
            };
            if ( currentNode.type === 'province' ) {
                polygonData = polygonList.filter(i=>i._opts.province === currentNode.title );
                polygonData.forEach(polyline=>{
                    map.add(polyline);
                });
                map.setFitView();
            } else if ( currentNode.type === 'city' ) {
                //利用行政区查询获取边界构建Path路径
                if ( AMap.DistrictSearch ) {
                    let hasCityArea = polygonList.filter(i=>i._opts.province === currentNode.title )[0];
                    if ( !hasCityArea ) {
                        new AMap.DistrictSearch(opts).search(currentNode.title, function(status, result) {
                            var bounds = result.districtList[0].boundaries;                   
                            let polyline = new AMap.Polyline({
                                // 过滤掉一些小的离散点
                                path:bounds.filter(arr=>arr.length > 100),
                                // fillColor:'#23b9f8',
                                // fillOpacity:0.8,
                                strokeColor:'#23b9f8',
                                strokeWeight:2,
                                map:map,
                                province:currentNode.title,
                                type:'city'
                            });
                            polygonList.push(polyline);   
                            map.add(polyline);
                            map.setFitView();
                            return ;
                        })
                    } else {
                        polygonData = [hasCityArea];
                        polygonData.forEach(polyline=>{
                            map.add(polyline);
                        });
                        map.setFitView();
                    }
                } 
            } else {
                polygonData.forEach(polyline=>{
                    map.add(polyline);
                });
                map.setFitView();
            }                   
        }
    },[currentNode])
    return (
        <div style={{ height:'100%', width:'100%' }}>
            <div className={style['info-container']} style={{ display: Object.keys(info).length ? 'block' : 'none', top: ( info.y - 160 ) + 'px', left: ( info.x - 100 ) + 'px' }}>
                <div className={style['info-title']}>{info.company_name}</div>
                <div className={style['info-content']}>
                    <div>
                        <div style={{ color:'rgba(255,255,255,0.64)', fontSize:'0.8rem' }}>总设备数</div>
                        <div><span className={style['data']}>{ info.totalMach }</span><span className={style['unit']}>个</span></div>
                    </div>
                    <div>
                        <div style={{ color:'rgba(255,255,255,0.64)', fontSize:'0.8rem' }}>告警设备</div>
                        <div><span className={style['data']} style={{ color:'#f30d0d' }}>{ info.warningMach }</span><span className={style['unit']} style={{ color:'#f30d0d' }}>个</span></div>
                    </div>
                </div>
                <div style={{ textAlign:'center' }}><span className={style['btn']} onClick={()=>{ 
                    history.push({
                        pathname:'/terminal_monitor',
                        state:{
                            key:info.company_id,
                            title:info.company_name,
                            type:'company'
                        }
                    }) 
                }}>进入项目</span></div>
            </div>
            <div id='my-map' style={{ height:'100%' }}></div>
        </div>
    )
}
function areEqual(prevProps, nextProps){
    if ( prevProps.msg !== nextProps.msg || prevProps.AMap !== nextProps.AMap || prevProps.currentNode !== nextProps.currentNode ) {
        return false;
    } else {
        return true;
    }
}
export default React.memo(AgentMap, areEqual);