/**
 * 
 */
var _depid=parent.$("#user_department").val();
/**
 * 算子添加修改下拉框级联
 */
$(document).ready(function(){
	$("#orstage").combobox({
		valueField:"orstageid",
		textField:"orstagename",
		value:0,
		data:[{    
			    "orstageid":0,    
			    "orstagename":"本期"   
			},{    
			    "orstageid":1,    
			    "orstagename":"环比"   
			},{    
			    "orstageid":2,    
			    "orstagename":"同比"    
			}]  
		});
	$("#orstastage").combobox({
		valueField:"orstageid",
		textField:"orstagename",
		data:[{    
		    "orstageid":"0",    
		    "orstagename":"年"   
		},{    
		    "orstageid":"1",    
		    "orstagename":"季度"   
		},{    
		    "orstageid":"2",    
		    "orstagename":"月"    
		}]  
		});	

		$.ajax({
			type:"post",
			url:"/department/ListDepartment",
			success: function(result){
	    			$("#ordepartment").combobox({
	    				valueField:"depid",
	    				textField:"depname",
	    				data:result.data
	    			});
	    			$("#department").combobox({
	    				valueField:"depid",
	    				textField:"depname",
	    				data:result.data,
	    				onChange:function(newValue,oldValue){
	    					$("#stattype").combobox("clear");
	    					$("#stattype").combobox('loadData', {});
	    					$("#orstatement").combobox("clear");
	    					$("#orstatement").combobox('loadData', {});
	    					$("#orstagename").combobox("clear");
	    					$("#orstagename").combobox('loadData', {});
	    					$("#orupper").combobox("clear");
	    					$("#orupper").combobox('loadData', {});
	    					$("#orleft").combobox("clear");
	    					$("#orleft").combobox('loadData', {});
	    					var depid = newValue;
	    					$("#stattype").combobox({
	    						url:"/diyMenu/findStatementType?depid="+newValue,
	    						valueField:"stattype",
	    						textField:"typename",
	    						//value:0,
	    						onChange:function(newValue,oldValue){
	    							$("#orstatement").combobox("clear");
	    	    					$("#orstatement").combobox('loadData', {});
	    	    					$("#orstagename").combobox("clear");
	    	    					$("#orstagename").combobox('loadData', {});
	    	    					$("#orupper").combobox("clear");
	    	    					$("#orupper").combobox('loadData', {});
	    	    					$("#orleft").combobox("clear");
	    	    					$("#orleft").combobox('loadData', {});
	    							$.ajax({
	    	    						type:"post",
	    	    						url:"/diyMenu/ListAllHaveLeftAndDataStatement?depid="+depid+"&type="+newValue,
	    	    						success:function(res){
	    	    							$("#orstatement").combobox({
	    	    		        				valueField:"staid",
	    	    		        				textField:"staname",
	    	    		        				data:res.data,
	    	    		        				onChange:function(newVal,oldVal){
	    	    		        					$("#orstagename").combobox("clear");
	    	    	    	    					$("#orstagename").combobox('loadData', {});
	    	    	    	    					$("#orupper").combobox("clear");
	    	    	    	    					$("#orupper").combobox('loadData', {});
	    	    	    	    					$("#orleft").combobox("clear");
	    	    	    	    					$("#orleft").combobox('loadData', {});
	    	    		        					$.ajax({
	    	    		        						type:"post",
	    	    		        						url:"/diyMenu/getStageAndUpperAndLeft",
	    	    		        						data:{"staid":newVal},
	    	    		        						success:function(resp){
	    	    		        							$("#orupper").combobox({
	    	    		        		        				valueField:"uppid",
	    	    		        		        				textField:"uppstruct",
	    	    		        		        				data:resp.data.upperList
	    	    		        		        			});
	    	    		        							$("#orleft").combobox({
	    	    		        		        				valueField:"leftid",
	    	    		        		        				textField:"leftstruct",
	    	    		        		        				data:resp.data.leftList
	    	    		        		        			});
	    	    		        						}
	    	    		        					});
	    	    		        					$.ajax({
	    	    		        						type:"post",
	    	    		        						url:"/diyMenu/getStagename",
	    	    		        						data:{"staid":newVal},
	    	    		        						success:function(resp){
	    	    		        							$("#orstagename").combobox({
	    	    		        		        				valueField:"stagename",
	    	    		        		        				textField:"stagename",
	    	    		        		        				data:resp.data
	    	    		        		        			});
	    	    		        						}
	    	    		        					});
	    	    		        				}
	    	    							});
	    	    						}
	    	    					});
	    						}
	    					});
	    				}
	    			});
			}
		});
		if(_depid!=0){
			$("#ordepartment").next(".combo").hide();
			$("#label_ordepartment").hide();//如果是部门管理者要隐藏选择算子所属部门，给算子所属部门一个固定的id
		}
});


function submitForm(){
	$("#addOperator").form({
		url:"/derive/addOperator",
		onSubmit:function(param){
			var stattype = $("#stattype").combobox('getValue');//报表类型(0-年报,1-半年报,2-季报,3-月报,4-常规报表)
			var orstastage = $("#orstastage").combobox('getValue');//统计维度(0-年,1-季度,2-月)
			if(_depid!=0){
				$("#ordepartment").combobox('setValue',_depid);
			}
			if((stattype==0&&(orstastage==1||orstastage==2))||(stattype==2&&orstastage==2)){
				layer.msg("统计维度不能小于报表类型");
				return false;
			}
		},
		success:function(resp){
			if(eval('('+resp+')').resultCode=="0"){
				layer.msg("添加成功",{time:1000});
				setTimeout(function(){parent.$('#mydialog').dialog('close');},2000);
//				parent.$('#mydialog').dialog('close');
			}else{
				layer.msg(eval('('+resp+')').resultDesc);
			}
		}
	});
	$("#addOperator").submit();
}

function cancelForm(){
	parent.$('#mydialog').dialog('close');
}
