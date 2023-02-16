import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'dva';
import { Tree, Spin, Menu, Input, message } from 'antd';
import style from '@/pages/IndexPage.css';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import RoomManager from './RoomManager';
const { Search } = Input;
let subMenuMaps = {
    'scene_monitor_room':RoomManager,
};

function SceneMonitor({ dispatch, user, sceneMonitor, fields }){
    let { treeLoading, fieldType, allFields, currentField, currentAttr, energyList, energyInfo, loaded } = fields;
    let fieldList = allFields[energyInfo.type_code] ? allFields[energyInfo.type_code].fieldList : [];
    let fieldAttrs = allFields[energyInfo.type_code] && allFields[energyInfo.type_code].fieldAttrs ? allFields[energyInfo.type_code].fieldAttrs[currentField.field_name] : [];
    let { currentMenu, userInfo } = user;
    let { roomDetail, mode } = sceneMonitor;
    const [subMenu, toggleSubMenu] = useState('');
    let inputRef = useRef();
    useEffect(()=>{
        if ( currentMenu.child && currentMenu.child.length ){
            toggleSubMenu(currentMenu.child[0]);
        }
    },[currentMenu]);
    
    let sidebar = (
        <div>
            <div className={style['card-container'] + ' ' + style['topRadius'] + ' ' + style['float-menu-container']}  style={{ padding:'0', height:'auto', paddingBottom:'10px' }}>
                <div className={style['card-title']} style={{ color:'#fff' }}>导航功能</div>
                <div className={style['card-content']} style={{ padding:'0' }}>
                    <Menu mode='inline' selectedKeys={[subMenu.menu_code]} onClick={e=>{
                        let temp = currentMenu.child.filter(i=>i.menu_code === e.key)[0];
                        toggleSubMenu(temp);
                    }}>
                        {
                            currentMenu.child && currentMenu.child.length 
                            ?
                            currentMenu.child.map((item,index)=>(
                                <Menu.Item key={item.menu_code}>{ item.menu_name }</Menu.Item>
                            ))
                            :
                            null
                        }
                    </Menu>
                </div>
            </div>
            {
                !Object.keys(roomDetail).length 
                ?
                <div className={style['card-container']} style={{ padding:'0', height:'auto', boxShadow:'none' }}>
                    <div className={style['card-title']}>区域选择</div>
                    <div className={style['card-content']}>

                        {
                            treeLoading
                            ?
                            <Spin className={style['spin']} />
                            :
                            <Tree
                                className={style['custom-tree']}
                                defaultExpandAll={true}
                                // expandedKeys={expandedKeys}
                                // onExpand={temp=>{
                                //     dispatch({ type:'fields/setExpandedKeys', payload:temp });
                                // }}
                                selectedKeys={[currentAttr.key ]}
                                treeData={fieldAttrs}
                                onSelect={(selectedKeys, {node})=>{ 
                                    dispatch({ type:'fields/toggleAttr', payload:node });  
                                    if ( mode === 'scene') {
                                        dispatch({ type:'sceneMonitor/fetchLayout'});
                                        dispatch({ type:'sceneMonitor/fetchBindMachs'});                                                                                              
                                    } else {
                                        dispatch({ type:'sceneMonitor/fetchRoomList'});                                                                                              
                                    }
                                }}
                            />
                        }
                    </div>
                </div>
                :
                null
            }              
        </div>
    
    ); 
    let Component = subMenuMaps[subMenu.menu_code] || (()=>null);
    let content = <Component menu={subMenu} type={subMenu.menu_code === 'mach_manager_clean' ? 2 : 1} />;
    return (
        <ColumnCollapse sidebar={sidebar} content={content} />
    )
   
}

export default connect(({ user, sceneMonitor, fields })=>({ user, sceneMonitor, fields }))(SceneMonitor);