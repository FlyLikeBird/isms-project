import React from 'react';
import { Table, Button, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import style from '@/pages/IndexPage.css';

function TableContainer({ isDemo, dispatch, data, onSelect, currentPage, total }){
    let columns = [
            {
                title:'序号',
                width:'60px',
                render:(text,record,index)=>{
                    return `${ ( currentPage - 1) * 14 + index + 1}`;
                }
            },
            { title:'设备名', dataIndex:'meter_name' },
            { title:'设备类型', dataIndex:'model_desc'},
            { title:'注册码', dataIndex:'register_code'},
            
            { title:'所属公司', dataIndex:'company_name' },
            { title:'在线状态', dataIndex:'online_status', render:value=>(<span>{ value ? '在线' : '离线' }</span>)},
            { title:'上次维护时间', dataIndex:'last_maintain_date' },
            { title:'负责人', dataIndex:'link_name' },
            { title:'联系方式', dataIndex:'link_mobile'},
            {
                title:'操作',
                render:row=>(
                    isDemo 
                    ?
                    null
                    :
                    <div>
                        <Button size='small' type='primary' icon={<EditOutlined />} style={{ marginRight:'1rem' }} onClick={()=>{
                            onSelect({ visible:true, currentMach:row, forEdit:true });
                        }}>修改</Button>
                        <Popconfirm title='确定删除此设备吗?' okText='确定' cancelText='取消' onConfirm={()=>{
                            new Promise((resolve, reject)=>{
                                dispatch({ type:'gateway/delDeviceAsync', payload:{ resolve, reject, mach_id:row.mach_id }})
                            })
                            .then(()=>{
                                message.success(`删除${row.meter_name}成功`);
                            })
                            .catch(msg=>message.error(msg))
                        }}><Button size='small' type='primary' icon={<DeleteOutlined />} danger >删除</Button></Popconfirm>
                    </div>
                )
            }
        ];
    return (
        <Table
            className={style['self-table-container'] + ' ' + style['dark']}
            columns={columns}
            rowKey='mach_id'
            dataSource={data}
            pagination={{current:currentPage, total, pageSize:14, showSizeChanger:false }}
            onChange={(pagination)=>{
               
                dispatch({ type:'gateway/fetchDevices', payload:{ currentPage:pagination.current }});            
            }}
        />
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data  ){
        return false;
    } else {
        return true;
    }
}
export default React.memo(TableContainer, areEqual);