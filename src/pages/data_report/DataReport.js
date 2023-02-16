import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'dva';
import { Tree, Spin, Menu, Input, message } from 'antd';
import style from '@/pages/IndexPage.css';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import RunningReport from './RunningReport';

const { Search } = Input;
let subMenuMaps = {
    'data_report_running':RunningReport,
};

function DataReport({ dispatch, user, fields }){
    let { currentMenu, userInfo } = user;
    let { treeLoading, fieldType, allFields, currentField, currentAttr, energyList, energyInfo, loaded } = fields;
    let fieldList = allFields[energyInfo.type_code] ? allFields[energyInfo.type_code].fieldList : [];
    let fieldAttrs = allFields[energyInfo.type_code] && allFields[energyInfo.type_code].fieldAttrs ? allFields[energyInfo.type_code].fieldAttrs[currentField.field_name] : [];
    const [subMenu, toggleSubMenu] = useState('');
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
                                dispatch({ type:'dataReport/fetchRunningReport'});                                                                                              
                            }}
                        />
                    }
                </div>
            </div>       
        </div>
    
    ); 
    let Component = subMenuMaps[subMenu.menu_code] || (()=>null);
    let content = <Component menu={subMenu} type={subMenu.menu_code === 'mach_manager_clean' ? 2 : 1} />;
    useEffect(()=>{
        return ()=>{
            dispatch({ type:'dataReport/reset'});
        }
    },[])
    return (
        <ColumnCollapse sidebar={sidebar} content={content} />
    )
   
}

export default connect(({ user, fields })=>({ user, fields }))(DataReport);