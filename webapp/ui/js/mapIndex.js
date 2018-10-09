/**

 * 
 */
var _url = "";
var spread;
var obj;
$(function(){
	$(".loader").remove();
	spread = new GC.Spread.Sheets.Workbook($("#ss").get(0), {
        sheetCount:1           
    });
	var staid=$("#staid").val();
	 $.ajax ({
        type: "POST",
        url:  _url+'/diyMenu/mapIndex',
        data: {
	    	staid:staid
        },
        success: function (data) {
        	obj=data;
        	initSpread(data);
        	
        	
        },
        error: function () {

            //alert("失败啦");原来就有注释
        }
    
   });
	  $("#ss").bind("contextmenu", processSpreadContextMenu);
	  $("#spreadContextMenu a").click(processContextMenuClicked);
	  $(document).on("contextmenu", function ()
			    {
			        event.preventDefault();
			        return false;
			    });
	  $("#mapIndex").click(function () {
			var sheet=spread.getActiveSheet();
			var selectionCells=sheet.getSelections();
			if(selectionCells.length!=2){
				alert("请选择两个指标！");
			}else{
				var index=new Array(2);
				var staid=new Array(2)
				var uppid=new Array(2);
				for(var i=0;i<index.length;i++){
					index[i]=sheet.getValue(selectionCells[i].row,selectionCells[i].col);
				}
				for(var m=0;m<obj.upper1.length;){
					if(index[0]==obj.upper1[m].uppstruct){
						staid[0]=obj.upper1[m].uppstatement;
						uppid[0]=obj.upper1[m].uppid;
						delete obj.upper1[m];
						break;
					}
				}
				for(var n=0;n<obj.upper2.length;){
					if(index[1]==obj.upper2[n].uppstruct){
						staid[1]=obj.upper2[n].uppstatement;
						uppid[1]=obj.upper2[n].uppid;
						delete obj.upper2[n];
						break;
					}
				}
				alert(uppid);
				var _data={
						"staid":staid.join(","),
						"uppid":uppid.join(",")
						
				};
				$.ajax({
					type : "post",
					url :"/diyMenu/insertCorrelation",
					data :_data ,
					success : function(response) {
						if(response.resultCode=="0"){
							alert("关联成功");
							spread.getActiveSheet().clear(0,0,20,20,GcSpread.Sheets.SheetArea.viewport,GcSpread.Sheets.StorageType.Data);
							initSpread(obj);
						}else{
							layer.msg(response.resultDesc);
						}
					},
				});
			}
			
	    });   
});


function initSpread(obj){
	
	var sheet=spread.getActiveSheet();
	
	sheet.suspendPaint();
	sheet.addSpan(0,0,1,4);
	sheet.addSpan(0,5,1,4);
	sheet.setValue(0,0,obj.statement1.staname);
	sheet.setValue(0,5,obj.statement2.staname);
	for(var m=0;m<obj.upper1.length;m++){
		sheet.addSpan(m+1,0,1,4)
		sheet.setValue(m+1,0,obj.upper1[m].uppstruct);
		sheet.autoFitRow(m+1);
	}
	for(var n=0;n<obj.upper2.length;n++){
		sheet.addSpan(n+1,5,1,4)
		sheet.setValue(n+1,5,obj.upper2[n].uppstruct);
		sheet.autoFitRow(n+1);
	}
	sheet.resumePaint();
}

