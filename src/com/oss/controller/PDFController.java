package com.oss.controller;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.text.DateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import com.jfinal.core.Controller;
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfWriter;

import sun.misc.BASE64Decoder;

public class PDFController extends Controller{
	//html转pdf
	public void HtmlToPdf() throws IOException, InterruptedException
	{
		String pdfName=getPara("pdfName");
		String currentUrl=getPara("currentUrl");
		//wkhtmltopdf在系统中的路径
	    final String toPdfTool ="F:\\java\\wkhtmltopdf\\bin\\wkhtmltopdf";
	   // String srcPath="http://www.cnblogs.com/xionggeclub/p/6144241.html";
	    String destPath="d:"+pdfName+".pdf";
	    
	    File file=new File(destPath);
	    File parent=file.getParentFile();
	    //如果pdf保存路径不存在，则创建路径  
	    if(!parent.exists()){
	    	parent.mkdirs();
	    	}
	    
	    String cmd=toPdfTool+" "+currentUrl+" "+destPath;
	    Runtime.getRuntime().exec(cmd);
	  
//	            HtmlToPdfInterceptor error = new HtmlToPdfInterceptor(proc.getErrorStream());
//	            HtmlToPdfInterceptor output = new HtmlToPdfInterceptor(proc.getInputStream());
//	            error.start();
//	            output.start();
//	            proc.waitFor();

	}
	
	public void savePicture() throws IOException{
		String baseimg = getPara("baseimg");
		System.out.println("baseimg:"+baseimg);
		System.out.println("baseimg_length:"+baseimg.length());
		String str = baseimg.replace("data:image/png;base64,","");
		System.out.println("str:"+str);
		System.out.println("str_length:"+str.length());
		String newPicInfo = str.replaceAll(" ", "+");
		if (newPicInfo == null) //图像数据为空  
			renderText("图像数据为空"); 

        BASE64Decoder decoder = new BASE64Decoder();   
            //Base64解码  
            byte[] b = decoder.decodeBuffer(newPicInfo);  
            for(int i=0;i<b.length;++i)  
            {  
                if(b[i]<0)  
                {//调整异常数据  
                    b[i]+=256;  
                }  
            }  
            //生成png/jpg图片               
            Date date = new Date();
            DateFormat df1 = DateFormat.getDateInstance();//日期格式，精确到日
            Random random = new Random();
            System.out.println(df1.format(date));
            String picName=df1.format(date)+random.nextInt(100);
            String imgFilePath = "F:\\workspace\\eova\\webapp\\image\\"+picName+".png";//新生成的图片  
            OutputStream out = new FileOutputStream(imgFilePath);      
            out.write(b);  
            out.flush();  
            out.close(); 
            Map<String ,String> response=new HashMap<String ,String>();
            response.put("picName", picName);
    		renderJson(response);

	}
	
	public void showPreview()
	{
		String title=getPara("title");
		String picName=getPara("picName");
		setAttr("title", title);
		setAttr("picName", picName);
		System.out.println("title:"+title);
		System.out.println("picName:"+picName);
		render("/menu/preview.html");
		}
	
	public void CreatePdf() throws DocumentException, IOException
	{
		String title=getPara("title");
		String picName=getPara("picName");
		BaseFont bfChinese=BaseFont.createFont("STSong-Light", "UniGB-UCS2-H", BaseFont.NOT_EMBEDDED);
		Font titleFont=new Font(bfChinese,12,Font.BOLD);
		titleFont.setColor(0, 0, 0);
		Font paragraphFont=new Font(bfChinese,10,Font.BOLD);
		paragraphFont.setColor(0, 0, 0);
		Document document=new Document(PageSize.A4);
		PdfWriter.getInstance(document, new FileOutputStream("F:\\workspace\\eova\\webapp\\image\\"+picName+".pdf"));
		document.open();
		Image img=Image.getInstance("F:\\workspace\\eova\\webapp\\image\\"+picName+".png");
		img.setAlignment(Image.ALIGN_CENTER);
		img.scalePercent(20);
		Paragraph paragraphTitle=new Paragraph(title,titleFont);
		paragraphTitle.setAlignment(Paragraph.ALIGN_CENTER);
		document.add(paragraphTitle);
		document.add(img);
//		Chunk chunk1 = new Chunk("第一种字体", titleFont);
//		Chunk chunk2 = new Chunk("第二种字体", paragraphFont);
//		document.add(paragraph);
//		document.add(paragraph);
//		document.add(chunk1);
//		document.add(chunk1);
		document.close();
	}
	/*
	public class HtmlToPdfInterceptor extends Thread {
	    private InputStream is;
	    
	    public HtmlToPdfInterceptor(InputStream is){
	        this.is = is;
	    }
	    
	    public void run(){
	        try{
	            InputStreamReader isr = new InputStreamReader(is, "utf-8");
	            BufferedReader br = new BufferedReader(isr);
	            String line = null;
	            while ((line = br.readLine()) != null) {
	                System.out.println(line.toString()); //输出内容
	            }
	        }catch (IOException e){
	            e.printStackTrace();
	        }
	    }
	}
//	public void exportPdf() throws  IOException, DocumentException, com.lowagie.text.DocumentException
//	{
//		String currentUrl=getPara("currentUrl");
//		String pdfName=getPara("pdfName");
//		System.out.println(currentUrl);
//		System.out.println(pdfName);
//		String inputFilePath="F:\\az.html";
//        String outputFilePath = "F:\\workspace\\eova\\webapp\\image\\"+pdfName+".pdf";//新生成的图片  
//
//		OutputStream os = new FileOutputStream(outputFilePath);     
//        ITextRenderer renderer = new ITextRenderer();     
//        String url = new File(inputFilePath).toURI().toURL().toString();       
//        renderer.setDocument(url);   
//     // 解决中文支持问题     
//        ITextFontResolver fontResolver = renderer.getFontResolver();    
//        fontResolver.addFont("C:/Windows/Fonts/SIMSUN.TTC", BaseFont.IDENTITY_H, BaseFont.NOT_EMBEDDED);     
//        //解决图片的相对路径问题
//        //renderer.getSharedContext().setBaseURL("file:/D:/");
//        renderer.layout();    
//        renderer.createPDF(os);  
//        
//        os.flush();
//        os.close();
//	}
*/	
}
