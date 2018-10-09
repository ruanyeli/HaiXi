var spread;
var _depid=parent.$("#user_department").val();

$(document).ready(function () {
	if(_depid==0){
		document.getElementById("department").style.display='block';
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
	var spread = $('#ss').data('workbook');        	        	
	var sheet = spread.getActiveSheet();  
	var tableinfo=new Array();//用来存放上表头和左表头信息
   var upperRow=0;//上表头行
   var upperCol=0;//上表头列
   var leftRow=0;//左表头行
   var leftCol=0;//左表头列
   var uppsign=0;
   var leftsign=0;
	$("#uppselect").bind('click', function(){//保存为上表头
		if((uppsign==leftsign)&&uppsign!=0){//如果两个标志相等且不等于0 ，说明之前上表头和左表头选中次数一样多，这次要导入需要清空
			tableinfo=[];
		}
		if(uppsign-leftsign>=1){
			tableinfo=[];
		}   	
		var sheet = spread.getActiveSheet();
    	sheet.suspendPaint(); 
    	var sel=sheet.getSelections();  //得到选择区域  
    	upperRow=sel[0].rowCount;
    	upperCol=sel[0].colCount;
   	    console.log(sel);   	
        //原来的左边合并的单元格 如果有坐表头，则填入   	  	
     	for(var rowindex=sel[0].row;rowindex<sel[0].rowCount+sel[0].row;rowindex++){
   		  var ColOfRow=0;   			
   		  for(var colindex=sel[0].col;colindex<sel[0].colCount;colindex+=ColOfRow){ 
   			var ColOfRow=0;
   			var span=sheet.getSpan(rowindex,colindex);      				
       			if(span!=null){//是合并单元格 
       				ColOfRow+=span.colCount;
   				    var id;
   				    var colspan;   				 			
   				    id= span.row+"@#"+span.col; //按照有左表头的算   					     					 
   				    colspan=span.colCount;
   				        arr={
   						id: id,
   						content:sheet.getValue(span.row,span.col),
   						rowspan:span.rowCount,	
   						colspan:colspan
   						
   				           }    				 				
   				}else{//不是合并单元格
   					ColOfRow=1;    					
   						arr={
       							id:rowindex+"@#"+colindex,
       							content:sheet.getValue(rowindex,colindex),
       							rowspan:"1",
       							colspan:"1"
       							
       					   }      						    			     					
   				}
       			tableinfo.push(arr);//存入  			
   			}
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
		var sheet = spread.getActiveSheet();
    	sheet.suspendPaint();     	
    	var sel=sheet.getSelections();  //得到选择区域
    	console.log(sel);
      leftCol=sel[0].colCount;
      leftRow=sel[0].rowCount;
    	for(var rowindex=sel[0].row;rowindex<sel[0].rowCount+sel[0].row;rowindex++){//遍历行  	
    			 console.log(rowindex)
        		 value=sheet.getValue(rowindex,0); //得到每一单元格的值
       		     var arr={
        		    id:rowindex+"@#0",
        		    content:value,
        		    rowspan:"1",
        		    colspan:"1"

        		   }
        		 tableinfo.push(arr);			
    	}
    	console.log(tableinfo);
    	sheet.resumePaint();
    	leftsign++;
    	layer.msg("保存为左表头成功");
	});

	$("#save").bind('click', function(){//左表头传值
		var detype;
		if(leftRow==0)//没有左表头
			detype=0;
		else detype=1;
		var sheet = spread.getActiveSheet();
		var cellValue=new Array();		
		var uppercontent=tableinfo[0].content;
		if(leftRow==0&&uppercontent==" "){//如果没有左表头，则删掉第一个，且之后的所有元素向前移一位
			var remove=tableinfo.shift();		
			for(var i=0;i<tableinfo.length;i++){
				var id=tableinfo[i].id;
				console.log(id);
				var str=new Array();
				str=id.split("-");	
				console.log(str);
				var firstid=str[0]-1;	
				console.log("firstid is ="+firstid);
				tableinfo[i].id=firstid+"-"+str[1];	
				str=[];
			}
		}
		console.log(tableinfo);
		console.log("总行数是："+ upperRow+leftRow);
		console.log("总列数"+upperCol+leftCol);
		var content;
		for(var rowindex=upperRow;rowindex<upperRow+leftRow;rowindex++){
			for(var colindex=leftCol;colindex<upperCol;colindex++){
				if(sheet.hasFormula(rowindex,colindex)){//如果有公式
					content=sheet.getFormula(rowindex,colindex);					
				}
				else{
					content=sheet.getValue(rowindex,colindex);
				}		   					
				var cell={
						content:content,
						colindex:colindex,
						rowindex:rowindex
				}
				cellValue.push(cell);
			}			
		}
		if(_depid==0){
			if($("#dept").combobox('getValue')==''||$("#dept").combobox('getValue')==null){
				layer.msg("请选择部门");
				return;
			}
			_depid=$("#dept").combobox('getValue');
		}
	$.ajax({
		type : "post",
		url :"/derive/saveDestatement",
		data : {
			"dename":$("#dename").val(), //表名
			"detype":detype,
			"dedepartment":_depid,//假设是高级管理员,
			"rowandcol" : JSON.stringify(tableinfo),//上表头和左表头信息
			"decontent":JSON.stringify(cellValue),//内容信息
			"derow" : upperRow+leftRow,//总行数
			"decol" : upperCol,//总列数
			"detype":1
//			"upheadColNum" : upperCol,//上表头列数
//			"leftheadRowNum" : leftRow,//左表头行数
//			"stadeptype":$("#stadeptype").combobox('getValue'),//这个地方，在下拉框那里存的实际上是statid			
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

