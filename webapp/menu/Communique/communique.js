/**
 * new_communique.html
 */
var ue = UE.getEditor('editor');
var departmentid = parent.$("#user_department").val();
var divId;
$(function(){
	$.ajax({
		url : '/diyMenu/getStatementListByDepartment',
		type : 'post',
		data : {
			"depid" : departmentid
		},
		success : function(response) {
			if (response.resultCode == "0") {
				var statementList = response.data;
				var init_str = "<option>--请选择报表--</option>";
				for (var i = 0; i < statementList.length; i++) {
					var staid = statementList[i].staid;
					var type = staid.substr(staid.indexOf('-')+1);
					if(type == 0){
						var statementId = staid.substr(0,staid.indexOf('-'));
						init_str += '<option value=' + statementId + '>'
								+ statementList[i].staname + '</option>';
					}
				}
				$("#statementList").html(init_str);
			} else {
				layer.msg(response.resultDesc);
			}
		}
	});
	
	$("#statementList").change(
	function() {
		
		if ($("#statementList").val() != null) {
			var statementId = $("#statementList").val();
		}

		$.ajax({
			url : '/diyMenu/getStagename',
			type : "post",
			data : {
				"staid" : statementId
			},
			success : function(response) {
				if (response.resultCode == "0") {
					var stagenameList = response.data;
					var init_str = '<option>--请选择地区--</option>';
					for (var i = 0; i < stagenameList.length; i++) {
						init_str += '<option value='
								+ stagenameList[i].stagename
								+ '>'
								+ stagenameList[i].stagename
								+ '</option>';
					}
					$("#stagenameList").html(init_str);
				}
			}
		});
		
		$.ajax({
			url : '/diyMenu/getStageAndUpperAndLeft',
			type : "post",
			data : {
				"staid" : statementId
			},
			success : function(response) {
				if (response.resultCode == "0") {
					var upperList = response.data.upperList;
					var leftList = response.data.leftList;
					var init_str = '<option>--请选择上表头--</option>';
					for (var i = 0; i < upperList.length; i++) {
						init_str += '<option value='
								+ upperList[i].uppid
								+ '>'
								+ upperList[i].uppfieldname
								+ '</option>';
					}
					$("#upperList").html(init_str);
					
					init_str = '<option>--请选择左表头--</option>';
					for (var i = 0; i < leftList.length; i++) {
						init_str += '<option value='
								+ leftList[i].leftid
								+ '>'
								+ leftList[i].leftname
								+ '</option>';
					}
					$("#leftList").html(init_str);
				}
			}
		});
	});
	
	//var spread = new GC.Spread.Sheets.Workbook($("#ss").get(0), {sheetCount:1});
	$("#addOperator").click(function(){
		var dialog = parent.sy.modalDialog({
			title:"选择算子",
			url:"/report/showOperator",
			buttons : [ {
	 			text : '确定',
	 			handler : function(){
	 				var d  = dialog.find('iframe').get(0).contentWindow;
	 				var operatorId = $("#operatorId",d.document).val();
	 				//alert(operatorId.toString());
	 				var operator="{"+operatorId.toString()+"}";
	 				//alert(operator);
	 				$("#formulabox").val($("#formulabox").val()+operator);
	 				dialog.dialog('destroy');
	 			}
	 		} ]
		},850,450);
	});	
})
function addFormula(){
	var content=$("#formulabox").val();
	if(content.length!=0){
		content='@'+content+'#';
		ue.focus();  
		ue.execCommand('inserthtml',content); 
	//	var ue = UE.getEditor('editor').focus();
	//	ue.setContent(ue.getContentTxt()+content);
		$("#formulabox").val('');
	}
	else{
		layer.msg("请先编辑公式！");
	}
	
}
function addCommunique(){
	var content = ue.getContent();  
	var title = document.getElementById("title").value;  
	var id = document.getElementById('id').value;
	var time = getNowFormatDate();
	var communiquetype=$("#communiquetype option:selected").text();
	console.log(communiquetype);
	if(id) 
	{
		if( isNaN( id ) )
	    	   {
			layer.msg("请输入数字");
	    	    return false;
	    	   }
	}  
	  else
    	  {
    	   layer.msg('请输入id');
    	  // myfm.isnum.focus();
    	  }
	if (title)
	 {  
		  	$.ajax({
	        url:'/communique/saveCommunique',
	        type:'post',
	        async:false,
	        //contentType:"application/json",
	        data:{
	        	"content":content,
	        	"title":title,
	        	"id":id,
	        	"time":time,
	        	"communiquetype":communiquetype
	        },
	        success: function (data) {
	        	alert(JSON.stringify(data));
	        	if (data.isExist == 1) {  
	        	      layer.msg("添加成功");      
	        	     }  
	        	else if(data.isExist == 0){  
	        	      layer.msg("已存在同名公报，请重新填写！")  
	        	    }  
	        	},  
	        error: function () {  
	        	      layer.msg("公报添加失败");  
	            }  
	    });     
		} 
		else
			{layer.msg("公报名字不能为空！");}
			 
		 
}

function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
            + " " + date.getHours() + seperator2 + date.getMinutes()
            + seperator2 + date.getSeconds();
    return currentdate;
}

/**
 * edit_communique.html
 */
function updateCommunique(){
    var id=$("#id").val();
	var content = ue.getContent();  
	var title = document.getElementById("title").value;  
	var time = getNowFormatDate();
	var communiquetype=$("#communiquetype option:selected").text();
	console.log(communiquetype);
	if(id) 
	{
		if( isNaN( id ) )
	    	   {
			layer.msg("请输入数字");
	    	    return false;
	    	   }
	}  
	  else
    	  {
    	   layer.msg('请输入id');
    	  }
	if (title)
	 {  
		  	$.ajax({
	        url:'/communique/updateCommunique',
	        type:'post',
	        async:false,
	        //contentType:"application/json",
	        data:{
	        	"content":content,
	        	"title":title,
	        	"id":id,
	        	"time":time,
	        	"communiquetype":communiquetype
	        },
	        success: function (data) {
 						layer.msg("修改成功！")
	        	},  
	        error: function () {  
	        	      layer.msg("公报修改失败");  
	            }  
	    });     
		} 
		else
			{layer.msg("公报名字不能为空！");}
			 
		 
}

function addImg(){
	divId = uuid(4, 16);
	ue.focus();  
	ue.execCommand('inserthtml','img'+divId+'[];');
}

function uuid(len, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [], i;
    radix = radix || chars.length;
 
    if (len) {
      // Compact form
      for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
    } else {
      // rfc4122, version 4 form
      var r;
 
      // rfc4122 requires these characters
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';
 
      // Fill in random data.  At i==19 set the high bits of clock sequence as
      // per rfc4122, sec. 4.1.5
      for (i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | Math.random()*16;
          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
      }
    }
 
    return uuid.join('');
}

function addDataSource(){
	var datasource = {};
	datasource.type = $("#type").val();
	datasource.statementId = $("#statementList").val();
	datasource.statementName = $("#statementList").find("option:selected").text();
	datasource.stageName = $("#stagenameList").val();
	datasource.upperId = $("#upperList").val();
	datasource.upperName = $("#upperList").find("option:selected").text();
	datasource.leftId = $("#leftList").val();
	datasource.leftName = $("#leftList").find("option:selected").text();
	
	ue.focus();  
	ue.execCommand('inserthtml',JSON.stringify(datasource));
}