import React, { useState, useEffect } from 'react';
import { Form, Tabs, Input, Upload, Radio, message, Button, Modal, Select, Timeline } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import style from './AlarmForm.css';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function validator(a,value){
    if ( !value ) {
        return Promise.reject('该字段不能为空');
    } else {
        return Promise.resolve();
    }
}
const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
};
function AlarmForm({ dispatch, info, status, cateCode, historyLog, progressLog, logTypes, onClose, onDispatch }){
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const [previewInfo, setPreviewInfo] = useState({});
    useEffect(()=>{
        // form.setFieldsValue({
        //     'type_name':data.type_name,
        //     'executor_name':data.executor_name,
        //     'warning_info':data.warning_info,
        //     'warning_value':data.warning_value,
        //     'satisfied': data.satisfied
        // })
    },[]);
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
            message.error('图片不能超过5M');
        }
        return false;
    };
    const uploadButton = (
        <div>
          <PlusOutlined />
          <div className="ant-upload-text">上传图片</div>
        </div>
    );
    return (
        <div>
            <Tabs defaultActiveKey='1'>
                {/* 处理进度 */}
                <TabPane tab='处理进度' key='1'>
                    <Timeline mode='left' className={style['custom-timeline']}>                  
                        {
                            progressLog && progressLog.length
                            ?
                            progressLog.map((item,index)=>(
                                <Timeline.Item label={item.log_date} key={index}>
                                    <div className={style['progress-container']}>
                                        <div className={style['progress-title']}>{ item.action_user_name + ( item.log_type_name ? '-' : '' ) + ( item.log_type_name || '' ) }</div>
                                        <div className={style['progress-content']}>
                                            {/* <div>{ item.log_desc }</div> */}
                                            <div>{ item.warning_desc }</div>
                                            {
                                                item.photo.length 
                                                ?
                                                <div className={style['img-container']}>
                                                    {
                                                        item.photo.map(img=>(
                                                            <div className={style['img-wrapper']} style={{ backgroundImage:`url(${img})`}}></div>
                                                        ))
                                                    }                                                    
                                                </div>
                                                :
                                                null
                                            }
                                        </div>
                                    </div>
                                </Timeline.Item>
                            ))
                            :
                            null
                        }
                    </Timeline> 
                    {   
                        info.action_code === 'view' 
                        ?
                        null 
                        :
                        <Form
                            { ...layout }
                            form={form}
                            onFinish={values=>{
                                new Promise((resolve,reject)=>{            
                                    values.record_id = info.current.record_id;
                                    values.oper_code = info.action_code;
                                    values.action_type = '2';
                                    if ( values.photos ){
                                        values.photos = values.photos.fileList.map(item=>item.originFileObj);
                                    } else {
                                        values.photos = [];
                                    }
                                    onDispatch({type:'alarm/confirmRecord', payload:{ resolve, reject, values, company_id:info.current.company_id, cateCode, status }}); 
                                })
                                .then(()=>onClose())
                                .catch(msg=>{
                                    message.error(msg);

                                }) 
                            }}
                        >
                            {
                                info.action_code === '2'
                                ?
                                <Form.Item label='跟进类型:' name='type_id' rules={[{ validator }]}>
                                    <Select>
                                        {
                                            logTypes.length 
                                            ?
                                            logTypes.map(item=>(
                                                <Option key={item.type_id}>{ item.type_name }</Option>
                                            ))
                                            :
                                            null
                                        }
                                    </Select>
                                </Form.Item>
                                :
                                null
                            }                        
                            <Form.Item label='消警:' name='log_desc' >
                                <Select>
                                    <Option key='计量' value='计量'>计量</Option>
                                    <Option key='误报' value='误报'>误报</Option>
                                    <Option key='测试' value='测试'>测试</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item label='处理凭证:' name='photos'>
                                <Upload
                                    listType="picture-card"
                                    fileList={fileList}
                                    onPreview={handlePreview}
                                    onChange={handleChange}
                                    beforeUpload={handleBeforeUpload}
                                >
                                    {
                                        fileList.length >= 4 ? null : uploadButton
                                    }
                                </Upload>
                            </Form.Item>
                            <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 6 }}>
                                <Button type='primary' htmlType='submit'>确定</Button>
                                <Button onClick={onClose} style={{ marginLeft:'10px'}}>关闭</Button>
                            </Form.Item>                          
                        </Form>
                    }
                </TabPane>
                {/* 历史告警 */}
                <TabPane tab='历史告警' key='2'>
                    <Timeline mode='left' className={style['custom-timeline']}>                  
                        {
                            historyLog && historyLog.length
                            ?
                            historyLog.map((item,index)=>(
                                <Timeline.Item label={item.log_date} key={index}>
                                    <div className={style['progress-container']}>
                                        <div className={style['progress-title']}>{ item.action_user_name + ( item.log_type_name ? '-' : '' ) + ( item.log_type_name || '' ) }</div>
                                        <div className={style['progress-content']}>
                                            {/* <div>{ item.log_desc }</div> */}
                                            <div>{ item.warning_desc }</div>
                                            {
                                                item.photo.length 
                                                ?
                                                <div className={style['img-container']}>
                                                    {
                                                        item.photo.map(img=>(
                                                            <div className={style['img-wrapper']} style={{ backgroundImage:`url(${img})`}}></div>
                                                        ))
                                                    }                                                    
                                                </div>
                                                :
                                                null
                                            }
                                        </div>
                                    </div>
                                </Timeline.Item>
                            ))
                            :
                            null
                        }
                    </Timeline> 
                </TabPane>
            </Tabs>
            
            
            <Modal visible={previewInfo.visible} width='1200px' title={previewInfo.title} footer={null} onCancel={()=>setPreviewInfo({ ...previewInfo, visible:false })}>
                <img src={previewInfo.img} style={{ width:'100%'}} />
            </Modal>
        </div>
    )
}

export default AlarmForm;