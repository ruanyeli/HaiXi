	var areas = ['allarea','mangya','lenghu','dachaidan','geermu','delingha','tianjun','wulan','dulan'];
	var areasName = ['全州','茫崖行委','冷湖行委','大柴旦行委','格尔木市','德令哈市','天峻县','乌兰县','都兰县'];
	var indexsTable = [{
						name : '地区生产总值',
						unit : '亿元',
						selected : true,
						tableName : 'regionalgdp',
						columns : [ {
							columnName : '绝对额',
							type : 'bar',
							yAxisIndex : 0
						}, {
							columnName : '比上年增长',
							type : 'line',
							yAxisIndex : 2
						} ]
					}, {
						name : '规模以上工业增加值',
						unit : '亿元',
						selected : false,
						tableName : 'industy_increase',
						columns : [ {
							columnName : '绝对额',
							type : 'bar',
							yAxisIndex : 0
						}, {
							columnName : '比上年增长',
							type : 'line',
							yAxisIndex : 2
						} ]
					}, {
						name : '城镇常住居民人均可支配收入',
						unit : '元',
						selected : true,
						tableName : 'urban_per',
						columns : [ {
							columnName : '绝对额',
							type : 'bar',
							yAxisIndex : 1
						}, {
							columnName : '比上年增长',
							type : 'line',
							yAxisIndex : 2
						} ]
					},{
						name : '农村常住居民人均可支配收入',
						unit : '元',
						selected : true,
						tableName : 'village_per',
						columns : [ {
							columnName : '绝对额',
							type : 'bar',
							yAxisIndex : 1
						}, {
							columnName : '比上年增长',
							type : 'line',
							yAxisIndex : 2
						} ]
					},{
						name : '固定资产投资',
						unit : '亿元',
						selected : false,
						tableName : '`assets_invest`',
						columns : [ {
							columnName : '绝对额',
							type : 'bar',
							yAxisIndex : 0
						}, {
							columnName : '比上年增长',
							type : 'line',
							yAxisIndex : 2
						} ]
					},{
						name : '地方公共财政预算收入',
						unit : '亿元',
						selected : false,
						tableName : 'social_spend',
						columns : [ {
							columnName : '绝对额',
							type : 'bar',
							yAxisIndex : 0
						}, {
							columnName : '比上年增长',
							type : 'line',
							yAxisIndex : 2
						} ]
					},{
						name : '社会消费品零售总额',
						unit : '亿元',
						selected : false,
						tableName : 'revenues',
						columns : [ {
							columnName : '绝对额',
							type : 'bar',
							yAxisIndex : 0
						}, {
							columnName : '比上年增长',
							type : 'line',
							yAxisIndex : 2
						} ]
					} ];
	
	var indexTablesName = [];
	for(var i = 0;i < indexsTable.length;i++){
		indexTablesName.push(indexsTable[i].tableName);
	}
	
	var areasData = {};
	//根据areas和indexsTable初始化areasData
	for(var l = 0;l < areas.length;l++){
		var areaName = areas[l];
		areasData[areaName] = {};
		//areasData = {area0:{},area1:{},...}
		for(var i = 0;i < indexsTable.length;i++){
			var tableName = indexsTable[i].tableName;
			areasData[areaName][tableName] = {};
			//areasData = {area0:{table0:{},table1:{},...},area1:{},...}
			for(var j = 0;j < indexsTable[i].columns.length;j++){
				var columnName = indexsTable[i].columns[j].columnName;
				areasData[areaName][tableName][columnName] = [];
				//areasData = {area0:{table0:{column0:[],column1:[],...},table1:{},...},area1:{},...}
			}
		}
	}//初始化areasData结束
	
	$(document).ready(function() {
		$(".area").click(function(){
			$(".area").removeClass("selected");
			$(this).addClass("selected");
		});
		$("#all").click(function(){
			$(".area").removeClass("selected");
			drawChart(areas[0]);
		});
		$(".area").each(function(i,o){
			$(o).click(function(){
				//console.log(i);
				drawChart(areas[i+1]);//要求html页面.area的顺序 与 areas[]的顺序要一致
			});
		});
		
		
		$.ajax({
			   type : "POST",
			   url : "/chart/getTablesData",
			   data : {'tablesName' : indexTablesName},
			   success : function(data){
				   //console.log(data);
				   parseData(data);
				   drawChart(areas[0]);
			   },
			   error: function(){
				   console.log(arguments[1]);
			   }
			});
	});
	
	function parseData(data){
		for(var key in data){
			var tableName = key;
			for(var i = 0;i < data[tableName].length;i++){
				var areaName = data[tableName][i].area;
				var areaNameFormat = areaName.replace(/\s+/g,"");//去除空格
				var pos = areasName.indexOf(areaNameFormat);
				var area = areas[pos];//要求areas 与 areasName相对应
				for(var key in areasData[area][tableName]){
					//areasData = {area0:{table0:{column0:[],column1:[],...},table1:{},...},area1:{},...}
					var columnName = key;
					var value = data[tableName][i][columnName];
					var num = parseFloat(value);
					if(columnName!= null && columnName.indexOf('比上年') != -1){
						num = num.toFixed(1);
					}else{
						num = num.toFixed(2);
					}
					//console.log("columnName is:" + columnName + "; num is:" + num);
					areasData[area][tableName][columnName].push(num);
				}
			}
		}
		
		//console.log(areasData);
	}
	
	function drawChart(area){
		var year = new Date().getFullYear();
		var xAxis_data =[];
		for(var i = 0;i < 6;i++){
			xAxis_data.push(year - 6 + i);
		}
		
		var series = [];
		var legend_selected = {};
		var legend_data = [];
		for(var i = 0;i < indexsTable.length;i++){//给series、legend_selected、legend_data赋值
			var name = indexsTable[i].name;
			legend_data.push(name);
			var selected = indexsTable[i].selected;
			legend_selected[name] = selected;
			var tableName = indexsTable[i].tableName;
			for(var j = 0;j < indexsTable[i].columns.length;j++){
				var seriesItem = {};
				seriesItem.name = name;
				seriesItem.type = indexsTable[i].columns[j].type;
				seriesItem.barMaxWidth = '10px';
				seriesItem.yAxisIndex = indexsTable[i].columns[j].yAxisIndex;
				var columnName = indexsTable[i].columns[j].columnName;
				seriesItem.data = areasData[area][tableName][columnName];
				series.push(seriesItem);
			}
		}
		//console.log(series);
		
		var chart = echarts.init(document.getElementById("chart"));
		var colors = ['#5793f3', '#d14a61', '#675bba'];//y轴的颜色
		var pos = areas.indexOf(area);
		var areaName = areasName[pos];
		var chartOption = {
				title:{
					text: areaName + '主要经济指标',//dynamic
					x:'center'
				},
			    tooltip: {
			        trigger: 'axis',
			        axisPointer: {
			            type: 'shadow'
			        },
			        formatter: function(params){//dynamic
			        	//console.log(params);
			        	var result = '';
			        	for(var i = 0;i < params.length;i++){
			        		if(params[i].seriesType == 'bar'){
			        			var unittemp = indexsTable[params[i].seriesIndex/2].unit;
			        			result = result + params[i].seriesName + ':' + params[i].value + unittemp + '</br>';
			        		}
			        		if(params[i].seriesType == 'line'){
			        			result = result + params[i].seriesName + '比上年增长:' + params[i].value + '%' + '</br>';
			        		}
			        	}
			        	return result;
			        }
			    },
			    grid: {
			        right: '20%'
			    },
			    toolbox: {
			    	show: true,
			        feature: {
			            dataView: {readOnly: true},
			            restore: {},
			            saveAsImage: {}
			        }
			    },
			    legend: {
			    	bottom:-5,
			    	selected:legend_selected,//dynamic
			        data:legend_data//dynamic
			    },
			    xAxis: [
			        {
			            type: 'category',
			            axisTick: {
			                alignWithLabel: true
			            },
			            data: xAxis_data//dynamic
			        }
			    ],
			    yAxis: [
			        {
			            type: 'value',
			            name: '（亿元）',
			            position: 'right',
			            axisLine: {
			                lineStyle: {
			                    color: colors[0]
			                }
			            },
			            axisLabel: {
			                formatter: '{value}'
			            }
			        },
			        {
			            type: 'value',
			            name: '（元）',
			            position: 'right',
			            offset: 80,
			            axisLine: {
			                lineStyle: {
			                    color: colors[1]
			                }
			            },
			            axisLabel: {
			                formatter: '{value}'
			            }
			        },
			        {
			            type: 'value',
			            name: '增长率%',
			           
			            position: 'left',
			            axisLine: {
			                lineStyle: {
			                    color: colors[2]
			                }
			            },
			            axisLabel: {
			                formatter: '{value} %'
			            }
			        }
			    ],
			    series: series//dynamic
			};
		
		chart.setOption(chartOption);
		window.onresize = chart.resize;
	}