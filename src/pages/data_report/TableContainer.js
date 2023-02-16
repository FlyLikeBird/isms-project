import React from 'react';
import { Table } from 'antd';
import { attrs } from '@/pages/utils/array';
import style from '@/pages/IndexPage.css';

function TableContainer({ data, columns, total, currentPage, containerWidth }){
    return (
        <Table
            columns={columns}
            dataSource={data}
            rowKey='attr_id'
            className={style['self-table-container'] + ' ' + style['dark'] + ' ' + style['no-space'] }
            onChange={(pagination)=>{
                setCurrentPage(pagination.current);
            }}
            pagination={false}
            scroll={ containerWidth <= 1440 ? { x:1400, y:540 } : { x:1400, y:640 }}
        />
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.containerWidth !== nextProps.containerWidth ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(TableContainer, areEqual);