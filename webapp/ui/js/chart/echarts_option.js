/**
 * Created by wangjuan on 2017/6/14.
 */

/*
 * 定义以下变量，为了统一图表的风格
 */
//工具栏。内置有导出图片，数据视图，动态类型切换，数据区域缩放，重置五个工具。
var option_toolbox = {
    	show: true,
        feature: {
            dataView: {readOnly: true},
            restore: {},
            saveAsImage: {}
        }
    };

//是否显示分隔线,以及分隔线的类型
var option_Axis_splitLine = {
		show : true,
		lineStyle : {
			type : 'dashed'//solid:实线;dashed:虚线;dotted:点线;
		}
	};

/*color:function(d){return "#"+Math.floor(Math.random()*(220*220*220-20)).toString(16);}*/
var colorArray = ['#78b4c8','#dcc814','#788c50','#f0b400','#788c64',
                  '#c86464','#8c8c78','#b4c8a0',
                  '#50a078','#64283c','#28503c',
                  '#f0a03c','#8c8c8c','#dc8ca0',
                  '#a0b414','#c8783c','#ffdc78',
                  '#503c3c','#dcb428','#c8a0a0',
                  '#dc3c14','#7878b4','#a06450',
                  '#1464c8','#f0ff64',
                  '#505064','#fff014','#3c3c78',
                  '#786450','#dcb4a0','#c86478'];



/*
 * 参数echartsData提供渲染各类图表所需的所有数据
 * 每个function决定了对应图表的样式
 * 每个function的返回值为对应图表的option
 */

// 饼状图1
function get_pie_chart_one_option(echartsData) {
	
	//---start(模拟数据)---
	/*var option_legend_data = [ '直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎' ];
	
	var option_series_data_value = [336,310,234,135,154];

	var option_title_text = 'mytest';*/
	//---end(模拟数据)---
	var option_legend_data = echartsData.option_legend_data;
		
	var option_series_data_value = echartsData.option_series_data_value;
		
	var option_title_text = echartsData.option_title_text;
	
	var option_series_data = [];
	
	for(var i = 0;i < option_series_data_value.length;i++){
		var option_series_data_item = {
				value : option_series_data_value[i],
				name : option_legend_data[i]
		};
		
		option_series_data.push(option_series_data_item);
	}

	var option = {
	        title: {
	            text: option_title_text,
	            x: 'center'
	        },
	        tooltip: {
	            trigger: 'item',
	            formatter: "{b} : {c} ({d}%)"//{a} <br/>{b} : {c} ({d}%)
	        },
	        toolbox: option_toolbox,
	        legend: {
	            data: option_legend_data,
	            orient: 'vertical',
	            x: 'left'
	        },
	        series: [
	            {
	            	name: '',
	                type: 'pie',
	                radius: '55%',
	                label : {
	    				normal : {
	    					show : true,
	    					formatter : '{b} :\n{c} ({d}%)'
	    				},
	    				emphasis : {
	    					show : true,
	    					textStyle : {
	    						fontSize : '30',
	    						fontWeight : 'bold'
	    					}
	    				}
	    			},
	    			itemStyle:{
	    				normal:{
	    					color: function(params){
	    						var colorList = colorArray;
	    						return colorList[params.dataIndex];
	    					}
		                }
	    			},
	                data: option_series_data
	            }
	        ]
	    };
	
	return option;
}

//饼状图2
function get_pie_chart_two_option(echartsData) {
	
	var option = get_pie_chart_one_option(echartsData);
	option.series[0].radius = [ '40%', '60%' ];
	option.series[0].itemStyle.normal = {
			color: function(params){
				var colorList = colorArray;
				return colorList[params.dataIndex];
			}
    }
	
	return option;
}

//饼状图3
function get_pie_chart_three_option(echartsData) {
	
	var option = get_pie_chart_one_option(echartsData);
	option.series[0].radius = [ 20, 80 ];
	//'radius' 扇区圆心角展现数据的百分比，半径展现数据的大小。
	//'area' 所有扇区圆心角相同，仅通过半径展现数据大小。
	option.series[0].roseType = 'radius';
	option.series[0].itemStyle.normal = {
			color: function(params){
				var colorList = colorArray;
				return colorList[params.dataIndex];
			}
	}
	
	return option;
}

// 折线图1
function get_line_chart_one_option(echartsData) {
	
	//---start(模拟数据)---
	/*var option_legend_data = ['邮件营销','联盟广告','视频广告','直接访问','搜索引擎'];

	var option_xAxis_data = ['周一','周二','周三','周四','周五','周六','周日'];
	
	var option_series_data = [[120, 132, 101, 134, 90, 230, 210],
							[220, 182, 191, 234, 290, 330, 310],
							[150, 232, 201, 154, 190, 330, 410],
							[320, 332, 301, 334, 390, 330, 320],
							[820, 932, 801, 934, 829, 933, 932]];

	var option_title_text = '折线图--支持一到多条';*/
	//---end(模拟数据)---
	var option_legend_data = echartsData.option_legend_data;
		
	var option_xAxis_data = echartsData.option_xAxis_data;
		
	var option_series_data = echartsData.option_series_data;
		
	var option_title_text = echartsData.option_title_text;
	
	var option_series = [];
	
	for(var i = 0;i < option_series_data.length;i++){
		var index = option_legend_data[i].length;
		var option_series_item = {
				name : option_legend_data[i],
				type : 'line',
				smooth : true,
				data : option_series_data[i],
				itemStyle:{
					color: function(params){
						var colorList = colorArray;
						return colorList[params.dataIndex];
					}
				}
		};
		
		option_series.push(option_series_item);
	}

	var option = {
	        title: {
	            text: option_title_text,
	            x: 'center'
	        },
	        tooltip: {
	            trigger: 'axis',
	            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
	                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
	            }
	        },
	        legend: {
	            data:option_legend_data,
	            top: '7%'
	        },
	        toolbox: option_toolbox,
	        xAxis: {
	            type: 'category',
	            data: option_xAxis_data,
	            splitLine : option_Axis_splitLine
	        },
	        yAxis: {
	            type: 'value',
	            splitLine : option_Axis_splitLine
	        },
	        series: option_series
	    };
	
	return option;
}

// 折线图2
function get_line_chart_two_option(echartsData) {
	
	var option = get_line_chart_one_option(echartsData);
	
	for(var i = 0;i < option.series.length;i++){
		
		option.series[i].stack = '堆叠';
	}
	
	return option;
}

// 折线图3
function get_line_chart_three_option(echartsData) {
	
	//---start(模拟数据)---
	/*var option_xAxis_data = ['周一','周二','周三','周四','周五','周六','周日'];
	
	var option_series_data = [120, 132, 101, 134, 90, 230, 210];

	var option_title_text = '大数据量面积图';*/
	//---end(模拟数据)---
		
	var option_xAxis_data = echartsData.option_xAxis_data;
		
	var option_series_data = echartsData.option_series_data;
		
	var option_title_text = echartsData.option_title_text;
	
	var option = {
	        tooltip: {
	            trigger: 'axis',
	            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
	                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
	            },
	            formatter: function (params) {
	                var tar = params[0];
	                return tar.name + ' : ' + tar.value;
	            }
	        },
	        title: {
	            text: option_title_text,
	            x: 'center'
	        },
	        toolbox: option_toolbox,
	        xAxis: {
	            type: 'category',
	            data: option_xAxis_data,
	            splitLine : option_Axis_splitLine
	        },
	        yAxis: {
	            type: 'value',
	            splitLine : option_Axis_splitLine
	        },
	        //dataZoom:用于区域缩放，从而能自由关注细节的数据信息，或者概览数据整体，或者去除离群点的影响。
	        dataZoom: [{
	            type: 'inside',
	            start: 0,
	            end: 100
	        }, {
	            start: 0,
	            end: 10
	        }],
	        series: [
	            {
	                type: 'line',
	                smooth: true,
	                symbol: 'none',
	                sampling: 'average',
	                itemStyle: {
	                    normal: {
	                        color: '#046790'
	                    }
	                },
	                areaStyle: {
	                    normal: {
	                        color: new echarts.graphic.LinearGradient(0,0,0, 1, [{
	                            offset: 0,
	                            /*color: 'rgb(255, 158, 68)'*/
	                            color:'#046790'
	                        }, {
	                            offset: 1,
	                            /*color: 'rgb(255, 70, 131)'*/
	                            color:'#5f54e5'
	                        }])
	                    }
	                },
	                data: option_series_data
	            }
	        ]
	    };
	
	return option;
}

// 柱状图1
function get_bar_chart_one_option(echartsData){
	
	//---start(模拟数据)---
	/*var option_legend_data = ['蒸发量','降水量'];

	var option_xAxis_data = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
	
	var option_series_data = [[2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3],
	                          [2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3]
	                         ];

	var option_title_text = '柱状图--支持一到多';*/
	//---end(模拟数据)---
	var option_legend_data = echartsData.option_legend_data;
		
	var option_xAxis_data = echartsData.option_xAxis_data;
		
	var option_series_data = echartsData.option_series_data;
		
	var option_title_text = echartsData.option_title_text;
	
	var option_series = [];
	
	for(var i = 0;i < option_series_data.length;i++){
		var color = colorArray[i+15];
		console.log(color);
		var option_series_item = {
				name:option_legend_data[i],
		        type:'bar',
		        data: option_series_data[i],
		        markPoint : {
		            data : [
		                {type : 'max', name: '最大值'},
		                {type : 'min', name: '最小值'}
		            ]
		        },
		        markLine : {
		            data : [
		                {type : 'average', name: '平均值'}
		            ]
		        },
		        itemStyle:{
		        	normal:{
		        		color: color
		        	}
		        }
		};
		option_series.push(option_series_item);
	}
	
	var option = {
			title: {
	            text: option_title_text,
	            x: 'center'
	        },
	        tooltip: {
	            trigger: 'axis',
	            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
	                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
	            }
	        },
	        toolbox: option_toolbox,
	        legend: {
	            data: option_legend_data,
	            top: '7%'
	        },
	        xAxis: [
	            {
	                type: 'category',
	                data: option_xAxis_data,
	                splitLine : option_Axis_splitLine
	            }
	        ],
	        yAxis: [
	            {
	                type: 'value',
	                splitLine : option_Axis_splitLine
	            }
	        ],
	        series: option_series
	    };
	
	return option;
}

// 柱状图2
function get_bar_chart_two_option(echartsData){
	
	//---start(模拟数据)---

	/*var option_xAxis_data = ['总','房租','水电费','交通费','伙食费','日用品数'];
	
	var option_series_data = [[0, 1700, 1400, 1200, 300, 0],
	                          [2900, 1200, 300, 200, 900, 300]
	                         ];

	var option_title_text = '柱状图--总-分';*/
	//---end(模拟数据)---
	var option_xAxis_data = echartsData.option_xAxis_data;
		
	var option_series_data = echartsData.option_series_data;
		
	var option_title_text = echartsData.option_title_text;
	
	var option = {
	        title: {
	            text: option_title_text,
	            x: 'center'
	        },
	        tooltip: {
	            trigger: 'axis',
	            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
	                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
	            },
	            formatter: function (params) {
	                var tar = params[1];
	                return tar.name + ' : ' + tar.value;
	            }
	        },
	        toolbox: option_toolbox,
	        xAxis: {
	            type: 'category',
	            data: option_xAxis_data,
	            splitLine : option_Axis_splitLine
	        },
	        yAxis: {
	            type: 'value',
	            splitLine : option_Axis_splitLine
	        },
	        series: [
	            {
	            	name: '辅助',
	                type: 'bar',
	                stack: '总量',
	                itemStyle: {
	                    normal: {
	                        barBorderColor: 'rgba(0,0,0,0)',
	                        color: function(params){
	                        	var colorList = colorArray;
	    						return colorList[params.dataIndex];
	    					}
	                    },
	                    emphasis: {
	                        barBorderColor: 'rgba(0,0,0,0)',
	                        color: 'rgba(0,0,0,0)'
	                    }
	                },
	                data: option_series_data[0]
	            },
	            {
	                type: 'bar',
	                stack: '总量',
	                label: {
	                    normal: {
	                        show: true,
	                        position: 'inside'
	                    }
	                },
	                itemStyle:{
	                	normal:{
	                		color: function(params){
	                			var colorList = colorArray;
	    						return colorList[params.dataIndex];
	    					}
	                	}
	                },
	                data: option_series_data[1]
	            }
	        ]
	    };
	
	return option;
}

// 柱状图3
function get_bar_chart_three_option(echartsData){
	
	//---start(模拟数据)---
	/*var option_legend_data = ['邮件营销','联盟广告','视频广告','直接访问','搜索引擎'];

	var option_xAxis_data = ['周一','周二','周三','周四','周五','周六','周日'];
	
	var option_series_data = [[120, 132, 101, 134, 90, 230, 210],
							[220, 182, 191, 234, 290, 330, 310],
							[150, 232, 201, 154, 190, 330, 410],
							[320, 332, 301, 334, 390, 330, 320],
							[420, 532, 501, 334, 429, 533, 432]];

	var option_title_text = '折柱混合';
	
	var tag = 3;*///折柱混合区分标识，可理解为折线的条数
	//---end(模拟数据)---
	
	var option_legend_data = echartsData.option_legend_data;
		
	var option_xAxis_data = echartsData.option_xAxis_data;
		
	var option_series_data = echartsData.option_series_data;
		
	var option_title_text = echartsData.option_title_text;
	
	var tag = echartsData.tag;
	
	var option_series = [];
	
	for(var i = 0;i < option_series_data.length;i++){
		var color = colorArray[i+15];
		var option_series_item = {
				name : option_legend_data[i],
				data : option_series_data[i],
				itemStyle:{
					normal:{
						color: color
					}
				}
		};
		
		if(i < tag){
			option_series_item.type = 'line';
		}else{
			option_series_item.type = 'bar';
		}
		
		option_series.push(option_series_item);
	}
	
	var option = {
	        title: {
	            text: option_title_text,
	            x: 'center'
	        },
	        tooltip: {
	            trigger: 'axis',
	            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
	                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
	            }
	        },
	        toolbox: option_toolbox,
	        legend: {
	            data: option_legend_data,
	            top: '7%'
	        },
	        xAxis: [
	            {
	                type: 'category',
	                data: option_xAxis_data,
	                splitLine : option_Axis_splitLine
	            }
	        ],
	        yAxis: {
	        	    type: 'value',
	        	    splitLine : option_Axis_splitLine
	        	},
	        series: option_series
	    };
	
	return option;
}

// 柱状图4
function get_bar_chart_four_option(echartsData){
	//---start(模拟数据)---
	/*var option_legend_data = ['邮件营销','联盟广告','视频广告','直接访问','搜索引擎'];

	var option_xAxis_data = ['周一','周二','周三','周四','周五','周六','周日'];
	
	var option_series_data = [[120, 132, 101, 134, 90, 230, 210],
							[220, 182, 191, 234, 290, 330, 310],
							[150, 232, 201, 154, 190, 330, 410],
							[320, 332, 301, 334, 390, 330, 320],
							[820, 932, 801, 934, 829, 933, 932]];

	var option_title_text = '堆叠条形图';*/
	//---end(模拟数据)---
	var option_legend_data = echartsData.option_legend_data;
		
	var option_xAxis_data = echartsData.option_xAxis_data;
		
	var option_series_data = echartsData.option_series_data;
		
	var option_title_text = echartsData.option_title_text;
	
	var option_series = [];
	
	for(var i = 0;i < option_series_data.length;i++){
		var color = colorArray[i+3];
		var option_series_item = {
				name : option_legend_data[i],
				type: 'bar',
	            stack: '总量',
	            label: {
	                normal: {
	                    show: true,
	                    position: 'inside'
	                }
	            },
				data : option_series_data[i],
				itemStyle:{
					normal:{
						color:color
					}
				}
		};
		
		option_series.push(option_series_item);
	}
	
	var option = {
			title: {
	            text: option_title_text,
	            x: 'center'
	        },
	        tooltip: {
	            trigger: 'axis',
	            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
	                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
	            }
	        },
	        toolbox: option_toolbox,
	        legend: {
	            data: option_legend_data,
	            top: '7%'
	        },
	        xAxis: {
	            type: 'category',
	            data: option_xAxis_data,
	            splitLine : option_Axis_splitLine
	        },
	        yAxis: {
	            type: 'value',
	            splitLine : option_Axis_splitLine
	        },
	        series: option_series
	    };
	
	return option;
}

// 散点图1
function get_scatter_chart_one_option(echartsData){
	
	//---start(模拟数据)---
	/*var option_legend_data = ['邮件营销','联盟广告','视频广告','直接访问','搜索引擎'];

	var option_xAxis_data = ['周一','周二','周三','周四','周五','周六','周日'];
	
	var option_series_data = [[120, 132, 101, 134, 90, 230, 210],
							[220, 182, 191, 234, 290, 330, 310],
							[150, 232, 201, 154, 190, 330, 410],
							[320, 332, 301, 334, 390, 330, 320],
							[820, 932, 801, 934, 829, 933, 932]];

	var option_title_text = '散点图--支持一到多';*/
	//---end(模拟数据)---
	var option_legend_data = echartsData.option_legend_data;
		
	var option_xAxis_data = echartsData.option_xAxis_data;
		
	var option_series_data = echartsData.option_series_data;
		
	var option_title_text = echartsData.option_title_text;
	
	var option_series = [];
	
	for(var i = 0;i < option_series_data.length;i++){
		var color = colorArray[i+6];
		var option_series_item = {
				name : option_legend_data[i],
				type: 'scatter',
		        data: option_series_data[i],
		        lineStyle: {
		            normal: {
		                type: 'solid',
		                color:color
		            }
		        }
		};
		
		option_series.push(option_series_item);
	}
	
	var option = {
	        title: {
	            text: option_title_text,
	            x: 'center'
	        },
	        tooltip: {
	            trigger: 'item'
	        },
	        legend: {
	            data: option_legend_data,
	            top: '7%'
	        },
	        toolbox: option_toolbox,
	        calculable: true,
	        xAxis: [
	            {
	                type: "category",
	                data: option_xAxis_data,
	                splitLine : option_Axis_splitLine
	            }
	        ],
	        yAxis: [
	            {
	                type: "value",
	                splitLine : option_Axis_splitLine
	            }
	        ],
	        series: option_series
	    };
	
	return option;
}

// 散点图2
function get_scatter_chart_two_option(echartsData) {
	
	// ---start(模拟数据)---
	    /*var option_series_data = [//[ 28604, 77, 17096869, 'Australia', 1990 ]前4个有效，第5个可有可无
			[ [ 28604, 77, 17096869, 'Australia', 1990 ],
					[ 31163, 77.4, 27662440, 'Canada', 1990 ],
					[ 1516, 68, 1154605773, 'China', 1990 ],
					[ 13670, 74.7, 10582082, 'Cuba', 1990 ],
					[ 28599, 75, 4986705, 'Finland', 1990 ],
					[ 29476, 77.1, 56943299, 'France', 1990 ],
					[ 31476, 75.4, 78958237, 'Germany', 1990 ],
					[ 28666, 78.1, 254830, 'Iceland', 1990 ],
					[ 1777, 57.7, 870601776, 'India', 1990 ],
					[ 29550, 79.1, 122249285, 'Japan', 1990 ],
					[ 2076, 67.9, 20194354, 'North Korea', 1990 ],
					[ 12087, 72, 42972254, 'South Korea', 1990 ],
					[ 24021, 75.4, 3397534, 'New Zealand', 1990 ],
					[ 43296, 76.8, 4240375, 'Norway', 1990 ],
					[ 10088, 70.8, 38195258, 'Poland', 1990 ],
					[ 19349, 69.6, 147568552, 'Russia', 1990 ],
					[ 10670, 67.3, 53994605, 'Turkey', 1990 ],
					[ 26424, 75.7, 57110117, 'United Kingdom', 1990 ],
					[ 37062, 75.4, 252847810, 'United States', 1990 ] ],
			[ [ 44056, 81.8, 23968973, 'Australia', 2015 ],
					[ 43294, 81.7, 35939927, 'Canada', 2015 ],
					[ 13334, 76.9, 1376048943, 'China', 2015 ],
					[ 21291, 78.5, 11389562, 'Cuba', 2015 ],
					[ 38923, 80.8, 5503457, 'Finland', 2015 ],
					[ 37599, 81.9, 64395345, 'France', 2015 ],
					[ 44053, 81.1, 80688545, 'Germany', 2015 ],
					[ 42182, 82.8, 329425, 'Iceland', 2015 ],
					[ 5903, 66.8, 1311050527, 'India', 2015 ],
					[ 36162, 83.5, 126573481, 'Japan', 2015 ],
					[ 1390, 71.4, 25155317, 'North Korea', 2015 ],
					[ 34644, 80.7, 50293439, 'South Korea', 2015 ],
					[ 34186, 80.6, 4528526, 'New Zealand', 2015 ],
					[ 64304, 81.6, 5210967, 'Norway', 2015 ],
					[ 24787, 77.3, 38611794, 'Poland', 2015 ],
					[ 23038, 73.13, 143456918, 'Russia', 2015 ],
					[ 19360, 76.5, 78665830, 'Turkey', 2015 ],
					[ 38225, 81.4, 64715810, 'United Kingdom', 2015 ],
					[ 53354, 79.1, 321773631, 'United States', 2015 ] ] ];*/
	    
		/*var option_series_data = [
			[ [ 28604, 77, 17096869, 'Australia' ],
					[ 31163, 77.4, 27662440, 'Canada' ] ],
			[ [ 38225, 81.4, 64715810, 'United Kingdom' ],
					[ 53354, 79.1, 321773631, 'United States' ] ] ];

	var option_legend_data = [ '1990', '2015' ];

	var option_title_text = '气泡图';*/
	//---end(模拟数据)---
	var option_series_data = echartsData.option_series_data;
	
	var option_legend_data = echartsData.option_legend_data;
		
	var option_title_text = echartsData.option_title_text;
	
	

	var option_series_itemStyle_normal_shadowColor = RGBA;

	var option_series_itemStyle_normal_color_zero = RGB_ZERO;

	var option_series_itemStyle_normal_color_one = RGB_ONE;

	var option_series = [];

	for (i = 0; i < option_series_data.length; i++) {//给option_series赋值
		var option_series_item = {
			name : option_legend_data[i],
			data : option_series_data[i],
			type : 'scatter',
			symbolSize : function(data) {
				return Math.sqrt(data[2]) / 5e2;
			},
			label : {
				emphasis : {
					show : true,
					formatter : function(param) {
						return param.data[3];
					},
					position : 'top'
				}
			},
			itemStyle : {
				normal : {
					shadowBlur : 10,
					shadowColor : option_series_itemStyle_normal_shadowColor[i],
					shadowOffsetY : 5,
					color : new echarts.graphic.RadialGradient(0.4, 0.3, 1, [ {
						offset : 0,
						color : option_series_itemStyle_normal_color_zero[i]
					}, {
						offset : 1,
						color : option_series_itemStyle_normal_color_one[i]
					} ])
				}
			}
		};

		option_series.push(option_series_item);
	}

	var option = {
		backgroundColor : new echarts.graphic.RadialGradient(0.3, 0.3, 0.8, [ {
			offset : 0,
			color : '#f7f8fa'
		}, {
			offset : 1,
			color : '#cdd0d5'
		} ]),
		title : {
			text : option_title_text,
			x: 'center'
		},
		toolbox: option_toolbox,
		legend : {
			data : option_legend_data,
			top: '7%'
		},
		xAxis : {
			splitLine : option_Axis_splitLine
		},
		yAxis : {
			splitLine : option_Axis_splitLine,
			scale : true//是否是脱离 0 值比例。设置成 true 后坐标刻度不会强制包含零刻度。
		},
		series : option_series
	};

	return option;
}

//漏斗图1
function get_funnel_chart_one_option(echartsData){
	
	//---start(模拟数据)---
	/*var option_legend_data = ['展现','点击','访问','咨询','订单'];
	
	var option_series_data_value = [100,80,60,40,20];

	var option_title_text = '漏斗图';*/
	//---end(模拟数据)---
	var option_legend_data = echartsData.option_legend_data;
		
	var option_series_data_value = echartsData.option_series_data_value;
		
	var option_title_text = echartsData.option_title_text;
	
	var option_series_data = [];
	
	for(var i = 0;i < option_series_data_value.length;i++){
		var color = colorArray[i+8];
		var option_series_data_item = {
				value : option_series_data_value[i],
				name : option_legend_data[i],				
		};
		
		option_series_data.push(option_series_data_item);
	}
	
	var option = {
		    title: {
		        text: option_title_text,
		        x: 'center'
		    },
		    tooltip: {
		        trigger: 'item',
		        formatter: "{b} : {c}%"//{a} <br/>{b} : {c}%
		    },
		    toolbox: option_toolbox,
		    legend: {
		        data: option_legend_data,
		        top: '7%'
		    },
		    calculable: true,
		    series: [
		        {
		        	name: '',
		            type:'funnel',
		            left: '10%',
		            top: 60,
		            //x2: 80,
		            bottom: 60,
		            width: '80%',
		            // height: {totalHeight} - y - y2,
		            min: 0,
		            max: 100,
		            minSize: '0%',
		            maxSize: '100%',
		            sort: 'descending',
		            gap: 2,
		            label: {
		                normal: {
		                    show: true,
		                    position: 'inside'
		                },
		                emphasis: {
		                    textStyle: {
		                        fontSize: 20
		                    }
		                }
		            },
		            labelLine: {
		                normal: {
		                    length: 10,
		                    lineStyle: {
		                        width: 1,
		                        type: 'solid'
		                    }
		                }
		            },
		            itemStyle: {
		                normal: {
		                    borderColor: '#fff',
		                    borderWidth: 1,
		                    color:function(params){
		                    	var colorList = colorArray;
		                    	return colorList[params.dataIndex];
		                    }
		                }
		            },
		            data: option_series_data
		        }
		    ]
		};
	
	return option;
}

//仪表盘1
function get_gauge_chart_one_option(echartsData){
	
	//---start(模拟数据)---
	/*var option_title_text = '仪表盘';
	var option_series_maxAndData = ['完成率',55,110];*/
	//---end(模拟数据)---
	var option_title_text = echartsData.option_title_text;
	var option_series_maxAndData = echartsData.option_series_maxAndData;
	
	var option = {
			title: {
		        text: option_title_text,
		        x: 'center'
		    },
	        tooltip: {
	            formatter: "{b} : {c}"
	        },
	        toolbox: option_toolbox,
	        series: [
	            {
	            	name: '',
	                min: 0,
	                max: option_series_maxAndData[2],
	                type: 'gauge',
	                detail: {formatter: '{value}'},
	                data: [{value: option_series_maxAndData[1], 
	                	    name: option_series_maxAndData[0]}],
	                itemStyle:{
	                	normal:{
	                		color:function(params){
		                    	var colorList = colorArray;
		                    	return colorList[params.dataIndex];
		                    }
	                	}
	                }
	            }
	        ]
	    };
	
	return option;
}
