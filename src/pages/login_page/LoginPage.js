import React, { useEffect } from 'react';
import { connect } from 'dva';
import { Link, Redirect } from 'dva/router';
import { Table, Button, Card, Form, Input, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import loginBg from '../../../public/login_bg.jpg';
import titleBg from '../../../public/login_title.png';
import style from './LoginPage.css';

const layout = {
    labelCol: { span: 0 },
    wrapperCol: { span: 24 },
};
const tailLayout = {
    wrapperCol: { offset: 0, span: 24 },
};

function LoginPage({ dispatch, user }) {  
    const { thirdAgent } = user;
    const [form] = Form.useForm();
    return (        
        localStorage.getItem('user_id') && location.pathname === '/login'
        ?
        <Redirect to='/' />
        :
        <div className={style.container}>
            <div className={style['login-container']}>             
                <div className={style['img-container']}>
                    <img src={Object.keys(thirdAgent).length ? thirdAgent.logo_path : ''} style={{ marginRight:'6px' }} />
                    <img src={titleBg} />
                </div>
                <div className={style['form-container']}>
                    <div className={style['title']}>用户登录</div>
                    <Form
                        {...layout}
                        className={style['form']}
                        form={form}
                    >
                        <Form.Item                            
                            name="user_name"
                        >
                            <Input addonBefore={<UserOutlined />} bordered='false' />
                        </Form.Item>
                        <Form.Item                           
                            name="password"
                        >
                            <Input.Password addonBefore={<LockOutlined />} bordered='false' />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" style={{width:'100%', height:'40px'}} onClick={()=>{
                                form.validateFields()
                                .then(values=>{
                                    new Promise((resolve,reject)=>{
                                        dispatch({type:'user/login', payload:values, resolve, reject })
                                    }).then(()=>{})
                                    .catch(msg=>{
                                        message.error(msg);
                                    })
                                })
                            }}>登录</Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>        
            <div className={style['bg-container']} style={{ backgroundImage:`url(${loginBg})` }}></div>    
            {/* <div style={{ position:'absolute', left:'calc( 10% + 140px)', bottom:'20px', fontSize:'0.8rem' }}>粤ICP备20066003号</div> */}
        </div>
    )
}

export default connect(({ user })=>({ user }))(LoginPage);
