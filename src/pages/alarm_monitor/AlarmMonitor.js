import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'dva';
import { Tree, Spin, Input, Menu, message } from 'antd';
import { SearchOutlined, SyncOutlined } from '@ant-design/icons';
import style from '@/pages/IndexPage.css';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import AlarmList from './AlarmList';
import AlarmAnalyze from './AlarmAnalyze';
import AlarmSetting from './AlarmSetting';
const { Search } = Input;
let subMenuMaps = {
    'alarm_monitor_list':AlarmList,
    'alarm_monitor_analysis':AlarmAnalyze,
    'alarm_monitor_setting':AlarmSetting
};

function AlarmMonitor({ dispatch, user, fields  }){
    let { treeLoading, fieldType, allFields, currentField, currentAttr, energyList, energyInfo, loaded } = fields;
    let fieldList = allFields[energyInfo.type_code] ? allFields[energyInfo.type_code].fieldList : [];
    let fieldAttrs = allFields[energyInfo.type_code] && allFields[energyInfo.type_code].fieldAttrs ? allFields[energyInfo.type_code].fieldAttrs[currentField.field_name] : [];
    let { currentMenu, userInfo } = user;
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
                                if ( subMenu.menu_code === 'alarm_monitor_list') {
                                    dispatch({ type:'alarm/fetchAlarmList', payload:{ page:1, status:0, cateCode:0 }});
                                } else if ( subMenu.menu_code === 'alarm_monitor_analysis') {
                                    dispatch({ type:'alarm/fetchAlarmAnalyze'});
                                } else if ( subMenu.menu_code === 'alarm_monitor_setting') {
                                    dispatch({ type:'alarm/fetchRule'});
                                }                                                                                       
                            }}
                        />
                    }
                </div>
            </div>         
        </div>
    ); 
    let Component = subMenuMaps[subMenu.menu_code] || (()=>null);
    let content = <Component menu={subMenu} />;
    return (
        <ColumnCollapse sidebar={sidebar} content={content} />
    )
   
}

export default connect(({ user, fields })=>({ user, fields }))(AlarmMonitor);