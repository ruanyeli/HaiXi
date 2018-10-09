/**
 * 
 */

html2canvas(document.body, { //截图对象
     //此处可配置详细参数
     onrendered: function(canvas) { //渲染完成回调canvas
       canvas.id = "mycanvas"; 
       // 生成base64图片数据
       var dataUrl = canvas.toDataURL('image/png');  //指定格式，也可不带参数
       var formData = new FormData(); //模拟表单对象
       formData.append("imgData",convertBase64UrlToBlob(dataUrl)); //写入数据
       $.ajax({
	        url:_url+'/excel/exportPdf',
	        type:'post',
	        async:false,
	        //contentType:"application/json",
	        data:{
	        	"formData":formData,
				//"title":
	        },
	        success:function(response){
	        	alert("ok");
	        	}
	        });
//       var xhr = new XMLHttpRequest(); //数据传输方法
//       xhr.open("POST", "/excel/exportPdf"); //配置传输方式及地址
//       xhr.send(formData);
//       xhr.onreadystatechange = function(){ //回调函数
//       if(xhr.readyState == 4){
//           if (xhr.status == 200) {
//            var back = JSON.parse(xhr.responseText);
//            if(back.success == true){
//            alertBox({content: 'Pdf导出成功！',lock: true,drag: false,ok: true});
//            }else{
//            alertBox({content: 'Pdf导出失败！',lock: true,drag: false,ok: true});
//            }
//           }
//        }
//       };
     }
}); 
   
//将以base64的图片url数据转换为Blob
function convertBase64UrlToBlob(urlData){
  //去掉url的头，并转换为byte
  var bytes=window.atob(urlData.split(',')[1]);    
  //处理异常,将ascii码小于0的转换为大于0
  var ab = new ArrayBuffer(bytes.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < bytes.length; i++) {
    ia[i] = bytes.charCodeAt(i);
  }
  return new Blob( [ab] , {type : 'image/png'});
}
