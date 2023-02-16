import React, { useState, useEffect } from 'react';
import { Modal, Form, Upload, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import style from './SceneMonitor.css';
import sceneBg2 from '../../../public/report_bg.jpg';


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

function UploadSceneBg({ visible, onVisible, dispatch, pointList }){
    let [form] = Form.useForm();
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
        const isLt2M = file.size / 1024 / 1024 < 1;
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
    return (
        <Modal
            visible={visible}
            onCancel={()=>onVisible(false)}
            footer={null}
        >
            <Form
                {...layout} 
                name="add-form"
                form={form}
                onFinish={values=>{
                    console.log(values);
                    if ( fileList.length ) {
                        // console.log(fileList);
                        new Promise((resolve, reject)=>{
                            dispatch({ type:'sceneMonitor/setBgAsync', payload:{ resolve, reject, file:fileList[0].originFileObj, content:[] }})
                        })
                        .then(()=>{
                            onVisible(false)
                            message.success('切换背景图成功');
                        })
                        .catch(msg=>message.error(msg))
                    } else {
                        message.info('请上传背景图');
                    }
                }}
            >
                <Form.Item name='link_img' label='上传拟态图'>
                    <Upload
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
                        onVisible(false);
                    }}> 取消 </Button>
                    <Button type="primary" htmlType="submit">确认</Button>            
                </Form.Item>
            </Form>
        </Modal>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.visible !== nextProps.visible ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(UploadSceneBg, areEqual);