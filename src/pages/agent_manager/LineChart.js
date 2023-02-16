import React, { useState } from 'react';
import ReactEcharts from 'echarts-for-react';

function LineChart({ data }){
    let seriesData = [];
    seriesData.push({
        type:'line',
        name:'告警数',
        symbol:'none',
        smooth:true,
        itemStyle:{
            color:'#ffcf21',
        },
       
        data:data.view
    });
    seriesData.push({
        type:'line',
        name:'同比',
        symbol:'none',
        smooth:true,
        itemStyle:{
            color:'#185f60',
        },
        data:data.sameView
    })
    return (
       
            <ReactEcharts
                notMerge={true}
                style={{ height:'100%' }}
                option={{
                    tooltip:{
                        trigger:'axis'
                    },
                    legend:{
                        data:seriesData.map(i=>i.name),
                        textStyle:{ color:'#fff' }
                    },
                    grid:{
                        top:30,
                        bottom:6,
                        left:10,
                        right:20,
                        containLabel:true
                    },
                    xAxis: {
                        type: 'category',
                        axisTick:{ show:false },
                        axisLabel:{ 
                            color:'#b0b0b0', 
                            formatter:(value)=>{
                                let temp = value.split('-');
                                return temp[2] || value;
                            }
                        },
                        axisLine:{
                            show:true,
                            lineStyle:{
                                color:'rgba(18, 168, 254, 0.8)'
                            }
                        },
                        data:data.date || []
                    },
                    yAxis: {
                        type: 'value',
                        name:'次',
                        nameTextStyle:{
                            color:'#b0b0b0'
                        },
                        nameGap:10,
                        minInterval:1,
                        axisTick:{ show:false },
                        axisLabel:{ color:'#b0b0b0' },
                        axisLine:{ show:false },
                        splitLine:{
                            lineStyle:{
                                color:'rgba(24, 95, 96, 0.25)'
                            }
                        }
                    },
                    series: seriesData
                }}
            />
        
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data  ){
        return false;
    } else {
        return true;
    }
}

export default React.memo(LineChart, areEqual);