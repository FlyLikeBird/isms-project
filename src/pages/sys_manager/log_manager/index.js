import React, { Component, useState, useEffect } from 'react';
import { connect } from 'dva';
import { Tabs, Table, Select } from 'antd';
import { EditOutlined, EllipsisOutlined, SettingOutlined, RadarChartOutlined, CloseOutlined } from '@ant-design/icons';
import style from '@/pages/IndexPage.css';
import Loading from '@/pages/components/Loading';
const { TabPane } = Tabs;
const { Option } = Select;

const SystemLog = ({dispatch, log, user, gateway }) => {
    const { logData, total, currentPage, isLoading } = log;
    const { companyList, currentCompany } = gateway;
    const { userInfo } = user;
    const [logType, toggleLogType] = useState('login');
    const columns = [
        {
            title:'序号',
            width:'60px',
            fixed:'left',
            render:(text,record,index)=>{
                return `${ ( currentPage - 1) * 12 + index + 1}`;
            }
        },
        {
            title:'日志类型',
            dataIndex:'log_type',
            render:(text)=>(
                <span>{ text === 1 ? '操作日志' : '登录日志'}</span>
            )
        },
        {
            title:'登录用户',
            dataIndex:'action_user'
        },
        {
            title:'登录IP',
            dataIndex:'ip',
        },
        // {
        //     title:'所属公司',
        //     dataIndex:'company_id',
        //     render:(text)=>{
        //         let filterCompany = companyList.filter(i=>i.company_id == text)[0];
        //         return <div>{ filterCompany ? filterCompany.company_name : '' }</div>
        //     }
        // },
        {
            title:'操作行为',
            dataIndex:'action_desc'
        },
        {
            title:'登录时间',
            dataIndex:'action_time'
        }
    ];
    useEffect(()=>{
        dispatch({ type:'log/initLog'});
        return ()=>{
            dispatch({ type:'log/reset'})
        }
    },[]);
    return (
        <div style={{ height:'100%', position:'relative' }}>
            {
                isLoading 
                ?
                <Loading />
                :
                null
            }
            <div className={style['card-container']}>
                <Tabs activeKey={logType} className={style['custom-tabs']} onChange={activeKey=>{
                    toggleLogType(activeKey);                 
                    dispatch({type:'log/fetchLog', payload:{ logType:activeKey }});
                }} tabBarExtraContent={{
                    left:(
                        userInfo.agent_id 
                        ?
                        <div>
                            <span>选择公司</span>
                            <Select className={style['custom-select']} value={currentCompany.key} style={{ width:'180px', margin:'0 1rem 0 4px' }} onChange={value=>{
                                dispatch({ type:'gateway/setCompany', payload:{ company_id:value }});
                                dispatch({ type:'log/fetchLog'});
                            }}>
                                {
                                    companyList.length 
                                    ?
                                    companyList.map((item,i)=>(
                                        <Option key={item.key} value={item.key}>{ item.title }</Option>
                                    ))
                                    :
                                    null
                                }
                            </Select>
                        </div>
                        :
                        null
                    )
                }  
                }>
                    <TabPane key='login' tab='登录日志'>
                        <Table
                            columns={columns}
                            dataSource={logData.logs || []}
                            className={style['self-table-container'] + ' ' + style['dark']}
                            style={{ padding:'1rem' }}
                            rowKey="log_id"
                            bordered={true}
                            pagination={{current:currentPage, total, pageSize:12, showSizeChanger:false }}
                            onChange={(pagination)=>{
                                dispatch({type:'log/fetchLog', payload:{ currentPage:pagination.current, logType }});                                
                            }}
                        />
                    </TabPane>
                    <TabPane key='action' tab='操作日志'>
                        <Table
                            columns={columns}
                            dataSource={logData.logs || []}
                            rowKey="log_id"
                            style={{ padding:'1rem' }}
                            className={style['self-table-container'] + ' ' + style['dark']}
                            bordered={true}
                            pagination={{current:currentPage, total, pageSize:12, showSizeChanger:false }}
                            onChange={(pagination)=>{
                                dispatch({type:'log/fetchLog', payload:{ currentPage:pagination.current, logType }});                                
                            }}
                        />
                    </TabPane>
                </Tabs>
            </div>
        </div>
    )
    
}

SystemLog.propTypes = {
};

export default connect(({ log, user, gateway })=>({ log, user, gateway }))(SystemLog);
