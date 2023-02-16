import React, { useState, useRef } from 'react';
import { connect } from 'dva';
import { Radio, Card, Button,  } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas from 'html2canvas';

function LineChart({ xData, yData, title, unit, warningValue, forModal }) {
    let seriesData = [];
    seriesData.push({
        type: 'line',
        smooth: true,
        symbol:'none',
        itemStyle:
            forModal 
            ?
            { 
                color:{
                    type:'linear',
                    x:0,
                    y:0,
                    x2:1,
                    y2:0,
                    colorStops: [{
                        offset: 0, color: '#1fecff' // 0% 处的颜色
                    }, {
                        offset: 1, color: '#7345ff' // 100% 处的颜色
                    }],
                }                                 
            }
            : 
            { 
                color:{
                    type:'linear',
                    x:0,
                    y:0,
                    x2:1,
                    y2:0,
                    colorStops: [{
                        offset: 0, color: '#06a0fd' // 0% 处的颜色
                    }, {
                        offset: 1, color: '#3076f2' // 100% 处的颜色
                    }],
                }                                 
            },
        areaStyle: forModal ? 
            {
                color:{
                    type:'linear',
                    x:0,
                    y:0,
                    x2:0,
                    y2:1,
                    colorStops: [{
                        offset: 0, color: 'rgba(31, 236, 255, 0.15)' // 0% 处的颜色
                    }, {
                        offset: 1, color: 'transparent' // 100% 处的颜色
                    }],
                    opacity:forModal ? 1 : 0
                }
            }
            :
            null,
        data:yData
    });
    if ( forModal ) {
        if ( Number(warningValue) ) {
            seriesData.push({
                type:'line',
                symbol:'none',
                name:'告警值',
                data:xData.map(i=> Number(warningValue)),
                itemStyle:{
                    color:'#fe2c2d'
                },
                lineStyle:{
                    type:'dashed'
                },
                markPoint:{
                    symbol:'rect',
                    symbolSize:[120,20],
                    data:[ { value:'预警值: '+ warningValue + unit, xAxis: xData.length-2, yAxis:Number(warningValue) } ],
                },
                tooltip:{ show:false }
            });
        }
        
    }
    return (  
            
            <ReactEcharts
                notMerge={true}
                style={{ width:'100%', height:'100%'}}
                option={{
                    tooltip:{
                        show:true,
                        trigger:'axis'
                    },
                    title:{
                        show:forModal ? true : false,
                        text:title,
                        top:0,
                        left:'center',
                        textStyle:{
                            fontSize:14,
                            color:'#fff'
                        }
                    },
                    grid:{
                        left:'2%',
                        top: forModal ? '10%' : '2%',
                        right:'2%',
                        bottom: forModal ? '6%' : '2%',
                        containLabel:true
                    },
                    xAxis: {
                        show: forModal ? true : false,
                        axisTick:{ show:false },
                        axisLabel:{ color:'rgba(255, 255, 255, 0.45)' },
                        type: 'category',
                        data:xData
                    },
                    yAxis: {
                        name:unit,
                        nameTextStyle:{ color:'rgba(255, 255, 255, 0.45)'},
                        show: forModal ? true : false,
                        axisLine:{ show:false },
                        axisLabel:{ color:'rgba(255, 255, 255, 0.45)' },
                        splitLine:{
                            show:true,
                            lineStyle:{
                                type:'dotted',
                                color:'rgba(255, 255, 255, 0.15)'
                            }
                        },
                        type: 'value'
                    },
                    series:seriesData
                }}
            /> 
        
           
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.xData !== nextProps.xData || prevProps.attrKey !== nextProps.attrKey ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(LineChart, areEqual);
