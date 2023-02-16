import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Form, Tabs, Table, Input, Select, Modal, Button, Upload, message } from 'antd';
import { PlusCircleFilled, DownloadOutlined, PlusOutlined, FileExcelOutlined } from '@ant-design/icons';
import TableContainer from './TableContainer';
import AddForm from './AddForm';
import IndexStyle from '@/pages/IndexPage.css';
import Loading from '@/pages/components/Loading';
import { downloadExcel } from '@/pages/utils/array';
import XLSX from 'xlsx';

const { TabPane } = Tabs;
const { Option } = Select;
let tabList = [{ tab:'洁净度探测器', key:'dust' }];
const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
};

function MachDetail({ dispatch, user, gateway, region }){
    let [info, setInfo] = useState({ visible:false, currentMach:null, forEdit:false });
    let [visible, setVisible] = useState(false);
    let [fileList, setFileList] = useState([]);
    let { AMap, currentCompany, userInfo, authorized } = user;
    let { managerList } = region;
    let { activeKey, deviceList, sceneType,  gatewayList, currentNode, companyList, gasCompanys, gatewayModelList, combustModelList, smokeModelList, isLoading, currentPage, total } = gateway;
    useEffect(()=>{
        if ( authorized ){
            dispatch({ type:'gateway/fetchDevices' });
        }
    },[authorized]);
    return (
        <div className={IndexStyle['card-container']} >
            {
                isLoading 
                ?
                <Loading />
                :
                null
            }
            <Tabs
                activeKey={activeKey}
                className={IndexStyle['custom-tabs'] + ' ' + IndexStyle['flex-tabs']}
                onChange={activeKey=>{
                    dispatch({ type:'gateway/setActiveKey', payload:activeKey });
                    if ( activeKey === 'gateway') {
                        dispatch({ type:'gateway/fetchGateway'});
                    } else {
                        dispatch({ type:'gateway/fetchDevices'});
                    }
                }}
                tabBarExtraContent={{
                    right:(
                        userInfo.is_demo 
                        ?
                        null
                        :
                        <div>
                            <Button type='primary' icon={<PlusCircleFilled />} style={{ marginRight:'0.5rem' }} onClick={()=>{
                                setInfo({ visible:true, currentMach:null, forEdit:null });
                            }}>添加设备</Button>
                            <Button type='primary' style={{ marginRight:'0.5rem' }} onClick={()=>{
                                let fileTitle = '洁净度探测器设备列表';
                                if ( deviceList.length ){
                                    var aoa = [], thead = [];
                                    thead.push('序号');
                                    thead.push('设备名');
                                    thead.push('设备类型');
                                    thead.push('注册码');
                                    thead.push('所属公司');
                                    thead.push('在线状态');
                                    thead.push('上次维护时间');
                                    thead.push('负责人');
                                    thead.push('联系方式');
                                    aoa.push(thead);
                                    
                                    deviceList.forEach((row, index)=>{
                                        let temp = [];
                                        temp.push(( currentPage - 1) * 14 + index + 1);
                                        temp.push(row.meter_name);
                                        temp.push(row.model_desc);
                                        temp.push(row.register_code);
                                        temp.push(row.company_name);
                                        temp.push(row.online_status ? '在线' : '离线');
                                        temp.push(row.last_maintain_date);
                                        temp.push(row.link_name);
                                        temp.push(row.link_mobile);
                                        aoa.push(temp);
                                    });
                                    var sheet = XLSX.utils.aoa_to_sheet(aoa);
                                    sheet['!cols'] = thead.map(i=>({ wch:16 }));
                                    downloadExcel(sheet, fileTitle + '.xlsx');
                                } else {
                                    message.info('数据源为空');
                                }
                                  
                            }}><FileExcelOutlined /></Button>
                            <Button onClick={()=>{
                                setVisible(true);
                            }}>导入设备</Button>
                        </div>
                    )
                }}
            >
                {
                    tabList.map((item,i)=>(
                        <TabPane tab={item.tab} key={item.key}><TableContainer isDemo={userInfo.is_demo} dispatch={dispatch} data={deviceList} currentPage={currentPage} total={total} onSelect={obj=>setInfo(obj)} /> </TabPane>
                    ))
                }
            </Tabs>
            <Modal
                visible={info.visible}
                title={<div>添加洁净度探测器</div>}
                footer={null}
                width={780}
                bodyStyle={{ padding:'40px'}}
                closable={false}
                className={IndexStyle['modal-container']}
                destroyOnClose={true}
                onCancel={()=>setInfo({ visible:false, forEdit:false })}
            >
                <AddForm 
                    info={info}
                    gasCompanys={gasCompanys}
                    gatewayList={gatewayList}
                    modelList={ activeKey === 'gateway' ? gatewayModelList : activeKey === 'combust' ? combustModelList : smokeModelList}
                    companyList={companyList}
                    managerList={managerList}
                    AMap={AMap}
                    isAgent={userInfo.agent_id ? true : false }
                    activeKey={activeKey}
                    onDispatch={action=>dispatch(action)}
                    onClose={()=>setInfo({ visible:false, forEdit:false, currentMach:null })}
                />
            </Modal>
            <Modal
                visible={visible}
                onCancel={()=>setVisible(false)}
                footer={null}
            >
                <Form {...layout}>
                    <Form.Item label="模板下载" name="download">
                        <a onClick={()=>dispatch({type:'gateway/export'})}>设备档案的Excel模板<DownloadOutlined /></a>
                    </Form.Item>
                    <Form.Item label="选择文件" name="upload">
                        <Upload 
                            fileList={fileList} 
                            onRemove={(file)=>{
                                let index = fileList.indexOf(file);
                                let newArr = fileList.slice();
                                newArr.splice(index,1);
                                setFileList(newArr);
                            }} 
                            beforeUpload={ file => {        
                                console.log(file);                 
                                let type = file.name.split('.')[1];
                                if ( type === 'xls' || type === 'xlsx' ){
                                    setFileList([...fileList, file]);
                                } else {
                                    message.error('请上传EXCEL格式文件');
                                }
                                return false;
                            }}
                        >
                            {
                                !fileList.length
                                ?
                                <Button>
                                    <PlusOutlined /> 上传
                                </Button>
                                :
                                null
                            }
                        </Upload>
                    </Form.Item>
                    <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 6 }}>
                        <Button type="primary" onClick={()=>{
                             if (!fileList.length){
                                 message.error('还没有上传EXCEL文件');
                             } else {
                                console.log(fileList[0]);
                                message.success('模板正在导入中,请稍后...');
                                new Promise((resolve, reject)=>{
                                    dispatch({type:'gateway/import', payload:{ resolve, reject, file:fileList[0]}});
                                })
                                .then(()=>{
                                    message.success('模板导入成功');
                                    setVisible(false);
                                })
                                .catch(msg=>message.error(msg))
                             }
                        }}>导入</Button>
                        <Button style={{margin:'0 10px'}} onClick={()=>setVisible(false)}>取消</Button>
                    </Form.Item>
               </Form>
            </Modal>
        </div>
    )
}

export default connect(({ user, gateway, region })=>({ user, gateway, region }))(MachDetail);