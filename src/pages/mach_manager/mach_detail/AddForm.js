import React, { useState, useEffect } from 'react';
import { Form, Select, Input, Button, message, DatePicker, Upload } from 'antd';
import { InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';
import style from '../MachManager.css';
import IndexStyle from '@/pages/IndexPage.css';
import AMapLoader from '@amap/amap-jsapi-loader';
import ContactManagerForm from '@/pages/sys_manager/contact_manager/AddForm';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';

const { Option } = Select;
const { Search } = Input;

const mobileReg = /^1[3-9]\d{9}$/;
function validator(a,value){
    if ( value && mobileReg.test(value+'') ) {
        return Promise.resolve();
    } else {
        return Promise.reject('请填入合法的号码');
    }
}

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}
const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
};
function AddForm({ info, gatewayList, isAgent, modelList, managerList, companyList, gasCompanys, onDispatch, onClose }){

    const [form] = Form.useForm();
    let [fileList, setFileList] = useState([]);
    let [previewInfo, setPreviewInfo] = useState({});
    const handleChange = ( { fileList })=>{
        setFileList(fileList);
    };
    const handlePreview = (file)=>{
        // file.thumbUrl 默认编译成200*200像素的64位字符串, 用FileReader重新解析
        
        if ( !file.preview ) {
            getBase64(file.originFileObj)
                .then(data=>{
                    file.preview = data;
                    setPreviewInfo({
                        visible:true,
                        img:data,
                        title:file.name
                    });
                })
        } else {
            setPreviewInfo({
                visible:true,
                img:file.preview,
                title:file.name
            })
        }
    };
    const handleBeforeUpload = (file)=>{
        const isJPG = file.type === 'image/jpeg';
        const isJPEG = file.type === 'image/jpeg';
        const isGIF = file.type === 'image/gif';
        const isPNG = file.type === 'image/png';
        if (!(isJPG || isJPEG || isGIF || isPNG)) {
            message.error('只能上传JPG 、JPEG 、GIF、 PNG格式的图片')
        }
        const isLt2M = file.size / 1024 / 1024 < 5;
        if (!isLt2M) {
            message.error('图片不能超过1M');
        }
        return false;
    };
    const uploadButton = (
        <div>
          <PlusOutlined />
          <div className="ant-upload-text">上传图片</div>
        </div>
    );  
    useEffect(()=>{        
        
        return ()=>{      
            form.resetFields();
        }
    },[]);
   
    useEffect(()=>{
        form.setFieldsValue({
            meter_name : info.forEdit ? info.currentMach.meter_name : null,
            register_code: info.forEdit ? info.currentMach.register_code : null,
            last_maintain_date:info.forEdit ? moment(info.currentMach.last_maintain_date) : null,
            link_name:info.forEdit ? info.currentMach.link_name : null,
            link_mobile:info.forEdit ? info.currentMach.link_mobile : null,
        });
        if ( info.forEdit ){
            if ( info.currentMach.link_img ) {
                setFileList([
                    {
                        uid: '-1',
                        name: 'image.png',
                        status: 'done',
                        preview: 'http://' + window.g.apiHost + info.currentMach.link_img,
                        url:'http://' + window.g.apiHost + info.currentMach.link_img,
                    }
                ])
            } else {
                setFileList([]);
            }
        }
        
    },[info]);

    return (
        <div>
            <Form
                {...layout} 
                name="add-form"
                className={style['form-container']}
                form={form}
                onFinish={values=>{
                    // console.log(values);
                    if ( values.link_img && values.link_img.file ) {
                        values.link_img = values.link_img.file;
                    }
                    if ( values.last_maintain_date ) {
                        values.last_maintain_date = values.last_maintain_date.format('YYYY-MM-DD');
                    }
                    if ( info.forEdit ) {
                        values.mach_id = info.currentMach.mach_id;
                    }
                    new Promise((resolve,reject)=>{
                        onDispatch({ type:'gateway/addDeviceAsync' , payload:{ values, resolve, reject, forEdit:info.forEdit }});                      
                    })
                    .then(()=>{
                        onClose();
                        message.success(`${info.forEdit ? '修改' : '添加'}洁净度探测器成功`);
                    })
                    .catch(msg=>{
                        message.error(msg);
                    })
                }}
            >
                {/* {
                    forDevice 
                    ?
                    <Form.Item name='gateway_id' label='选择主机' rules={[{ required:true, message:'请选择主机类型'}]}>
                        {
                            
                            <Select>
                                {
                                    gatewayList.concat({ mach_id:0, meter_name:'独立式探头' }).map((item,index)=>(
                                        <Option key={item.mach_id} value={item.mach_id}>{ item.meter_name }</Option>
                                    ))
                                }
                            </Select>
                        }
                    </Form.Item>
                    :
                    null
                }          */}
                {/* <Form.Item label={  activeKey === 'gateway' ? '选择主机型号' : activeKey === 'combust' ? '可燃气体探测器' : '烟感探测器' } shouldUpdate={(prevValues, currentValues) => {
                    return prevValues.gateway_id !== currentValues.gateway_id;
                }}>                     
                    {({ getFieldValue }) => { 
                        let gatewayId = getFieldValue('gateway_id');
                        let modelList = !forDevice ? gatewayModelList : gatewayId === 0 ? networkModelList : deviceModelList;   
                        return (   
                            <div style={{ display:'flex', flexWrap:'wrap' }}>
                                {
                                    modelList && modelList.length 
                                    ?
                                    modelList.map((item,i)=>(
                                        <div key={item.model_code} style={{ width:'33.3%', padding:'0 6px 6px 0'  }} onClick={()=>{
                                            setCurrentModel(item.model_code);
                                        }}>
                                            <div style={{ padding:'0 1rem 1rem 1rem', position:'relative', backgroundColor:'rgba(255, 255, 255, 0.1)', textAlign:'center', width:'100%', borderWidth:'1px', borderStyle:'solid', borderColor:item.model_code === currentModel ? '#1890ff' : 'transparent', cursor:'pointer', borderRadius:'6px' }}>
                                                <img src={item.img_path} style={{ height:'180px' }} />
                                                <span style={{ position:'absolute', left:'50%', bottom:'0', color:'rgb(24 144 255)', fontWeight:'bold', transform:'translateX(-50%)', whiteSpace:'nowrap' }}>{ item.model_desc }</span>
                                            </div>
                                        </div>
                                    ))
                                    :
                                    null
                                }
                            </div> 
                        )
                        
                    }}                    
                </Form.Item>                                  */}
                {/* <Form.Item label={activeKey === 'gateway' ? '选择主机型号' : activeKey === 'combust' ? '可燃气体探测器' : '烟感探测器'}>
                    <div style={{ display:'flex', flexWrap:'wrap' }}>
                        {
                            modelList && modelList.length 
                            ?
                            modelList.map((item,i)=>(
                                <div key={item.model_code} style={{ width:'33.3%', padding:'0 6px 6px 0'  }} onClick={()=>{
                                    setCurrentModel(item.model_code);
                                }}>
                                    <div style={{ 
                                        padding:'0 1rem 1rem 1rem', 
                                        position:'relative', 
                                        backgroundColor:'rgba(255, 255, 255, 0.1)', 
                                        textAlign:'center', 
                                        width:'100%', 
                                        borderWidth:'1px', 
                                        borderStyle:'solid', 
                                        borderColor:item.model_code === currentModel ? '#1890ff' : 'transparent', 
                                        cursor:'pointer', 
                                        borderRadius:'6px' 
                                    }}>
                                        <img src={item.img_path} style={{ height:'180px', transform:+item.model_code === 73 || +item.model_code === 82 ? 'translateX(-20%)' : 'none' }} />
                                        <span style={{ position:'absolute', left:'50%', bottom:'0', color:'rgb(24 144 255)', fontWeight:'bold', transform:'translateX(-50%)', whiteSpace:'nowrap' }}>{ item.model_desc }</span>
                                    </div>
                                </div>
                            ))
                            :
                            null
                        }
                    </div> 
                </Form.Item> */}
               
                <Form.Item name='meter_name' label='设备名称' rules={[{ required:true, message:'设备名称不能为空'}]}>
                    <Input />
                </Form.Item>
                
                <Form.Item name='register_code' label='注册码' rules={[ { required:true, message:'注册码不能为空' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name='last_maintain_date' label='上次维护时间' rules={[ { required:true, message:'字段不能为空' }]}>
                    <DatePicker locale={zhCN} />
                </Form.Item>
                {/* {
                    isAgent && !info.forEdit
                    ?
                    <Form.Item name='company_id' label='选择公司' rules={[{ required:true, message:'请选择归属公司'}]}>
                        {
                            companyList.length  
                            ?
                            <Select>
                                {
                                    companyList.map((item)=>(
                                        <Option key={item.key} value={item.key}>{ item.title }</Option>
                                    ))
                                }
                            </Select>
                            :
                            null
                        }
                    </Form.Item>
                    :
                    null
                }                 */}
                       
                <Form.Item name='link_name' label='负责人姓名' rules={[ { required:true, message:'联系人不能为空' }]}>
                    <Input />
                </Form.Item>   
                <Form.Item name='link_mobile' label='联系方式' rules={[ { validateTrigger:['onBlur'], required:true, pattern:mobileReg, message:'请输入合法的号码' }]}>
                    <Input />
                </Form.Item>    
                <Form.Item name='link_img' label='负责人头像'>
                    <Upload
                        className={style['custom-upload']}
                        style={{ padding:'1rem 2rem' }}
                        listType="picture-card"
                        fileList={fileList}
                        onChange={handleChange}
                        onPreview={handlePreview}
                        beforeUpload={handleBeforeUpload}
                        
                    >
                        {
                            fileList.length === 1 ? null : uploadButton
                        }
                    </Upload>
                </Form.Item>                 
                <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 6 }}>
                    <Button type="primary" ghost style={{ marginRight:'1rem' }} onClick={()=>{
                        form.resetFields();
                        onClose();
                    }}> 取消 </Button>
                    <Button type="primary" htmlType="submit">确认{ info.forEdit ? '修改' : '添加'} </Button>            
                </Form.Item>
            </Form>
            
        </div>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.info !== nextProps.info || prevProps.AMap !== nextProps.AMap || prevProps.managerList !== nextProps.managerList ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(AddForm, areEqual);