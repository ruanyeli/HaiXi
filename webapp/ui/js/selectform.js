_url = "";
var spread;
var indexdata;
var spreadNS = GC.Spread.Sheets;
var departmentid = parent.$("#user_department").val();
var fbx;

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

$(document).ready(
		function() {
			 
			
			spread = $('#indexTable').data('workbook');// 初始化表
//			init_communiqueSelect("communique"); // 初始化公报
			init_predictionSelect("prediction"); // 初始化预测期

			fbx = new GC.Spread.Sheets.FormulaTextBox.FormulaTextBox(document.getElementById('formulaBar'), {rangeSelectMode: true});
		     fbx.workbook(spread);
			$("#indexTable").bind("contextmenu", processSpreadContextMenu);
			$("#spreadContextMenu a").click(processContextMenuClicked);
			$(document).on("contextmenu", function() {
				event.preventDefault();
				return false;
			});
			
			$("#div1").hide();
			$("#div2").hide();

			$("#doExport").click(function() {
				exportToExcel();
			});
			
			$("#analysis").click(function(){
				descAnalysis();
			});
			
			$("#sure").click(function(){
				caculate();
			});
			$("#predict").click(function(){
				var selectionCells = spread.getActiveSheet().getSelections();
				DrawCharts(spread.getActiveSheet(), selectionCells,1);
			});
		});

/**
 * @param classname
 * 初始化查询选择框searchSelect，内容包括报表名、起始时间、终止时间、查询指标
 */
function init_searchSelect(classname) {// classname是style的类名
	$.ajax({
		url : _url + '/diyMenu/getStatementListByDepartment',
		type : 'post',
		data : {
			"depid" : departmentid
		},
		success : function(response) {
			if (response.resultCode == "0") {
				var statementList = response.data;
				$("#statement").combobox({
					valueField:"staid",
					textField:"staname",
					panelHeight:200,
					data:statementList,
					onChange:function(newStatement,oldStatement){
						$("#upper").combobox('clear');
						$("#start").combobox('clear');
						$("#end").combobox('clear');
						var staid=parseInt(newStatement.split('-')[0]);//报表id
						$.ajax({
							type:"post",
							url:"/diyMenu/getStagename",
							data:{
								"staid":staid
							},
							success:function(resp){
								var stagenameList=resp.data;
								if(response.resultCode == "0"){
									$("#stagename").combobox({
										valueField:"stagename",
										textField:"stagename",
										data:stagenameList,
										panelHeight:100,
										onChange:function(newStagename,oldStagename){
											$.ajax({
												type:"post",
												url:"/diyMenu/getStageAndUpper",
												data:{
													"staid":staid,
													"stagename":newStagename
												},
												success:function(res){
													var stattype=res.data.statementtype;
													var stageList=res.data.stageList;
													var upperList=res.data.upperList;
													$("#upper").combobox({
														valueField:"uppid",
														textField:"uppstruct",
														panelHeight:120,
														multiple:true,
														data:upperList
													});
													$("#start").combobox({
														valueField:"stagedate",
														textField:"datename",
														panelHeight:120,
														data:stageList
													});
													$("#end").combobox({
														valueField:"stagedate",
														textField:"datename",
														panelHeight:120,
														data:stageList
													});
												}
											});
										}
									});
								}else{
									layer.msg(resp.resultDesc);
								}
							}
						});
					}
				});
			} else {
				layer.msg(response.resultDesc);
			}
		}
	});
}

function autoHeight(){
	var divHeight = $("#searchDiv").height();
	var centerTop = $(".layout-split-center").position().top;
	var southTop = $(".layout-split-south").position().top;
	var eastTop = $(".layout-split-east").position().top;
	$(".layout-split-center").css("top",centerTop+50);
	$(".layout-split-south").css("top",southTop+50);
	$(".layout-split-east").css("top",eastTop+50);
	$("#searchDiv").height(divHeight+50);
	var bodyHeight = $("#bodyDiv").height();
	$("#bodyDiv").height(bodyHeight+50);
}

/**
 * 新增要查询的报表
 */
function addSearch(e) {
	var _str;
	var _rownumber = $('#searchlist tbody tr').length;// 行数
//	alert(_rownumber); 
	_str = '<tr style="height:50px"><td><input class="easyui-combobox" id="statement" style="width:230px"></td>'
			+ '<td><input class="easyui-combobox" id="stagename" style="width:140px"></td>'
			+ '<td><input class="easyui-combobox" id="start" style="width:135px"></td>'
			+ '<td><input class="easyui-combobox" id="end" style="width:135px"></td>'
			+ '<td><input class="easyui-combobox" id="upper" style="width:210px"></td>'
			+ '<td><input id="threshold"  style="width: 110px;" type="text" placeholder="请输入阈值(可不填)"></td>'
			+ '<td onclick="delDataSearch(this)"><i class="lnr lnr-circle-minus"></i></td></tr>';
	// 保存上一行的查询信息到table中
	if (_rownumber > 1) {
		if ($("#searchlist tbody tr").eq(_rownumber - 2).find("td").eq(0).find("input").size()>0
				&&($("#statement").combobox('getValue') == ''
				|| $("#start").combobox('getValue') == ''
				|| $("#end").combobox('getValue') == ''
				|| $("#upper").combobox('getValues') == null
				|| $("#stagename").combobox('getValue') == '')) {
			layer.msg("请完善选择信息！");
			return;
		} else if(($("#threshold").val()!=null&&(parseFloat($("#threshold").val())>1||parseFloat($("#threshold").val())<0))){
			layer.msg("阈值必须在0-1之间");
			return;
		}else if ($("#searchlist tbody tr").eq(_rownumber - 2).find("td").eq(0).find("input").size() == 0) {
			$(e).parent("tr").before(_str);// 防止删除后，再添加将前面已选的内容覆盖了
			autoHeight();
		} 
		else {
//			console.log($("#statement").combobox('getValue')+"==============="+$("#stagename").combobox('getValue')+"====="+$("#upper").combobox('getValue'));
			if (saveSearchTD($("#statement").combobox('getValue')
					, $("#stagename").combobox('getValue')) == 0) {
				$(e).parent("tr").before(_str);
				autoHeight();
			} else {// 先对上一行的选项进行保存,如果保存成功
				return;
			}
		}
	} else {
		$(e).parents("tr").before(_str);
		autoHeight();
	}
	$.parser.parse("#searchlist");
	init_searchSelect("statement");// 初始化报表名称下拉框
}

/**
 * 删除查询
 */
function delDataSearch(e) {
	$(e).parents("tr").remove();
	var divHeight = $("#searchDiv").height();
	var centerTop = $(".layout-split-center").position().top;
	var southTop = $(".layout-split-south").position().top;
	var eastTop = $(".layout-split-east").position().top;
	$(".layout-split-center").css("top",centerTop-40);
	$(".layout-split-south").css("top",southTop-40);
	$(".layout-split-east").css("top",eastTop-40);
	$("#searchDiv").height(divHeight-40);
	var bodyHeight = $("#bodyDiv").height();
	$("#bodyDiv").height(bodyHeight-40);
}

/*
 * 删除图表
 */
function delSearch(e){
	$(e).parents("tr").remove();
	var indexChartsHeight = $("#indexCharts").height();
	$("#indexCharts").height(indexChartsHeight-500);
	var bodyHeight = $("#bodyDiv").height();
	$("#bodyDiv").height(bodyHeight-500);
}

var _searchList = new Array();// 声明一个存储查询对象search的数组search:{statementid,upperid,startstage,endstage}

// 添加一个新的查询的时候就要对上一行的信息进行保存
function saveSearchTD(statementid, stagename) {
	var searchnum = $('#searchlist tbody tr').length;
	if (searchnum > 1) {
		var flag = 0;
		for (var i = 0; i < searchnum - 2; i++) {// 多减一个1，从该行的上上列往上比较
			if (statementid == $('#searchlist tbody tr').eq(i).find("td").eq(0).attr("id")
					&& stagename == $('#searchlist tbody tr').eq(i).find("td").eq(1).attr("id")) {
				layer.msg("请勿重复添加相同指标！");
				flag = 1;
				break;
			}
		}
		if (flag == 0) {
			setsearchinfo();
		}
		return flag;
	} else {
		setsearchinfo();
		return 0;
	}
}

/**
 * 将查询信息保存在table中
 */
function setsearchinfo() {
	var searchnum = $('#searchlist tbody tr').length;
	var searchtd = $('#searchlist tbody tr').eq(searchnum - 2).find("td");
	searchtd.eq(0).attr("id",
			$('#statement').combobox('getValue'));
	searchtd.eq(0).text($('#statement').combobox('getText'));

	searchtd.eq(1).attr("id",
			$('#stagename').combobox('getValue'));
	searchtd.eq(1).text($('#stagename').combobox('getText'));

	searchtd.eq(2).attr("id", $('#start').combobox('getValue'));
	searchtd.eq(2).text($('#start').combobox('getText'));

	searchtd.eq(3).attr("id", $('#end').combobox('getValue'));
	searchtd.eq(3).text($('#end').combobox('getText'));

	searchtd.eq(4).attr("id", $('#upper').combobox('getValues'));
	searchtd.eq(4).text($('#upper').combobox('getText'));
	
	searchtd.eq(5).text($('#threshold').val());
}

// 将搜索的指标发给服务器
function getIndexData() {
	var searchnum = $('#searchlist tbody tr').length;
	var searchtd = $('#searchlist tbody tr').eq(searchnum - 2).find("td");
	for (var i = 0; i < searchnum - 2; i++) {// 多减一个1，从该行的上上列往上比较
		if (searchtd.eq(0).find("input").size()>0&&$('#statement').combobox('getValue') == $('#searchlist tbody tr').eq(i).find("td").eq(0).attr("id")
			&& $('#stagename').combobox == $('#searchlist tbody tr').eq(i).find("td").eq(1).attr("id")) {
			layer.msg("请勿重复添加相同指标！");
			return;
		}
	}
	_searchList.splice(0, _searchList.length);// 清除_searchList
	if (searchtd.eq(0).find("input").size()>0) {//取元素find里面元素的长度用length来表示
		if ($("#statement").combobox('getValue') == ''
			|| $("#start").combobox('getValue') == ''
			|| $("#end").combobox('getValue') == ''
			|| $("#upper").combobox('getValues') == null
			|| $("#stagename").combobox('getValue') == '') {
			layer.msg("请完善选择信息！");
			return;
		}
		searchtd.eq(0).attr("id",$('#statement').combobox('getValue'));
		searchtd.eq(0).text($('#statement').combobox('getText'));

		searchtd.eq(1).attr("id",$('#stagename').combobox('getValue'));
		searchtd.eq(1).text($('#stagename').combobox('getText'));

		searchtd.eq(2).attr("id",$('#start').combobox('getValue'));
		searchtd.eq(2).text($('#start').combobox('getText'));

		searchtd.eq(3).attr("id",$('#end').combobox('getValue'));
		searchtd.eq(3).text($('#end').combobox('getText'));

		searchtd.eq(4).attr("id",$('#upper').combobox('getValues'));
		searchtd.eq(4).text($('#upper').combobox('getText'));
		
		searchtd.eq(5).text($('#threshold').val());
	}
	for (var i = 0; i < searchnum - 1; i++) {
		var _searchtd = $('#searchlist tbody tr').eq(i).find("td");
		var _statementid = _searchtd.eq(0).attr("id");
		var _stagename = _searchtd.eq(1).attr("id");
		var _upperid = _searchtd.eq(4).attr("id");
		var _startstage = _searchtd.eq(2).attr("id");
		var _endstage = _searchtd.eq(3).attr("id");
		var _search = {
			statementid : _statementid,
			upperid : _upperid,
			startstage : _startstage,
			endstage : _endstage,
			stagename : _stagename
		}
		_searchList.push(_search);
	}
	//console.log(JSON.stringify(_searchList));
	if (_searchList.length == 0) {
		layer.msg("请选择查询指标");
	} else {
		$.ajax({
			url : _url + "/diyMenu/getIndexData",
			data : {
				"searchList" : JSON.stringify(_searchList),
			},
			success : function(response) {
				indexdata = response.data.statementList;
				//console.log(JSON.stringify(indexdata));
				if (indexdata == null) {
					layer.msg("未查询到相关数据，请重试")
				} else {					
					spread.clearSheets();// 清空表单					
					initSpread(indexdata, spread);
				}
			}
		});
	}
}

// 绘制指标展示表
function initSpread(obj, spread0) {
	var column = 0;// 记录一共要扩展的列数
	var column1;// 记录每个指标要扩展的列数
	var column2;// 记录每个指标开始的位置
	var stageList;
	var rowStart;
	var nameStart=new Array();
	var res=[];
	for(var i=0;i<obj.length;i++){//比较名称是否相同
		var txt=obj[i].statementname.split("[")[0];
		nameStart.push(txt);
	}
	nameStart.sort();
	var count=0;
	for (var i=0;i<nameStart.length;){
		var countName=0;
		count=0;
		for( var j=i;j<nameStart.length;j++){
			if(nameStart[i]==nameStart[j]){
				count++;
			}
		   }
		res.push({
			name:nameStart[i],
			count:count
		    })
		i+=count;
	  }	
	
	spread0.setSheetCount(res.length);
	var index=0;	
	var tableStyle = GC.Spread.Sheets.Tables.TableThemes.medium2;
	for (var i = 0; i < res.length; i++) {
		rowStart=0;
	  var longth=0;
	  var temp=[];		
	  var sheet = spread0.getSheet(i);
	  var staname=res[i].name;
	  sheet.name(staname);//sheet名
	  sheet.setColumnCount(200,GC.Spread.Sheets.SheetArea.viewport);
	  sheet.setRowCount(2000,GC.Spread.Sheets.SheetArea.viewport);
	  for(var jasonIndex=0;jasonIndex<obj.length;jasonIndex++){
		  var txt=obj[jasonIndex].statementname.split("[")[0];		
		  if(txt==res[i].name){//如果相等了，则这个jason在这个sheet里面。
			  column=0;		 
			  column2 = 1;
			  var table0 = sheet.tables.addFromDataSource("左表头"+rowStart,rowStart+2,0,obj[jasonIndex].left,//数据源要更改，左表头
						tableStyle);
			  var table;
			  for (var j = 0; j < obj[jasonIndex].upperList.length; j++) {
					column1 = 0;
					for ( var m in obj[jasonIndex].upperList[j].stageList[0]) {
						column1++;//累计算col
						
					}
					column += column1;//总的col数
					
					stageList = obj[jasonIndex].upperList[j].stageList;//数据源要更改
					sheet.suspendPaint();
					sheet.addSpan(rowStart+1, column2, 1, column1);
					sheet.setValue(rowStart+1, column2, obj[jasonIndex].upperList[j].uppername);//数据源，要更改					
					var uppname = obj[jasonIndex].upperList[j].uppername.replace(/\-/g, '')
							.replace(/\s/g, '').replace(/\%/g,'').replace(/\±/g,'');	
				

						table = sheet.tables.addFromDataSource("报表"+jasonIndex+j, rowStart+2, column2,
								stageList, tableStyle);		
						table.filterButtonVisible(false);				
						var threshold= $('#searchlist tbody tr').eq(j).find("td").eq(5).text();		//阈值  设置颜色	
//						alert(threshold);
						if(threshold!=""){							
							for(var m=3;m<obj[jasonIndex].left.length;m++){//循环行
								for(var n=column2+1;n<column2+column1;n++){
									if((sheet.getValue(m,(n-1))*(1+threshold))<sheet.getValue(m,n)||
											(sheet.getValue(m,(n-1))*(1-threshold))>sheet.getValue(m,n)){
										sheet.getCell(m,n).foreColor("#FF0000");
										}
									}
							}			
						}	
						
						sheet.resumePaint();						
						//console.log("uppname ="+uppname);
					
						if(obj[jasonIndex].upperList[j].uppername.indexOf("%")!=-1){//uppname 中含有%号
							//console.log("含有%");
							var newvalue;
							 var value;
							for(var rindex=rowStart+3;rindex<obj[jasonIndex].left.length+rowStart+3;rindex++){
								for(var cindex=column2+1;cindex<column2+column1;cindex++){
									var oldvalue=sheet.getValue(rindex,cindex);	
									//console.log("oldvalue ="+oldvalue);
									if(oldvalue!=null&&oldvalue.indexOf(".")!=-1){//是小数点
										//console.log("是小数点");
										newvalue=parseFloat(oldvalue);
										value=newvalue.toFixed(1)+"%";
									    sheet.setValue(rindex,cindex,value);
									}else{
										sheet.setValue(rindex,cindex,oldvalue);
									}
									
									
								}
							}
						}
						
						column2 += column1;
						sheet.getRange(rowStart,1,obj[jasonIndex].left.length+rowStart+3,column+1).formatter('0.0');
		

				}
			  sheet.suspendPaint();
				for (var k = 0; k < column + 1; k++) {
					sheet.autoFitColumn(k);
				}
				
				sheet.addSpan(rowStart, 0, 1, column+1);
				sheet.addSpan(rowStart+1, 0, 2, 1);
				sheet.setValue(rowStart, 0, staname);  //设置表头
				sheet.setValue(rowStart+1, 0, "指标");	
			
				
				
				var defaultStyle = new GC.Spread.Sheets.Style();
				sheet.options.selectionBorderColor = 'green';
				defaultStyle.hAlign = GC.Spread.Sheets.HorizontalAlign.center;
				defaultStyle.vAlign = GC.Spread.Sheets.VerticalAlign.bottom;
				sheet.setDefaultStyle(defaultStyle,GC.Spread.Sheets.SheetArea.viewport);
				sheet.resumePaint();			
				longth=obj[jasonIndex].left.length;
				rowStart+=longth;
				rowStart+=4;
//				console.log("rowStrat is ="+rowStart);
		  }		  
	  }
	}
} 
	


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

function createCommunique() {
	var id = $('#communique option:selected').val();// 选中的值
	// alert(id);
	var picName = "2017-11-540";
	var returnType = "preview";
	// if(picInfo){
	// $.ajax({
	// url:_url+'/pdf/savePicture',
	// type:'post',
	// async:false,
	// //contentType:"application/json",
	// data:{
	// "baseimg":picInfo
	// },
	// success:function(response){
	// alert("picName:"+response.picName);
	// picName=response.picName;
	// }
	// });
	// window.location.href="/excel/showPreview?title="+title+"&picName="+picName;
	var dialog = parent.sy.modalDialog({/* 打开一个对话框 */
		title : "预览",
		url : '/communique/editCommunique?id=' + id + "&picName=" + picName
				+ "&returnType=" + returnType
	}, document.body.offsetWidth, document.body.offsetHeight);
}
// else
// {
// $.slideMsg("图片未生成！");
// }
//	
// }

/**
 * 转置二维数组
 * 
 * @param arg
 * @returns {Array}
 */
function transposition(arg) {
	var arr2 = [];
	for (var i = 0; i<arg[0].length; i++) {
		arr2[i] = [];
	}
	for (var i = 0; i < arg.length; i++) {
		for (var j = 0; j < arg[i].length; j++) {
			arr2[j][i] = arg[i][j];
		}
	}
	return arr2;
}

/**
 * 用于报表中的各种操作
 */
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
	//spread = $("#indexTable").data("workbook");
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
	case "drawLine":
		var selectionCells = sheet.getSelections();
		if (CanDrawCharts(selectionCells)) {
			DrawCharts(spread.getActiveSheet(), selectionCells,1);
		} else {
			layer.msg("单元格选择不符合规范，请重试");
		}
		break;
	case "drawBar":
		var selectionCells = sheet.getSelections();
		if (CanDrawCharts(selectionCells)) {
			DrawCharts(spread.getActiveSheet(), selectionCells,2);
		} else {
			layer.msg("单元格选择不符合规范，请重试");
		}
		break;
	case "drawLineAndBar":
		var selectionCells = sheet.getSelections();
		if (CanDrawCharts(selectionCells)) {
			DrawCharts(spread.getActiveSheet(), selectionCells,3);
		} else {
			layer.msg("单元格选择不符合规范，请重试");
		}
		break;
	case "drawPie":
		var selectionCells = sheet.getSelections();
		if (CanDrawCharts(selectionCells)) {
			DrawCharts(spread.getActiveSheet(), selectionCells,4);
		} else {
			layer.msg("单元格选择不符合规范，请重试");
		}
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
	//spread = $("#indexTable").data("workbook");
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
	var offset = $("#indexTable").offset(), x = pageX - offset.left, y = pageY
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

function exportToExcel() {
	//spread = $("#indexTable").data("workbook");
	var excelIO = new GC.Spread.Excel.IO();
	var fileName = getFileName();
	var json = spread.toJSON({
		includeBindingSource : true
	});
	excelIO.save(json, function(blob) {
		if (isSafari) {
			var reader = new FileReader();
			reader.onloadend = function() {
				showModal(uiResource.toolBar.downloadTitle,
						DOWNLOAD_DIALOG_WIDTH, $("#downloadDialog").children(),
						function() {
							$("#downloadDialog").hide();
						});
				var link = $("#download");
				link[0].href = reader.result;
			};
			reader.readAsDataURL(blob);
		} else {
			saveAs(blob, fileName + ".xlsx");
		}
	}, function(e) {
		alert(e);
	});
}

function getFileName() {
	function to2DigitsString(num) {
		return ("0" + num).substr(-2);
	}
	var date = new Date();
	return [ "export", date.getFullYear(),
			to2DigitsString(date.getMonth() + 1),
			to2DigitsString(date.getDate()), to2DigitsString(date.getHours()),
			to2DigitsString(date.getMinutes()),
			to2DigitsString(date.getSeconds()) ].join("");
}
/**
 * 预警
 */
function Warning(obj){
	
}
/**
 * 判断单元格的选择是否合理不同区域的单元格只能选择一个0-单元格不规范1-以行为单位2-以列为单位
 */
function CanDrawCharts(selectionCells0) {
	
	var count = 0;
	var selectionLength = selectionCells0.length;
	if (selectionLength > 1) {
		for (var i = 1; i < selectionLength; i++) {
			if ((selectionCells0[i].row == selectionCells0[i - 1].row && selectionCells0[i].colCount == selectionCells0[i - 1].colCount)
					|| (selectionCells0[i].col == selectionCells0[i - 1].col && selectionCells0[i].rowCount == selectionCells0[i - 1].rowCount)
					|| (selectionCells0[i].row == selectionCells0[i - 1].row && selectionCells0[i].rowCount == selectionCells0[i - 1].rowCount)
					|| (selectionCells0[i].col == selectionCells0[i - 1].col && selectionCells0[i].colCount == selectionCells0[i - 1].colCount)) {
				for (var j = 0; j < selectionLength; j++) {
					if (selectionCells0[j].row + selectionCells0[j].rowCount >= 4
							&& selectionCells0[j].col
									+ selectionCells0[j].colCount >= 2) {
						count++;
					}
				}

			} else {
				return false;
			}
		}
		if (count > 0) {
			return true;
		} else {
			return false;
		}
	} else if (selectionLength == 1) {
		if (selectionCells0[0].row + selectionCells0[0].rowCount >= 4
				&& selectionCells0[0].col + selectionCells0[0].colCount >= 2) {
			return true;
		} else
			return false;
	} else
		return false;
}

/**
 * 生成绘制图形的数组
 * 
 * @param sheet0
 */
function DrawCharts(sheet0,selectionCells0,drawType){
	var xArray1=[],left=[];//获取左表头
	var xArray2=[],upper=[];//获取期数
	var xArray3=[];//中间值
    var data=[];
    var title=sheet0.getValue(0,0);//表名
    var index=[];
	if(CanDrawCharts(selectionCells0)){
		for(var i=0;i<selectionCells0.length;i++){
			var flag=0;
			for(var m=selectionCells0[i].row;m<selectionCells0[i].row+selectionCells0[i].rowCount;m++){
				if(m>=3){
					
					if(i>=1){
						xArray3=sheet0.getArray(m,0,selectionCells0[i].rowCount,1);
						if(JSON.stringify(xArray1)!=JSON.stringify(xArray3)){							
							xArray1=xArray1.concat(sheet0.getArray(m,0,selectionCells0[i].rowCount,1));
						}												
					}else {
						
						xArray1=sheet0.getArray(m,0,selectionCells0[i].rowCount,1);						
					}
					break;									
				}				
			}
			for(var n=selectionCells0[i].col;n<selectionCells0[i].col+selectionCells0[i].colCount;n++){
				if(n>=1){
					if(i>=1){						
						xArray3=sheet0.getArray(2,n,1,selectionCells0[i].colCount);
						var xArray4=[];
						for(var k=0;k<xArray2.length;k++){
							xArray4[k]=xArray2[k].time;
						}
						if(JSON.stringify(xArray4)!=JSON.stringify(xArray3)){
							var count=xArray2.length;
							for(var k=n;k<n+selectionCells0[i].colCount;k++){
								xArray2[count]={};
								var array0;
								for(var j=k;j>=1;j--){
									if((sheet0.getValue(1,j))!=null){
										array0=sheet0.getValue(1,j).split("/");
										xArray2[count].index=array0[array0.length-1];
										break;
									}
								}				
								xArray2[count].time=sheet0.getValue(2,k);
								count++;
							}
						}					
					}else{
						var count=0;
						for(var k=n;k<n+selectionCells0[i].colCount;k++){
							xArray2[count]={};
							var array0;
							for(var j=k;j>=1;j--){
								if((sheet0.getValue(1,j))!=null){
									array0=sheet0.getValue(1,j).split("/");
									xArray2[count].index=array0[array0.length-1];
									break;
								}
							}				
							xArray2[count].time=sheet0.getValue(2,k);
							count++;
						}
						
					}
					break;
				}				
			}			
			for(var m=selectionCells0[i].row;m<selectionCells0[i].row+selectionCells0[i].rowCount;m++){
				for(var n=selectionCells0[i].col;n<selectionCells0[i].col+selectionCells0[i].colCount;n++){
					if(m>=3&&n>=1){
						if(i>=1){
							if(selectionCells0[i].colCount==selectionCells0[i-1].colCount&&selectionCells0[i].rowCount!=selectionCells0[i-1].rowCount){								
								data=data.concat(sheet0.getArray(m,n,(selectionCells0[i].rowCount+selectionCells0[i].row-m),(selectionCells0[i].colCount+selectionCells0[i].col-n)));
								flag=1;
						 }else{
							 
							 var count1=0;
							 for(var x=0;x<(selectionCells0[i].rowCount+selectionCells0[i].row-m);x++){									
									data[count1]=data[count1].concat(sheet0.getArray(m,n,1,(selectionCells0[i].colCount+selectionCells0[i].col-n)));
									count1++;
									flag = 1;
								}
							}
						} else {
							
							data = sheet0.getArray(m, n,(selectionCells0[i].rowCount+ selectionCells0[i].row - m),(selectionCells0[i].colCount+ selectionCells0[i].col - n));
							flag = 1;
						}
						break;
					}
				}
				if (flag != 0) {
					break;
				}
			}
		}
        for(var m=0;m<data.length;m++){
        	for(var n=0;n<data[m].length;n++){
        		if(data[m][n].indexOf("%")>0){
        			data[m][n]=parseFloat(data[m][n]);
        		}
        	}
        }        
        for(var i=0;i<xArray1.length;i++){
        	left[i]='('+i+')'+xArray1[i][0].replace(/\s/g,'');
        }
        for(var j=0;j<xArray2.length;j++){
        	upper[j]=xArray2[j].index+'('+xArray2[j].time+')';
        }
        if($('#prediction option:selected').val()){
     		var row=data.length;
     		var volume=upper.length;
         	var tempY=[];
        	var num= $('#prediction option:selected').val();// 选中的值,预测期数
        	 for(var i=1;i<=num;i++){
             	var tempX='预测'+i+'期';
             	upper.push(tempX);
             	for(var m=0;m<row;m++){
             		tempY[m]=0;
             		for(var n=1;n<=volume;n++){
             			//alert(data[m][data[m].length-n]);
                 		tempY[m]=tempY[m]+parseInt(data[m][data[m].length-n]);
                 	}
             		//alert(tempY[m]);

             	}
             	for(var j=0;j<row;j++){
             		data[j].push(parseInt(tempY[j]/volume));
             	}    	
             } 

        }
			createOptions(data, upper, left, title, drawType);
			

	}
	else{
		alert("数据选择不规范，请重新选择");
	}
}

var chartNum = 0;
function createOptions(matrix, upper_arg, left_arg, input_title, type) {// 生成绘图数据,type=1折线和柱状2折柱混合3饼状图，饼状的先不管了
	chartNum++;
	var trNum = $("#chartTable tbody tr").length;//
	var existChartNum = trNum;
	var drawtd;
	var td_id="drawtd"+chartNum;
	if (existChartNum == 0) { 
		$("#chartTable tbody").html(
		"<tr style='width:1100px; height:450px;'><td style='width:1000px; height:500px;' id='"+"drawtd"+chartNum+"'></td><td>" +
		"<div style='height:40px'><input id='matrix' type='hidden' value="+JSON.stringify(matrix)+" />" +
		"<input id='upper_arg' type='hidden' value="+JSON.stringify(upper_arg)+" />" +
		"<input id='left_arg' type='hidden' value="+JSON.stringify(left_arg)+" />" +
		"<input id='type' type='hidden' value="+type+" />" +
		"<input id='input_title' type='hidden' value="+input_title+" />"+
		"<a href='#' onclick='transCharts(this)' class='easyui-linkbutton' iconCls='icon-reload'>转置</a></div>"		
		+"<div style='height:40px'><a onclick='delSearch(this)' class='easyui-linkbutton' iconCls='icon-remove'>删除</a></div>" +
				"</td></tr>");
		drawtd = document.getElementById(td_id);
	} else {
		var lastTr = $("#chartTable tbody tr").eq(trNum - 1);
		lastTr.after("<tr style='width:1100px; height:450px;'><td style='width:1000px; height:500px;' id='"+"drawtd"+chartNum+"'></td><td>" +
				"<div style='height:40px'><input id='matrix' type='hidden' value="+JSON.stringify(matrix)+" />" +
				"<input id='upper_arg' type='hidden' value="+JSON.stringify(upper_arg)+" />" +
				"<input id='left_arg' type='hidden' value="+JSON.stringify(left_arg)+" />" +
				"<input id='type' type='hidden' value="+type+" />" +
				"<input id='input_title' type='hidden' value="+input_title+" />"+
				"<a href='#' onclick='transCharts(this)' class='easyui-linkbutton' iconCls='icon-reload'>转置</a></div>"		
				+"<div style='height:40px'><a onclick='delSearch(this)' class='easyui-linkbutton' iconCls='icon-remove'>删除</a></div>" +
						"</td></tr>");// 增加一行
		drawtd = document.getElementById(td_id);
	}
	if (type == 1) {
		var _serial = new Array();
		for (var i = 0; i < left_arg.length; i++) {
			var _name = left_arg[i];
			var _type = "line";
			var _data = matrix[i];
			_serial.push({
				name : _name,
				type : _type,
				data : _data,
//				itemStyle : { normal: {label : {show: true}}}
			});
		}
		var myChart = echarts.init(drawtd);
		myChart.setOption(getOption(input_title,left_arg,upper_arg,_serial));
	}else if(type==2){
		var _serial = new Array();
		for (var i = 0; i < left_arg.length; i++) {
			var _name = left_arg[i];
			var _type = "bar";
			var _data = matrix[i];
			_serial.push({
				name : _name,
				type : _type,
				data : _data,
//				itemStyle : { normal: {label : {show: true}}}
			});
		}
		var myChart = echarts.init(drawtd);
		myChart.setOption(getOption(input_title,left_arg,upper_arg,_serial));
	}
	else if (type == 3) {
		var _serial = new Array();
		for (var i = 0; i < left_arg.length; i++) {
			var _name = left_arg[i];
			var _data = matrix[i];
			var line_data=[];
			for(var l=1;l< matrix[i].length;l++){
				line_data[l]=(matrix[i][l]-matrix[i][l-1])/matrix[i][l-1];
			}
			var _color='rgba('+parseInt(Math.random()*255)+','+parseInt(Math.random()*255)+','+parseInt(Math.random()*255)+','+0.5+')'
			var _bcolor='rgb('+parseInt(Math.random()*255)+','+parseInt(Math.random()*255)+','+parseInt(Math.random()*255)+')'

			_serial.push({
				name : _name,
				type : "line",
				data : line_data,
				yAxisIndex:1,
			});
			_serial.push({
				name : _name,
				type : "bar",
				data : _data,
				itemStyle : { normal:{color:_color}}
			});
		}
		var myChart = echarts.init(drawtd);
		var option=getOption(input_title,left_arg,upper_arg,_serial);
		option.yAxis=[{type : 'value'},{  'type':'value','name':'增长率'} ];
		myChart.setOption(option);
	}
	else if (type == 4) {
		var _serial = new Array();
		var _data = new Array();
		for (var i = 0; i < upper_arg.length; i++) {
			_data[i] = new Array();
			for(var j = 0; j < left_arg.length; j++){
				_data[i].push({
					value : matrix[j][i],
					name : left_arg[j]
				});
			}	
		}
		//console.log(_data);
		for (var i = 0; i < upper_arg.length; i++) {
			//var _data = matrix[i];
			_serial.push({
				type : "pie",
				data : _data[i]
			});
		}

		var myChart = echarts.init(drawtd);
		myChart.setOption(getPieOption(input_title,left_arg,upper_arg,_serial));
	}
	$.parser.parse("#chartTable");
	var bodyHeight = $("#bodyDiv").height();
	$("#bodyDiv").height(bodyHeight+500);
	var indexChartsHeight = $("#drawCharts").height();
	$("#drawCharts").height(indexChartsHeight+500);	
	layer.msg("绘图成功");
}

//matrix, upper_arg, left_arg, input_title, type
function transCharts(e){
//	alert(JSON.stringify($(e).parents("td").find("div").eq(0).find("input")));
//	alertj(e);
//	console.log(eval('('+$(e).parents("td").find("div").eq(0).find("input").eq(0).val()+')'));
	var matrix=transposition(eval('('+$(e).parents("td").find("div").eq(0).find("input").eq(0).val()+')'));
//	(data);
	var upper_arg=eval('('+$(e).parents("td").find("div").eq(0).find("input").eq(2).val()+')');
	var left_arg=eval('('+$(e).parents("td").find("div").eq(0).find("input").eq(1).val()+')');
	var input_title=$(e).parents("td").find("div").eq(0).find("input").eq(4).val();
	var type=$(e).parents("td").find("div").eq(0).find("input").eq(3).val();
	var drawtdid=$(e).parents("tr").find("td").eq(0).attr("id");
	$(e).parents("td").find("div").eq(0).find("input").eq(0).val(JSON.stringify(matrix));
	$(e).parents("td").find("div").eq(0).find("input").eq(2).val(JSON.stringify(left_arg));
	$(e).parents("td").find("div").eq(0).find("input").eq(1).val(JSON.stringify(upper_arg));
	if (type == 1) {
		var _serial = new Array();
		for (var i = 0; i < left_arg.length; i++) {
			var _name = left_arg[i];
			var _type = "line";
			var _data = matrix[i];
			_serial.push({
				name : _name,
				type : _type,
				data : _data,
//				itemStyle : { normal: {label : {show: true}}}
			});
		}
		var myChart = echarts.getInstanceById($("#"+drawtdid).attr("_echarts_instance_"));
		myChart.clear();
		myChart.setOption(getOption(input_title,left_arg,upper_arg,_serial));
	}else if(type==2){
		var _serial = new Array();
		for (var i = 0; i < left_arg.length; i++) {
			var _name = left_arg[i];
			var _type = "bar";
			var _data = matrix[i];
			_serial.push({
				name : _name,
				type : _type,
				data : _data,
//				itemStyle : { normal: {label : {show: true}}}
			});
		}
		var myChart = echarts.getInstanceById($("#"+drawtdid).attr("_echarts_instance_"));
		myChart.clear();
		myChart.setOption(getOption(input_title,left_arg,upper_arg,_serial));
	}
	else if (type == 3) {
		var _serial = new Array();
		for (var i = 0; i < left_arg.length; i++) {
			var _name = left_arg[i];
			var _data = matrix[i];
			_serial.push({
				name : _name,
				type : "line",
				data : _data
			});
			_serial.push({
				name : _name,
				type : "bar",
				data : _data
			});
		}
		var myChart = echarts.getInstanceById($("#"+drawtdid).attr("_echarts_instance_"));
		myChart.clear();
		myChart.setOption(getOption(input_title,left_arg,upper_arg,_serial));
	}
	layer.msg("绘图成功");
}

/*****
 * 描述性统计
 * *****/
function descAnalysis(){			   
	number=[];
	totalCount = 0, numCount = 0, total = 0;
	var position=$("#analysis").offset(); 
	var activeSheet=spread.getActiveSheet();    	
 	activeSheet.suspendPaint();   
 	activeSheet.options.allowCellOverflow = true;//允许overflow
 	var selections=activeSheet.getSelections();  //得到选择区域
        if(selections&& selections.length){
            for(var i = 0; i < selections.length; i++){
                var selection = selections[i];
                for(var row = selection.row; row < selection.row + selection.rowCount; row++){
                    for(var col = selection.col; col < selection.col + selection.colCount; col++){
                        var value = activeSheet.getValue(row, col);             
                        if((value !== null )&&(value !== undefined )&&( value !== " ")&&( value !== "——")){//当单元格值有效时                       	
                            if(isFinite(value)){
                                numCount++;
                                total += parseFloat(value);
                                number.push(value);
                            }                          
                            totalCount ++;
                        }
                     
                    }
                }
            }
            console.log("number is ");
            console.log(number);
        }
        else{
           alert("选择区域不正确");
        }       
 	     activeSheet.resumePaint();
 	    $("#div1").show(); 
 	    $( "#div1" ).dialog(); 	    	     	
}

function caculate(){		
	var activeSheet=spread.getActiveSheet();   
    var str=fbx.text();//得到位置
	var txt=str.split("!")[1];
	var val=txt.split(":");
	var location=new Array();
	location.push(val);
	var result=location[0];
	var sub=result[0];
    var eng=new Array();
    var num="";
    var col=0;
    var res;
    for(var i=0;i<sub.length;i++){
    	if(sub.charCodeAt(i)>=65&&sub.charCodeAt(i)<=90){//说明是大写的英文字母	    	
    		col+=sub.charCodeAt(i)-64;
    	}else if(sub.charCodeAt(i)>=48&&sub.charCodeAt(i)<=57){//说明是数字
    		num+=sub[i];	    		
    	}
    }
    col--;//表格是从0开始编号的
    var row=parseInt(num)-1;
    
    obj = document.getElementsByName("ng");
    check_val = [];
    for(k in obj){
        if(obj[k].checked){//检测哪个选项被选中
        	 check_val.push(obj[k].value);
        }	           
    }
    for(var i=0;i<check_val.length;i++){
       switch(check_val[i]){
           case "1": {//求平均数
    	      var res1 = average(total,numCount) || 0;  	    
    	      activeSheet.setValue(row,col,'平均数');
    	      activeSheet.setValue(row,col+1,res1.toFixed(3));
    	      row++;
    	      break;	   
         }
           case "2":{//求中位数的
    	    var res2 = parseFloat(mediannum(number,numCount)) || 0;
    	    activeSheet.setValue(row,col,'中位数');
    	    activeSheet.setValue(row,col+1,res2);
    	    row++;
    	    break;
         }
       case "3":{
    	   var res3 = parseFloat(mode(number,numCount)) || 0;
    	   activeSheet.setValue(row,col,'众数');
    	   activeSheet.setValue(row,col+1,res3);
    	    row++; 
    	    break;
       }	 
       case "4":{
    	   var res4 = parseFloat(kurtosis(number,numCount))|| 0;;
    	   activeSheet.setValue(row,col,'峰度');
    	   activeSheet.setValue(row,col+1,res4.toFixed(3));
    	   row++;  
    	   break; 
       }	
       case "5":{
    	  var res5= parseFloat(max(number,numCount));
    	   activeSheet.setValue(row,col,'最大值');
    	   activeSheet.setValue(row,col+1,res5);
    	   row++;        	   
    	   break;
       }	
       case "6":{
    	   var res6 = parseFloat(min(number,numCount))|| 0;;
    	   activeSheet.setValue(row,col,'最小值');
    	   activeSheet.setValue(row,col+1,res6);
    	   row++; 
    	   break;
       }	
       case "7":{
    	   activeSheet.setValue(row,col,'求和');
    	   activeSheet.setValue(row,col+1,total.toFixed(3));
    	   row++; 
    	   break;
       }           
       case "8":{//选择方差
    	   var mean= average(total,numCount);
    	   var res8 = parseFloat(variance(number,numCount,mean));
    	   activeSheet.setValue(row,col,'方差');
    	   activeSheet.setValue(row,col+1,res8.toFixed(3));
    	   row++; 
    	   break;       	 
       }
       case "9":{
    	   var res9= parseFloat(standardDiviation(number,numCount));
    	   activeSheet.setValue(row,col,'标准差');
    	   activeSheet.setValue(row,col+1,res9.toFixed(3));
    	   row++; 
    	   break;  
    	   
       }
       case "10":{
    	   var res10=parseFloat(skewness(number,numCount));
    	   activeSheet.setValue(row,col,'偏度');
    	   activeSheet.setValue(row,col+1,res10.toFixed(3));
    	   row++; 
    	   break;       	  
       }
       case "11":{
    	   if(averageIncrease(number,numCount)){
    	   var res11=parseFloat(averageIncrease(number,numCount));
    	   activeSheet.setValue(row,col,'年均增速');
    	   activeSheet.setValue(row,col+1,res11.toFixed(3)+"%");
    	   row++; 
    	   break;       	  
       }else{
    	   activeSheet.setValue(row,col,'年均增速');
    	   activeSheet.setValue(row,col+1,'无法计算');
    	   row++; 
    	   break;       	  
       }
       }
       
       
    }
    }
$( "#div1" ).dialog('close');
$("#div1").hide();
}

	function sequence(a,b){//对数组进行排序的函数
		if(a>b){
			return 1;
		}else if(a<b){
			return -1;			
		}else{
			return 0;
		}
		
	}
	
/***
 * 平均数
 * ****/
function average(total,count){
	var average=total/count;
	return average;
}

function mediannum(number,count){//中位数	
	console.log("中位数排序");
	number.sort(function(a,b){
	     return a-b;
	});	
	console.log(number);
	var length=number.length;
	var result;
	
	if(length%2==0){//长度是偶数
		result=length/2;	
	}else{//长度是奇数
		result=(length+1)/2;
	}
	return number[result];
}

function max(number,count){
	number.sort(function(a,b){
	     return a-b;
	});	//number.sort()对number数组进行排序		
	console.log("排序后的数组为");
	console.log(number);
	return number[count-1];
	
}

function min(number,count){
	number.sort(function(a,b){
	     return a-b;
	});	
	return number[0];
}

function variance(number,count,mean){//计算方差
	var sum=0;
	for(var i=0;i<number.length;i++){
		sum += Math.pow(number[i] - mean , 2); 
	}		
	return sum/count;	
}



/**
 * 寻找众数  
**/ 
function mode(number,length){
	var sortNumber=number.sort();
	var i=0;
	var maxCount=1;
	var index=0;
	while (i<length-1)
		{
		 var count=1; 
		for (var j=i;j<length-1;j++)  
		   {  
			if (number[j] ==number[j + 1])//存在连续两个数相等，则众数+1  
		     {  
		       count++;  
		    }  
		    else  
		     {  
		       break;  
		     }  
		   }  
		if (maxCount<count)  
		  {  
		    maxCount=count;//当前最大众数  
		    index=j;//当前众数标记位置  
		  }  
		  ++j;  
		  i = j;//位置后移到下一个未出现的数字  
		}
	return number[index];
}

/**
 * 计算峰度  
 * Kurtosis=1/n-1{[(x1-x)^4 +...(xn-x)^4]/σ^3}-3
**/ 
function kurtosis(number,count){
	var sum1=0;  
	for(var i=0;i<count;i++){//求和  
		sum1+=parseFloat(number[i]);  
	}    
	var dAve=sum1/count;//求平均值 
	var sum2=0;
	for(var i=0;i<count;i++){//  
		sum2+=Math.pow(parseFloat(number[i])-dAve,4); 
		} 
	var std=standardDiviation(number,count);//求标准差
	var std4=Math.pow(std,4);
	return 1/(count-1)*sum2/std4-3;
}

/**
 * 计算偏度  
 * Skewness=1/n-1{[(x1-x)^3 +...(xn-x)^3]/σ^3}
**/ 
function skewness(number,count){
	var sum1=0;  
	for(var i=0;i<count;i++){//求和  
		sum1+=parseFloat(number[i]);  
	}    
	var dAve=sum1/count;//求平均值 
	var sum2=0;
	for(var i=0;i<count;i++){//  
		sum2+=Math.pow(parseFloat(number[i])-dAve,3); 
		} 
	var std=standardDiviation(number,count);//求标准差
	var std3=Math.pow(std,3);
	return 1/(count-1)*sum2/std3;
}

/**
 * 标准差σ=sqrt(s^2)  
 * 
**/ 
function standardDiviation(number,count){
	var sum=0;  
	for(var i=0;i<count;i++){//求和  
		sum+=parseFloat(number[i]);  
	} 
	var dAve=sum/count;//求平均值  
	var dVar=0;  
	for(var i=0;i<count;i++){//求方差  
	    dVar+=(parseFloat(number[i])-dAve)*(parseFloat(number[i])-dAve);  
	} 
	 return Math.sqrt(dVar/count);     
}

/**
 * 年均增速
 * 
**/ 

function averageIncrease(number,count){	
	var mul=1;	
	for(var i=0;i<count;i++){//求乘积
		var val;
		console.log("number is "+number[i]);
		val=number[i];
		console.log("val is "+val);
		mul=mul*val;
	}
	console.log("mul is "+mul);
	var result=Math.pow(mul,1/count);			
		if(mul<0&&!(count%2)){//奇数开偶次方
			console.log("无法计算");
			return false;
		}
		else{
			console.log("result is "+result*100+"%");
	        return result*100;
	}
}


//初始化预测期
function init_predictionSelect(selectid) {
			var init_str = '<option value="">--请选择--</option>';
			for (var i = 1; i < 10; i++) {
				init_str += '<option value=' +i + '>'
						+ '预测' +i+'期'+ '</option>';
			}
			$("#" + selectid).html(init_str);
}


