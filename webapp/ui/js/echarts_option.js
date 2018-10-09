/**
 * 
 */
/**
 * 多折线图
 */
function get_mul_line(){
	
	var option={
			grid: { // 控制图的大小，调整下面这些值就可以，
		           x: 200,
		           y:100,
		           x2: 100,
		           y2: 100,// y2可以控制 X轴跟Zoom控件之间的间隔，避免以为倾斜后造成 label重叠到zoom上
		},
			title: {
	   	         //text: '海西地区工业增长值及增速表/增加值/累计',
	   	        	x: 'center',
	   	        	y:'top'
	   	     },
	   	     tooltip: {trigger: 'axis'},
	   	     legend: {
	   	         //data:
	   	    	orient: 'vertical',
	   	    	 x: 'left',
	   	    	 y:'top',
	   	         left: 10
	   	     },

	         toolbox: {
	             show : true,
	             feature : {
	                 mark : {show: true},
	                 dataView : {show: true, readOnly: false},
	                 magicType : {show: true, type: ['line', 'bar']},
	                 restore : {show: true},
	                 saveAsImage : {show: true}
	             }
	         },
	         calculable : true,
	         xAxis : [
	        	 {
	        		 type : 'category',
	                 boundaryGap : false,
	                 axisLabel: {        
	                     show: true,
	                     textStyle: {
	                         //color: '#000',
	                       //  fontSize:'2'
	                     },
	                     interval: 0  ,
	                     rotate:60,
	                 }
	                // data:['周一','周二','周三','周四','周五','周六','周日']
		   	    	 }
	         ],    
	   	     yAxis: [
	   	    	 {
	 	   	    	type: 'value'
	   	    	 }
	   	     ],
	   	     series: [
	   	     ]
	   	 };
	return option;
}


function getOption(input_title,left_arg,upper_arg,_serial){
	var option={
			grid: { // 控制图的大小，调整下面这些值就可以，
		           x: 200,
		           y:100,
		           x2: 200,
		           y2: 100,// y2可以控制 X轴跟Zoom控件之间的间隔，避免以为倾斜后造成 label重叠到zoom上
			},
			title : {
				text : input_title,
				x: 'center',
	        	y:'top'
			},
			tooltip : {
				trigger : 'axis'
			},
			legend : {
				orient: 'vertical',
	   	    	 x: 'left',
	   	    	 y:'top',
	   	         left: 10,  
				data :left_arg 
			},
			toolbox : {
				show : true,
				feature : {
					mark : {
						show : true
					},
					dataView : {
						show : true,
						readOnly : false
					},
					magicType : {
						show : true,
						type : [ 'line', 'bar' ]
					},
					restore : {
						show : true
					},
					saveAsImage : {
						show : true
					}
				}
			},
			calculable : true,
			xAxis : [ {
				data : upper_arg,
				 axisLabel: {                           
                  interval: 0,  
                  rotate:30,
              }
			} ],
			yAxis : [ {
				type : 'value'
			} ],
			series : _serial

		};
	return option;
}
//饼状图样式
function getPieOption(input_title,left_arg,upper_arg,_serial){
	var serials=[];
	var options=[];
	serials[0]=_serial[0];
	for(var i=0;i<upper_arg.length;i++){
		upper_arg[i]=upper_arg[i].match(/\((\S*?)\)/)[1];
		upper_arg[i]=upper_arg[i].replace('年','-');
		upper_arg[i]=upper_arg[i].replace('月','');
	}
	options.push({
		title : {
			x: 'center',
        	y:'top',
            text: input_title
        },
        tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
        	orient: 'vertical',
  	    	 x: 'left',
  	    	 y:'top',
  	         left: 10,  
            data:left_arg
        },
        toolbox: {
            show : true,
            feature : {
                mark : {show: true},
                dataView : {show: true, readOnly: false},
                magicType : {
                    show: true, 
                    type: ['pie', 'funnel'],
                    option: {
                        funnel: {
                            x: '25%',
                            width: '50%',
                            funnelAlign: 'left',
                            max: 1700
                        }
                    }
                },
                restore : {show: true},
                saveAsImage : {show: true}
            }
        },
        series : serials
	});
	for(var i=1;i<_serial.length;i++){
		var serialsi=[];
		serialsi.push(_serial[i]);
		options.push({
			series:serialsi
		})
	}
	
	var option = {
	    timeline : {
	        data :upper_arg,
	        label : {
	            formatter : function(s) {
	                return s.slice(0, 7);
	            }
	        }
	    },
	    options : options
	};  
	//console.log(option);
	return option;
}

function getOption(input_title,left_arg,upper_arg,_serial,_yAxis){
	var option={
			grid: { // 控制图的大小，调整下面这些值就可以，
		           x: 200,
		           y:100,
		           x2: 200,
		           y2: 100,// y2可以控制 X轴跟Zoom控件之间的间隔，避免以为倾斜后造成 label重叠到zoom上
			},
			title : {
				text : input_title,
				x: 'center',
	        	y:'top'
			},
			tooltip : {
				trigger : 'axis'
			},
			legend : {
				orient: 'vertical',
	   	    	 x: 'left',
	   	    	 y:'top',
	   	         left: 10,  
				data :left_arg 
			},
			toolbox : {
				show : true,
				feature : {
					mark : {
						show : true
					},
					dataView : {
						show : true,
						readOnly : false
					},
					magicType : {
						show : true,
						type : [ 'line', 'bar' ]
					},
					restore : {
						show : true
					},
					saveAsImage : {
						show : true
					}
				}
			},
			calculable : true,
			xAxis : [ {
				data : upper_arg,
				 axisLabel: {                           
                  interval: 0,  
                  rotate:30,
              }
			} ],
			yAxis : [ {
				type : 'value'
			} ],
			series : _serial

		};
	return option;
}