//oss
window.onload=function(){
	$(".loader").remove();
}
//var tableid=window.location.href.split("?")[1].split("=")[1];
//var tableid=36;
//上表头最大层数
var maxUpLevel=0;
//左表头最大层数
var maxLeftLevel=0;
var zTreeUp;
var zTreeLeft;
var tableId;
var tableName;
var setting = {
    view: {
        addHoverDom: addHoverDom,        //添加按钮
        removeHoverDom: removeHoverDom //离开节点时的操作
    },
    edit: {
        enable: true
    },
    data: {
        simpleData: {
            enable: true
        }
    },
    callback: {
        beforeDrag: beforeDrag
    }
};

function beforeDrag(treeId, treeNodes) {
    return false;
}

var tableid;
$(document).ready(function () {		      
			tableid =$("#id").val();
		 $.ajax
		    (
		        {
		            type: "POST",
		            url: "/diyEdit/widthAndDeepth",
		            data: {
				    	tableid:tableid
//		                tableid: 163
		            },
		            success: function (data) {
//		                data = eval('(' + data + ')');原来就有注释
		            	maxUpLevel=parseInt(data.staupperrow)+1;
		            	maxLeftLevel=parseInt(data.staleftcol)+1;
		            	// alert(maxUpLevel+";"+maxLeftLevel);原来就有注释
		            },
		            error: function () {
		                //alert("失败啦");原来就有注释
		            }
		        }
		    );
		    $.ajax
		    (
		        {
		            type: "POST",
		            url: "/diyEdit/fromJsontoTree",
		            //url:"http://127.0.0.1:8081/CreateTable/excel/fromJsontoTree",
		            data: {
				    	tableid:tableid
//		                tableid: 163
		            },
		            dataType:"JSON",
		            success: function (data) {
		                data = eval('(' + data + ')');
		                //上表头
		                var uphead=eval('(' + data.uphead + ')');
		                //alert(typeof(uphead));
		                zTreeUp = $.fn.zTree.init($("#treeUp"), setting, uphead);
		                //左表头
		                var lefthead=eval('(' + data.lefthead + ')');
		                zTreeLeft = $.fn.zTree.init($("#treeLeft"), setting, lefthead);
		            },
		            error: function () {
		                //alert("失败啦");
		            }
		        }
		    );
});
	    
function addHoverDom(treeId, treeNode) 
{
    var treeObj = $.fn.zTree.getZTreeObj(treeId);
    var sObj = $("#" + treeNode.tId + "_span"); //获取删除修改span
    if (treeNode.editNameFlag || $("#addBtn_" + treeNode.tId).length > 0) return;
    var addStr = "<span class='add' id='addBtn_" + treeNode.tId
        + "' title='add node' onfocus='this.blur();'><img src='/ui/css/zTreeStyle/img/add.png'></span>";  //添加add  span
    sObj.after(addStr);          // 把删除修改 span 放到 add 后面
    var btn = $("#addBtn_" + treeNode.tId);
    if (btn) btn.bind("click", function () {
        var id=1;
        //alert(treeNode);
        if(treeNode.children != undefined){
            id=treeNode.children.length+1;
        }
        //alert("current level="+treeNode.level);
        if( (treeNode.level+2) > maxUpLevel && treeId == "treeUp"){
        	alert("您所新增的节点层数不能超过当前最大层数！");
        	return false;
        }
        if( (treeNode.level+2) > maxLeftLevel && treeId == "treeLeft"){ 
        	alert("您所新增的节点层数不能超过当前最大层数！");
        	return false;
        }
        id='n'+treeNode.id+id;
        var nodes = treeObj.addNodes(treeNode, {id: id,pId: treeNode.id, name: "新建节点"});//前端添加成功
        return false;
    });
};

function removeHoverDom(treeId, treeNode) {
    $("#addBtn_" + treeNode.tId).unbind().remove();
};
//新建隐藏的标签存储数据
function trans(id, data) {
	var ele = document.createElement("SPAN");
	ele.setAttribute("id", id);
	ele.style.display = "none";
	ele.innerHTML = data;
	document.body.appendChild(ele);
}

function save() {
    var upnodes = zTreeUp.transformToArray(zTreeUp.getNodes());
    console.log(upnodes);
    var leftnodes = zTreeLeft.transformToArray(zTreeLeft.getNodes());
    //alert(JSON.stringify(nodes));
    $.ajax
    (
        {
            type: "POST",
            url: "/diyEdit/fromTreetoJson",
            data: {
     	    	tableid:tableid,
                uphead: JSON.stringify(upnodes),
                lefthead: JSON.stringify(leftnodes)
            },
            success: function (data) {
                alert("编辑成功，请刷新查看");
//                console.log(data);
                trans("data", data);
                
                // 改变网页title，触发监听事件
    			document.title = "data";
            },
            error: function () {
              alert("抱歉，编辑不成功");
            }
        }
    );
}

