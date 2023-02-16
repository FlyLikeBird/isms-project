import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Row, Col, Table, Button, Card, Modal, Select, Spin, Switch, message, Popconfirm, Form, Input } from 'antd';
import { FireOutlined, DownloadOutlined, DoubleLeftOutlined, DoubleRightOutlined, PlusOutlined } from '@ant-design/icons'
import RuleForm from './RuleForm';
import TplForm from './TplForm';
import Loading from '@/pages/components/Loading';
import style from '@/pages/IndexPage.css';
import { attrs } from '@/pages/utils/array';

const { Option } = Select;

function AlarmSetting({ dispatch, user, alarm, fields, menu }){
    let { companyList, currentCompany } = user;
    let { ruleList, ruleType, ruleTpls, isLoading, ruleMachs } = alarm;
    let [visibleInfo, setVisible] = useState({ visible:false, currentRule:null, forEdit:false });
    let [tplInfo, setTplInfo] = useState({ visible:false, currentTpl:null, forEdit:false });
    let { fieldType, allFields, energyList, energyInfo, loaded } = fields;
    let fieldList = allFields[energyInfo.type_code] ? allFields[energyInfo.type_code].fieldList : [];
    let fieldAttrs = allFields[energyInfo.type_code] && allFields[energyInfo.type_code].fieldAttrs ? allFields[energyInfo.type_code].fieldAttrs[fieldList[0].field_name] : [];
    useEffect(()=>{
        dispatch({ type:'alarm/initAlarmSetting'});
        return ()=>{
           
        }
    },[]);
    let btnMaps = {};
    if ( menu.child && menu.child.length ){
        menu.child.forEach(item=>{
            btnMaps[item.menu_code] = true;
        })
    }
    const columns = [
        {
            title:'序号',
            width:'60px',
            fixed:'left',
            render:(text,record,index)=>{
                return index + 1;
                // return `${ ( pageNum - 1) * pagesize + index + 1}`;
            }
        },
        { title:'策略名称', dataIndex:'name' }, 
        // { title:'所属公司', dataIndex:'company_name' },
        ...attrs.map(attr=>({ title:`${attr.title}(${attr.unit})`, dataIndex:attr.key })),
        {
            title:'操作',
            render:(row)=>{
                return (
                    <div>
                        {
                            true
                            // btnMaps['sw_warning_rule_edit']
                            ?
                            <a onClick={()=>{
                                setVisible({ visible:true, currentRule:row, forEdit:true });
                            }}>修改</a>
                            :
                            null
                        }
                        {
                            true
                            // btnMaps['sw_warning_rule_del']
                            ?
                            <Popconfirm title="确定删除此条规则吗?" onText="确定" cancelText="取消" onConfirm={()=> dispatch({type:'alarm/deleteRule', payload:row.rule_id })}><a style={{margin:'0 10px'}}>删除</a></Popconfirm>
                            :
                            null
                        }

                    </div>
                )
            }
        }
    ];
    return (
            <div style={{ height:'100%' }}>
                {
                    isLoading
                    ?
                    <Loading />
                    :
                    null
                }
                <div className={style['card-container']}>
                    <div style={{ padding:'1rem'}}>
                        <Button type='primary'  onClick={()=>setTplInfo({ visible:true, forEdit:false })} style={{ marginRight:'0.5rem' }}>添加模板</Button>
                        <Button type="primary"  onClick={() => setVisible({ visible:true, forEdit:false }) }>添加告警规则</Button>                
                    </div>
                    {/* {
                        btnMaps['sw_warning_rule_add']
                        ?
                        <div style={{ padding:'1rem'}}>
                            <Button type="primary"  onClick={() => setVisible({ visible:true, forEdit:false }) }>添加告警规则</Button>                
                        </div>
                        :
                        null
                    } */}
                    
                    <Table
                        className={style['self-table-container'] + ' ' + style['dark'] }
                        columns={columns}
                        dataSource={ruleList}
                        locale={{emptyText:'还没有设置规则'}}
                        bordered={true}
                        rowKey="rule_id"
                        pagination={false}
                        // onChange={pagination=>{
                        //     dispatch({ type:'alarm/setPageNum', payload:pagination.current });
                        //     dispatch({ type:'alarm/fetchRecordList', payload:{ cate_code:activeKey, keywords:value }} )
                        // }}
                    />
                    <Modal
                        visible={visibleInfo.visible}
                        footer={null}
                        width="40%"
                        destroyOnClose={true}
                        bodyStyle={{ padding:'40px'}}
                        closable={false}
                        onCancel={()=>setVisible({ visible:false, forEdit:false })}
                    >
                        <RuleForm 
                            dispatch={dispatch}
                            visibleInfo={visibleInfo} 
                            fieldAttrs={fieldAttrs}
                            ruleTpls={ruleTpls}
                            onClose={()=>setVisible({ visible:false, forEdit:false })} 
                        />
                    </Modal>
                    <Modal
                        visible={tplInfo.visible}
                        footer={null}
                        width="40%"
                        destroyOnClose={true}
                        bodyStyle={{ padding:'40px'}}
                        closable={false}
                        onCancel={()=>setTplInfo({ visible:false, forEdit:false })}
                    >
                        <TplForm
                            dispatch={dispatch}
                            visibleInfo={tplInfo} 
                            ruleTpls={ruleTpls}
                            onClose={()=>setTplInfo({ visible:false, forEdit:false })} 
                        />
                    </Modal>
                </div>
            </div>    
             
    )
};

AlarmSetting.propTypes = {
};

export default connect( ({ user, alarm, fields, }) => ({ user, alarm, fields }))(AlarmSetting);