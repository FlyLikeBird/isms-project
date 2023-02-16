import React, { useState, useRef } from 'react';
import { connect } from 'dva';
import { Radio, Card, Button,  } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas from 'html2canvas';

const indicatorTypes = {
    'load_ratio':'颗粒物',
    'empty_ratio':'温度',
    'air_ele_ratio':'湿度',
    'air_save_cost':'压差',
    'air_cost_ratio':'露点'
};
const textMaps = {
    '颗粒物':'load_ratio',
    '温度': 'empty_ratio',
    '湿度' : 'air_ele_ratio',
    '压差':'air_save_cost',
    '露点':'air_cost_ratio'
};
function RadarChart({ data }) {
    data = {
        load_ratio:80,
        empty_ratio:30,
        air_ele_ratio:60,
        air_save_cost:90,
        air_cost_ratio:40
    }
    let seriesData = [], indicator = [];
    Object.keys(data).forEach(key=>{
        indicator.push({ name:indicatorTypes[key], max:100 });
        seriesData.push(data[key]);
    });
    return (    
        <ReactEcharts
            notMerge={true}
            style={{ width:'100%', height:'100%'}}
            option={{
                tooltip:{
                    show:false
                },
                radar: {
                    // shape: 'circle',
                    name: {
                        // formatter:(value, indicator)=>{                        
                        //     return `${value} {a|${data[textMaps[value]]}}`
                        // },
                        formatter:(value, indicator)=>{                        
                            return `${value}`
                        },
                        textStyle: {
                            color: '#707080',
                            rich:{
                                a:{
                                    backgroundColor:'#4cd0ef',
                                    color:'#fff',
                                    padding:[2,6],
                                    borderRadius:6
                                }
                            }
                        }
                    },
                    radius:'65%',
                    splitNumber:4,
                    splitArea: {
                        areaStyle: {
                            color: ['transparent']
                        }
                    },
                    splitLine:{
                        lineStyle:{
                            width:1,
                            color:['rgba(27, 100, 180, 0.65)', 'rgba(27, 100, 180, 0.75)', 'rgba(27, 100, 180, 0.8)', 'rgba(27, 100, 180, 0.85)', 'rgba(27, 100, 180, 0.9)'],
                        }
                    },
                    axisLine:{
                        lineStyle:{
                            color:'rgba(27, 100, 180, 0.25)',
        
                        }
                    },
                    indicator
                },                    
                series:{
                    type: 'radar',
                    name:'用气体验',
                    label:{
                        distance:2
                    },
                    symbolSize:6,
                    itemStyle:{ color:'rgb(27, 100, 180)' },
                    data: [
                        {
                            value: seriesData,
                            lineStyle:{
                                opacity:0
                            },
                            areaStyle:{
                                opacity:0.9,
                                color:{
                                    type:'linear',
                                    x:0,
                                    y:0,
                                    x2:0,
                                    y2:1,
                                    colorStops: [{
                                        offset: 0, color: 'rgba(101, 50, 222, 0.9)' // 0% 处的颜色
                                    }, {
                                        offset: 1, color: 'rgba(101, 50, 222, 0.75)' // 100% 处的颜色
                                    }],
                                    
                                },
                            }
                        }

                    ]
                }
            }}
        /> 
           
    );
}

export default RadarChart;
