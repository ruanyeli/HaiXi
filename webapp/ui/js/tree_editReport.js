/**
 * 
 */
var depid,statid;
var _stattype;
$(function(){
	$(".loader").remove();
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
         	//getCombobox(depid,statid);         
         	initTree(data);         	
         },
         error: function () {

             //alert("失败啦");原来就有注释
         }
     
    });  
}); 
function initTree(obj){
	var upper=getUpper(obj);
	for(var i=0;i<upper.length;i++){
		for(var j=0;j<upper[i].length;j++){
			console.log(upper[i][j].name);
		}
	}
}
