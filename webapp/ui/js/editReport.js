/**
 * 
 */
var _url = "";
var spread;
var _depid=parent.$("#user_department").val();
/**
 * 页面加载
 */
var depid,statid;
var _stattype;
$(function(){
	$(".loader").remove();
	spread = new GC.Spread.Sheets.Workbook($("#ss").get(0), {
        sheetCount:1           
    });
	var staid=$("#staid").val();
	 $.ajax ({
         type: "POST",
         url:  _url+'/diyMenu/EditStatementInfo',
         data: {
		    	staid:staid
         },
         success: function (data) {
        	var depid=data.statement.statdepartment;
        	var statid=data.statype.statid;       	
         	getCombobox(depid,statid);         
         	initSpread(data,spread);
         	document.getElementById("staName").value=data.statement.staname;
         	
         },
         error: function () {

             //alert("失败啦");原来就有注释
         }
     
    });
	var excelIo = new GC.Spread.Excel.IO();
	var sheet = spread.getActiveSheet();
	sheet.setColumnCount(200,GC.Spread.Sheets.SheetArea.viewport);
	sheet.setRowCount(2000,GC.Spread.Sheets.SheetArea.viewport);
    $("#loadExcel").click(function () {
        var excelFile = document.getElementById("file").files[0];
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
   
    
  
}); 
function getCombobox(depid,statid){
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
    					value:statid,
    					textField:'typename'   
    				});
    			}else{
    				layer.msg(response.resultDesc);
    			}
    		}
    	});
    }else{
    	$.ajax({
    		url:_url+'/statype/findStatype',
    		type:'post',
    		data:{
    			"statdepartment":depid
    		},
    		success:function(response){
    			if(response.resultCode=="0"){
    				var statypeList=response.data;
    				$('#stadeptype').combobox({
    					data:statypeList,
    					value:statid,
    					valueField:'statid',    
    					textField:'typename'   
    				});
    			}else{
    				layer.msg(response.resultDesc);
    			}
    		}
    	});  
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
    					value:depid,
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
    				    					value:"",
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
}
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
		var uppercontent=tableinfo[0].content;
//		if(leftRow==0&&uppercontent==" "){//如果没有左表头，则删掉第一个，且之后的所有元素向前移一位
//			var remove=tableinfo.shift();		
//			for(var i=0;i<tableinfo.length;i++){
//				var id=tableinfo[i].id;
//				console.log(id);
//				var str=new Array();
//				str=id.split("-");	
//				console.log(str);
//				var firstid=str[0]-1;	
//				console.log("firstid is ="+firstid);
//				tableinfo[i].id=firstid+"-"+str[1];	
//				str=[];
//			}
//		}
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
		
		var _data={
				"rowandcol" : JSON.stringify(tableinfo),
				"row" : upperRow+leftRow,//总行数
				"col" : upperCol+leftCol,//总列数
				"upheadColNum" : upperCol,//上表头列数
				"leftheadRowNum" : leftRow,//左表头行数
				"stacreator":4,//假设是高级管理员
				"stadeptype":$("#stadeptype").combobox('getValue'),//这个地方，在下拉框那里存的实际上是statid
				"staname":$("#staName").val() //表名
			};
		//alert(JSON.stringify(_data));
	$.ajax({
		type : "post",
		url :"/diyMenu/createTable",
		data :_data ,
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


function getUpper(obj){
	var rowInfo=[];
	
	var maxLength=0;
	for(var k=0;k<obj.upper.length;k++){
		var uppstruct=obj.upper[k].uppstruct;
		if(maxLength<uppstruct.split("/").length){
			maxLength=uppstruct.split("/").length;
		}
	}
	var upper=new Array(maxLength);
	for(var i=0;i<upper.length;i++){
		var index=[];
		var colSpan=[];
		for(var j=0;j<obj.upper.length;j++){			
			var uppstruct=obj.upper[j].uppstruct;
			rowInfo[j]=new Array();
			rowInfo[j]=uppstruct.split("/");
			if(rowInfo[j].length<upper.length){
				for(var k=rowInfo[j].length;k<upper.length;k++){
					rowInfo[j].push(rowInfo[j][rowInfo[j].length-1]);
				}
			}
			if(j==0){
				index[0]=rowInfo[j][i];
			}else{
				if(rowInfo[j][i]!=rowInfo[j-1][i]){
					index.push(rowInfo[j][i]);
				}	
			}														
		}
		for(var m=0;m<index.length;m++){
			colSpan[m]=1;
		}
		for(var j=1;j<obj.upper.length;j++){					
			for(var m=0;m<index.length;m++){
				
				if(rowInfo[j][i]==index[m]&&rowInfo[j-1][i]==index[m]){
					colSpan[m]++;
				}
			}						
		}		
		upper[i]=new Array(index.length);
		for(var n=0;n<upper[i].length;n++){
			upper[i][n]={};
			upper[i][n].name=index[n];
			upper[i][n].row=i;
			upper[i][n].rowSpan=1;
			upper[i][n].colSpan=colSpan[n];
			if(n>0){
				upper[i][n].col=upper[i][n-1].col+upper[i][n-1].colSpan;
			}else{
				upper[i][n].col=0;
			}
		}				
	}
	
	/*var lastRow=upper.length-1
	upper[lastRow]=new Array();
	if(rowInfo[0].length<rowInfo[rowInfo.length-1].length){
		for(var j=1;j<obj.upper.length;j++){
			upper[lastRow][j-1]={};
			upper[lastRow][j-1].name=rowInfo[j][lastRow];
			upper[lastRow][j-1].row=upper.length-1;
			upper[lastRow][j-1].rowSpan=1;
			upper[lastRow][j-1].colSpan=1;
			if(j>1){
				upper[lastRow][j-1].col=upper[lastRow][j-2].col+upper[lastRow][j-2].colSpan;
			}else{
				upper[lastRow][j-1].col=1;
			}
		}		
	}else{
        for(var j=0;j<obj.upper.length;j++){
        	upper[lastRow][j]={};
			upper[lastRow][j].name=rowInfo[j][lastRow];
			upper[lastRow][j].row=lastRow;
			upper[lastRow][j].rowSpan=1;
			upper[lastRow][j].colSpan=1;
			if(j>0){
				upper[lastRow][j].col=upper[lastRow][j-1].col+upper[lastRow][j-1].colSpan;
			}else{
				upper[lastRow][j].col=0;
			}
		}
	}*/

	
	return upper;
}

function getLeft(obj){
	var startRow=obj.left[0].leftrid;
	var rowInfo=[];
	var flag=0;
	var left=[];
	for(var i=0;i<obj.left.length;i++){
		var struct=obj.left[i].leftstruct;
		if(struct.indexOf("/")>0){
			flag=1;
			break;
		}
	}
	
	if(flag==0){
		for(var m=0;m<obj.left.length;m++){
			left[m]={};
			left[m].name=obj.left[m].leftstruct;
			left[m].row=startRow+m;
			left[m].col=0;
			left[m].colSpan=1;
			left[m].rowSpan=1;
			
		}
	}
	else{
		left=new Array(2);
		for(var i=0;i<left.length;i++){
			left[i]=new Array;
			if(i==0){
				var index=[];
				var rowSpan=[];
				for(var j=0;j<obj.left.length;j++){
					var leftstruct=obj.left[j].leftstruct;
					rowInfo[j]=new Array();
					if(leftstruct.indexOf("/")>0){
						rowInfo[j]=leftstruct.split("/");
					}else{
						rowInfo[j][i]=leftstruct;
					}
					index[0]=rowInfo[0][0];
					if(index.indexOf(rowInfo[j][i])<0){
						index.push(rowInfo[j][i]);
					}
				}				
				for(var m=0;m<index.length;m++){
					rowSpan[m]=0;
				}
				for(var j=0;j<obj.left.length;j++){												
					for(var m=0;m<index.length;m++){
						
						if(rowInfo[j][i]==index[m]){
							rowSpan[m]++;
						}
					}					
				}				
				for(var n=0;n<index.length;n++){
					left[i][n]={};
					left[i][n].name=index[n];
					left[i][n].col=i;
					left[i][n].rowSpan=rowSpan[n];
					left[i][n].colSpan=1;
					if(n>0){
						left[i][n].row=left[i][n-1].row+left[i][n-1].rowSpan;
					}else{
						left[i][n].row=startRow;
					}
				}
				
			}else{				
				for(var j=0;j<obj.left.length;j++){
					var leftstruct=obj.left[j].leftstruct;
					left[i][j]={}
					//left[i][j].name=rowInfo[j][i]
					left[i][j].col=i;
					left[i][j].rowSpan=1;
					left[i][j].colSpan=1
					if(leftstruct.indexOf("/")>0){
						var struct=leftstruct.split("/");
						left[i][j].name=struct[struct.length-1];
						left[i][j].row=obj.left[j].leftrid;
					}else{
						left[i][j].name=null;
						left[i][j].row=j;
						
					}
				}
			}						
		}
	}	
	return left;
}
function initSpread(obj,spread){
	var sheet=spread.getActiveSheet();
	var upper=getUpper(obj);
	console.log(upper);
	sheet.suspendPaint();
	var row=0;
	var column=0;
	for(var i=0;i<upper.length;i++){
		for(var j=0;j<upper[i].length;j++){
			sheet.addSpan(upper[i][j].row,upper[i][j].col,upper[i][j].rowSpan,upper[i][j].colSpan);
			sheet.setValue(upper[i][j].row,upper[i][j].col,upper[i][j].name);
			console.log(upper[i][j].name);
		}
	}
	if("left" in obj){
		
		var left=getLeft(obj);
		if(!(left[0] instanceof Array)){
			for(var i=0;i<left.length;i++){
				sheet.addSpan(left[i].row,left[i].col,left[i].rowSpan,left[i].colSpan);
				sheet.setValue(left[i].row,left[i].col,left[i].name);
				console.log(left[i].name);
				sheet.autoFitRow(i+4);
				//alert("iii");
			}		
		}else{
			
			for(var i=0;i<left.length;i++){
				for(var j=0;j<left[i].length;j++){
					sheet.addSpan(left[i][j].row,left[i][j].col,left[i][j].rowSpan,left[i][j].colSpan);
					sheet.setValue(left[i][j].row,left[i][j].col,left[i][j].name);
				}
			}
			if(upper[upper.length-1].length<obj.upper[obj.upper.length-1].uppcid){			
				sheet.addSpan(upper.length-2,0,2,2);
				
			}else{			
				sheet.addSpan(upper.length-2,0,1,2);
			}		
		}
	}
	
	for(var column=0;column<upper[0][0].colSpan;column++){	
		var span=[];
		var info=[];
		var rowIndex=[];			
		for(var row=1;row<upper.length;row++){
			if(sheet.getValue(row,column)!=null&&info.indexOf(sheet.getValue(row,column))>=0){
				 for(var i = 0; i <info.length; i++){
				        if(info[i] == sheet.getValue(row,column)){
				           span[i]++;
				        }
				    }
			}else if(sheet.getValue(row,column)!=null){
				info.push(sheet.getValue(row,column));
				span[info.length-1]=1;
				rowIndex[info.length-1]=row;
			}
		}
		//alert(info);
		for(var j=0;j<info.length;j++){
			for(var m=0;m<upper.length;m++){
				var flag=0;
				for(var n=0;n<upper[m].length;n++){
					if(info[j]==upper[m][n].name){
						
						sheet.addSpan(rowIndex[j],column,span[j],upper[m][n].colSpan);
						sheet.setValue(rowIndex[j],column,info[j]);
						flag=1;
						break;
					}
				}
				if(flag==1){
					break;
				}
			}
		}
		
	}
	sheet.resumePaint();
	
	
	
}

