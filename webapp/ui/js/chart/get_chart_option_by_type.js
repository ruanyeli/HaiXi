/**
 * Created by wangjuan on 2017/6/22.
 */

function getOptionByType(type,echartsData){
	var option = null;
	
	switch (type){
		case DISPLAY_PIE_CHART_ONE : {
			
			option = get_pie_chart_one_option(echartsData);
			
			break;
			
		}case DISPLAY_PIE_CHART_TWO :{
			
			option = get_pie_chart_two_option(echartsData);

			break;
			
		}case DISPLAY_PIE_CHART_THREE :{
			
			option = get_pie_chart_three_option(echartsData);	

			break;
			
		}case DISPLAY_LINE_CHART_ONE :{
			
			option = get_line_chart_one_option(echartsData);

			break;
			
		}case DISPLAY_LINE_CHART_TWO :{
			
			option = get_line_chart_two_option(echartsData);

			break;
			
		}case DISPLAY_LINE_CHART_THREE :{
			
			option = get_line_chart_three_option(echartsData);

			break;
			
		}case DISPLAY_BAR_CHART_ONE :{
			
			option = get_bar_chart_one_option(echartsData);

			break;
			
		}case DISPLAY_BAR_CHART_TWO :{
			
			option = get_bar_chart_two_option(echartsData);

			break;
			
		}case DISPLAY_BAR_CHART_THREE :{
			
			option = get_bar_chart_three_option(echartsData);

			break;
			
		}case DISPLAY_BAR_CHART_FOUR :{
			
			option = get_bar_chart_four_option(echartsData);

			break;
			
		}case DISPLAY_SCATTER_CHART_ONE :{
			
			option = get_scatter_chart_one_option(echartsData);

			break;
			
		}case DISPLAY_SCATTER_CHART_TWO :{
			
			option = get_scatter_chart_two_option(echartsData);

			break;
			
		}case DISPLAY_FUNNEL_CHART_ONE : {
			
			option = get_funnel_chart_one_option(echartsData);
			
			break;
			
		}case DISPLAY_DASH_BOARD_CHART_ONE : {
			
			option = get_gauge_chart_one_option(echartsData);
			
			break;
		}
	}
	
	return option;
}

function initCharts(chartAndTypeArray){
	for(var i = 0;i < chartAndTypeArray.length;i++){
		
		var echartsData = echartsStaticData.getEchartsData(chartAndTypeArray[i].type);
        
        var option = getOptionByType(chartAndTypeArray[i].type,echartsData);
        option.toolbox.show = false;//示例图统一不显示工具栏
        if(option.legend != null){//示例图DOM容器的高度为270px，比预览显示的400px小，所以统一调整一下图例组件的高度
        	option.legend.top = '10%';
        }
        
        chartAndTypeArray[i].chart.setOption(option);
        
        //---temp
        chartAndTypeArray[i].chart.on('click',function(e){
    		console.log(e);
    	});
        //---temp
	}
}