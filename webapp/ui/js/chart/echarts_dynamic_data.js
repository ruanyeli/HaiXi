/**
 * Created by wangjuan on 2017/6/14.
 */
function EchartsDynamicData(){

    this.getEchartsData = function(type,data,title,tag,isTrans) {//isTrans为1则转置
		
		this.option_title_text = title;
		
		switch (type) {
			case DISPLAY_PIE_CHART_ONE: 
			case DISPLAY_PIE_CHART_TWO: 
			case DISPLAY_PIE_CHART_THREE: 
			case DISPLAY_FUNNEL_CHART_ONE: {
				
				if(isTrans == 1){
					//转置：二维表的数据为两行
					this.option_legend_data = getTableHeaders(data);
					this.option_series_data_value = getTableFirstRowValue(data);
				}else{
					//不转置：二维表的数据为两列
					this.option_legend_data = getTableFirstCloumnValue(data);
					this.option_series_data_value = getTableSecondCloumnValue(data);
				}
				
				break;
			}
			case DISPLAY_LINE_CHART_ONE: 
			case DISPLAY_LINE_CHART_TWO: 
			case DISPLAY_BAR_CHART_ONE: 
			case DISPLAY_BAR_CHART_THREE: 
			case DISPLAY_BAR_CHART_FOUR: 
			case DISPLAY_SCATTER_CHART_ONE : {
				
				if(isTrans == 1){
					//转置：x轴的数据为除第一列的表头数据
					this.option_legend_data = getTableFirstCloumnValue(data);
					this.option_xAxis_data = getTableHeadersNotFirst(data);
					this.option_series_data = getTableValueRowsNotFirst(data);
				}else{
					//不转置：x轴的数据为第一列的值
					this.option_legend_data = getTableHeadersNotFirst(data);
					this.option_xAxis_data = getTableFirstCloumnValue(data);
					this.option_series_data = getTableValueNotFirst(data);
				}
				
				if(type == DISPLAY_BAR_CHART_THREE){
					//折柱混合区分标识，可理解为折线的条数
					this.tag = tag;
				}
				
				break;
			}
			case DISPLAY_LINE_CHART_THREE : {
				
				if(isTrans == 1){
					//转置：二维表的数据为两行
					this.option_xAxis_data = getTableHeaders(data);
					this.option_series_data = getTableFirstRowValue(data);
				}else{
					//不转置：二维表的数据为两列
					this.option_xAxis_data = getTableFirstCloumnValue(data);
					this.option_series_data = getTableSecondCloumnValue(data);
				}
				
				break;
			}
			case DISPLAY_BAR_CHART_TWO : {//柱状图--总-分：特殊处理
				
				if(isTrans == 1){
					//转置：二维表的数据为两行
					firstCloumnValue = getTableHeaders(data);
					secondCloumnValue = getTableFirstRowValue(data);
				}else{
					//不转置：二维表的数据为两列
					firstCloumnValue = getTableFirstCloumnValue(data);
					secondCloumnValue = getTableSecondCloumnValue(data);
				}
				
				firstCloumnValue.unshift('总');//unshift:可向数组的开头添加一个或更多元素，并返回新的长度。
				this.option_xAxis_data = firstCloumnValue;
				
				var arrayOne = [];
				var arrayTwo = [];
				var sum = 0;
				for(var i = secondCloumnValue.length - 1;i >= 0;i--){
					arrayOne.unshift(sum);
					arrayTwo.unshift(secondCloumnValue[i]);
					sum = sum + secondCloumnValue[i];
				}
				arrayOne.unshift(0);
				arrayTwo.unshift(sum);
				var optionSeriesData = [];
				optionSeriesData.push(arrayOne);
				optionSeriesData.push(arrayTwo);
				
				this.option_series_data = optionSeriesData;
				
				break;
			}
            case DISPLAY_SCATTER_CHART_TWO : {//气泡图：特殊处理
            	
            	var headers = getTableHeaders(data);
            	
            	var chartData=[];
        	    var optionLegendData=[];
        	    //给optionLegendData赋值以及初始化chartData
        	    $.each(data,function(index,item){
        	    	var optionSeriesName = item[headers[4]];
        	    	var d={};
        	    	var temp = optionLegendData.indexOf(optionSeriesName);
        	    	if(temp == -1){
        	    		optionLegendData.push(optionSeriesName);
        	    		d={};
        	    		d.name=optionSeriesName;
        	    		d.value=[];
        	    		chartData.push(d);
        	    	}
        		});
        	    //chartData:[*{name:'',value:[]}]
        	    
        	    //给chartData[i].value赋值
        		$.each(data,function(index,item){
        			var tpoint = [];//保存一个点的数据，x、y、s、tag，即一条记录的前四个字段
        			for(var i = 0;i < headers.length - 1;i++){
        				tpoint.push(item[headers[i]]);
        			}
        			for(var i = 0;i < chartData.length;i++){
        				if(item[headers[4]] == chartData[i].name){
        					chartData[i].value.push(tpoint);
        				}
        			}
        		});
        		//chartData:[{name:'',value:[[x,y,s,tag],...]},...]
				
        		var optionSeriesData = [];
        		for(var i = 0;i < chartData.length;i++){
        			optionSeriesData.push(chartData[i].value);
        		}
        		//optionSeriesData:[[[x,y,s,tag],...],...]
        		
        		this.option_series_data = optionSeriesData;
        		this.option_legend_data = optionLegendData;
        		
				break;
			}
            case DISPLAY_DASH_BOARD_CHART_ONE : {
            	
            	var firstRowValue = getTableFirstRowValue(data);
            	
            	if(firstRowValue.length == 2){
            		firstRowValue.push(100);
            	}
            	
            	this.option_series_maxAndData = firstRowValue;
            		
            	break;
            }
            default : {
            	
            }
		}//---end(switch)---
		
		return this;
	};
	
	//获取二维表的表头
	getTableHeaders = function(data){
		var headers = [];
		for(var key in data[0]){
			headers.push(key);
		}
		return headers;
	};
	
	//获取二维表除第一列的表头
	getTableHeadersNotFirst = function(data){
		var headers = getTableHeaders(data);
	    headers.remove(0);
		return headers;
	};
	
	//获取二维表第i列的表头
	getTableHeadersIndex = function(data,i){
		var headers = getTableHeaders(data);
		var iHeader = headers[i];
		return iHeader;
	};
	
	//获取二维表第一列的表头
	getTableHeadersFirst = function(data){
		var firstHeard = getTableHeadersIndex(data,0);
		return firstHeard;
	};
	
	//以二维数组的格式返回二维表的数据，一维数组表示每列的值，二维数组表示多列的值
	getTableValue = function(data){
		var headers = getTableHeaders(data);
		var tableValue = [];
		for(var i = 0;i < headers.length;i++){//初始化tableValue
			var column = [];
			tableValue.push(column);
		}
		
		//给tableValue赋值
		$.each(data,function(index,item){//index代表行号，从0开始；item代表每行的数据
			//对每一行进行处理
			for(var j = 0;j < headers.length;j++){
				var cellValue = item[headers[j]];
				tableValue[j].push(cellValue);
			}
		});
		
		return tableValue;
	};
	
	//以二维数组的格式返回二维表除第一列的数据，一维数组表示每列的值，二维数组表示多列的值
	getTableValueNotFirst = function(data){
		var tableValue = getTableValue(data);
		tableValue.remove(0);
		return tableValue;
	};
	
	//获取二维表的第i列的数据
	getTableIndexCloumnValue = function(data,i){
		var tableValue = getTableValue(data);
		var iCloumnValue = tableValue[i];
		return iCloumnValue;
	};
	
	//获取二维表的第一列的数据
	getTableFirstCloumnValue = function(data){
		var firstCloumnValue = getTableIndexCloumnValue(data,0);
		return firstCloumnValue;
	};
	
	//获取二维表的第二列的数据
	getTableSecondCloumnValue = function(data){
		var secondCloumnValue = getTableIndexCloumnValue(data,1);
		return secondCloumnValue;
	};
	
	//以二维数组的格式返回二维表的数据，一维数组表示每行的值，二维数组表示多行的值
	getTableValueRows = function(data){
		var headers = getTableHeaders(data);
		var tableValue = [];
		
		//给tableValue赋值
		$.each(data,function(index,item){//index代表行号，从0开始；item代表每行的数据
			var row = [];
			//对每一行进行处理
			for(var j = 0;j < headers.length;j++){
				var cellValue = item[headers[j]];
				row.push(cellValue);
			}
			
			tableValue.push(row);
		});
		
		return tableValue;
	};
	
	//以二维数组的格式返回二维表除第一列的数据，一维数组表示每行(不包括第一列)的值，二维数组表示多行(不包括第一列)的值
	getTableValueRowsNotFirst = function(data){
		var tableValue = getTableValueRows(data);
		for(var i = 0;i < tableValue.length;i++){
			tableValue[i].remove(0);
		}
		return tableValue;
	};
	
	//获取二维表第一行的数据
	getTableFirstRowValue = function(data){
		var tableValue = getTableValueRows(data);
		return tableValue[0];
	}
	
	/**
	 * 删除数组某一指定元素
	 */
	Array.prototype.remove = function(m){
		if(isNaN(m)||m>this.length){
			return false;
		}
		this.splice(m,1);  
	 }
};