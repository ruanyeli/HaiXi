
function generateChart(chartId) {

	
	$.ajax({
		type : 'post',
		url : '/data/excuteView',
		data : chartId,
		dataType : 'json',
		success : function(excuteData) {
			parseJson(dataset, excuteData.excuteRecord, viewDiv);
		}
	});

}



function generateView(paramsData, dataset, viewDiv) {

	paramsData.sqlStr = dataset.sqlstr;
	$.ajax({
		type : 'post',
		url : '/data/excuteView',
		data : paramsData,
		dataType : 'json',
		success : function(excuteData) {
			parseJson(dataset, excuteData.excuteRecord, viewDiv);
		}
	});

}

//根据不同的图表类型返回不同的dom
function parseJson(dataset, excuteRecord, viewDiv) {

	if (dataset.selresdisplaytype == 10) {
		//报表初始化
		initDataTable(dataset, excuteRecord, viewDiv);
	} else if (dataset.selresdisplaytype == 11) {
		//卡片报表初始化
		initCard(dataset, excuteRecord, viewDiv);
	} else if (dataset.selresdisplaytype == 12) {
		//单项报表初始化
		initSingle(dataset, excuteRecord, viewDiv);
	} else {
		//图表初始化
		initChart(dataset, excuteRecord, viewDiv);
	}

}

//显示结果为  卡片报表  类型
function initCard(dataset, excuteRecord, viewDiv) {
	var cardDom = $("#template .cardType").clone();
	$("#cardTitle", cardDom).html(dataset.note);
	$.each(excuteRecord, function(index, item) {
		for ( var key in item) {
			$("#info", cardDom).append(
					"<li><span title='" + key + "'>" + key + "</span><span>"
							+ item[key] + "</span></li>");
		}
	});
	viewDiv.html(cardDom.children());
}

//显示结果为  单项报表  类型
function initSingle(dataset, excuteRecord, viewDiv) {
	var singleDom = $("#template .singleType").clone();
	var icon = dataset.icon;
	if (icon != '') {
		var info = icon.split("@");
		$("#icon", singleDom).html(
				"<i class='" + info[1] + "'>&#" + info[0] + "</i>");
	} else {
		$("#icon", singleDom).hide();
	}
	$.each(excuteRecord, function(index, item) {
		for ( var key in item) {
			$("#name", singleDom).text(key);
			$("#value", singleDom).text(item[key]);
		}
	});
	viewDiv.html(singleDom.children());
}

//显示结果为  报表  类型
function initDataTable(dataset, excuteRecord, viewDiv) {//viewDiv是table标签
	chartid = viewDiv.attr("id");

	var newRow = "";
	var i = 0;//保存table的列数
	for ( var key in excuteRecord[0]) {
		newRow += "<th>" + key + "</th>";
		i++;
	}

	$("thead", viewDiv).empty();
	$("tbody", viewDiv).empty();
	$("thead", viewDiv).append(
			"<tr><th colspan='" + i + "' class='text-c'>" + dataset.note
					+ "</th></tr><tr>" + newRow + "</tr>");

	//处理tbody
	$.each(excuteRecord, function(index, item) {
		newRow = "";
		for ( var key in item) {
			newRow += "<td>" + item[key] + "</td>";
		}

		$("tbody", viewDiv).append("<tr>" + newRow + "</tr>");
	});

	viewDiv.DataTable({
		"bLengthChange" : false,
		"searching" : false,
		"ordering" : false,
		"scrollCollapse" : "true",
		"deferRender" : true
	});

}

//显示结果为  图表  类型
function initChart(dataset, excuteRecord, viewDiv) {//viewDiv是img标签
	window.onresize = function() {
		myChart.resize();
		//console.log("调用该方法");
	}
	chartid = viewDiv.attr("class");
	layoutDiv = viewDiv.parent();
	var height = layoutDiv.height();
	layoutDiv.append("<div id='" + chartid
			+ "' style='width:100%;height:380px'></div>");

	chartDom = document.getElementById(chartid);
	var myChart = echarts.init(chartDom);

	var echartsDynamicData = new EchartsDynamicData();
	var echartsData = echartsDynamicData.getEchartsData(
			dataset.selresdisplaytype, excuteRecord, dataset.note, dataset.tag,
			dataset.isTrans);
	var option = getOptionByType(dataset.selresdisplaytype, echartsData);

	myChart.setOption(option);

	if (dataset.hasrelate == 1) {
		$("#datasetId").val(dataset.selfrelevance.child);
		$("#tagIsGroup").val(dataset.selfrelevance.tagisgroup);
		myChart.on('click', relateChartClick);
	}

	if (dataset.hasdrill == 1) {
		$("#datasetId").val(dataset.selfdrill.datasetid);
		$("#tagIsGroup").val(dataset.selfdrill.tagisgroup);
		myChart.on('click', drillChartClick);
	}
}

function drillChartClick(e) {
	console.log(e);
	//TODO
	$("#setParamForm").append(
			"<input id=" + e.seriesName + " type=\"hidden\" name="
					+ e.seriesName + " value=" + e.name + " />");
	id = $("#datasetId").val();
	if ($("#tagIsGroup").val() == 1) {
		isDataSet = 0;
	} else {
		isDataSet = 1;
	}
	//    window.location = "preview-data.html" + "?id=" + id + "&isDataSet=" + isDataSet + "&isDrillLevel=" + 1;
	var index = layer.open({
		type : 2,
		title : "下钻层",
		//        title: false,
		content : "preview-data.html" + "?id=" + id + "&isDataSet=" + isDataSet
				+ "&isDrillLevel=" + 1
	});
	layer.full(index);
}

function relateChartClick(e) {
	id = $("#datasetId").val();
	if ($("#tagIsGroup").val() == 1) {
		isDataSet = 0;
	} else {
		isDataSet = 1;
	}
	//    window.location = "preview-data.html" + "?id=" + id + "&isDataSet=" + isDataSet + "&isDrillLevel=" + 0;
	var index = layer.open({
		type : 2,
		title : "关联层",
		//        title: false,
		content : "preview-data.html" + "?id=" + id + "&isDataSet=" + isDataSet
				+ "&isDrillLevel=" + 0
	});
	layer.full(index);
}

//获取地址栏中的数据
function getParams() {
	var name, value;
	var str = location.href;
	var num = str.indexOf("?");
	str = str.substr(num + 1);
	var arr = str.split("&");
	var request = {};
	for (var i = 0; i < arr.length; i++) {
		num = arr[i].indexOf("=");
		if (num > 0) {
			name = arr[i].substring(0, num);
			value = decodeURIComponent(arr[i].substr(num + 1));
			request[name] = value;
			//console.log(request[name]);
		}
	}
	return request;
}

//解析form表单的数据
function getFormParams(formData) {
	var arr = formData.split("&");
	var result = {};
	for (var i = 0; i < arr.length; i++) {
		num = arr[i].indexOf("=");
		if (num > 0) {
			name = arr[i].substring(0, num);
			value = decodeURIComponent(arr[i].substr(num + 1));
			result[name] = value;
			//console.log(request[name]);
		}
	}
	return result;
}