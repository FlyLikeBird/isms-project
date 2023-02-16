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

function RuleForm({ dispatch, visibleInfo, fieldAttrs, ruleTpls, onClose }){
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
    return (
        <div>
            <div style={{ margin:'1rem auto', textAlign:'center' }}>
                <Button type='primary'>选择模板</Button>
                <Select style={{ width:'200px' }} value={currentTpl.tpl_id} onChange={value=>{
                    let tplInfo = ruleTpls.filter(i=>i.tpl_id === value)[0];
                
                    if ( tplInfo ){
                        setCurrentTpl(tplInfo);
                        // 将选中模板信息的字段填充至表单
                        form.setFieldsValue({
                            ...tplInfo,
                            name:tplInfo.tpl_name
                        });
                    } else {
                        // 将表单字段置空
                        setCurrentTpl({});
                        let defaultFields = attrs.reduce((sum, cur)=>{
                            sum[cur.key] = null;
                            return sum;
                        },{})
                        form.setFieldsValue({
                            name:'',
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
                </Select>
            </div>
            <Form
                {...layout} 
                name="rule-form"
                className={style['form-container']}
                form={form}
                onFinish={values=>{
                    new Promise((resolve,reject)=>{
                        if ( visibleInfo.forEdit ){
                            values.rule_id = visibleInfo.currentRule.rule_id;
                            dispatch({ type:'alarm/updateRule', payload:{ values, resolve, reject }});
                        } else {
                            dispatch({type:'alarm/addRule', payload:{ values, resolve, reject }});
                        }
                    })
                    .then(()=>{
                        onClose();
                        message.success(`${visibleInfo.forEdit ? '修改' : '添加'}告警规则成功`)
                    })
                    .catch(msg=>{
                        message.error(msg);
                    })
                }}
            >
                <Form.Item name='name' label='规则名称' rules={[{ required:true, message:'规则名称不能为空'}]}>
                    <Input />
                </Form.Item>
                {
                    attrs.map((item,index)=>(
                        item.key === 'humidity' || item.key === 'diffPressure'
                        ?
                        <Form.Item key={item.key} label={`${item.title}(${item.unit})`} >
                            <Form.Item name={item.key + '_min'} noStyle>
                                <InputNumber min={0} style={{ width:'50%' }}  placeholder={`${item.title}最小值`} />
                            </Form.Item>
                            <Form.Item name={item.key} noStyle>
                                <InputNumber min={0} style={{ width:'50%'}} placeholder={`${item.title}最大值`} />
                            </Form.Item>
                        </Form.Item>
                        :
                        <Form.Item key={item.key} name={item.key} label={`${item.title}(${item.unit})`} >
                            <InputNumber min={0} style={{ width:'100%' }} />
                        </Form.Item>
                    ))
                }

                <Form.Item name='order_by' label='优先级'>
                    <InputNumber />
                </Form.Item>
                <Form.Item name='attrs' label='关联属性'>
                    <TreeSelect
                        multiple
                        treeDefaultExpandAll
                        treeData={fieldAttrs}
                    />
                </Form.Item> 
                <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 6 }}>
                    <Button style={{ marginRight:'0.5rem' }} onClick={ onClose }> 取消 </Button>
                    <Button type="primary" htmlType="submit">确定</Button>
                </Form.Item>
            </Form>
        </div>
    )
}


export default RuleForm;