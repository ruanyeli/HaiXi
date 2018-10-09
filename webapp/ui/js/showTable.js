var changeid=new Array();
var addCol=new Array();
var deletedCol=new Array();
//当前行数
var row=3;
//当前列数
var col=3;

//当前已合并单元格的信息
var  mergeid=new Array();
var  mergecolspan=new Array();
var  mergerowspan=new Array();

$(document).ready(function(){
		$.ajax
	   (
	      {
		    type : "POST",
		    url : "/CreateTable/excel/showtable",
		    data :{
		    	tableid:36
		    },
		    success : function(data) {
		    	data= eval("(" + data + ")");
		    	//列在数据库里的id
		    	var colId=data.ids.split(",");
		    	//列数
		    	col=data.col;
		    	//行数
		    	row=data.row;
		    	//表格内容
		    	var tablecontent=eval("(" + data.rowandcol + ")");
		    	//根据行数和列数初始化一个空表
		    	var arr=new Array();
                for(var i=0;i<row;i++){      //一维长度
                    arr[i]=new Array();    //声明二维
                    for(var j=0;j<col;j++){      //二维长度
          	            if($("#"+j+"-"+i).html() != undefined){
                            arr[i][j]=$("#"+j+"-"+i).html();
          	            }else{
          		        arr[i][j]='';
          	            }
                    } 
                }
                $('#my').jexcel({ data:arr });
                //填入数据,加上列的id
                for(var i=0;i<tablecontent.length;i++){
                	var tdcontent=tablecontent[i];
                	$("#"+tdcontent.id).html(tdcontent.content);
                	var colnum=parseInt(tdcontent.id.split("-")[0]);
                	$("#"+tdcontent.id).attr("name",colId[colnum]);
                }
                //合并单元格
                for(var i=0;i<tablecontent.length;i++){
                	var mergetd=tablecontent[i];
                	//该单元格不需要合并
                	if(mergetd.colspan == 1 && mergetd.rowspan == 1){
                		continue;
                	}
                	//合并
                    var thisid=mergetd.id;
		            var thisrow=mergetd.rowspan;
		            var thiscol=mergetd.colspan;
		            mergeid.push(thisid);
		            mergecolspan.push(thiscol);
		            mergerowspan.push(thisrow);
		            $("#"+thisid).attr("rowspan",thisrow);
		            $("#"+thisid).attr("colspan",thiscol);
		            //去掉行上多余的
		            var currentrow=parseInt(thisid.split("-")[1]);
		            var currentcol=parseInt(thisid.split("-")[0]);
		            for(var j=1;j<=thiscol-1;j++){
			            $("#"+(currentcol+j)+"-"+currentrow).remove();
		            }
		            //去掉列上多余的
		            for(var j=1;j<=thisrow-1;j++){
			            $("#"+currentcol+(currentrow+j)).remove();
		            }
                	
                }
		    },
		    error:function()
		    {
		    	//alert("失败啦");
		    }
		  }
	   );
});
//保存修改过的id
$(document).on('change','.editor',function(e){
	var obj=e.target;
	var str="";
	//alert($(obj).parent().attr("id"));
	if($(obj).parent().attr("name") != undefined){
		str=($(obj).parent().attr("name"))+"-"+($(obj).parent().attr("id"));
	}
	if(str != ""){
		changeid.push(str);
	}
	
});
//确认修改
function reviseTable(){
var tableinfo=new Array();
	$("tbody td").each(function(){
		//第一个格子不要
		if($(this).hasClass("label")){
			return true; 
		}
		var id=$(this).attr("id");
		var content=$(this).html();
		var colspan=1;
		var rowspan=1;

		if($(this).attr("colspan") != undefined){
			colspan=$(this).attr("colspan");
		}
		if($(this).attr("rowspan") != undefined){
			rowspan=$(this).attr("rowspan");
		}
		var arr={
			id:id,
			content:content,
			colspan:colspan,
			rowspan:rowspan
		};
		tableinfo.push(arr);
	});
	$.ajax
	   (
	      {
		    type : "POST",
		    url : "/CreateTable/excel/updateTable",
		    data :{
		    	tableid:36,
		    	row : row,
		    	col : col,
		    	rowandcol: JSON.stringify(tableinfo),
		    	change: JSON.stringify(changeid),
		    	addCol: JSON.stringify(addCol),
		    	deletedCol: JSON.stringify(deletedCol)
		    },
		    success : function(data) {
		    	alert("hcc我们成功了吗？？");
		    },
		    error:function() {
		    	//alert("失败啦");
		    }
		  }
	   );
}

//按钮的方法
//添加一行
function addrow(){
	//行数增加一行
    row++;
    var arr=new Array();
       for(var i=0;i<row;i++){          //一维长度
          arr[i]=new Array();    //声明二维
          for(var j=0;j<col;j++){      //二维长度
          	if($("#"+j+"-"+i).html() != undefined){
             arr[i][j]=$("#"+j+"-"+i).html();
          	}else{
          		arr[i][j]='';
          	}
       } 
    }
	$('#my').jexcel({ data:arr });
	//合并已有单元格
	for(var i=0;i<mergeid.length;i++){
		var thisid=mergeid[i];
		var thisrow=mergerowspan[i];
		var thiscol=mergecolspan[i];
		$("#"+thisid).attr("rowspan",thisrow);
		$("#"+thisid).attr("colspan",thiscol);
	    //去掉行上多余的
		var currentrow=parseInt(thisid.split("-")[1]);
		var currentcol=parseInt(thisid.split("-")[0]);
		for(var k=0;k<thisrow;k++){
			for(var j=1;j<=thiscol-1;j++){
			    $("#"+(currentcol+j)+"-"+(currentrow+k)).remove();
		    }
		}
		//去掉列上多余的
		for(var j=1;j<=thisrow-1;j++){
		    $("#"+currentcol+"-"+(currentrow+j)).remove();
	    }
	}

}
//添加一列
function addcol(){
	//列数增加一列
	col++;
	addCol.push(col-1);
	var arr=new Array();
       for(var i=0;i<row;i++){      //一维长度
          arr[i]=new Array();    //声明二维
          for(var j=0;j<col;j++){      //二维长度
          	if($("#"+j+"-"+i).html() != undefined){
             arr[i][j]=$("#"+j+"-"+i).html();
          	}else{
          		arr[i][j]='';
          	}
       } 
    }
	$('#my').jexcel({ data:arr });
	//合并已有单元格
	for(var i=0;i<mergeid.length;i++){
		var thisid=mergeid[i];
		var thisrow=mergerowspan[i];
		var thiscol=mergecolspan[i];
		$("#"+thisid).attr("rowspan",thisrow);
		$("#"+thisid).attr("colspan",thiscol);
		//去掉行上多余的
		var currentrow=parseInt(thisid.split("-")[1]);
		var currentcol=parseInt(thisid.split("-")[0]);
		for(var k=0;k<thisrow;k++){
			for(var j=1;j<=thiscol-1;j++){
			    $("#"+(currentcol+j)+"-"+(currentrow+k)).remove();
		    }
		}
		//去掉列上多余的
	    for(var j=1;j<=thisrow-1;j++){
			$("#"+currentcol+"-"+(currentrow+j)).remove();
	    }
	}
}
//合并单元格
function mergecells(){
	var id=$(".highlight").eq(0).attr("id");
	if(id == undefined){
		alert("请选择单元格！");
		return false;
	}
	var thiscol=parseInt(id.split("-")[0]);
	var thisrow=parseInt(id.split("-")[1]);
	var rowspan=1;
	var colspan=1;
	//找当前这一行要被合并的单元格
	for(var i=0;i<col;i++){
		$("#"+i+"-"+thisrow).each(function(){
			var thisid=$(this).attr("id");
			if($(this).hasClass("highlight") && thisid != id){
				colspan++;
				$(this).remove();
			}
		});
	}
	//找当前这一列要被合并的单元格
	for(var i=0;i<row;i++){
		$("#"+thiscol+"-"+i).each(function(){
			var thisid=$(this).attr("id");
			if($(this).hasClass("highlight") && thisid != id){
				rowspan++;
				$(this).remove();
			}
		});
	}
	//检查当前选中所有的单元格是单个的还是合并过的,flag=0->单个的，flag=1->合并过的
	var flag=0;
	//合并中心单元格原来的colspan和rowspan
	var myrow=0;
	var mycol=0;
	//当前需拆分单元格在mergeid数组里的下标
	var breakid=new Array();
	for(var i=0;i<mergeid.length;i++){
		$(".highlight").each(function(){
			if( $(this).attr("id") == mergeid[i]){
			    flag=1;
			    breakid.push(i);
		    }
		    if( id == mergeid[i] ){
		    	mycol=mergecolspan[i];
		    	myrow=mergerowspan[i];
		    }
		});
	}
	if(flag==0){
	    //全部是单个单元格，直接合并
	    mergeid.push(id);
	    mergecolspan.push(parseInt(colspan));
	    mergerowspan.push(parseInt(rowspan));
	    if(parseInt(colspan) >0){
		    $("#"+id).attr("colspan",parseInt(colspan));
	    }
	    if(parseInt(rowspan) >0){
		    $("#"+id).attr("rowspan",parseInt(rowspan));
	    }
	}else{//全部拆开，再合并
		//去掉不需要的合并信息
		for(var i=0;i<breakid.length;i++){
			mergeid.splice(breakid[i],1);
			mergerowspan.splice(breakid[i],1);
			mergecolspan.splice(breakid[i],1);
		}

		//保存新的合并信息
		mergeid.push(id);
	    mergecolspan.push(parseInt(colspan)+mycol-1);
	    mergerowspan.push(parseInt(rowspan)+myrow-1);
	    //重新初始化
	    var arr=new Array();
        for(var i=0;i<row;i++){      //一维长度
          arr[i]=new Array();    //声明二维
          for(var j=0;j<col;j++){      //二维长度
          	if($("#"+j+"-"+i).html() != undefined){
                arr[i][j]=$("#"+j+"-"+i).html();
          	}else{
          		arr[i][j]='';
          	}
          } 
        }
	    $('#my').jexcel({ data:arr });
	    //合并已有单元格
	    for(var i=0;i<mergeid.length;i++){
		    var thisid=mergeid[i];
		    var thisrow=mergerowspan[i];
		    var thiscol=mergecolspan[i];
		    $("#"+thisid).attr("rowspan",thisrow);
		    $("#"+thisid).attr("colspan",thiscol);
		    //去掉行上多余的
		    var currentrow=parseInt(thisid.split("-")[1]);
		    var currentcol=parseInt(thisid.split("-")[0]);
		    for(var k=0;k<thisrow;k++){
			    for(var j=1;j<=thiscol-1;j++){
			        $("#"+(currentcol+j)+"-"+(currentrow+k)).remove();
		        }
		    }
		    //去掉列上多余的
		    for(var j=1;j<=thisrow-1;j++){
			    $("#"+currentcol+"-"+(currentrow+j)).remove();
			}
	    }
   }

	$("td").removeClass('selected highlight highlight-top highlight-left highlight-right highlight-bottom');
}
//拆分单元格
function splitcells(){
	var id=$(".highlight").eq(0).attr("id");
	if(id == undefined){
		alert("请选择单元格！");
		return false;
	}
	var mycol=0;
	var myrow=0;
	//当前需拆分单元格在mergeid数组里的下标
	var breakid=new Array();
	for(var i=0;i<mergeid.length;i++){
		$(".highlight").each(function(){
			if( $(this).attr("id") == mergeid[i]){
			    breakid.push(i);
		    }
		    if( id == mergeid[i] ){
		    	mycol=mergecolspan[i];
		    	myrow=mergerowspan[i];
		    }
		});
	}
			//去掉不需要的合并信息
		for(var i=0;i<breakid.length;i++){
			mergeid.splice(breakid[i],1);
			mergerowspan.splice(breakid[i],1);
			mergecolspan.splice(breakid[i],1);
		}
	    //重新初始化
	    var arr=new Array();
        for(var i=0;i<row;i++){      //一维长度
          arr[i]=new Array();    //声明二维
          for(var j=0;j<col;j++){      //二维长度
          	if($("#"+j+"-"+i).html() != undefined){
                arr[i][j]=$("#"+j+"-"+i).html();
          	}else{
          		arr[i][j]='';
          	}
          } 
        }
	    $('#my').jexcel({ data:arr });
	    //合并已有单元格
	    for(var i=0;i<mergeid.length;i++){
		    var thisid=mergeid[i];
		    var thisrow=mergerowspan[i];
		    var thiscol=mergecolspan[i];
		    $("#"+thisid).attr("rowspan",thisrow);
		    $("#"+thisid).attr("colspan",thiscol);
		    //去掉行上多余的
		    var currentrow=parseInt(thisid.split("-")[1]);
		    var currentcol=parseInt(thisid.split("-")[0]);
		    for(var k=0;k<thisrow;k++){
			    for(var j=1;j<=thiscol-1;j++){
			        $("#"+(currentcol+j)+"-"+(currentrow+k)).remove();
		        }
		    }
		    //去掉列上多余的
		    for(var j=1;j<=thisrow-1;j++){
			    $("#"+currentcol+"-"+(currentrow+j)).remove();
			}
	    }
}
//删除一行
function deleteRow(){
	var id=$(".highlight").eq(0).attr("id");
	if(id == undefined){
		alert("请选择单元格！");
		return false;
	}
	var rowNum=id.split("-")[1];
	row--;
    //当前需拆分单元格在mergeid数组里的下标
	var breakid=new Array();
	for(var i=0;i<col;i++){
		//清空该行的内容
		 $("#"+i+"-"+rowNum).html("");
		 //检查当前行有没有需要拆分的单元格
		for(var k=0;k<mergeid.length;k++){
				if( (i+"-"+rowNum) == mergeid[k]){
			    	breakid.push(k);
		    	}
		}
	}
	//去掉不需要的合并信息
	for(var i=0;i<breakid.length;i++){
		mergeid.splice(breakid[i],1);
		mergerowspan.splice(breakid[i],1);
		mergecolspan.splice(breakid[i],1);
	}

	//重新初始化
	    var arr=new Array();
	    if(rowNum == row){//删除的是最后一行，内容可以直接填充
	      	for(var i=0;i<row;i++){      //一维长度
          		arr[i]=new Array();    //声明二维
          		for(var j=0;j<col;j++){      //二维长度
          			if($("#"+j+"-"+i).html() != undefined){
                		arr[i][j]=$("#"+j+"-"+i).html();
          			}else{
          				arr[i][j]='';
          			}
          		}	 
        	}
	}else{//下面行的内容要上移
			for(var i=0;i<row;i++){      //一维长度
          		arr[i]=new Array();    //声明二维
          		for(var j=0;j<col;j++){      //二维长度
          			if($("#"+j+"-"+i).html() != undefined){
          					if(i < rowNum ){//上面行的内容不变
                				arr[i][j]=$("#"+j+"-"+i).html();
                			}else{//上移
                				if($("#"+j+"-"+(i+1)).html() != undefined){
                					arr[i][j]=$("#"+j+"-"+(i+1)).html();
                				}else{
                					arr[i][j]='';
                				}
                				
                			}
          			}else{
          				arr[i][j]='';
          			}
          		}	 
        	}
	}

	    $('#my').jexcel({ data:arr });
	    //合并已有单元格
	    for(var i=0;i<mergeid.length;i++){
		    var thisid=mergeid[i];
		    var thisrow=mergerowspan[i];
		    var thiscol=mergecolspan[i];
		    $("#"+thisid).attr("rowspan",thisrow);
		    $("#"+thisid).attr("colspan",thiscol);
		    //去掉行上多余的
		    var currentrow=parseInt(thisid.split("-")[1]);
		    var currentcol=parseInt(thisid.split("-")[0]);
		    for(var k=0;k<thisrow;k++){
			    for(var j=1;j<=thiscol-1;j++){
			        $("#"+(currentcol+j)+"-"+(currentrow+k)).remove();
		        }
		    }
		    //去掉列上多余的
		    for(var j=1;j<=thisrow-1;j++){
			    $("#"+currentcol+"-"+(currentrow+j)).remove();
			}
	    }
}
//删除一列
function deleteCol(){
	var id=$(".highlight").eq(0).attr("id");
	if(id == undefined){
		alert("请选择单元格！");
		return false;
	}
	//列在数据库中的id
	var colNum=$("#"+id).attr("name");
	if(colNum != undefined){ //如果删掉的是重现的列，保存id
		deletedCol.push(colNum);
	}else{ //如果删掉的是后来新增的列，去掉add里的信息
		for(var i=0;i<addCol.length;i++){
			if(addCol[i] == (id.split("-")[0]))
			{
				addCol.splice(i,1);
			}
		}
	}
	col--;
    //当前需拆分单元格在mergeid数组里的下标
	var breakid=new Array();
	for(var i=0;i<row;i++){
		//清空该列的内容
		 $("#"+colNum+"-"+i).html("");
		 //检查当前列有没有需要拆分的单元格
		for(var k=0;k<mergeid.length;k++){
				if( (colNum+"-"+i) == mergeid[k]){
			    	breakid.push(k);
		    	}
		}
	}
	//去掉不需要的合并信息
	for(var i=0;i<breakid.length;i++){
		mergeid.splice(breakid[i],1);
		mergerowspan.splice(breakid[i],1);
		mergecolspan.splice(breakid[i],1);
	}
	//重新初始化
	    var arr=new Array();
	    if(colNum == col){//删除的是最后一列，内容可以直接填充
	      	for(var i=0;i<row;i++){      //一维长度
          		arr[i]=new Array();    //声明二维
          		for(var j=0;j<col;j++){      //二维长度
          			if($("#"+j+"-"+i).html() != undefined){
                		arr[i][j]=$("#"+j+"-"+i).html();
          			}else{
          				arr[i][j]='';
          			}
          		}	 
        	}
	}else{//右边列的内容要左移
			for(var i=0;i<row;i++){      //一维长度
          		arr[i]=new Array();    //声明二维
          		for(var j=0;j<col;j++){      //二维长度
          			if($("#"+j+"-"+i).html() != undefined){
          					if(j < colNum ){//左边列的内容不变
                				arr[i][j]=$("#"+j+"-"+i).html();
                			}else{//左移
                				if($("#"+(j+1)+"-"+i).html() != undefined){
                					arr[i][j]=$("#"+(j+1)+"-"+i).html();
                				}else{
                					arr[i][j]='';
                				}
                				
                			}
          			}else{
          				arr[i][j]='';
          			}
          		}	 
        	}
	}

	    $('#my').jexcel({ data:arr });
	    //合并已有单元格
	    for(var i=0;i<mergeid.length;i++){
		    var thisid=mergeid[i];
		    var thisrow=mergerowspan[i];
		    var thiscol=mergecolspan[i];
		    $("#"+thisid).attr("rowspan",thisrow);
		    $("#"+thisid).attr("colspan",thiscol);
		    //去掉行上多余的
		    var currentrow=parseInt(thisid.split("-")[1]);
		    var currentcol=parseInt(thisid.split("-")[0]);
		    for(var k=0;k<thisrow;k++){
			    for(var j=1;j<=thiscol-1;j++){
			        $("#"+(currentcol+j)+"-"+(currentrow+k)).remove();
		        }
		    }
		    //去掉列上多余的
		    for(var j=1;j<=thisrow-1;j++){
			    $("#"+currentcol+"-"+(currentrow+j)).remove();
			}
	    }
}
