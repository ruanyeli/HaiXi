var spread;
var _depid=parent.$("#user_department").val();//当前登录部门
var spreadNS = GC.Spread.Sheets;
var isSafari = (function() {
	var tem, M = navigator.userAgent
			.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i)
			|| [];
	if (!/trident/i.test(M[1]) && M[1] !== 'Chrome') {
		M = M[2] ? [ M[1], M[2] ] : [ navigator.appName, navigator.appVersion,
				'-?' ];
		if ((tem = navigator.userAgent.match(/version\/(\d+)/i)) != null)
			M.splice(1, 1, tem[1]);
		return M[0].toLowerCase() === "safari";
	}
	return false;
})();
var isIE = navigator.userAgent.toLowerCase().indexOf('compatible') < 0
		&& /(trident)(?:.*? rv ([\w.]+)|)/.exec(navigator.userAgent
				.toLowerCase()) !== null;
var tableinfo=new Array();//用来存放上表头和左表头信息
var upperRow=0;//上表头行
var upperCol=0;//上表头列
var leftRow=0;//左表头行
var leftCol=0;//左表头列
var uppsign=0;
var leftsign=0;
var cellValue=new Array();//用于存公式和值
var ruleArray=new Array();//用于存规则

$(document).ready(function () {
	
	if(_depid==0){
		document.getElementById("dep").style.display='block';
		$.ajax({
			type:"post",
			url:"/department/ListDepartment",
			success:function(resp){
				$("#dept").combobox({
					valueField:"depid",
					textField:"depname",
					data:resp.data
				});
			}
		});
	}
	
	$("#refunction").combobox({
		valueField:"funID",
		textField:"funName",
		value:"0",
		data:[
		  {funID:"0",funName:"原值"},
		  {funID:"1",funName:"求和"},
		  {funID:"2",funName:"平均值"},
		  {funID:"3",funName:"方差"},
		  {funID:"4",funName:"标准差"},
		  {funID:"5",funName:"最大值"},
		  {funID:"6",funName:"最小值"},
		  {funID:"7",funName:"数量"}
		]
	});
	$.ajax({
		type:"post",
		url:"/department/ListDepartment",
		success: function(result){
    			$("#department").combobox({
    				valueField:"depid",
    				textField:"depname",
    				data:result.data,
    				onChange:function(newValue,oldValue){
    					$("#restaid").combobox('clear');
    					$("#reupper").combobox('clear');
    					$.ajax({
    						type:"post",
    						url:"/diyMenu/findStatementType",
    						data:{
    							"depid":newValue
    						},
    						success:function(response){
    							$("#stattype").combobox({
    								panelHeight:100,
    								valueField:"stattype",
    								textField:"typename",
    								data:response,
    								onChange:function(newType,oldType){
//    									alert(newType);
    									var _data=[{
    										restage:"0",
    										stagename:"年"
    									},
    									{
    										restage:"1",
    										stagename:"半年"
    									},{
    										restage:"2",
    										stagename:"季度"
    									},{
    										restage:"3",
    										stagename:"月"
    									}
    									 ];
//    									alert(newType+1);
    									_data=_data.slice(0,parseInt(newType)+1);
//    									alert(JSON.stringify(_data));
    									$("#reupper").combobox('clear');
    									$("#restage").combobox({
    										panelHeight:100,
		    	    		        		valueField:"restage",
		    	    		        		textField:"stagename",
		    	    		        		data:_data
		    	    					});
    									$.ajax({
    			    	    				type:"post",
    			    	    				url:"/diyMenu/ListAllHaveDataStatementByType",
    			    	    				data:{
    			    	    					"depid":newValue,
    			    	    					"type":newType
    			    	    				},
    			    	    				success:function(res){
    			    	    					$("#restaid").combobox({
    			    	    		        		valueField:"staid",
    			    	    		        		textField:"staname",
    			    	    		        		data:res.data,
    			    	    		        		onChange:function(newVal,oldVal){
    			    	    		        			$.ajax({
    			    	    		        				type:"post",
    			    	    		        				url:"/diyMenu/getStageAndUpperAndLeft",
    			    	    		        				data:{"staid":newVal},
    			    	    		        				success:function(resp){
    				    	    		        				$("#reupper").combobox({
    				    	    		        		        	valueField:"uppid",
    				    	    		        		        	textField:"uppstruct",
    				    	    		        		        	data:resp.data.upperList
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
    		}
    	});
	$("#restage").combobox({
		panelHeight:120,
		valueField:"restage",
		textField:"stagename",
			data:[{
				restage:"0",
				stagename:"年"
			},
			{
				restage:"1",
				stagename:"半年"
			},{
				restage:"2",
				stagename:"季度"
			},{
				restage:"3",
				stagename:"月"
			}
			      ]
	});
	$('#ruleDesignWin').window({
        onBeforeClose: function () { //当面板关闭之前触发的事件
        	$('#ruleForm').form('clear');
        	$('#ruleDesignWin').window('close', true); //这里调用close 方法，true 表示面板被关闭的时候忽略onBeforeClose 回调函数。
        }
    });
   spread = new spreadNS.Workbook($("#ss")[0]);
   var sheet = spread.getActiveSheet();
   sheet.getRange(-1, -1, -1, -1).setBorder(new spreadNS.LineBorder("Black", spreadNS.LineStyle.dotted), { inside: true });
   $("#ss").bind("contextmenu", processSpreadContextMenu);
	$("#spreadContextMenu a").click(processContextMenuClicked);
	$(document).on("contextmenu", function() {
		event.preventDefault();
		return false;
	});

	$("#save").bind('click', function(){//左表头传值
		cellValue.splice(0,cellValue.length);
		if(tableinfo.length<1){
			layer.msg("表头未保存，请先保存");
			return ;
		}
		var retype=0;
		if(leftRow>=0){
			retype=1;
		}
//		alert(upperRow+"======"+leftRow);
		for(var rowindex=upperRow;rowindex<upperRow+leftRow;rowindex++){
			for(var colindex=leftCol;colindex<upperCol;colindex++){
				if(sheet.hasFormula(rowindex,colindex)){
					var formula0={
							reflocation:rowindex+"@#"+colindex,
							refcontent:sheet.getFormula(rowindex,colindex)
					}
					cellValue.push(formula0);
				}else if(sheet.getValue(rowindex,colindex)!=null){
//					alert(sheet.getValue(rowindex,colindex));
					var cellval0={
							reflocation:rowindex+"@#"+colindex,
							refcontent:sheet.getValue(rowindex,colindex)
					};
					cellValue.push(cellval0);
				}
			}			
		}
		
		if(_depid==0){
			if($("#dept").combobox('getValue')==''||$("#dept").combobox('getValue')==null){
				layer.msg("请选择部门");
				return;
			}
			_depid=$("#dept").combobox('getValue');
		}
		
//		console.log("规则列表："+JSON.stringify(ruleArray));
		var _data={
				"rename":$("#rename").val(),
				"restaid":$("#restaid").combobox('getValue'),
				"stattype":$("#stattype").combobox('getValue'),
				"retype":retype,//是否有左表头
				"redepartment":_depid,//哪个创建者创建的就填哪个部门
				"rerow":upperRow+leftRow,
				"recol":upperCol,
				"rules":JSON.stringify(ruleArray),
				"reformulas":JSON.stringify(cellValue),//单元格的值及公式
				"rowandcol":JSON.stringify(tableinfo),//表头信息
				"restage":$("#restage").combobox('getValue')//衍生报表的维度信息
			};
		console.log(JSON.stringify(_data));
		$.ajax({
			type:"post",
			url:"/rule/addRulestate",
			data:_data,
			success:function(response){
				if(response.resultCode==0){
					layer.msg("统计衍生报表保存成功");
				}else{
					layer.msg(response.resultDesc);
				}
			}
		});
	});
});

function processSpreadContextMenu(e) {
	// move the context menu to the position of the mouse point
	//spread = $("#indexTable").data("workbook");
	//console.log(spread);
	var sheet = spread.getActiveSheet(), target = getHitTest(e.pageX, e.pageY,
			sheet), hitTestType = target.hitTestType, row = target.row, col = target.col, selections = sheet
			.getSelections();

	var isHideContextMenu = false;

	if (hitTestType === GC.Spread.Sheets.SheetArea.colHeader) {
		if (getCellInSelections(selections, row, col) === null) {
			sheet.setSelection(-1, col, sheet.getRowCount(), 1);
		}
		if (row !== undefined && col !== undefined) {
			$(".context-header").show();
			$(".context-cell").hide();
		}
	} else if (hitTestType === GC.Spread.Sheets.SheetArea.rowHeader) {
		if (getCellInSelections(selections, row, col) === null) {
			sheet.setSelection(row, -1, 1, sheet.getColumnCount());
		}
		if (row !== undefined && col !== undefined) {
			$(".context-header").show();
			$(".context-cell").hide();
		}
	} else if (hitTestType === GC.Spread.Sheets.SheetArea.viewport) {
		if (getCellInSelections(selections, row, col) === null) {
			sheet.clearSelection();
			sheet.endEdit();
			sheet.setActiveCell(row, col);
			updateMergeButtonsState();
		}
		updateMergeButtonsState();
		if (row !== undefined && col !== undefined) {
			$(".context-header").hide();
			$(".context-cell").hide();
			showMergeContextMenu();
		} else {
			isHideContextMenu = true;
		}
	} else if (hitTestType === GC.Spread.Sheets.SheetArea.corner) {
		sheet.setSelection(-1, -1, sheet.getRowCount(), sheet.getColumnCount());
		if (row !== undefined && col !== undefined) {
			$(".context-header").hide();
			$(".context-cell").show();
		}
	}

	var $contextMenu = $("#spreadContextMenu");
	$contextMenu.data("sheetArea", hitTestType);
	if (isHideContextMenu) {
		hideSpreadContextMenu();
	} else {
		$contextMenu.css({
			left : e.pageX,
			top : e.pageY
		});
		$contextMenu.show();
		$(document).on("click.contextmenu", function() {
			if ($(event.target).parents("#spreadContextMenu").length === 0) {
				hideSpreadContextMenu();
			}
		});
	}
}

// 右键菜单点击触发
function processContextMenuClicked() {
	var action = $(this).data("action");
//	alert(action);
	var sheet = spread.getActiveSheet();
	var sheetArea = $("#spreadContextMenu").data("sheetArea");

	hideSpreadContextMenu();

	switch (action) {
	case "cut":
		spread.commandManager().execute({
			cmd : "cut",
			sheetName : sheet.name()
		});
		break;
	case "copy":
		spread.commandManager().execute({
			cmd : "copy",
			sheetName : sheet.name()
		});
		break;
	case "paste":
		spread.commandManager().execute({
			cmd : "paste",
			sheetName : sheet.name()
		});
		break;
	case "insert":
		if (sheetArea === GC.Spread.Sheets.SheetArea.colHeader) {
			sheet.addColumns(sheet.getActiveColumnIndex(), 1);
		} else if (sheetArea === GC.Spread.Sheets.SheetArea.rowHeader) {
			sheet.addRows(sheet.getActiveRowIndex(), 1);
		}
		break;
	case "delete":
		if (sheetArea === GC.Spread.Sheets.SheetArea.colHeader) {
			sheet.deleteColumns(sheet.getActiveColumnIndex(), 1);
		} else if (sheetArea === GC.Spread.Sheets.SheetArea.rowHeader) {
			sheet.deleteRows(sheet.getActiveRowIndex(), 1);
		}
		break;
	case "merge":
		var sel = sheet.getSelections();
		if (sel.length > 0) {
			sel = sel[sel.length - 1];
			sheet.addSpan(sel.row, sel.col, sel.rowCount, sel.colCount,
					GC.Spread.Sheets.SheetArea.viewport);
		}
		updateMergeButtonsState();
		break;
	case "unmerge":
		var sels = sheet.getSelections();
		for (var i = 0; i < sels.length; i++) {
			var sel = getActualCellRange(sels[i], sheet.getRowCount(), sheet
					.getColumnCount());
			for (var r = 0; r < sel.rowCount; r++) {
				for (var c = 0; c < sel.colCount; c++) {
					var span = sheet.getSpan(r + sel.row, c + sel.col,
							GC.Spread.Sheets.SheetArea.viewport);
					if (span) {
						sheet.removeSpan(span.row, span.col,
								GC.Spread.Sheets.SheetArea.viewport);
					}
				}
			}
		}
		updateMergeButtonsState();
		break;
	case "designRule":
		if($("#department").combobox('getValue')==''||$("#stattype").combobox('getValue')==''||$("#restaid").combobox('getValue')==''){
			layer.msg("请先选择原始报表信息");
		}else{
			var sels = sheet.getSelections();
//    	alert(JSON.stringify(sels));
//    	alert(JSON.stringify(sel));
			if(sels[0].rowCount>1||sels[0].colCount>1||sels.length>1){
				layer.msg("所选单元格不符合规范");
			}else{
				ruleCellDesign();
			}
		}
    	break;
	case "checkRule":
		ruleCheckOpen();
    	break;
	case "setupper":
		setupper();
    	break;
	case "setleft":
		setleft();
    	break;
	default:
		break;
	}
}

function hideSpreadContextMenu() {
	$("#spreadContextMenu").hide();
	$(document).off("click.contextmenu");
}

function updateMergeButtonsState() {
	var sheet = spread.getActiveSheet();
	var sels = sheet.getSelections(), mergable = false, unmergable = false;

	sels.forEach(function(range) {
				var ranges = sheet.getSpans(range), spanCount = ranges.length;

				if (!mergable) {
					if (spanCount > 1
							|| (spanCount === 0 && (range.rowCount > 1 || range.colCount > 1))) {
						mergable = true;
					} else if (spanCount === 1) {
						var range2 = ranges[0];
						if (range2.row !== range.row
								|| range2.col !== range.col
								|| range2.rowCount !== range2.rowCount
								|| range2.colCount !== range.colCount) {
							mergable = true;
						}
					}
				}
				if (!unmergable) {
					unmergable = spanCount > 0;
				}
			});

	$("#mergeCells").attr("disabled", mergable ? null : "disabled");
	$("#unmergeCells").attr("disabled", unmergable ? null : "disabled");
}

function getHitTest(pageX, pageY, sheet) {
	var offset = $("#ss").offset(), x = pageX - offset.left, y = pageY
			- offset.top;
	return sheet.hitTest(x, y);
}

function getCellInSelections(selections, row, col) {
	var count = selections.length, range;
	for (var i = 0; i < count; i++) {
		range = selections[i];
		if (range.contains(row, col)) {
			return range;
		}
	}
	return null;
}

function getActualCellRange(cellRange, rowCount, columnCount) {
	if (cellRange.row === -1 && cellRange.col === -1) {
		return new spreadNS.Range(0, 0, rowCount, columnCount);
	} else if (cellRange.row === -1) {
		return new spreadNS.Range(0, cellRange.col, rowCount,
				cellRange.colCount);
	} else if (cellRange.col === -1) {
		return new spreadNS.Range(cellRange.row, 0, cellRange.rowCount,
				columnCount);
	}

	return cellRange;
}

function showMergeContextMenu() {
	// use the result of updateMergeButtonsState
	if ($("#mergeCells").attr("disabled")) {
		$(".context-merge").hide();
	} else {
		$(".context-cell.divider").show();
		$(".context-merge").show();
	}

	if ($("#unmergeCells").attr("disabled")) {
		$(".context-unmerge").hide();
	} else {
		$(".context-cell.divider").show();
		$(".context-unmerge").show();
	}
}

function setupper(){//保存为上表头
	var sheet = spread.getActiveSheet();
	var sel=sheet.getSelections();  //得到选择区域  
	if((uppsign==leftsign)&&uppsign!=0){//如果两个标志相等且不等于0 ，说明之前上表头和左表头选中次数一样多，这次要导入需要清空
		tableinfo=[];
	}
	if(uppsign-leftsign>=1){
		tableinfo=[];
	}   	
	sheet.suspendPaint(); 
	upperRow=sel[0].rowCount;//获取选区的行数
	upperCol=sel[0].colCount;//获取选区的列数
	//alert(upperRow+"=============++++"+upperCol);
 	for(var rowindex=sel[0].row;rowindex<sel[0].rowCount+sel[0].row;rowindex++){
		  for(var colindex=sel[0].col;colindex<sel[0].col+sel[0].colCount;colindex+=ColOfRow){ 
			  var ColOfRow=1;//每次遍历的单元格占多少列
			 if(sheet.getValue(rowindex,colindex)!=null){
 			  var span=sheet.getSpan(rowindex,colindex);
 			  var headlocation=rowindex+"@#"+colindex;//单元格位置
 			  var headname=sheet.getValue(rowindex,colindex);
 			  var headrowspan=1;
 			  var headcolspan=1;
 			  if(span!=null){//是合并单元格 
 				  ColOfRow=span.colCount;
 				  headrowspan=span.rowCount;
 				  headcolspan=span.colCount;
 			  }
 			  arr={
 					reheadlocation:headlocation,
 					reheadname:headname,
 					reheadrowspan:headrowspan,
 					reheadcolspan:headcolspan
				   }      		
 			  tableinfo.push(arr);//存入 
			 }
		  }
 	}
 	sheet.resumePaint();
	uppsign++;
	layer.msg("保存为上表头成功");
}

function setleft(){//左表头传值
	var sheet = spread.getActiveSheet();
	var sel=sheet.getSelections();  //得到选择区域  
	if((uppsign==leftsign)&&uppsign!=0){//如果两个标志相等且不等于0 ，说明之前上表头和左表头选中次数一样多，这次要导入需要清空
		tableinfo=[];
	}
	if(leftsign-uppsign>=1){
		tableinfo=[];
	}
	sheet.suspendPaint(); 
	leftRow=sel[0].rowCount;//获取选区的行数
	leftCol=sel[0].colCount;//获取选区的列数
//	alert(leftRow+"++++"+leftCol);
 	for(var rowindex=sel[0].row;rowindex<sel[0].rowCount+sel[0].row;rowindex++){
		  for(var colindex=sel[0].col;colindex<sel[0].col+sel[0].colCount;colindex+=ColOfRow){ 
			  var ColOfRow=1;//每次遍历的单元格占多少列
			 if(sheet.getValue(rowindex,colindex)!=null){
 			  var span=sheet.getSpan(rowindex,colindex);
 			  var headlocation=rowindex+"@#"+colindex;//单元格位置
 			  var headname=sheet.getValue(rowindex,colindex);
 			  var headrowspan=1;
 			  var headcolspan=1;
 			  if(span!=null){//是合并单元格 
 				  ColOfRow=span.colCount;
 				  headrowspan=span.rowCount;
 				  headcolspan=span.colCount;
 			  }
 			  arr={
 					reheadlocation:headlocation,
 					reheadname:headname,
 					reheadrowspan:headrowspan,
 					reheadcolspan:headcolspan
				   }      		
 			  tableinfo.push(arr);//存入 
			 }
		  }
 	}
 	sheet.resumePaint();
	leftsign++;
	layer.msg("保存为左表头成功");
	console.log(JSON.stringify(tableinfo));
}

/**
 * 弹出新的窗口，编辑单元格规则
 * @param row
 * @param col
 */
function ruleCellDesign(){
	$('#ruletype').combobox({
		panelHeight:80,
		valueField:"typeid",
		textField:"typename",
		data:[
           	 	 {
			    	"typeid":"0",
			    	"typename":"行约束"
			      },
			      {
			    	 "typeid":"1",
			    	 "typename":"列约束"
			      }
			   ]
	});
	$('#ruleDesignWin').window('open');	    	     	
}

function ruleCheckOpen(){
//	alert(JSON.stringify(ruleArray));
	$('#ruleList').datagrid({ 
		autoRowHeight:true,
		rownumbers:true,
		singleSelect:true,
		data:ruleArray,
		rownumberWidth:50,
		columns : [ [ 
		   	        {field:'ruletypeName',title:'规则类型',width:80,sortable:true},
		   	        {field:'reupperName',title:'指标名',width:510,sortable:true},
		   	        {field:'reconstraint',title:'规则描述',width:220,sortable:true},
		   	        {field:'reposition',title:'坐标',width:50,sortable:true},
		   	        {field:'refunction',title:'计算方式',width:90,sortable:true,
		   	        	formatter:function(value,row,index){
		   	        		if(value=="0"){
		   	        			return "原值";
		   	        		}else if(value=="1"){
		   	        			return "求和";
		   	        		}else if(value=="2"){
		   	        			return "平均值";
		   	        		}else if(value=="3"){
		   	        			return "方差";
		   	        		}else if(value=="4"){
		   	        			return "标准差";
		   	        		}else if(value=="5"){
		   	        			return "最大值";
		   	        		}else if(value=="6"){
		   	        			return "最小值";
		   	        		}else if(value=="7"){
		   	        			return "数量";
		   	        		}
		   	        	}
		   	       }
	   	        ]],
   	    onDblClickRow: function(){  
   	    		var sheet=spread.getActiveSheet();
   	    		var rowindex=$('#ruleList').datagrid('getRowIndex', $("#ruleList").datagrid('getSelected'));
   	    		$('#deleteRule').window('open');
   	    		$("#deleteCertain").bind('click', function(){
   	    			var rowRuleNum=0;
   	    			for(var i=0;i<ruleArray.length;i++){
   	    				if(ruleArray[i].reposition==ruleArray[rowindex].reposition&&ruleArray[i].retype=="0"){
   	    					rowRuleNum++;
   	    				}
   	    			}
   	    			if(ruleArray[rowindex].retype=="0"&&rowRuleNum<=1){
   	    				sheet.getRange(ruleArray[rowindex].reposition,-1,1,-1).backColor('white');
   	    			}else{
   	    				sheet.getRange(-1,ruleArray[-1,rowindex].reposition,-1,1).backColor('white');
   	    			}
   	    			ruleArray.splice(rowindex,1);
   	    			$('#ruleList').datagrid('loadData',ruleArray);
   	    			$('#deleteRule').window('close');
   	    		});
   	    		$("#undeleteCertain").bind('click', function(){
   	    			$('#deleteRule').window('close');
   	    		});
   	    	}  
		});  
	$('#ruleCheckWin').window('open');	
}

/**
 * 规则编辑表单取消提交
 */
function unsubmit(){
	$('#ruleForm').form('clear');
	$('#ruleDesignWin').window('close');	  
}

/**
 * 规则编辑表单提交
 */
function submit(){
	$('#ruleForm').form({
		onSubmit:function(){
			var activeSheet=spread.getActiveSheet();//获取当前活动表单
			var sel=activeSheet.getSelections();//获取当前单元格
			var cellrow=sel[0].row;//所选单元格的行索引
			var cellcol=sel[0].col;//所选单元格的列索引
//			alert(JSON.stringify($('#ruleForm').serialize()));
			var rule=$('#ruleForm').serialize().replace(/&/g,"\",\"")//先将最外面的&符号替换掉
				.replace(/=/g,"\":\"").replace(/%3D/g,"=").replace(/%3E/g,">")
				.replace(/%3C/g,"<").replace(/%7C/g,"|").replace(/%26/g,"&");//约束条件只能全部是与或者全部是或
			rule="{\""+rule+"\"}";
			var ruleObj=JSON.parse(rule);
			if(ruleObj.ruletype==''||ruleObj.reupper==''||ruleObj.refunction==''||(ruleObj.ruletype=="0"&&ruleObj.reconstraint=='')){
					layer.msg("规则不完整，请完善后再提交");
					return false;
			}else if(ruleObj.ruletype=="1"){
				for (var i = 0; i < ruleArray.length; i++) {
					if(ruleArray[i].ruletype=="0"&&ruleArray[i].reposition==cellcol){
						layer.msg("重复添加列规则，请删除后添加");
						return false;
					}
				}
			}
			var rules={
					ruletypeName:$('#ruletype').combobox("getText"),
					reupperName:$('#reupper').combobox("getText"),
					reconstraint:ruleObj.reconstraint,
					retype:ruleObj.ruletype,
					reupper:ruleObj.reupper,
					refunction:ruleObj.refunction,
					reposition:(ruleObj.ruletype=="0"?cellrow:cellcol)
			};
			ruleArray.push(rules);
			if(ruleObj.ruletype=="0"){
				activeSheet.getRange(cellrow,-1,1,-1).backColor("#D9FFD9");
			}else{
				activeSheet.getRange(-1,cellcol,-1,1).backColor("#D9D9FF");
			}
			$('#ruleForm').form('clear');
			$('#ruleDesignWin').window('close',true);//防止提交时表单清空
		}
	});
	$('#ruleForm').submit();
}
