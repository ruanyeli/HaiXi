/**
 * 页面加载
 */
var _url="";
var _depid=parent.$("#user_department").val();
var spread;

$(function(){
	$(".loader").remove();
	spread = new GC.Spread.Sheets.Workbook($("#ss").get(0), {
        sheetCount:1           
    });	        	        	
	var excelIo = new GC.Spread.Excel.IO();
	var sheet = spread.getActiveSheet();
	sheet.setColumnCount(200,GC.Spread.Sheets.SheetArea.viewport);
	sheet.setRowCount(2000,GC.Spread.Sheets.SheetArea.viewport);
    $("#loadExcel").click(function () {
        var excelFile = document.getElementById("fileDemo").files[0];
        var password = $("#password").val();
        // here is excel IO API
        excelIo.open(excelFile, function (json) {
            var workbookObj = json;
            spread.fromJSON(workbookObj);
            spread.removeSheet(0);
        }, function (e) {
            // process error
            layer.msg(e.errorMessage);
            if (e.errorCode === 2 /*noPassword*/ || e.errorCode === 3 /*invalidPassword*/) {
                $("#password").select();
            }
        }, {password: password});       
    });
   
    $("#ss").bind("contextmenu", processSpreadContextMenu);
   	$("#spreadContextMenu a").click(processContextMenuClicked);
    $(document).on("contextmenu", function ()
    {
        event.preventDefault();
        return false;
    });	
    if(_depid!=0){
    	$.ajax({
    		url:_url+'/statype/findStatype',
    		type:'post',
    		data:{
    			"statdepartment":_depid
    		},
    		success:function(response){
    			if(response.resultCode=="0"){
    				var statypeList=response.data;
    				$('#stadeptype').combobox({
    					data:statypeList,
    					valueField:'statid',    
    					textField:'typename'   
    				});
    			}else{
    				layer.msg(response.resultDesc);
    			}
    		}
    	});
    }else{
    	var forthDiv=$("#staname");
    	forthDiv.after("<div style='margin-bottom:20px'><div>所属部门</div><input class='easyui-combobox' style='width:200px;height:32px' id='department'/></div>");
    	$.ajax({
    		url:_url+'/department/ListDepartment',
    		type:'post',
    		success:function(response){
                if(response.resultCode=="0")
                {
                    var departmentList=response.data;
                    $('#department').combobox({
    					data:departmentList,
    					valueField:'depid',    
    					textField:'depname',
    					onChange: function(NewValue,OldValue){    
    						$.ajax({
    				    		url:_url+'/statype/findStatype',
    				    		type:'post',
    				    		data:{
    				    			"statdepartment":NewValue
    				    		},
    				    		success:function(response){
    				    			if(response.resultCode=="0"){
    				    				var statypeList=response.data;
    				    				$('#stadeptype').combobox({
    				    					data:statypeList,
    				    					valueField:'statid',    
    				    					textField:'typename'   
    				    				});
    				    			}else{
    				    				layer.msg(response.resultDesc);
    				    			}
    				    		}
    				    	});  
    			        }
    				});
                }else{
                    layer.msg(response.resultDesc);
                }
            }
    	});
    }
}); 
//当前行数
var rowNum = 3;
// 当前列数
var col = 3;
// 当前已合并单元格的信息
var mergeid = new Array();
var mergecolspan = new Array();
var mergerowspan = new Array();

//右键点击触发
function processSpreadContextMenu(e)
       {
           // move the context menu to the position of the mouse point
           var sheet = spread.getActiveSheet(),
               target = getHitTest(e.pageX, e.pageY, sheet),
               hitTestType = target.hitTestType,
               row = target.row,
               col = target.col,
               selections = sheet.getSelections();

           var isHideContextMenu = false;

           if (hitTestType === GC.Spread.Sheets.SheetArea.colHeader)
           {
               if (getCellInSelections(selections, row, col) === null)
               {
                   sheet.setSelection(-1, col, sheet.getRowCount(), 1);
               }
               if (row !== undefined && col !== undefined)
               {
                   $(".context-header").show();
                   $(".context-cell").hide();
               }
           } else if (hitTestType === GC.Spread.Sheets.SheetArea.rowHeader)
           {
               if (getCellInSelections(selections, row, col) === null)
               {
                   sheet.setSelection(row, -1, 1, sheet.getColumnCount());
               }
               if (row !== undefined && col !== undefined)
               {
                   $(".context-header").show();
                   $(".context-cell").hide();
               }
           } else if (hitTestType === GC.Spread.Sheets.SheetArea.viewport)
           {
               if (getCellInSelections(selections, row, col) === null)
               {
                   sheet.clearSelection();
                   sheet.endEdit();
                   sheet.setActiveCell(row, col);
                   updateMergeButtonsState();
               }
               if (row !== undefined && col !== undefined)
               {
                   $(".context-header").hide();
                   $(".context-cell").hide();
                   showMergeContextMenu();
               } else
               {
                   isHideContextMenu = true;
               }
           } else if (hitTestType === GC.Spread.Sheets.SheetArea.corner)
           {
               sheet.setSelection(-1, -1, sheet.getRowCount(), sheet.getColumnCount());
               if (row !== undefined && col !== undefined)
               {
                   $(".context-header").hide();
                   $(".context-cell").show();
               }
           }

           var $contextMenu = $("#spreadContextMenu");
           $contextMenu.data("sheetArea", hitTestType);
           if (isHideContextMenu)
           {
               hideSpreadContextMenu();
           } else
           {
               $contextMenu.css({ left: e.pageX, top: e.pageY });
               $contextMenu.show();
               $(document).on("click.contextmenu", function () {              
                   if ($(event.target).parents("#spreadContextMenu").length === 0)
                   {
                       hideSpreadContextMenu();
                   }
               });
           }
       }

       //右键菜单点击触发
       function processContextMenuClicked()
       {
           var action = $(this).data("action");
           var sheet = spread.getActiveSheet();
           var sheetArea = $("#spreadContextMenu").data("sheetArea");

           hideSpreadContextMenu();

           switch (action)
           {
               case "cut":
                   spread.commandManager().execute({cmd:"cut",sheetName:sheet.name()});
                   break;
               case "copy":
                   spread.commandManager().execute({cmd:"copy",sheetName:sheet.name()});
                   break;
               case "paste":
					spread.commandManager().execute({cmd:"paste",sheetName:sheet.name()});
                   break;
               case "insert":
                   if (sheetArea === GC.Spread.Sheets.SheetArea.colHeader)
                   {
                       sheet.addColumns(sheet.getActiveColumnIndex(), 1);
                   } else if (sheetArea === GC.Spread.Sheets.SheetArea.rowHeader)
                   {
                       sheet.addRows(sheet.getActiveRowIndex(), 1);
                   }
                   break;
               case "delete":
                   if (sheetArea === GC.Spread.Sheets.SheetArea.colHeader)
                   {
                       sheet.deleteColumns(sheet.getActiveColumnIndex(), 1);
                   } else if (sheetArea === GC.Spread.Sheets.SheetArea.rowHeader)
                   {
                       sheet.deleteRows(sheet.getActiveRowIndex(), 1);
                   }
                   break;
               case "merge":
                   var sel = sheet.getSelections();
                   if (sel.length > 0)
                   {
                       sel = sel[sel.length - 1];
                       sheet.addSpan(sel.row, sel.col, sel.rowCount, sel.colCount, GC.Spread.Sheets.SheetArea.viewport);
                   }
                   updateMergeButtonsState();
                   break;
               case "unmerge":
                   var sels = sheet.getSelections();
                   for (var i = 0; i < sels.length; i++)
                   {
                       var sel = getActualCellRange(sels[i], sheet.getRowCount(), sheet.getColumnCount());
                       for (var r = 0; r < sel.rowCount; r++)
                       {
                           for (var c = 0; c < sel.colCount; c++)
                           {
                               var span = sheet.getSpan(r + sel.row, c + sel.col, GC.Spread.Sheets.SheetArea.viewport);
                               if (span)
                               {
                                   sheet.removeSpan(span.row, span.col, GC.Spread.Sheets.SheetArea.viewport);
                               }
                           }
                       }
                   }
                   updateMergeButtonsState();
                   break;
               default:
                   break;
           }
       }

       function hideSpreadContextMenu(){       
           $("#spreadContextMenu").hide();
           $(document).off("click.contextmenu");
       }

       function updateMergeButtonsState()
       {
           var sheet = spread.getActiveSheet();
           var sels = sheet.getSelections(),
               mergable = false,
               unmergable = false;

           sels.forEach(function (range)
           {
               var ranges = sheet.getSpans(range),
                   spanCount = ranges.length;

               if (!mergable)
               {
                   if (spanCount > 1 || (spanCount === 0 && (range.rowCount > 1 || range.colCount > 1)))
                   {
                       mergable = true;
                   } else if (spanCount === 1)
                   {
                       var range2 = ranges[0];
                       if (range2.row !== range.row || range2.col !== range.col ||
                           range2.rowCount !== range2.rowCount || range2.colCount !== range.colCount)
                       {
                           mergable = true;
                       }
                   }
               }
               if (!unmergable)
               {
                   unmergable = spanCount > 0;
               }
           });

           $("#mergeCells").attr("disabled", mergable ? null : "disabled");
           $("#unmergeCells").attr("disabled", unmergable ? null : "disabled");
       }
       
       function getHitTest(pageX, pageY, sheet)
       {
           var offset = $("#ss").offset(),
                   x = pageX - offset.left,
                   y = pageY - offset.top;
           return sheet.hitTest(x, y);
       }

       function getCellInSelections(selections, row, col)
       {
           var count = selections.length, range;
           for (var i = 0; i < count; i++)
           {
               range = selections[i];
               if (range.contains(row, col))
               {
                   return range;
               }
           }
           return null;
       }

       function getActualCellRange(cellRange, rowCount, columnCount)
       {
           if (cellRange.row === -1 && cellRange.col === -1)
           {
               return new spreadNS.Range(0, 0, rowCount, columnCount);
           }
           else if (cellRange.row === -1)
           {
               return new spreadNS.Range(0, cellRange.col, rowCount, cellRange.colCount);
           }
           else if (cellRange.col === -1)
           {
               return new spreadNS.Range(cellRange.row, 0, cellRange.rowCount, columnCount);
           }

           return cellRange;
       }

       function showMergeContextMenu()
       {
           // use the result of updateMergeButtonsState
           if ($("#mergeCells").attr("disabled"))
           {
               $(".context-merge").hide();
           } else
           {
               $(".context-cell.divider").show();
               $(".context-merge").show();
           }

           if ($("#unmergeCells").attr("disabled"))
           {
               $(".context-unmerge").hide();
           } else
           {
               $(".context-cell.divider").show();
               $(".context-unmerge").show();
           }
       }
       
$(function(){
   var tableinfo=new Array();//用来存放上表头和左表头信息
   var upperRow=0;//上表头行
   var upperCol=0;//上表头列
   var leftRow=0;//左表头行
   var leftCol=0;//左表头列
   var uppsign=0;
   var leftsign=0;
   var start;
   var allUpper;

	$("#uppselect").bind('click', function(){//保存为上表头
		if((uppsign==leftsign)&&uppsign!=0){//如果两个标志相等且不等于0 ，说明之前上表头和左表头选中次数一样多，这次要导入需要清空
			tableinfo=[];
		}
		if(uppsign-leftsign>=1){
			tableinfo=[];
		}
		var sheet=spread.getActiveSheet();    	
    	sheet.suspendPaint(); 
    	var sel=sheet.getSelections();  //得到选择区域
    	upperRow=sel[0].rowCount;
    	console.log("上表头行数upperRow is ="+upperRow);
    	upperCol=sel[0].colCount;
     	console.log(sel);  
     	start=sel[0].col+"-"+sel[0].row;
//   	var arr={
//   			id:sel[0].col+"-"+sel[0].row,
//   		    content:" ",
//   		    colspan:1,
//   		    rowspan:sel[0].rowCount
//   	}
//   		tableinfo.push(arr);//原来的左边合并的单元格 如果有坐表头，则填入   	  	
   	for(var rowindex=sel[0].row;rowindex<sel[0].rowCount+sel[0].row;rowindex++){  		  			
   		for(var colindex=sel[0].col;colindex<sel[0].colCount;colindex+=ColOfRow){ 
   			var ColOfRow=0;
   			var span=sheet.getSpan(rowindex,colindex);      				
       			if(span!=null){//是合并单元格 
       				ColOfRow+=span.colCount;
   				var id;
   				var colspan;   				 			
   				id= span.col+"-"+span.row; //按照有左表头的算   					     					 
   				colspan=span.colCount;
   				console.log("合并单元格列数：="+colspan);    						   					     							
   				        arr={
   						id: id,
   						content:sheet.getValue(span.row,span.col),
   						colspan:colspan,
   						rowspan:span.rowCount	
   				           }    				 				
   				}else{//不是合并单元格
   					ColOfRow=1;    					
   						arr={
       							id:colindex+"-"+rowindex,
       							content:sheet.getValue(rowindex,colindex),
       							colspan:"1",
       							rowspan:"1"
       					   }      						    			     					
   				}
       			tableinfo.push(arr);//存入 
       			allUpper=tableinfo.length;
   			}
   		console.log(tableinfo);
   	}
    	sheet.resumePaint();
    	uppsign++;
    	layer.msg("保存为上表头成功");
	});
	
	$("#leftselect").bind('click', function(){//左表头传值
		if((uppsign==leftsign)&&uppsign!=0){//如果两个标志相等且不等于0 ，说明之前上表头和左表头选中次数一样多，这次要导入需要清空
			tableinfo=[];
		}
		if(leftsign-uppsign>=1){
			tableinfo=[];
		}
		var sheet=spread.getActiveSheet();    	
    	sheet.suspendPaint();     	
    	var sel=sheet.getSelections();  //得到选择区域
    	console.log(sel);
      leftCol=sel[0].colCount;
      leftRow=sel[0].rowCount;
      console.log("leftcol is "+leftCol+"leftRow is "+leftRow);
    	for(var rowindex=sel[0].row;rowindex<sel[0].rowCount+sel[0].row;rowindex++){//遍历行
    		console.log(rowindex);
    		var ColOfRow=0;
    		for(var colindex=sel[0].col;colindex<sel[0].col+sel[0].colCount;colindex++){//遍历列   			
       		   value=sheet.getValue(rowindex,colindex); //得到每一单元格的值
       		   var span=sheet.getSpan(rowindex,colindex);   //得到选择区域		     
      		   if(span!=null){//是合并单元格 
      		    ColOfRow+=span.colCount;
  				var id;
  				var colspan;   				 			
  				id= span.col+"-"+span.row;  					     					 
  				colspan=span.colCount;
  				console.log("合并单元格列数：="+colspan);    						   					     							
  				        arr={
  						id: id,
  						content:sheet.getValue(span.row,span.col),
  						colspan:colspan,
  						rowspan:span.rowCount	
  				           }    				 				
  				}else{//不是合并单元格
  					ColOfRow=1;    					
  						arr={
      							id:colindex+"-"+rowindex,
      							content:sheet.getValue(rowindex,colindex),
      							colspan:"1",
      							rowspan:"1"
      					   }      						    			     					
  				}
      			tableinfo.push(arr);//存入  		    			
    		}
    			
    	}
    	console.log(tableinfo);
    	sheet.resumePaint();
    	leftsign++;
    	layer.msg("保存为左表头成功");
	});

	$("#save").bind('click', function(){//左表头传值
		if($("#staName").val()==""){
			layer.msg("请输入报表名称");
			return;
		}else {
			if($("#stadeptype").combobox('getValue')==""){
				layer.msg("请选择报表类型");
				return;
		       }else{
		    	   if(upperRow==0&&leftRow==0){
		    		   layer.msg("请选择上表头和左表头");
		    		   return;
		    	   }else{
		    		   layer.msg("正在新建报表...");
		    	   }
		       }
			}		
		var uppercontent=tableinfo[0].content;
		console.log("leftRow is "+leftRow);		
		if(leftRow>0){//如果存在左表
			console.log("有多列左表头");
				var arr={
						 id:start,
			             content:"",
			             colspan:leftCol,
			             rowspan:upperRow
				}
				tableinfo.unshift(arr);//存入第一位						
					for(var i=1;i<=allUpper;i++){
						var id=tableinfo[i].id;
						console.log(id);
						var str=new Array();
						str=id.split("-");	
						console.log(str);						
						var firstid=parseInt(str[0])+leftCol;	
						console.log("firstid is ="+firstid);
						tableinfo[i].id=firstid+"-"+str[1];	
						str=[];
					}
				
		}
		console.log(tableinfo);
		
	$.ajax({
		type : "post",
		url :"/diyMenu/createTable",
		data : {
			"rowandcol" : JSON.stringify(tableinfo),
			"row" : upperRow+leftRow,//总行数
			"col" : upperCol+leftCol,//总列数
			"upheadColNum" : upperCol,//上表头列数
			"leftheadRowNum" : leftRow,//左表头行数
			"stacreator":4,//假设是高级管理员
			"stadeptype":$("#stadeptype").combobox('getValue'),//这个地方，在下拉框那里存的实际上是statid
			"staname":$("#staName").val() //表名
		},
		success : function(response) {
			if(response.resultCode=="0"){
				layer.msg("新建报表成功",{icon: 1});
			}else{
				layer.msg(response.resultDesc);
			}
		},
	});
	});
});
