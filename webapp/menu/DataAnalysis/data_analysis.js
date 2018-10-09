/**
 * 
 */
_url = "";
var chartIndexs = [];
$(document).ready(
		function() {
//			init_yeareSelect("year");
			init_communiqueSelect("communique"); // 初始化公报
		})

/**
 * 选择公报模板
 */
function init_communiqueSelect(selectid) {
	$.ajax({
		url : _url + '/communique/getCommunique',
		type : 'post',
		async : false,
		// contentType:"application/json",
		data : {

		},
		success : function(response) {

			var init_str = '<option value="">--请选择--</option>';
			for (var i = 0; i < response.length; i++) {
				init_str += '<option value=' + response[i].id + '>'
						+ response[i].title + '</option>';
			}
			$("#" + selectid).html(init_str);
		}
	});
}
function submit()
{
	var ue;
	var content;
	var newcontent='';
	var contentArray=[];
	var formulaArray=[];
	var communiqueId = $('#communique option:selected').val();// 选中的值	

	var year = $('#year').val();// 选中的值	
	var season = $('#season option:selected').val();// 选中的值
	var month = $('#month option:selected').val();// 选中的值
	console.log(year);
	console.log(season);
	console.log(month);

	//var year = $('#year option:selected').val();// 选中的值	
	//var year = $("#begintime").val().slice(0, 4);
	

	$.ajax({
		url : _url + '/communique/editCommunique',
		type : 'post',
		async : false,
		// contentType:"application/json",
		data : {
			returnType:'data_analysis',
			id:communiqueId
		},
		success : function(response) {
			content = response.editorText;
//			content = "imgB4D8[{\"type\":\"bar\",\"statementId\":\"1888\",\"statementName\":\"批发和零售业商品销售情况[2007-2009]\",\"stageName\":\"青海省-海西州\",\"upperId\":\"17934\",\"upperName\":\"限额以上企业(单位)月末库存总额\",\"leftId\":\"30109\",\"leftName\":\"合 计\"},{\"type\":\"bar\",\"statementId\":\"1888\",\"statementName\":\"批发和零售业商品销售情况[2007-2009]\",\"stageName\":\"青海省-海西州\",\"upperId\":\"17934\",\"upperName\":\"限额以上企业(单位)月末库存总额\",\"leftId\":\"30109\",\"leftName\":\"合计\"}];<br>img1234[{\"type\":\"bar\",\"statementId\":\"1888\",\"statementName\":\"批发和零售业商品销售情况[2007-2009]\",\"stageName\":\"青海省-海西州\",\"upperId\":\"17934\",\"upperName\":\"限额以上企业(单位)月末库存总额\",\"leftId\":\"30109\",\"leftName\":\"合计\"}];";
			content = content.replace(/&quot;/g,'"');
			//console.log(content);
			//处理模板中图表的定义
			chartIndexs = [];
			var imgs = content.match(/img.+?;/g);
			//console.log(imgs);
			if(imgs != null){
				for(var i = 0;i < imgs.length;i++){
					var imgStr = imgs[i];
					var divId = imgStr.substring(3,7);
					var jsonStr = imgStr.substring(7,imgStr.length-1);//去除img divId和末尾的;
					var indexs = JSON.parse(jsonStr);
					for(var j = 0;j < indexs.length;j++){
						indexs[j].divId = divId;
					}
					chartIndexs = chartIndexs.concat(indexs);
					//console.log(chartIndexs);
					//将img占位符替换成div
					var re = new RegExp("img"+divId+".+?;");//imgdivId.+?;
					content = content.replace(re, "<div id=\""+divId+"\" class=\"willbedraw\" style=\"width: 600px; height: 400px;\"></div>");
				}
			}
			
			//处理模板中公式的定义
			var re = /\@.+?\#/g;// /@{(\S.*?)}#/g)
			formulaArray=content.match(re)//公式数组
			if(formulaArray != null){
				contentArray=content.split('@{');
				//console.log("1："+content);
				//console.log(contentArray.length);
				//console.log(formulaArray);
				for(var i=1;i<contentArray.length;i++){
					contentArray[i]='@{'+contentArray[i];//内容数组
					//operatorArray[i-1]=contentArray[i].match(/@{(\S*)}#/)[1];
				}
				console.log("formulas:"+formulaArray.join(","));
				$.ajax({
					url : _url + '/report/generateResult1',
					type : 'post',
					async : false,
					// contentType:"application/json",
					data : {
						formulas:formulaArray.join(","),
						year:year,
						season:season,
						month:month
					},
					success : function(response) {
						//替换算子公式
						console.log("response:"+JSON.stringify(response));
						newcontent=contentArray[0];
						for(var i=1;i<contentArray.length;i++){
						contentArray[i]=contentArray[i].replace(formulaArray[i-1],eval(response[i-1]));
						newcontent=newcontent+contentArray[i];
					     }
						$("#show").html(newcontent);
						getChartData();
						/*ue = UE.getEditor('editor');
						ue.ready(function() {
						    ue.execCommand('inserthtml', content)
						    ue.setDisabled('fullscreen');
						    disableBtn("enable");
						});*/
					}
				});
			}
			if(formulaArray == null){
				$("#show").html(content);
				getChartData();
			}
			
			/*ue = UE.getEditor('editor');
			ue.ready(function() {
				console.log(content);
			    ue.execCommand('inserthtml', content)
			    ue.setDisabled('fullscreen');
			    //disableBtn("enable");
			});*/
		}
	});
	
}

function getChartData(){
	
	   if(chartIndexs.length == 0){
		   return;
	   }
	   //var endTime = parseInt($("#year").val());
	   var endTime = $("#begintime").val().slice(0, 4);
	   var startTime = endTime - 1;
	   $.ajax({
		   type : "POST",
		   url : "/communique/getChartData",
		   data : {chartIndexs : JSON.stringify(chartIndexs),
			   startTime : startTime,
			   endTime : endTime
		   },
		   success : function(data){
			   dealCharts(data);
		   },
		   error: function(){
			   console.log(arguments[1]);
		   }
		});
}

function dealCharts(chartsData){
	   //TODO
	   //根据查看时选择的时间范围确定x轴的取值
	   //var xAxisData = ["2008.01","2008.02","2008.03","2008.04","2008.05","2008.06","2008.07","2008.08","2008.09","2008.10","2008.11","2008.12"];
	   var xAxisData = [];
	  // var endTime = parseInt($("#year").val());
	   
	   var endTime = $("#begintime").val().slice(0, 4);
	   for(var i = 0 ; i < 2;i++){
		   xAxisData.push(endTime - 1 + i);
	   }
	   
	   /* var xAxisData = [];
	   var startTime = $("#startTime").val();
	   var endTime = $("#endTime").val();
	   var startYear = parseInt(startTime.substr(0,4));
	   var startMonth = parseInt(startTime.substr(5));
	   var endYear = parseInt(endTime.substr(0,4));
	   var endMonth = parseInt(endTime.substr(5));
	   while(startYear < endYear ||(startYear == endYear && startMonth <= endMonth) ){
		   xAxisData.push(startYear + '.' + startMonth);
		   startMonth = startMonth + 1;
		   if(startMonth > 12){
			   startYear = startYear + 1;
			   startMonth = 1;
		   }
	   } */
	   //console.log(xAxisData);
	   chartsData = parseData(chartsData,xAxisData);
	   $("#show").find(".willbedraw").each(function(){
        var divId = $(this).attr("id");
        //console.log(divId);
        drawChart(divId,chartsData,xAxisData);
    });
}

function drawChart(divId,chartsData,xAxisData){
	   //console.log(chartsData[0].chartDatas);
	   var chartData = [];
	   for(var i = 0;i < chartsData.length;i++){
		   if(chartsData[i].divId == divId){
			   chartData.push(chartsData[i]);
		   }
	   }
	   var myChart = echarts.init(document.getElementById(divId));
	   var option = getOption(chartData,xAxisData);
	   myChart.setOption(option);
}

function getOption(chartData,xAxisData){
		//console.log(chartData);
		var option_legend_data = [];
		var option_xAxis_data = xAxisData;
		var option_title_text = chartData[0].statementName;		
		var option_series = [];
		
		for(var i = 0;i < chartData.length;i++){
			var legendData = chartData[i].upperName + "-" + chartData[i].leftName;
			option_legend_data.push(legendData);
			var yAxisIndex = 0;
			if(chartData[i].type == 'line'){
				yAxisIndex = 1;
			}
			var option_series_item = {
					name : legendData,
					data : chartData[i].chartDatas,
					type : chartData[i].type,
					yAxisIndex : yAxisIndex,
					barMaxWidth : '20px'
			};
			
			option_series.push(option_series_item);
		}
		
		var option = {
		        title: {
		            text: option_title_text,//dynamic
		            x: 'center'
		        },
		        tooltip: {
		            trigger: 'axis',
		            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
		                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
		            }
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
		            data: option_legend_data,//dynamic
		            top: '7%'
		        },
		        xAxis: [
		            {
						type : 'category',
						data : option_xAxis_data,//dynamic
						axisLabel:{  
			                interval:0,//横轴信息全部显示  
			                textStyle: {
			                	 fontSize:10
		                    } 
			            },
			            splitLine : {
		            		show : true,
		            		lineStyle : {
		            			type : 'dashed'//solid:实线;dashed:虚线;dotted:点线;
		            		}
		            	}
					}
		        ],
		        yAxis: [ {
						type : 'value',
						name : '',
						axisLabel : {
							formatter : '{value}',
								 textStyle: {
				                	 fontSize:8
			                    } 
						},
						splitLine : {
		        			show : true,
		        			lineStyle : {
		        				type : 'dashed'//solid:实线;dashed:虚线;dotted:点线;
		        			}
		        		}
					}, {
						type : 'value',
						name : '(%)',
						axisLabel : {
							formatter : '{value}%',
								 textStyle: {
				                	 fontSize:10
			                    } 
						},
						splitLine : {
		        			show : true,
		        			lineStyle : {
		        				type : 'dashed'//solid:实线;dashed:虚线;dotted:点线;
		        			}
		        		}
					} ],
		        series: option_series//dynamic
		    };
		
		return option;
	}

function parseData(chartsData,xAxisData){
		for(var i = 0;i < chartsData.length;i++){
			chartsData[i].chartDatas = [];//indexData
			for(var j = 0;j < xAxisData.length;j++){
				//TODO
				//根据x轴的信息获取期数
				/* var xData = xAxisData[j];//2008.3
				var year = xData.substr(0,4);
				var month = xData.substring(5,xData.length);
				var stageid = null;
				for(var m = 0;m < chartsData[i].stagesList.length;m++){
					if(chartsData[i].stagesList[m].year == year && chartsData[i].stagesList[m].month == month){
						stageid = chartsData[i].stagesList[m].stageid;
						break;
					}
				} */
				var xData = xAxisData[j];//2010
				var stageid = null;
				for(var m = 0;m < chartsData[i].stagesList.length;m++){
					if(chartsData[i].stagesList[m].year == xData){
						stageid = chartsData[i].stagesList[m].stageid;
						break;
					}
				}
				//根据期数获取数据
				var chartData = null;
				for(var n = 0;n < chartsData[i].indexData.length;n++){
					if(chartsData[i].indexData[n].stageid == stageid){
						chartData = chartsData[i].indexData[n]["_"+chartsData[i].upperId];
						break;
					}
				}
				chartsData[i].chartDatas.push(chartData);
			}
			//console.log(chartsData[i].chartDatas);
		}
		//console.log(chartsData);
		return chartsData;
}

