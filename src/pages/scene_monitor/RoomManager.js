import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Select, Button, Tree, Spin, Table, Radio, message } from 'antd';
import { HomeOutlined, UnorderedListOutlined, AppstoreOutlined,  LeftOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import RoomList from './RoomList';
import RoomDetail from './RoomDetail';
import RoomScene from './RoomScene';
import TableContainer from './TableContainer';
import Loading from '@/pages/components/Loading';
import XLSX from 'xlsx';
import { attrs, getBase64, downloadExcel, downloadPDF } from '@/pages/utils/array';
import style from './SceneMonitor.css';
import IndexStyle from '@/pages/IndexPage.css';

const { Option } = Select;

function RoomManager({ dispatch, user, fields, sceneMonitor }){
    let [finishLoading, setFinishLoading] = useState(false);
    let { currentAttr } = fields;
    let { sourceData, roomDetail, mode, layout, allBindMachs, isLoading, currentPage, total } = sceneMonitor;
    const [currentRoom, setCurrentRoom] = useState({});
    useEffect(()=>{
        dispatch({ type:'sceneMonitor/initRoom'});
        return ()=>{
            dispatch({ type:'sceneMonitor/reset'});
        }
    },[]);
    const handleDownload = ()=>{
        let container = document.getElementsByClassName(style['room-detail-container'])[0];
        if ( container ){
            getBase64(container)
            .then(base64Imgs=>{
                // 3224 1598
                let fileTitle = '区域监控详情';
                downloadPDF(fileTitle, base64Imgs);
                setFinishLoading(false);
            })
        } 
    };
    return (
        <div>
            {
                finishLoading 
                ?
                <div className={IndexStyle['mask']} onClick={e=>e.stopPropagation()}>
                    <div className={IndexStyle['content']}>
                        <div style={{ color:'#fff' }}>生成pdf文档中,请稍后...</div>
                        <Spin size='large' />
                    </div>
                </div>
                :
                null
            }
            {
                Object.keys(currentRoom).length
                ?
                <div style={{ height:'50px', color:'#fff', paddingRight:'1rem', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
                    <div>
                        <LeftOutlined style={{ color:'#04a9ff' }} />
                        <span style={{ color:'#04a9ff', cursor:'pointer', marginRight:'1rem' }} onClick={()=>{
                            setCurrentRoom({});
                            dispatch({ type:'sceneMonitor/resetDetail'});
                        }}>返回</span>
                        <span style={{ marginRight:'1rem' }}>{ currentAttr.title + '-' + currentRoom.attr_name  }</span>
                        <span className={style['sub-text']}>数据更新时间 : { currentRoom.record_time }</span>
                    </div>
                    <div><Button type='primary' onClick={()=>{
                        setFinishLoading(true);
                        handleDownload();
                    }}><FilePdfOutlined style={{ fontSize:'1.2rem' }} /></Button></div>
                </div>
                :
                <div style={{ height:'50px', color:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(255, 255, 255, 0.15)', marginBottom:'1rem' }}>
                    <div>
                        <Radio.Group className={IndexStyle['custom-radio']} value={mode} onChange={e=>{ 
                            dispatch({ type:'sceneMonitor/setMode', payload:e.target.value });
                            if ( e.target.value === 'scene') {
                                dispatch({ type:'sceneMonitor/fetchRoomScene'});
                                dispatch({ type:'sceneMonitor/fetchBindMachs'});
                            }
                        }}>
                            <Radio.Button value='list' key='list'><UnorderedListOutlined style={{ marginRight:'4px' }} />列表</Radio.Button>
                            <Radio.Button value='card' key='card'><AppstoreOutlined style={{ marginRight:'4px' }} />视图</Radio.Button>
                            <Radio.Button value='scene' key='scene'><HomeOutlined style={{ marginRight:'4px' }} />平面</Radio.Button>
                        </Radio.Group>
                    </div>
                    {
                        mode === 'list' || mode === 'card'
                        ?
                        <div><Button type='primary' onClick={()=>{
                            if ( sourceData.length ) {
                                let fileTitle = '监控区域列表';
                                var aoa = [], thead = [];
                                thead.push('序号');
                                thead.push('位置');
                                thead.push('设备状态');
                                thead.push('数据更新时间');
                                attrs.forEach(i=>thead.push(`${i.title}(${i.unit})`));
                                aoa.push(thead);
                                sourceData.forEach((item,index)=>{
                                    let temp = [];
                                    temp.push(index+1);
                                    temp.push(item.attr_name);
                                    temp.push(item.online_status ? '在线': '离线');
                                    temp.push(item.record_time);
                                    attrs.forEach(i=>{
                                        temp.push(item[i.key]);
                                    });
                                    aoa.push(temp);
                                })
                                var sheet = XLSX.utils.aoa_to_sheet(aoa);
                                sheet['!cols'] = thead.map(i=>({ wch:16 }));                            
                                downloadExcel(sheet, fileTitle + '.xlsx');
                            } else {
                                message.info('数据源为空')
                            }
                        }}><FileExcelOutlined /></Button></div>
                        :
                        null
                    }                    
                </div>
            }  
            <div className={style['card-container']} style={{ height:'calc( 100% - 50px)'}}>
                {
                    isLoading 
                    ?
                    <Loading />
                    :
                    null
                }
                {
                    Object.keys(currentRoom).length 
                    ?
                    <RoomDetail dispatch={dispatch} currentRoom={currentRoom} data={roomDetail} currentAttr={currentAttr} />
                    :
                    mode === 'list' 
                    ?
                    <TableContainer data={sourceData} currentPage={currentPage} total={total} />
                    :
                    mode === 'card'
                    ?
                    <RoomList data={sourceData} currentAttr={currentAttr} currentPage={currentPage} total={total} onSelected={room=>setCurrentRoom(room)} />
                    :
                    mode === 'scene' 
                    ?
                    Object.keys(layout).length
                    ?
                    <RoomScene dispatch={dispatch} layout={layout} allBindMachs={allBindMachs} currentAttr={currentAttr} screenWidth={user.containerWidth} />
                    :
                    null
                    :
                    null
                }
                
            </div>
        </div>
    )

}

export default connect(({ user, fields, sceneMonitor })=>({ user, fields, sceneMonitor }))(RoomManager);