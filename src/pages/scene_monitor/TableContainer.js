import React from 'react';
import { Table, Pagination } from 'antd';
import style from './SceneMonitor.css';
import IndexStyle from '@/pages/IndexPage.css';
import { attrs } from '@/pages/utils/array';

function TableContainer({ data, total, currentPage }){
    let columns = [
        {
            title:'序号',
            width:'60px',
            render:(text,record,index)=>{
                return `${ ( currentPage - 1) * 12 + index + 1}`;
            }
        },
        { title:'位置', dataIndex:'attr_name' },
        { title:'设备状态', dataIndex:'online_status', render:value=>(<span className={value ? IndexStyle['tag-on'] : IndexStyle['tag-off']}>{ value ? '在线' : '离线' }</span>)},
        { title:'数据更新时间', dataIndex:'record_time' },
        ...attrs.map(attr=>({
            title:`${attr.title}(${attr.unit})`,
            dataIndex:attr.key,
            render:( value, row)=>(<span style={{ color:Number(row.warning[attr.key]) && value >= row.warning[attr.key]  ? 'red' : '#fff'  }}>{ value }</span>)
        }))
    ];
    return (
        <div className={IndexStyle['card-container']}>
            <div className={style['inline-container']}>
                <div className={style['inline-content']}>
                    <Table
                        className={IndexStyle['self-table-container'] + ' ' + style['dark']}
                        columns={columns}
                        rowKey='attr_id'
                        dataSource={data}
                        pagination={false}
                        onChange={(pagination)=>{
                            dispatch({ type:'alarm/fetchAlarmList', payload:{ status, cateCode, page:pagination.current }})
                        }}
                    />
                </div>
                <div className={style['inline-footer']}>
                    <Pagination className={IndexStyle['custom-pagination']} total={total} current={currentPage} />
                </div>
            </div>
        </div>
        
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data  ) {
        return false;
    } else {
        return true;
    }
}
export default React.memo(TableContainer, areEqual);