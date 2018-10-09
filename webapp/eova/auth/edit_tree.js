/**
 * 
 */
		
	var depid,statid;
	var staid,staName;
	$(document).ready(function(){
		staid=$("#staid").val();
		init_upper();
		init_left();
		});	
function init_upper(){
	$.ajax ({
         type: "POST",
         url:  '/diyMenu/EditStatementInfo',
         async:false,
         data: {
		    	staid:staid
         },
         success: function (data) {
        	var depid=data.statement.statdepartment;
        	var statid=data.statype.statid; 
        	staName=data.statement.staname;
        	document.getElementById("staName").value=staName;
        	
         	initTreeUpper(data); 
         	var attributes=getUpperAttributes();
			$.ajax ({
		         type: "POST",
		         url:  '/diyEdit/preEditSave',
		         async:false,
		         data: {
		        	 attributes:attributes.join(","),
		        	 oldTableId:staid,
		        	 oldTableName:staName,
		        	 newTableId:'111',
		        	 newTableName:'测试'
		         },
		         success: function (data) {
		        	         	
		         }
		     
		    });
         },
         error: function () {

             //alert("失败啦");原来就有注释
         }
     
    });
}		

function init_left(){
	$.ajax ({
         type: "POST",
         url:  '/diyMenu/EditStatementInfo',
         async:false,
         data: {
		    	staid:staid
         },
         success: function (data) {
        	var depid=data.statement.statdepartment;
        	var statid=data.statype.statid; 
        	staName=data.statement.staname;
         	initTreeLeft(data); 
         	var attributes=getLeftAttributes();
			$.ajax ({
				type: "POST",
		         url:  '/diyEdit/preLeftEditSave',
		         async:false,
		         data: {
		        	 attributesName:attributes[0].join(","),
		        	 attributesId:attributes[1].join(","),
		        	 oldTableId:staid,
		        	 oldTableName:staName,
		        	 newTableId:'111',
		        	 newTableName:'测试'
		         },
		         success: function (data) {
		        	         	
		         }
		     
		    });
         },
         error: function () {

             //alert("失败啦");原来就有注释
         }
     
    });
}
		var setting = {
				data: {
					simpleData: {
						enable: true
					}
				},
				view: {
					selectedMulti: false
				},
				edit: {
					enable: true
				},
				callback: {
					beforeEditName: beforeEditName,
					beforeRemove: beforeRemove,
					onRemove: onRemove,
					beforeRename: beforeRename,
					onRename: onRename
				}
			};
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
			return upper;
		}
		
		function getLeft(obj){
			console.log(obj);
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
					left[m].id=obj.left[m].leftid;
					
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
		function createUpperNodes(upper){
			var parentArray=new Array();
			var isFirst=0;
			for(var i=upper.length-2;i>=0;i--){
				var childArray=new Array();
				var colSpan=new Array();
				var startCol=0;
				if(isFirst==1&&upper[i].length==1){
						var tempParentArray=new Array();
						tempParentArray=parentArray;
						var parent={name:upper[i][0].name,children:tempParentArray};
						parentArray=new Array();
						parentArray.push(parent);

				}
				else{
				for(var j=0;j<upper[i].length;j++){
						childArray[j]=new Array();
						for(var k=startCol;k<startCol+upper[i][j].colSpan;k++){
							var name=upper[i+1][k].name;
							var child={name:name};	
							childArray[j].push(child);
						}
						var parent={name:upper[i][j].name,children:childArray[j]};
						parentArray.push(parent);
						startCol=startCol+upper[i][j].colSpan;
						isFirst=1;
					}
					
				}
			}
			

			return parentArray;
		}
		
		function createLeftNodes(left){
			var nodes=[];
			for(var i=0;i<left.length;i++){
				var child={name:left[i].name,id:left[i].id};
				nodes.push(child);
			}
			return nodes;
		}
		function showRemoveBtn(treeId, treeNode) {
			return treeNode;
		}
		function showRenameBtn(treeId, treeNode) {
			return treeNode;
		}
		var log, className = "dark";
		var oldNode,newNode,nodeId;
		function beforeEditName(treeId, treeNode) {
			if(treeId=="treeUpper"){
				var zTreeUpper = $.fn.zTree.getZTreeObj("treeUpper");
				zTreeUpper.selectNode(treeNode);
				setTimeout(function() {
					if (confirm("进入节点 -- " + treeNode.name + " 的编辑状态吗？")) {
						setTimeout(function() {
							zTreeUpper.editName(treeNode);
						}, 0);
						type=0;
					}
				}, 0);
			}else if(treeId=="treeLeft"){
				var zTreeLeft = $.fn.zTree.getZTreeObj("treeLeft");
				zTreeLeft.selectNode(treeNode);
				setTimeout(function() {
					if (confirm("进入节点 -- " + treeNode.name + " 的编辑状态吗？")) {
						setTimeout(function() {
							zTreeLeft.editName(treeNode);
						}, 0);
						type=0;
					}
				}, 0);
			}
			
			
			
			
			return false;
		}
		var removeNode,removeNodeId;
		function beforeRemove(treeId, treeNode) {
			if(treeId=="treeUpper"){
				var zTree = $.fn.zTree.getZTreeObj("treeUpper");
			}
			else if(treeId=="treeLeft"){
				var zTree = $.fn.zTree.getZTreeObj("treeLeft");
			}
			zTree.selectNode(treeNode);
			return confirm("确认删除 节点 -- " + treeNode.name + " 吗？");
		}
		function onRemove(e, treeId, treeNode) {
			if(treeId=="treeUpper"){
				var str=[];
				for(var j=0;j<treeNode.getPath().length;j++){
					str.push(treeNode.getPath()[j].name);
				}
				removeNode=str.join("/");
				$.ajax ({
			         type: "POST",
			         url:  '/diyEdit/removeAttributes',
			         async:false,
			         data: {
			        	 removeAttribute:removeNode,
			        	 oldTableId:staid
			         },
			         success: function (data) {
			        	         	
			         }
			     
			    });
			}else if(treeId=="treeLeft"){
				removeNode=treeNode.name;
				removeNodeId=treeNode.id;
				$.ajax ({
			         type: "POST",
			         url:  '/diyEdit/removeLeftAttributes',
			         async:false,
			         data: {
			        	 removeAttribute:removeNode,
			        	 removeNodeId:removeNodeId,
			        	 oldTableId:staid
			         },
			         success: function (data) {
			        	         	
			         }
			     
			    });
			}
			
		}
		function beforeRename(treeId, treeNode, newName, isCancel) {
			if(treeId=="treeUpper"){
				var str=[];
				for(var j=0;j<treeNode.getPath().length;j++){
					str.push(treeNode.getPath()[j].name);
				}
				oldNode=str.join("/");
				if (newName.length == 0) {
					setTimeout(function() {
						var zTree = $.fn.zTree.getZTreeObj("treeUpper");
						zTree.cancelEditName();
						alert("节点名称不能为空.");
					}, 0);
					return false;
				}
				return true;
			}else if(treeId=="treeLeft"){
				oldNode=treeNode.name;
				nodeId=treeNode.id;
				if (newName.length == 0) {
					setTimeout(function() {
						var zTree = $.fn.zTree.getZTreeObj("treeLeft");
						zTree.cancelEditName();
						alert("节点名称不能为空.");
					}, 0);
					return false;
				}
				return true;
			}
			
		}
		function onRename(e, treeId, treeNode, isCancel) {
			if(treeId=="treeUpper"){
				var str=[];
				for(var j=0;j<treeNode.getPath().length;j++){
					str.push(treeNode.getPath()[j].name);
				}
				newNode=str.join("/");
				if(type==0){
					alert("修改名字:"+oldNode+"——>"+newNode);
					var attributes=getUpperAttributes();
					$.ajax ({
				         type: "POST",
				         url:  '/diyEdit/editAttributes',
				         async:false,
				         data: {
				        	 oldattribute:oldNode,
				        	 newattribute:newNode,
				        	 oldTableId:staid,
				        	 newTableId:'111',
				        	 newTableName:'测试'
				         },
				         success: function (data) {
				        	         	
				         }
				     
				    });
				}
				else if(type==1){
					alert("新增节点:"+newNode);
					var attributes=getUpperAttributes();
					$.ajax ({
				         type: "POST",
				         url:  '/diyEdit/addAttributes',
				         async:false,
				         data: {
				        	 attribute:newNode,
				        	 oldTableId:staid,
				        	 oldTableName:staName,
				        	 newTableId:'111',
				        	 newTableName:'测试'
				         },
				         success: function (data) {
				        	         	
				         }
				     
				    });
				}
			}else if(treeId=="treeLeft"){
				newNode=treeNode.name;
				if(type==0){
					alert("修改名字:"+oldNode+"——>"+newNode);
					var attributes=getLeftAttributes();
					$.ajax ({
				         type: "POST",
				         url:  '/diyEdit/editLeftAttributes',
				         async:false,
				         data: {
				        	 oldattribute:oldNode,
				        	 newattribute:newNode,
				        	 nodeId:nodeId,
				        	 oldTableId:staid,
				        	 newTableId:'111',
				        	 newTableName:'测试'
				         },
				         success: function (data) {
				        	         	
				         }
				     
				    });
				}
				else if(type==1){
					alert("新增节点:"+newNode);
					var attributes=getLeftAttributes();
					$.ajax ({
				         type: "POST",
				         url:  '/diyEdit/addLeftAttributes',
				         async:false,
				         data: {
				        	 attribute:newNode,
				        	 nodeId:nodeId,
				        	 oldTableId:staid,
				        	 oldTableName:staName,
				        	 newTableId:'111',
				        	 newTableName:'测试'
				         },
				         success: function (data) {
				        	         	
				         }
				     
				    });
				}
			}
		}
		var newCount = 1,type=0;
		function addUpper(e) {
			var zTree = $.fn.zTree.getZTreeObj("treeUpper"),
			isParent = e.data.isParent,
			nodes = zTree.getSelectedNodes(),
			treeNode = nodes[0];
			if (treeNode) {
				treeNode = zTree.addNodes(treeNode, { name:"new node" + (newCount++)});
			} else {
				treeNode = zTree.addNodes(null, { name:"new node" + (newCount++)});
			}
			if (treeNode) {
				type=1;
				zTree.editName(treeNode[0]);
			} else {
				alert("叶子节点被锁定，无法增加子节点");
			}
		};
		function addLeft(e) {
			var zTree = $.fn.zTree.getZTreeObj("treeLeft"),
			isParent = e.data.isParent,
			nodes = zTree.getSelectedNodes(),
			treeNode = nodes[0];
			if (treeNode) {
				treeNode = zTree.addNodes(treeNode, { name:"new node" + (newCount++)});
			} else {
				treeNode = zTree.addNodes(null, { name:"new node" + (newCount++)});
			}
			if (treeNode) {
				type=1;
				zTree.editName(treeNode[0]);
			} else {
				alert("叶子节点被锁定，无法增加子节点");
			}
		};
		function getUpperAttributes(){
			var attributes=[];
			var leafnodes=[];
			var zTree = $.fn.zTree.getZTreeObj("treeUpper");
			var rootNode = zTree.getNodesByFilter(function (node) { return node.level == 0 }, true);
			leafnodes=getAllLeafNodes(rootNode, leafnodes);
			for(var i=0;i<leafnodes.length;i++){
				var attribute;
				var str=[];
				for(var j=0;j<leafnodes[i].getPath().length;j++){
					str.push(leafnodes[i].getPath()[j].name);

				}
				attribute=str.join("/")
				attributes.push(attribute);
			}
			
			return attributes;
		}
		
		function getLeftAttributes(){
			var attributes=[];
			attributes[0]=[];
			attributes[1]=[];
			var leafnodes=[];
			var zTree = $.fn.zTree.getZTreeObj("treeLeft");
			var nodes = zTree.getNodesByFilter(function (node) { return node.level == 0 });  
			for(var i=0;i<nodes.length;i++){
				attributes[0].push(nodes[i].name);
				attributes[1].push(nodes[i].id);
			}			
			return attributes;
		}
		function getAllLeafNodes(treeNode, arrayObj) {
		    if (treeNode.isParent) {
		        var childrenNodes = treeNode.children;
		        if (childrenNodes) {
		            for (var i = 0; i < childrenNodes.length; i++) {
		                if (!childrenNodes[i].isParent) {
		                    arrayObj.push(childrenNodes[i]);
		                } else {
		                    arrayObj = getAllLeafNodes(childrenNodes[i], arrayObj);
		                }
		            }
		        }
		    } else {
		        arrayObj.push(treeNode);
		        
		    }
		    return arrayObj;
		}
		function initTreeUpper(obj){
			var upper=getUpper(obj);
			var left=getLeft(obj);
			console.log(left);
			var nodesUpper=createUpperNodes(upper);
			$.fn.zTree.init($("#treeUpper"), setting, nodesUpper);
			$("#addParent").bind("click", {isParent:true}, addUpper);
			$("#addLeaf").bind("click", {isParent:false}, addUpper);
		}
		function initTreeLeft(obj){
			var left=getLeft(obj);
			var nodesLeft=createLeftNodes(left);
			$.fn.zTree.init($("#treeLeft"), setting, nodesLeft);
			$("#addNode").bind("click", {isParent:true}, addLeft);
		}
