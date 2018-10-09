/**
 * Created by wangjuan on 2017/6/14.
 */
var echartsStaticData = {

	getEchartsData : function(type) {
		switch (type) {
			case DISPLAY_PIE_CHART_ONE :
			case DISPLAY_PIE_CHART_TWO :
			case DISPLAY_PIE_CHART_THREE : {
				this.option_legend_data = [ '直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎' ];
	
				this.option_series_data_value = [336,310,234,135,154];
	
				this.option_title_text = '饼状图';
				
				break;
			}
			case DISPLAY_LINE_CHART_ONE:
			case DISPLAY_LINE_CHART_TWO:{
				this.option_legend_data = ['邮件营销','联盟广告','视频广告','直接访问','搜索引擎'];
	
				this.option_xAxis_data = ['周一','周二','周三','周四','周五','周六','周日'];
				
				this.option_series_data = [[120, 132, 101, 134, 90, 230, 210],
										[220, 182, 191, 234, 290, 330, 310],
										[150, 232, 201, 154, 190, 330, 410],
										[320, 332, 301, 334, 390, 330, 320],
										[820, 932, 801, 934, 829, 933, 932]];
				
				if(type == DISPLAY_LINE_CHART_ONE){
					
					this.option_title_text = '折线图--支持一到多条';
				}else{//type == DISPLAY_LINE_CHART_TWO
					
					this.option_title_text = '折线图堆叠--累加永不相交';
				}
	
				break;
			}
			case DISPLAY_LINE_CHART_THREE : {
				this.option_xAxis_data = ['周一','周二','周三','周四','周五','周六','周日'];
				
				this.option_series_data = [120, 132, 101, 134, 90, 230, 210];

				this.option_title_text = '大数据量面积图';
				
				break;
			}
			case DISPLAY_BAR_CHART_ONE : {
				this.option_legend_data = ['蒸发量','降水量'];

				this.option_xAxis_data = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
				
				this.option_series_data = [[2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3],
				                          [2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3]
				                         ];

				this.option_title_text = '柱状图--支持一到多';
				
				break;
			}
			case DISPLAY_BAR_CHART_TWO : {
				this.option_xAxis_data = ['总','房租','水电费','交通费','伙食费','日用品数'];
				
				this.option_series_data = [[0, 1700, 1400, 1200, 300, 0],
				                          [2900, 1200, 300, 200, 900, 300]
				                         ];

				this.option_title_text = '柱状图--总-分';
				
				break;
			}
			case DISPLAY_BAR_CHART_THREE : 
			case DISPLAY_BAR_CHART_FOUR : 
			case DISPLAY_SCATTER_CHART_ONE : {
				this.option_legend_data = ['邮件营销','联盟广告','视频广告','直接访问','搜索引擎'];

				this.option_xAxis_data = ['周一','周二','周三','周四','周五','周六','周日'];
				
				this.option_series_data = [[120, 132, 101, 134, 90, 230, 210],
										[220, 182, 191, 234, 290, 330, 310],
										[150, 232, 201, 154, 190, 330, 410],
										[320, 332, 301, 334, 390, 330, 320],
										[420, 532, 501, 334, 429, 533, 432]];
				
				if(type == DISPLAY_BAR_CHART_THREE){
					
					this.option_title_text = '折柱混合';
					
					this.tag = 2;//折柱混合区分标识，可理解为折线的条数
				}else if(type == DISPLAY_BAR_CHART_FOUR){
					
					this.option_title_text = '堆叠条形图';
				}else if(type == DISPLAY_SCATTER_CHART_ONE){
					
					this.option_title_text = '散点图--支持一到多';
				}
				
				break;
			}
            case DISPLAY_SCATTER_CHART_TWO : {
            	this.option_series_data = [//[ 28604, 77, 17096869, 'Australia', 1990 ]前4个有效，第5个可有可无
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
            	              					[ 53354, 79.1, 321773631, 'United States', 2015 ] ] ];

            	this.option_legend_data = [ '1990', '2015' ];

            	this.option_title_text = '气泡图';
            	
				break;
			}
            case DISPLAY_FUNNEL_CHART_ONE : {
            	
            	this.option_legend_data = ['展现','点击','访问','咨询','订单'];
            	
            	this.option_series_data_value = [100,80,60,40,20];

            	this.option_title_text = '漏斗图';
            	
            	break;
            }
            case DISPLAY_DASH_BOARD_CHART_ONE : {
            	
            	this.option_title_text = '仪表盘';
            	
            	this.option_series_maxAndData = ['完成率',75,110];
            	
            	break;
            }
		}
		
		return this;
	}
};