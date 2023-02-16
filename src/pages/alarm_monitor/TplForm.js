import React, { useState, useEffect } from 'react';
import { Form, Select, Input, Button, message, TreeSelect, Slider, Divider, InputNumber } from 'antd';
import style from './AlarmForm.css';
import { attrs } from '@/pages/utils/array';

const { Option } = Select;

function validator(a,value){
    if ( !value || (typeof +value === 'number' && +value === +value && +value >=0  )) {
        return Promise.resolve();
    } else {
        return Promise.reject('请填入合适的阈值');
    }
}

function TplForm({ dispatch, visibleInfo, ruleTpls, onClose }){
    const layout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 },
    };
    const [currentTpl, setCurrentTpl] = useState({});
    const [form] = Form.useForm();
    useEffect(()=>{
        if ( visibleInfo.forEdit ){
            form.setFieldsValue({ 
                ...visibleInfo.currentRule,    
                attrs:visibleInfo.currentRule.ruleattr && visibleInfo.currentRule.ruleattr.length ? visibleInfo.currentRule.ruleattr.map(i=>i.attr_id) : []
            });
        }
    },[]);
    // console.log(currentType);
    useEffect(()=>{
        let tpl_name = form.getFieldValue('tpl_name');
        let temp = ruleTpls.filter(i=>i.tpl_name === tpl_name)[0];
        setCurrentTpl(temp || {});
        if ( temp ){
            form.setFieldsValue({
                ...temp,
                
            });
        } else {
            let defaultFields = attrs.reduce((sum, cur)=>{
                sum[cur.key] = null;
                return sum;
            },{})
            form.setFieldsValue({
                tpl_name:'',
                ...defaultFields,
                humidity_min:null,
                diffPressure_min:null,
                attrs:[]
            });
        }
    },[ruleTpls])
    return (
        <div>
            <div style={{ margin:'1rem auto', textAlign:'center' }}>
                <Button type='primary'>选择模板</Button>
                <Select style={{ width:'200px' }} value={currentTpl.tpl_id || 0} onChange={value=>{
                    let tplInfo = ruleTpls.filter(i=>i.tpl_id === value)[0];
                    if ( tplInfo ){
                        setCurrentTpl(tplInfo);
                        // 将选中模板信息的字段填充至表单
                        form.setFieldsValue({
                            ...tplInfo,
                        });
                    } else {
                        // 将表单字段置空
                        setCurrentTpl({});
                        let defaultFields = attrs.reduce((sum, cur)=>{
                            sum[cur.key] = null;
                            return sum;
                        },{})
                        form.setFieldsValue({
                            tpl_name:'',
                            ...defaultFields,
                            humidity_min:null,
                            diffPressure_min:null,
                            attrs:[]
                        });
                    }
                }}>
                    {
                        ruleTpls.map((item,index)=>(
                            <Option key={item.tpl_id} value={item.tpl_id}>{ item.tpl_name }</Option>
                        ))
                    }
                    <Option key={0} value={0}>自定义模板</Option>
                </Select>
            </div>
            <Form
                {...layout} 
                name="rule-form"
                className={style['form-container']}
                form={form}
            >
                <Form.Item name='tpl_name' label='模板名称' rules={[{ required:true, message:'模板名称不能为空'}]}>
                    <Input />
                </Form.Item>
                {
                    attrs.map((item,index)=>(
                        item.key === 'humidity' || item.key === 'diffPressure'
                        ?
                        <Form.Item key={item.key} label={`${item.title}(${item.unit})`} >
                            <Form.Item name={item.key + '_min'} noStyle>
                                <InputNumber  style={{ width:'50%' }}  placeholder={`${item.title}最小值`} />
                            </Form.Item>
                            <Form.Item name={item.key} noStyle>
                                <InputNumber  style={{ width:'50%'}} placeholder={`${item.title}最大值`} />
                            </Form.Item>
                        </Form.Item>
                        :
                        <Form.Item key={item.key} name={item.key} label={`${item.title}(${item.unit})`} >
                            <InputNumber  style={{ width:'100%' }} />
                        </Form.Item>
                    ))
                }
                <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 6 }}>
                    <Button style={{ marginRight:'0.5rem' }} onClick={()=>onClose()}>取消</Button>
                    <Button type='primary' style={{ marginRight:'0.5rem' }} onClick={()=>{
                        form.validateFields()
                        .then(values=>{
                            new Promise((resolve, reject)=>{
                                if ( currentTpl.tpl_id ) {
                                    values.tpl_id = currentTpl.tpl_id;
                                }
                                dispatch({ type:'alarm/addTplAsync', payload:{ resolve, reject, values, forEdit:true }})
                            })
                            .then(()=>message.success('更新模板成功'))
                            .catch(msg=>message.error(msg))
                        })
                    }}>更新此模板</Button>
                    <Button type='primary' style={{ marginRight:'0.5rem' }} onClick={()=>{
                        form.validateFields()
                        .then(values=>{
                            if ( ruleTpls.filter(i=>i.tpl_name === values.tpl_name ).length ) {
                                message.error('已存在同名模板，无需重复添加');
                            } else {
                                new Promise((resolve, reject)=>{
                                    dispatch({ type:'alarm/addTplAsync', payload:{ resolve, reject, values, forEdit:false }})
                                })
                                .then(()=>message.success('添加模板成功'))
                                .catch(msg=>message.error(msg))
                            } 
                        })
                    }}>设为新模板</Button>
                    <Button type='primary' onClick={()=>{
                        
                            if ( currentTpl.tpl_id ) {
                                new Promise((resolve, reject)=>{
                                    dispatch({ type:'alarm/delTplAsync', payload:{ resolve, reject, tpl_id:currentTpl.tpl_id }})
                                })
                                .then(()=>message.success(`删除${currentTpl.tpl_name}模板成功`))
                                .catch(msg=>message.error(msg))
                            } else {
                                message.info('请先选中一个模板')
                            }
                        
                    }}>删除此模板</Button>
                </Form.Item>
            </Form>
        </div>
    )
}


export default TplForm;