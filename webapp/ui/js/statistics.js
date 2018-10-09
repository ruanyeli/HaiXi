/* Create By Yuanziqian 20170621*/
window.onload=function(){
	$(".loader").remove();
}
//var tableid=window.location.href.split("?")[1].split("=")[1];
var tableid=114;
// 基于准备好的dom，初始化echarts实例
var myChart = echarts.init(document.getElementById('main'));
$(function(){
    //样式初始化
    var height=($(window).height()-68)+'px';
    $(".infocontainer").css("height",height);
    $(".chartcontainer").css("height",height);
    var chartheight=($(window).height()-108)+'px';
    var chartwidth=($(".chartcontainer").width()-40)+'px';
    $("#main").css("height",chartheight);
    $("#main").css("width",chartwidth);
    $(".blue").css("height",$(window).height()+'px');
    // 初始化实例的chart
    // 指定图表的配置项和数据
    var option = {
        title: {
            text: 'Example',
            subtext: '请于信息区选择期号和字段'
        },
        tooltip: { trigger: 'axis'},
        toolbox: {
            show : true,
            feature : {
                magicType : {show: true, type: ['line', 'bar']},
                saveAsImage : {show: true}
            }
        },
        legend: {
            data:['销量']
        },
        xAxis: {
            data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"]
        },
        yAxis: {},
        series: [{
            name: '销量',
            type: 'line',
            data: [5, 20, 36, 10, 10, 20]
        }]
    };

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
    //请求报表的类型和期号
    $.ajax
    (
        {
            type: "POST",
            url: "/CreateTable/charts/getStageidByStaid",
            data: {
                tableid:tableid
            },
            success: function (data) {
                data = eval('(' + data + ')');
                //根据类型渲染不同的信息区
                if(data.type == 0){//上表头类型
                    $("#upheadinfo").css("display","block");
                    $("#leftheadinfo").css("display","none");

                    //填入期号
                    var str="";
                    var issue= eval('(' + data.stages + ')');
                    for(var i=0;i<issue.length;i++){
                        str+='<option value="'+issue[i].stageid+'">'+issue[i].stagename+'</option>';
                    }
                    $("#up-issue").html(str);
                }else if(data.type == 1){//上左表头类型
                    $("#upheadinfo").css("display","none");
                    $("#leftheadinfo").css("display","block");

                    //填入期号
                    var str="";
                    var issue= eval('(' + data.stages + ')');
                    for(var i=0;i<issue.length;i++){
                        str+='<option value="'+issue[i].stageid+'">'+issue[i].stagename+'</option>';
                    }
                    $("#left-startissue").html(str);
                    $("#left-endissue").html(str);
                }

            },
            error: function () {
                //alert("失败啦");
            }
        }
    );
});
//根据期号请求字段
//上表头
$("#up-issue").change(function(){
    $.ajax
    (
        {
            type: "POST",
            url: "/CreateTable/charts/getFieldsByStageid",
            data: {
                tableid:tableid,
                startissue:$("#up-issue").val(),
                endissue:$("#up-issue").val()
            },
            success: function (data) {
                data = eval('(' + data + ')');
                data = eval('(' + data.uppFields + ')');
                //填入字段
                for(var i=0;i<data.length;i++){
                    str+='<option value="'+data[i].uppid+'">'+data[i].uppfieldname+'</option>';
                }
                $("#up-x").html(str);
                $("#up-y").html(str);
            },
            error: function () {
                //alert("失败啦");
            }
        }
    );
});
//上左表头
$(".left-issue").change(function(){
    //起始期号一定要小于终止期号
    if(parseInt($("#left-startissue").val()) >= parseInt($("#left-endissue").val())){
        alert("起始期号必须要小于终止期号！");
        return false;
    }
    $.ajax
    (
        {
            type: "POST",
            url: "/CreateTable/charts/getFieldsByStageid",
            data: {
                tableid:tableid,
                startissue:$("#left-startissue").val(),
                endissue:$("#left-endissue").val()
            },
            success: function (data) {
                data = eval('(' + data + ')');
                var uphead=eval('(' + data.uppFields + ')');
                var lefthead=eval('(' + data.leftFields + ')');

                var str1="";
                var str2="";

                //填入字段
                for(var i=0;i<uphead.length;i++){
                    str1+='<option value="'+uphead[i].uppid+'">'+uphead[i].uppfieldname+'</option>';
                }
                for(var i=0;i<lefthead.length;i++){
                    str2+='<option value="'+lefthead[i].leftid+'">'+lefthead[i].leftname+'</option>';
                }
                $("#left-up").html(str1);
                $("#left-left").html(str2);
            },
            error: function () {
                //alert("失败啦");
            }
        }
    );
});
//生成图表
//上表头-单独图表
$("#up-makechart-single").click(function () {
    $.ajax
    (
        {
            type: "POST",
            url: "/CreateTable/charts/getXYData",
            data: {
                tableid:tableid,
                startissue:$("#up-issue").val(),
                endissue:$("#up-issue").val(),
                xfield:$("#up-x").val(),
                yfield:$("#up-y").val()
            },
            success: function (data) {
                data = eval('(' + data + ')');
                //轴的名字
                var xname=$("#up-x").find("option:selected").text();
                var yname=$("#up-y").find("option:selected").text();
                //x轴
                var xdata=data.x;
                //y轴
                var ydata=data.y;
                //如果是空数据要变成0
                for(var i=0;i<xdata.length;i++){
                    if(xdata[i] == null){
                        xdata[i]=0;
                    }
                }
                for(var i=0;i<ydata.length;i++){
                    if(ydata[i] == null){
                        ydata[i]=0;
                    }
                }
                // 指定图表的配置项和数据
                var option = {
                    title: {
                        text: '数据统计表',
                        subtext: ''
                    },
                    tooltip: { trigger: 'axis'},
                    toolbox: {
                        show : true,
                        feature : {
                            magicType : {show: true, type: ['line', 'bar']},
                            saveAsImage : {show: true}
                        }
                    },
                    legend: {
                        data:yname
                    },
                    xAxis: {
                        name: xname,
                        data: xdata
                    },
                    yAxis: {
                        name: yname
                    },
                    series: [{
                        name: yname,
                        type: 'line',
                        data: ydata
                    }]
                };

                // 使用刚指定的配置项和数据显示图表。
                myChart.setOption(option,true);
            },
            error: function () {
                //alert("失败啦");
            }
        }
    );
});
//上表头-混合图表
$("#up-makechart-mixture").click(function () {
    $.ajax
    (
        {
            type: "POST",
            url: "/CreateTable/charts/getXYData",
            data: {
                tableid:tableid,
                startissue:$("#up-issue").val(),
                endissue:$("#up-issue").val(),
                xfield:$("#up-x").val(),
                yfield:$("#up-y").val()
            },
            success: function (data) {
                data = eval('(' + data + ')');
                //轴的名字
                var xname=$("#up-x").find("option:selected").text();
                var yname=$("#up-y").find("option:selected").text();
                //x轴
                var xdata=data.x;
                //y轴
                var ydata=data.y;
                //如果是空数据要变成0
                for(var i=0;i<xdata.length;i++){
                    if(xdata[i] == null){
                        xdata[i]=0;
                    }
                }
                for(var i=0;i<ydata.length;i++){
                    if(ydata[i] == null){
                        ydata[i]=0;
                    }
                }
                // 指定图表的配置项和数据
                var option = {
                    title: {
                        text: '数据统计表',
                        subtext: ''
                    },
                    tooltip: { trigger: 'axis'},
                    toolbox: {
                        show : true,
                        feature : {
                            saveAsImage : {show: true}
                        }
                    },
                    legend: {
                        data:yname
                    },
                    xAxis: {
                        name: xname,
                        data: xdata
                    },
                    yAxis: {
                        name: yname
                    },
                    series: [
                    	{
                    		name: yname,
                    		type: 'line',
                    		data: ydata
                    	},
                    	{
                    		name: yname,
                    		type: 'bar',
                    		data: ydata
                    	}
                    ]
                };

                // 使用刚指定的配置项和数据显示图表。
                myChart.setOption(option,true);
            },
            error: function () {
                //alert("失败啦");
            }
        }
    );
});
//上左表头-单独图表
$("#left-makechart-single").click(function () {
    $.ajax
    (
        {
            type: "POST",
            url: "/CreateTable/charts/getXYData",
            data: {
                tableid:tableid,
                startissue:$("#left-startissue").val(),
                endissue:$("#left-endissue").val(),
                xfield:$("#left-up").val(),
                yfield:$("#left-left").val()
            },
            success: function (data) {
                data = eval('(' + data + ')');
                //轴的名字
                var xname="期名";
                var yname=$("#left-up").find("option:selected").text() + $("#left-left").find("option:selected").text();
                //x轴
                var xdata=data.x;
                //y轴
                var ydata=data.y;
                //如果是空数据要变成0
                for(var i=0;i<xdata.length;i++){
                    if(xdata[i] == null){
                        xdata[i]=0;
                    }
                }
                for(var i=0;i<ydata.length;i++){
                    if(ydata[i] == null){
                        ydata[i]=0;
                    }
                }
                // 指定图表的配置项和数据
                var option = {
                    title: {
                        text: '数据统计表',
                        subtext: ''
                    },
                    tooltip: { trigger: 'axis'},
                    toolbox: {
                        show : true,
                        feature : {
                            magicType : {show: true, type: ['line', 'bar']},
                            saveAsImage : {show: true}
                        }
                    },
                    legend: {
                        data:yname
                    },
                    xAxis: {
                        name: xname,
                        data: xdata
                    },
                    yAxis: {
                        name: yname
                    },
                    series: [{
                        name: yname,
                        type: 'line',
                        data: ydata
                    }]
                };

                // 使用刚指定的配置项和数据显示图表。
                myChart.setOption(option,true);
            },
            error: function () {
                //alert("失败啦");
            }
        }
    );
});
//上左表头-混合图表
$("#left-makechart-mixture").click(function () {
    $.ajax
    (
        {
            type: "POST",
            url: "/CreateTable/charts/getXYData",
            data: {
                tableid:tableid,
                startissue:$("#left-startissue").val(),
                endissue:$("#left-endissue").val(),
                xfield:$("#left-up").val(),
                yfield:$("#left-left").val()
            },
            success: function (data) {
                data = eval('(' + data + ')');
                //轴的名字
                var xname="期名";
                var yname=$("#left-up").find("option:selected").text() + $("#left-left").find("option:selected").text();
                //x轴
                var xdata=data.x;
                //y轴
                var ydata=data.y;
                //如果是空数据要变成0
                for(var i=0;i<xdata.length;i++){
                    if(xdata[i] == null){
                        xdata[i]=0;
                    }
                }
                for(var i=0;i<ydata.length;i++){
                    if(ydata[i] == null){
                        ydata[i]=0;
                    }
                }
                // 指定图表的配置项和数据
                var option = {
                    title: {
                        text: '数据统计表',
                        subtext: ''
                    },
                    tooltip: { trigger: 'axis'},
                    toolbox: {
                        show : true,
                        feature : {
                            saveAsImage : {show: true}
                        }
                    },
                    legend: {
                        data:yname
                    },
                    xAxis: {
                        name: xname,
                        data: xdata
                    },
                    yAxis: {
                        name: yname
                    },
                    series: [
                    	{
                    		name: yname,
                    		type: 'line',
                    		data: ydata
                    	},
                    	{
                    		name: yname,
                    		type: 'bar',
                    		data: ydata
                    	}
                    ]
                };

                // 使用刚指定的配置项和数据显示图表。
                myChart.setOption(option,true);
            },
            error: function () {
                //alert("失败啦");
            }
        }
    );
});