import React, { useEffect  } from 'react';
import { connect } from 'dva';
import { Table, message, Spin, Skeleton, Select, Button, DatePicker } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import TableContainer from './TableContainer';
import Loading from '@/pages/components/Loading';
import style from '@/pages/IndexPage.css';
import XLSX from 'xlsx';
import { attrs, downloadExcel } from '@/pages/utils/array';
const { Option } = Select;

function RunningReport({ dispatch, user, dataReport }){
    let { startDate, endDate, timeType } = user;
    const { reportInfo, tableData, columns, currentPage, total, layout, isLoading } = dataReport;
    useEffect(()=>{
        dispatch({ type:'dataReport/initRunningReport'});
    },[]);
    
    return (
        <div style={{ height:'100%'}}>
            {
                isLoading 
                ?
                <Loading />
                :
                null
            }
            <div style={{ height: '40px', display:'flex', justifyContent:'space-between' }}>          
                <div style={{ display:'flex' }}>
                    <CustomDatePicker onDispatch={()=>{
                        dispatch({ type:'dataReport/fetchRunningReport'});
                    }} />
                    <Select className={style['custom-select']} value={layout} style={{ marginTop:'2px', marginLeft:'1rem', width:'140px' }} onChange={value=>{
                        dispatch({ type:'dataReport/setLayout', payload:{ layout:value }});
                    }}>
                        <Option key='horizon' value='horizon'>按横向排列</Option>
                        <Option key='vertical' value='vertical'>按纵向排列</Option>
                    </Select>
                </div>                 
                <Button type='primary' onClick={()=>{
                    if ( !tableData.length ){
                        message.info('数据源为空');
                        return ;
                    } else {
                        
                        let fileTitle = 
                            timeType === '1' 
                            ?
                            `${startDate.format('YYYY-MM-DD')}日运行报表`
                            :
                            `${startDate.format('YYYY-MM-DD')}至${endDate.format('YYYY-MM-DD')}${timeType === '2' ? '月' : '年'}运行报表`
                        var aoa = [], thead1 = [], thead2 = [];
                        if ( layout === 'horizon' ) {
                            columns.forEach((col,index)=>{                         
                                if ( col.children && col.children.length ){                              
                                    thead1.push(col.title);
                                    col.children.forEach((item,index)=>{
                                        thead2.push(item.title);
                                        if ( index === 0 ) return;                                     
                                        thead1.push(null);
                                    })  
                                } else {
                                    thead1.push(col.title);
                                    thead2.push(null);
                                }
                            });
                            aoa.push(thead1);
                            aoa.push(thead2);
                            tableData.forEach((row,i)=>{
                                let temp = [];
                                temp.push(i + 1);
                                temp.push(row.attr_name);
                                reportInfo.date.forEach((date,j)=>{
                                    attrs.forEach(attr=>{
                                        temp.push(row.view[j][attr.key]);
                                    })
                                });
                                aoa.push(temp);
                            })
                        }
                        if ( layout === 'vertical') {
                            columns.forEach(col=>{
                                thead1.push(col.title);
                            });
                            aoa.push(thead1);
                            tableData.forEach((row, i)=>{                             
                                attrs.forEach((attr,j)=>{
                                    let temp = [];
                                    if ( j === 0 ){
                                        temp.push( i + 1);
                                        temp.push(row.attr_name);
                                    } else {
                                        temp.push(null);
                                        temp.push(null);
                                    }
                                    temp.push(`${attr.title}(${attr.unit})`);
                                    reportInfo.date.forEach((date, k)=>{
                                        temp.push(`${row.view[k][attr.key]}`);
                                    })
                                    aoa.push(temp);
                                })
                            })
                        }
                        
                        
                        // let isMultiThead = thead2.filter(i=>i).length ? true : false;
                        // aoa.push(thead1);
                        // if ( isMultiThead ){
                        //     aoa.push(thead2);
                        // }
                        // if ( layout === 'horizon') {
                        //     data.forEach((attr,index)=>{
                        //         let temp = [];
                        //         if ( layout === 'horizon' ) {
                        //             temp.push(index + 1);
                        //         }
                        //         temp.push(attr.device_name);
                        //         attr.view.forEach(item=>{
                        //             category.forEach(obj=>{
                        //                 temp.push(item[obj.type] || '-- --');
                        //             })
                        //         });
                        //         aoa.push(temp);
                        //     });
                        // } else {
                        //     data.forEach((attr,index)=>{
                        //         if ( attr.category && attr.category.length ){           
                        //             attr.category.forEach((obj, j)=>{
                        //                 let temp = [];
                        //                 if ( j === 0 ){
                        //                     temp.push(attr.time);
                        //                 } else {
                        //                     temp.push(null);
                        //                 }
                        //                 temp.push(obj.title);
                        //                 if ( attr.diffMaps ){
                        //                     // 兼容节能核算表的数据结构
                        //                     attr.view.forEach(sub=>{
                        //                         attr.diffMaps.forEach(diff=>{
                        //                             temp.push(sub[diff.fields[j]] || '-- --')
                        //                         })
                        //                     })
                        //                 } else {
                        //                     attr.view.forEach(sub=>{
                        //                         temp.push(sub[obj.type] || '-- --');
                        //                     });
                        //                 }
                                        
                        //                 aoa.push(temp);                                        
                        //             })
                        //         }
                        //     });
                        // }                         
                        var sheet = XLSX.utils.aoa_to_sheet(aoa);
                        // 合并表格表头的格式
                        let merges = [];
                        if ( layout === 'horizon' ) {
                            merges.push({
                                s:{ r:0, c:0 },
                                e:{ r:1, c:0 }
                            });
                            merges.push({
                                s:{ r:0, c:1 },
                                e:{ r:1, c:1 }
                            });
                            reportInfo.date.forEach((item,index)=>{
                                merges.push({
                                    s:{ r:0, c: index * attrs.length + 2 },
                                    e:{ r:0, c: index * attrs.length + 2 + attrs.length - 1 }
                                })                              
                            });
                        }
                        // if ( layout === 'vertical' ) {
                        //     tableData.forEach((item,index)=>{
                        //         merges.push({
                        //             s:{ r:( index * attrs.length ) + 1, c:0 },
                        //             e:{ r: ( index * attrs.length ) + attrs.length , c:0 }
                        //         });
                        //     })
                        // }
                        if ( layout === 'horizon' ){
                            sheet['!cols'] = thead2.map(i=>({ wch:16 }));
                        } else {
                            sheet['!cols'] = thead1.map(i=>({ wch:16 }));
                        }
                        sheet['!merges'] = merges;
                        downloadExcel(sheet, fileTitle + '.xlsx');
                    }
                }}><FileExcelOutlined style={{ fontSize:'1.2rem' }} /></Button>
            </div>
            <div className={style['card-container']} style={{ height: 'calc( 100% - 40px)', borderRadius:'4px', overflow:'hidden' }}>         
                {
                    Object.keys(reportInfo).length 
                    ?
                    <TableContainer data={tableData} columns={columns} total={total} currentPage={currentPage} containerWidth={user.containerWidth} />
                    :
                    <Skeleton active className={style['skeleton']} />
                }
            </div>
        </div>
    )
}

export default connect(({ user, dataReport })=>({ user, dataReport }))(RunningReport)