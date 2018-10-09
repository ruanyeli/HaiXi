<table id="${id}" width="auto" height="auto"></table>
<script>
// var ${'$'+id};
$(function () {
	
    // init param
    var id = "${id!}";
    var masterId = "${masterId!}";
    var $grid = $("#" + id);
    var $masterGrid;
    if(masterId != ""){
    	$masterGrid = $("#" + masterId);
    }
    
    var menuCode = '${menuCode!}';// medaobject code
    var objectCode = '${objectCode!}';// medaobject code
    var toolbar = '${toolbar!}';// grid ref toolbar
    var isPaging = eval('${isPaging!true}');// is show pagination
    var url = '${url!}';// diy grid load data url
    var objectJson = '${objectJson!}';// object is json
    var fieldsJson = '${fieldsJson!}';// fiedlds is json
    var configJson = '${configJson!}';// config is json

    if (url == '') {
        url = '/grid/query/' + objectCode;
        if(menuCode != ''){
        	url = url + '-' + menuCode;
        }
    }
    var paras = $.getUrlParas();
    // æ¯å¦å«æå³èæ¥è¯¢æ¡ä»¶
    if(paras && paras.indexOf('query_') != -1){
    	url = url + '?' + paras;
    }
    
    // console.log(objectCode + 'isFirstLoad' + isFirstLoad);

    var config, object, fields;

    if(configJson != '') {
        config = JSON.parse(configJson);
    }
    if(objectJson != '') {
        object = JSON.parse(objectJson);
    } else {
        $.syncGetJson('/meta/object/' + objectCode, function (json) {
            object = json;
        });
    }
    if(fieldsJson != '') {
        fields = JSON.parse(fieldsJson);
    } else  {
        $.syncGetJson('/meta/fields/' + objectCode, function (json) {
            fields = json;
        });
    }
//    console.log(object);
//    console.log(fields);

    // å½åå¯¹è±¡æ¯å¦åè®¸åå§å è½½æ°æ®
    var isFirstLoad = false;
    var isFirstLoadNow = eval('${isFirstLoad!true}');
	// å¿é¡»å½åä¸å¡åå¯¹è±¡é½åè®¸å è½½æ°æ®
    if(isFirstLoadNow && object.is_first_load){
    	isFirstLoad = true;
    }

    var cols = [];
    var validators = {};
    // æ¹ééæ©æ¡
    if (!object.is_single) {
        var attr = new Object;
        attr.field = 'ck';
        attr.checkbox = true;
        cols.push(attr);
    }
    // å­æ®µå±æ§
    $.each(fields, function (i, f) {
        if (!f.is_show) {
            // continue;
            return true;
        }

        var attr = new Object;
        attr.field = f.en;
        attr.title = f.cn;
        attr.width = f.width ? f.width : 150;

        if (f.is_order) {
            attr.sortable = true;
        }

        if (f.formatter != null) {
            attr.formatter = new Function('return ' + f.formatter)();
        } else {
            // é»è®¤æ ¼å¼åå¤ç
            if (f.type == 'å¤éæ¡') {
                attr.align = 'center';
                attr.formatter = function (value, row, index, field) {
                    var ck = '<span class="ck0">â¡</span>';
                    if (value) {
                        ck = '<span class="ck1">â</span>';
                    }
                    return ck;
                };
            }
            if (f.type == 'ææ¬æ¡' || f.type == 'ç¼è¾æ¡' || f.type == 'ææ¬å') {
                attr.formatter = function (value, row, index, field) {
                    if (value && value.length > 10) {
                    	//alert($.encodeHtml(value));
                        return '<span title="' + $.encodeHtml(value) + '">' + $.encodeHtml(value) + '</span>'
                    }
                    return value;
                }
            }
        }
        // Grid Cell Editor,å¯¹è±¡åå­æ®µåè®¸è¡åç¼è¾èªå¢ï¼èªå¢é¿ç¦æ­¢ç¼è¾
        if (object.is_celledit && f.is_edit) {
        	if(object.is_auto && object.is_auto == true){
        		return;
        	}
            var editor = new Object;
            editor.type = f.editor;
            // æé åæ°
            editor.options = {};
            if (f.type == 'ä¸ææ¡') {
                editor.options = {
                    url: '/widget/comboJson/' + objectCode + '-' + f.en, valueField: 'id', textField: 'cn', multiple: f.is_multiple
                }
            } else if (f.type == 'æ¥æ¾æ¡') {
                editor.options = {
                    url: '/widget/find?code=' + objectCode + '&field=' + f.en + '&multiple=' + f.is_multiple
                }
            } else if (f.type == 'æ¥ææ¡') {
                editor.options = {
            		format: 'yyyy-MM-dd'
                }
            }
            editor.options['name'] = f.en;
            
            attr.editor = editor;
            
         	// validator
            var rule = '';
            if(f.is_required){
                rule = f.cn + ':required;';
            }
            if(f.validator){
                rule = rule + f.validator;
            }
            if(rule != ''){
    	        validators[f.en] = { rule: rule };
            }
        }

        cols.push(attr);
    });

    console.log(cols);

	// é»è®¤æåº
	var sortName = null,sortOrder = 'asc';
	if(object.default_order){
		var defaultOrder = object.default_order.split(' ');
		sortName = defaultOrder[0];
		if(defaultOrder.length > 1){
			sortOrder = defaultOrder[1];
		}
	}

    var selectIndex;
    var $myGrid = $grid.datagrid({
        fit: true,
        border: false,
        striped: true,
        align: 'right',
        autoRowHeight: true,
        collapsible: false,
        remoteSort: true,
        multiSort: false,
        rownumbers: object.is_show_num,
        showFooter: true,
       
        ctrlSelect: true,
        singleSelect: object.is_single,

        toolbar: toolbar ? '#' + toolbar : null,
        pagination: isPaging,
        pageSize: 15,
        pageList: [15, 30, 50, 100, 200, 500, 1000, 2000],

        idField: object.pk_name,
        sortName: sortName,
        sortOrder: sortOrder,

        url: url,
        method: 'post',
        columns: [cols],
        // frozenColumns: [[{field:'diy_fun',title:'æä½'}]],

        onDblClickRow:function(index,row){
        	
        	if("depid" in row){
        		var dialog = parent.sy.modalDialog({//打开对话框
        	 		title : '['+ row.depname +'_'+row.staname+']报表查看',
        	 		url : '/diyMenu/showReport?statementid=' + row.statementid+'&'+'stageid='+row.stageid,//传入id和期数id
        	 		buttons : [ {
        	 			text : '确认',
        	 			handler : function() {
        	 				dialog.dialog('destroy');
        	 			}
        	 		} ],
        	 	},document.body.offsetWidth, document.body.offsetHeight);
        	}else if("stattype_val" in row){
        		var dialog = parent.sy.modalDialog({/*  打开一个对话框*/
        	 		title : '['+ row.staname +']可用功能选择', 		
        	 		url : '/diyEdit/renderId/' + row.staid,
        	 		buttons : [ {
        	 			text : '确认',
        	 			handler : function() {
        	 				dialog.dialog('destroy');
        	 			}
        	 		} ],
        	 	}, document.body.offsetWidth, document.body.offsetHeight);
        	}else if("deid" in row){
        		var dialog = parent.sy.modalDialog({/*  打开一个对话框*/
        			id:"myDialog",
        		 	title : "生成衍生报表", 		
        		 	url : '/menu/GenerateReport/editGenerateReport.html',
        		 	data:{
        	 			"deid":row.deid
        	 		}
        		}, 1315, 500);
        	}
        	
        },
        onHeaderContextMenu: function (e, field) {
            e.preventDefault();
            if (!cmenu) {
                createColumnMenu();
            }
            cmenu.menu('show', {
                left: e.pageX,
                top: e.pageY
            });
        },
        onBeforeLoad: function () {
            // é»æ­¢åå§åå è½½æ°æ®
            if (!isFirstLoad) {
                isFirstLoad = true;
                return false;
            }
        },
        onLoadSuccess: function (data) {
            if (object.is_celledit && data.total < 1) {
                // ææ¶ç¦ç¨ï¼åå§åä¸å è½½ç©ºè¡ï¼ä½¿ç¨Grid åé¡µæ æé®æ·»å ï¼
                $myGrid.datagrid('insertRow', {index: 0, row: {}});
            }
        },
        onRowContextMenu: function (e, rowIndex, rowData) {
            e.preventDefault();
            if (!rowMenu) {
                createRowMenu();
            }
            selectIndex = rowIndex;
            rowMenu.menu('show', {
                left: e.pageX,
                top: e.pageY
            });
        }
    });
    
//     ${'$'+id} = $myGrid;

    // å¼å¯ç¼è¾æ¨¡å¼
    if (object.is_celledit) {
        $myGrid.datagrid('enableCellEditing');
    }

    var rowMenu;
    function createRowMenu() {
        rowMenu = $('<div/>').appendTo('body');
        rowMenu.menu({
            id: 'rowMenu',
            onClick: function (item) {
                console.log('click menu' + item.text);
            }
        });
        rowMenu.menu('appendItem', {
            text: 'å·æ°',
            name: 'reload',
            iconCls: 'pagination-load',
            onclick: function () {
                $myGrid.datagrid('reload');
            }
        });
        rowMenu.menu('appendItem', {
            text: 'å¯¼åºæææ°æ®',
            name: 'exportAll',
            iconCls: 'icon-pageexcel',
            onclick: function () {
                window.location.href = '/grid/export/' + objectCode;
            }
        });
        rowMenu.menu('appendItem', {
            text: 'å¯¼åºæ¬é¡µæ°æ®',
            name: 'exportAll',
            iconCls: 'icon-pageexcel',
            onclick: function () {
            	// å¯¼åºXls
                $.gridToExcel($myGrid, objectCode);
            }
        });
        if (object.is_celledit) {
        	var rowData = {};
        	if($masterGrid){
	        	// è·åä¸»è¡¨éä¸­è¡
	        	var gridSelectRow = $masterGrid.datagrid('getSelected');
        		if(gridSelectRow){
        			// åå§æ·»å å³é®å­æ®µ
                    var val = gridSelectRow[config.objectField];
        			rowData[config.fields[0]] = val;
        			rowData[config.fields[0]+'_val'] = val;
        		}
        	}
        	
        	rowMenu.menu('appendItem', {
                text: 'å é¤è¡',
                name: 'delete',
                iconCls: 'icon-tabledelete',
                onclick: function () {
                	console.log('å é¤è¡ï¼ç´¢å¼=' +  selectIndex);
					$myGrid.datagrid('deleteRow', selectIndex);
                }
            });
            rowMenu.menu('appendItem', {
                text: 'æ°å¢è¡',
                name: 'add',
                iconCls: 'icon-tableadd',
                onclick: function () {
                    $myGrid.datagrid('insertRow', {
                        index: 0,
                        row: rowData
                    });
                }
            });
            rowMenu.menu('appendItem', {
                text: 'ä¿å­æ°æ®',
                name: 'save',
                iconCls: 'icon-tablesave',
                onclick: function () {

                    var inserted = $myGrid.datagrid('getChanges', 'inserted');
                    var deleted = $myGrid.datagrid('getChanges', 'deleted');
                    var updated = $myGrid.datagrid('getChanges', 'updated');

                    var isOk = true;
                    var errorMsg = '';
                    if (inserted.length > 0) {
                        var json1 = JSON.stringify(inserted);
                        console.log('ä¿å­addæ°æ®' + json1);
                        $.syncPost('/grid/add/' + objectCode, {rows: json1},
                                function (result, status) {
                                    if (!result.success) {
                                        isOk = false;
                                        errorMsg += result.msg + '<br>';
                                    }
                                });
                    }
                    if (updated.length > 0) {
                        var json3 = JSON.stringify(updated);
                        console.log('ä¿å­updateæ°æ®' + json3);
                        $.syncPost('/grid/update/' + objectCode, {rows: json3},
                                function (result, status) {
                                    if (!result.success) {
                                        isOk = false;
                                        errorMsg += result.msg + '<br>';
                                    }
                                });
                    }
                    if (deleted.length > 0) {
                        var json2 = JSON.stringify(deleted);
                        console.log('ä¿å­deleteæ°æ®' + json2);
                        $.syncPost('/grid/delete/' + objectCode, {rows: json2},
                                function (result, status) {
                                    if (!result.success) {
                                        isOk = false;
                                        errorMsg += result.msg + '<br>';
                                    }
                                });
                    }

                    if (isOk) {
                        $.slideMsg("ä¿å­æåï¼");
                        // ç¡®è®¤æ¹å¨
                        $myGrid.datagrid('acceptChanges');
                        console.log('æ è®°æ´æ¹');
                    } else {
                        $.alert($, errorMsg);
                    }
                }
            });
//            rowMenu.menu('appendItem', {
//                text: 'åæ»æ°æ®',
//                name: 'reject',
//                iconCls: 'icon-undo',
//                onclick: function () {
//                    //$myGrid.datagrid('rejectChanges');
//                    console.log('åæ»æ°æ®');
//                }
//            });
            rowMenu.menu('appendItem', {
                text: 'å¶å®åè½',
                name: 'other',
                onclick: function () {
                    alert('Eova is So Easy');
                }
            });
        }
    }

    var cmenu;
    function createColumnMenu() {
        cmenu = $('<div/>').appendTo('body');
        // åå§åèå
        cmenu.menu();
        <%// ä»è¶çº§ç®¡çåå¯è§%>
        <%if(session.user.rid == 1){%>
        cmenu.menu('appendItem', {
            text: 'ç¼è¾åå­æ®µ',
            name: 'editmeta',
            iconCls: 'icon-tableedit',
            onclick: function () {
                window.open('/meta/edit/' + objectCode);
            }
        });
        cmenu.menu('appendItem', {
            text: 'ç¼è¾åå¯¹è±¡',
            name: 'editmeta',
            iconCls: 'icon-tableedit',
            onclick: function () {
                loadDialog($myGrid, 'ä¿®æ¹åå¯¹è±¡', '/form/update/eova_object_code-' + object.id);
            }
        });
        <%}%>
        // å¨æå è½½åä½ä¸ºèåé¡¹ç®
        cmenu.menu('appendItem', {
			text: 'other',
			name: 'other',
			iconCls: ''
        });
    }
    
    if (object.is_celledit) {
    	// validator init
        var $form = $('#${id}').parent();// get datagrid-view dom is validata zone
        $form.validator({
            debug: false,
            stopOnError: true,
            focusInvalid : false,
            showOk: false,
            timely: 0,
            msgMaker: false,
            fields: validators
        });
        $form.on("validation", $.validation);    	
    }
//    var pager = $myGrid.datagrid('getPager');
//    pager.pagination({
//        buttons: [
//            {
//                iconCls: 'icon-tableadd',
//                handler: function () {
//                    $myGrid.datagrid('insertRow', {
//                        index: 0,
//                        row: {}
//                    });
//                }
//            },
//            {
//                iconCls: 'icon-tabledelete',
//                handler: function () {
//                    alert('tabledelete');
//                }
//            },
//            {
//                iconCls: 'icon-tablesave',
//                handler: function () {
//                    alert('save');
//                }
//            }
//        ]
//    });

});

</script>