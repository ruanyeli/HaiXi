package com.oss.controller;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.jfinal.core.Controller;
import com.jfinal.kit.JsonKit;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.jfinal.upload.UploadFile;
import com.oss.kit.BaseResponse;
import com.oss.kit.ResultCodeEnum;
import com.oss.service.EditService;
import com.oss.service.ExcelService;
import com.oss.service.StageService;
//import com.oss.service.Student;
//import com.oss.service.list;


/** 
 * @author  ryl
 * @E-mail: 
 * @date 创建时间：2017年10月22日 上午11:12:31 
 */

public class EditController extends Controller{
	

	
	private StageService stageService=null;
    private EditService editService=null;
	private Workbook wb;
	
	public EditController(){
		editService=new EditService();
		stageService=new StageService();
	}
	
	
	public void widthAndDeepth(){
		int tableid=this.getParaToInt("tableid");
		ExcelService excelService = new ExcelService();
		Record record=excelService.widthAndDeepth(tableid);
		System.out.println(record);
		this.renderJson(JsonKit.toJson(record));
	}
	
	public void fromJsontoTree() {//从数据库中的数据转化为tree显示需要的数据
		ExcelService excelService=new ExcelService();
		Integer tableid=this.getParaToInt("tableid");//拿到要展示的表的id
		Integer type=excelService.getTableType(tableid);//0-只有上表头；1-有上表头和左表头
		Map<String, String> result=new HashMap<>();//传给前端的结果
		
		List<Record> jsonUp=excelService.getUpperByTableid(tableid);	//存放数据库中查出来的数据
		List<Record> uptreeNode=new ArrayList<>();//上表头所有树节点
		Record top=new Record();
		top.set("id", 0);
		top.set("name", "上表头");
		top.set("pId", null);
		uptreeNode.add(top);
		
		int vIndex=1;

		String[] leftnames={"thisisleftborder"};
		Map<String,String> existname=new HashMap<>();
		
		for(int index=0;index<jsonUp.size();index++){
			Record node=jsonUp.get(index);
			String struct=node.getStr("uppstruct");
			String[] names=struct.split("/");
			if(names.length==1){//如果这不是一个复合的列
				Record newNode=new Record();
				newNode.set("id", node.get("uppid"));
				newNode.set("name", names[0]);
				newNode.set("pId", 0);
				uptreeNode.add(newNode);
				existname.put(names[0],""+ node.get("uppid"));
			}
			else{//这是一个有多行组成的列
				
				int mergedNum=0;//用来计算融合的行数
				int mergedIndex=0;
				while(mergedIndex<leftnames.length && mergedIndex<names.length && leftnames[mergedIndex].equals(names[mergedIndex])){
					mergedIndex++;
					mergedNum++;
				}
				for (int i = mergedNum; i < names.length; i++) {
					String thisname=names[i];
					Record newNode=new Record();
					
					if (i==0) //最上面的
					{
						newNode.set("id", "v"+vIndex); 
						newNode.set("name",thisname);
						newNode.set("pId", 0);
						existname.put(thisname,"v"+vIndex); 
						vIndex++;
					}else if(i==names.length-1)//叶子
					{
						newNode.set("id", ""+node.get("uppid"));
						newNode.set("name",thisname);
						newNode.set("pId", existname.get(names[i-1]));
						existname.put(thisname,""+node.get("uppid")); 
					}
					else
					{
						newNode.set("id", "v"+vIndex); 
						newNode.set("name",thisname);
						newNode.set("pId", existname.get(names[i-1]));
						existname.put(thisname,"v"+vIndex); 
						vIndex++;
					}
					uptreeNode.add(newNode);
				}
			}
			leftnames=names;//将左边的列更换
		}
		System.out.println("up:"+uptreeNode);
		result.put("uphead", JsonKit.toJson(uptreeNode).toString());
		
		if (type==0) {
			result.put("lefthead", null);
		}
		else{
			
			List<Record> jsonLeft=excelService.getLeftByTableid(tableid);	//存放数据库中查出来的数据
			List<Record> lefttreeNode=new ArrayList<>();//左表头所有树节点
			Record top2=new Record();
			top2.set("id", 0);
			top2.set("name", "左表头");
			top2.set("pId", null);
			lefttreeNode.add(top2);
			int vIndex2=1;

			String[] uppnames={"thisisuppborder"};
			Map<String,String> existname2=new HashMap<>();
			
			for(int index=0;index<jsonLeft.size();index++){
				Record node=jsonLeft.get(index);
				String struct=node.getStr("leftstruct");
				String[] names=struct.split("/");
				if(names.length==1){//如果这不是一个复合的列
					Record newNode=new Record();
					newNode.set("id", node.get("leftid"));
					newNode.set("name", names[0]);
					newNode.set("pId", 0);
					lefttreeNode.add(newNode);
					existname2.put(names[0],""+ node.get("leftid"));
				}
				else{//这是一个有多行组成的列
					
					int mergedNum=0;//用来计算融合的行数
					int mergedIndex=0;
					while(mergedIndex<uppnames.length && mergedIndex<names.length && uppnames[mergedIndex].equals(names[mergedIndex])){
						mergedIndex++;
						mergedNum++;
					}
					for (int i = mergedNum; i < names.length; i++) {
						String thisname=names[i];
						Record newNode=new Record();
						
						if (i==0) //最上面的
						{
							newNode.set("id", "v"+vIndex2); 
							newNode.set("name",thisname);
							newNode.set("pId", 0);
							existname2.put(thisname,"v"+vIndex2); 
							vIndex2++;
						}else if(i==names.length-1)//叶子
						{
							newNode.set("id", ""+node.get("leftid"));
							newNode.set("name",thisname);
							newNode.set("pId", existname2.get(names[i-1]));
							existname2.put(thisname,""+node.get("leftid")); 
						}
						else
						{
							newNode.set("id", "v"+vIndex2); 
							newNode.set("name",thisname);
							newNode.set("pId", existname2.get(names[i-1]));
							existname2.put(thisname,"v"+vIndex2); 
							vIndex2++;
						}
						lefttreeNode.add(newNode);
					}
				}
				uppnames=names;//将左边的列更换
			}
			System.out.println("left:"+lefttreeNode);
			result.put("lefthead", JsonKit.toJson(lefttreeNode).toString());
			
		}
		System.out.println(JsonKit.toJson(result).toString());
		renderJson(JsonKit.toJson(result).toString());
	}
	
	
	public void fromTreetoJson() {//从树结构转化为数据库存的数据
		int tableid=this.getParaToInt("tableid");
		System.out.println("this is formTreetojson");
		
		String uptreeStruct = this.getPara("uphead");//得到上节点
		String lefttreeStruct = this.getPara("lefthead");//得到左节点
		JSONArray uphead=JSONArray.parseArray(uptreeStruct);//String 转化成为jsonArray
		JSONArray lefthead=JSONArray.parseArray(lefttreeStruct);
		
		Map<String, String> result=new HashMap<>();
		
		List<Record> updata=new ArrayList<>();//用来上表头存放叶子节点
		List<Record> leftdata=new ArrayList<>();//用来存放左表头叶子节点

		Map<String,String> upMap=new HashMap<>();//用来存放非叶子节点的id和text对应关系
		Map<String,String> leftMap=new HashMap<>();//用来存放非叶子节点的id和text对应关系

		for(int index=0;index<uphead.size();index++){//小于上节点个数时循环
			JSONObject node=JSONObject.parseObject(uphead.get(index).toString());//特定节点转化成为json对象
			if (!"n".equals(node.getString("id").substring(0,1))&& node.containsKey("children")) {//如果是非叶子节点
				upMap.put(node.getString("id"), node.getString("name"));
			}
			else if(!"n".equals(node.getString("id").substring(0,1))){//如果是叶子
				Record record=new Record();
				record.set("id", node.get("id"));
				record.set("name", node.getString("name"));
				String struct=node.get("name")+"";
				boolean flag=true;
				while(flag){
					flag=false;
					for(int i=0;i<uphead.size();i++){//找到父节点
						JSONObject tempnode=JSONObject.parseObject(uphead.get(i).toString());//循环每一个节点，并且转化想成为json对象
						if (tempnode.get("id").equals(node.get("pId"))&& tempnode.get("pId")!=null) {//如果循环节点的id等于这个节点的父id
							node=tempnode;
							flag=true;//一直找父节点，直到找到的节点没有父节点为止
						   }
					}
						 if (flag) {
								struct=upMap.get(node.getString("id"))+"/"+struct;
							}   
						
				}				
				record.set("struct", struct);
				updata.add(record);
			}
			else if(node.containsKey("children")){//新增非叶子结点
				upMap.put(node.getString("id"), node.getString("name"));

			}
			else{//新增叶子节点
				Record newNode=new Record();
				newNode.set("id", "-1");
				newNode.set("name", node.get("name"));
				String struct=node.get("name")+"";
				
				boolean flag=true;
				while(flag){
					flag=false;
					for(int i=0;i<uphead.size();i++){//找到父节点
						JSONObject tempnode=JSONObject.parseObject(uphead.get(i).toString());
						if (tempnode.get("id").equals(node.get("pId"))&& tempnode.get("pId")!=null) {
							node=tempnode;
							flag=true;
						}
					}
						if (flag) {
							struct=upMap.get(node.getString("id"))+"/"+struct;
						}		
				}
				newNode.set("struct", struct);
				updata.add(newNode);
			}
			 
		}
		
		for(int j=0;j<lefthead.size();j++){
			JSONObject node=JSONObject.parseObject(lefthead.get(j).toString());
			if ( !"n".equals(node.getString("id").substring(0,1))&& node.containsKey("children")) {//如果是非叶子节点
				leftMap.put(node.getString("id"), node.getString("name"));
			}
			else if(!"n".equals(node.getString("id").substring(0,1) ) ) {
				Record record=new Record();
				record.set("id", node.get("id"));
				record.set("name", node.getString("name"));
				String struct=node.get("name")+"";
				boolean flag=true;
				while(flag){
					flag=false;
					for(int i=0;i<lefthead.size();i++){//找到父节点
						JSONObject tempnode=JSONObject.parseObject(lefthead.get(i).toString());
						if (tempnode.get("id").equals(node.get("pId")) && tempnode.get("pId")!=null) {
							node=tempnode;
							flag=true;
						}
					}
					if (flag) {
						struct=leftMap.get(node.getString("id"))+"/"+struct;
					}
				}
				record.set("struct", struct);
				leftdata.add(record);
			}
			else if(node.containsKey("children") ){//新增非叶子结点
				leftMap.put(node.getString("id"), node.getString("name"));

			}else {
				Record newNode=new Record();
				newNode.set("id", -1);
				newNode.set("name", node.get("name"));
				String struct=node.get("name")+"";
				boolean flag=true;
				while(flag){
					flag=false;
					for(int i=0;i<lefthead.size();i++){//找到父节点
						JSONObject tempnode=JSONObject.parseObject(lefthead.get(i).toString());
						if (tempnode.get("id").equals(node.get("pId"))&& tempnode.get("pId")!=null) {
							node=tempnode;
							flag=true;
						}
					}
					if (flag) {
						struct=leftMap.get(node.getString("id"))+"/"+struct;

					}
				}
				newNode.set("struct", struct);
				leftdata.add(newNode);
			}
		}
		System.out.println(leftMap);
		System.out.println(upMap);
		System.out.println(updata);
		System.out.println(JsonKit.toJson(updata).toString());
		result.put("uphead", JsonKit.toJson(updata).toString());
		result.put("lefthead", JsonKit.toJson(leftdata).toString());
		if(editSave(tableid,updata)&editSaveleft(tableid,leftdata)){
			this.render("1");
		}
	}
	
	
	public void getTableId(){
		System.out.println("thie is getTableid");		
		if(editService.getStatementTableIdAndName()!=null){
			this.renderJson(Boolean.TRUE);
			Map<String, String> result=new HashMap<>();                      //传给前端的结果
			List<Record> tables=editService.getStatementTableIdAndName();	//存放数据库中查出来的数据
			for(int index=0;index<tables.size();index++){
				Record node=tables.get(index);
				String tablename = node.getStr("staname");
				int tableid= node.getInt("staid");
				result.put("lefthead", JsonKit.toJson(node).toString());
			}
			System.out.println(JsonKit.toJson(result).toString());
			renderText(JsonKit.toJson(result).toString());
			setAttr("result",0);
            setAttr("tables",tables);
//              this.renderJson(JsonKit.toJson(tables));
          	renderJson(); 
		}
		else{
			setAttr("result",0);//如果是0代表借不成功
			 setAttr("tables",0);
			renderJson(); 
		}
		}

	public void getStatype(int tableid){		
		System.out.println("this is getStatype");
		if(editService.getStatype(tableid)!=null){//查询成功			
			Record tables=editService.getStatype(tableid);
			System.out.println(tables);
			int type=tables.getInt("stattype");
			System.out.println("this is type:"+type);
			setAttr("result",tableid);
			setAttr("type",type);
			render("/menu/halfyear_report.html");
	}
	}

	
	public void getUpperrowAndLeftcol(int tableid){//得到表的上表头行，和坐标头列
		System.out.println("This is getUpperrowAndLeftcol()");	
		List<Record> upptables=editService.getUppercol(tableid);
	    Record id=editService.getFirstUpperid(tableid);
	    int  upperFirstId=id.get("uppid");//得到起始id
	    System.out.println("起始id是："+upperFirstId);
	    int  Uppercol=upptables.size();//得到上表头的列数
	    System.out.println("上表头列数是"+Uppercol);  
	}
	
	public void importExcel(){			
				System.out.println("this is importExcel");		
				UploadFile file = getFile("file");
				if(file==null){
					renderText("请选择文件");
				}else{
				try{
				File file1=file.getFile();
				int year = getParaToInt("select_year");
				int month = getParaToInt("select_month");
				int halfyear = getParaToInt("select_halfyear");
				int season = getParaToInt("select_season");
				System.out.println("year ="+year+"month ="+month+"season ="+season);
				String area_select = getPara("area");		
				String state = getPara("State");
				String province=getPara("province");
				String company=getPara("company");
				System.out.println("company is "+company);
				int type= getParaToInt("type");//得到报表类型
				int tableid=getParaToInt("tableid");
				int stageid=0;
				String area;
				if(state.equals(" ")){		//海西州的
					if(company.equals("")){
						area=province;
					}
					else{
						area=province+"-"+company;
						}	
				}else{
				if(area_select.equals(" ")){
					if(company.equals("")){
					area=province+"-"+state;}
					else{
						area=province+"-"+state+"-"+company;
						}					
				}else{
					if(company.equals("")){
					area=province+"-"+state+"-"+area_select;
					}
					else{
						area=province+"-"+state+"-"+area_select+"-"+company;
						}
				}
				}
			if(checkExcel(file)){
					     System.out.println("checkExcel(file) is "+!checkExcel(file));			     
		                   if(checkExcelxlsx(file)){
		                	   renderText("请上传2003版本的文件");
		           			   return;      
				            }
				       }else{
				    	   renderText("请上传excel");
		       			   return;
				       }	
			
			Record tables=editService.getDetail(tableid);
		    int  leftid=editService.getLeftId(tableid);		    
			int up=tables.get("staupperrow");//得到上表头行数
			int left=tables.get("staleftcol");//得到左表头列数	
		    int  leftrow=editService.getLeftRow(tableid);
			String datatable_id="datatable_"+tableid;//得到数据库表的名称
		    List<Record> upptables=editService.getUppercol(tableid);
		    Record id=editService.getFirstUpperid(tableid);
		    int  upperFirstId=id.get("uppid");//得到起始id
		    int  Uppercol=upptables.size();//得到上表头的列数
		    System.out.println("上表头列数是"+Uppercol);  
			switch(type){					
					       case 0:{//年报
					    	   if(year==0){
					    		   renderText("请选择年份");
					    		   return;
					    	   }
					    	   if(stageService.IsExistStage(area,tableid,year))
					    	   {
						    		renderText("该期数据已导入");
						    		return;
						    	 }
					    	   else{
					    		   stageid=editService.insertStagesYear(area,tableid,year);
								   getUpperrowAndLeftcol(tableid);										
					    	     }
						    	    break;   
					           }
					      case 1: {//半年报
					    	  if(year==0){
					    		  renderText("请选择年份");
					    		  return;
					    	  }else{
					    		  if(halfyear==0){
					    			  renderText("请选择时间段");
					    			  return;
					    		  }
					    	  }
					    	  if(stageService.IsExistHalfyearStage(area,tableid,year,halfyear))//存在数据
					    	  {
						    		renderText("该期数已导入");
						    		return;
						    	 }
					    	  else{					    		  
				    	          stageid=editService.insertStagesHalfyear(area,tableid,year,halfyear);
							      getUpperrowAndLeftcol(tableid);							     
				    	        }				    		
						    break;
					       }
					      case 2:{//季报
					    	  if(year==0){
					    		  renderText("请选择年份");
					    		  return;
					    	  }else{
					    		  if(season==0){
					    			  renderText("请选择季度");
					    			  return;
					    		  }
					    	  }
					    	  if(stageService.IsExistSeasonStage(area,tableid,year,season))
					    	  {
						    		renderText("该期数已导入");
						    		return;
						    	 }
					    	  else{
					    		  stageid=editService.insertStagesSeason(area,tableid,year,season);
							     getUpperrowAndLeftcol(tableid);							    
					    	  }						   
					    	  break;
					      }
					      case 3:{//月报
					    	  if(year==0){
					    		  renderText("请选择年份");
					    		  return;
					    	  }else{
					    		  if(month==0){
					    			  renderText("请选择月份");
					    			  return;
					    		  }
					    	  }
					    	 if( stageService.IsExistMonthStage(area,tableid,year,month))
					    	 {
					    		renderText("该期数已导入");
					    		return;
					    	 }
					    	  else{
					    		  stageid=editService.insertStagesMonth(area,tableid,year,month);					
								  getUpperrowAndLeftcol(tableid);									  
					    	   }
						       break;
					      }
					}
			       wb = WorkbookFactory.create(file1);	
				   if(editService.importExcel(wb,datatable_id,stageid,up,Uppercol,left,upperFirstId,leftid,leftrow)){
					     setAttr("stageid",stageid);
					     setAttr("tableid",tableid);			
					     render("/menu/showResult.html");
				    }else{//此处导入不成功还有从数据库里删除已经添加的期数的操作				    	
				    	renderText("导入不成功");				    	
				   }
		    	 wb.close();
				 file1.delete();		
				 }catch (Exception e) {
						// TODO: handle exception
						e.printStackTrace();					
						renderText("内部错误");						
				 }
				}
				
			}

	private boolean checkExcel(UploadFile file) {		
		String fileName=file.getFileName();
		boolean isExcel=(fileName.endsWith(".xls")||fileName.endsWith(".xlsx")||fileName.endsWith(".XLS")||fileName.endsWith(".XLSX"));
		if(isExcel==false){
		return false;
		}
		return true;
	}
	
	private boolean checkExcelxlsx(UploadFile file){
		String fileName=file.getFileName();
		boolean isxlsxExcel=fileName.endsWith(".xlsx")||fileName.endsWith(".XLSX");	
		System.out.println("isxlsxExcel ="+isxlsxExcel);
		if(isxlsxExcel==true){
			return true;			
		}
		return false;
		
	}


	public void getInfo(){		
		int tableid=this.getParaToInt("tableid");//得到id
		if(editService.getDetail(tableid)!=null){
			this.renderJson(Boolean.TRUE);
			Map<String, String> result=new HashMap<>();                      //传给前端的结果
			Record tables=editService.getDetail(tableid);	//存放数据库中查出来的数据
			System.out.println(tables);
		    result.put("lefthead", JsonKit.toJson(tables).toString());			
			System.out.println(JsonKit.toJson(result).toString());
			renderText(JsonKit.toJson(result).toString());
			setAttr("result",0);
            setAttr("tables",tables);
          	renderJson(); 
			
		}
		
	}
		
	public boolean editSave(int tableid,List<Record> updata){
		System.out.println("thie is editSave()");	
        List<Record> allUpper =(editService).editFindUppid(tableid);//在upp中查找到tableid所有对应的uppid
        int colsize = allUpper.size();
        int upperindex = 0;
        int id = 0;
        int count=0;
        List<Integer> upperid=new ArrayList<Integer>();
        List<Integer> uppershow=new ArrayList<Integer>();
        List<String> upperstruct=new ArrayList<String>();
        List<String> uppfieldname=new ArrayList<String>();
        for(upperindex = 0;upperindex<allUpper.size();upperindex++){//将数据库里的项目分类存储
        	Record uppernode=allUpper.get(upperindex);
        	upperid.add((Integer) uppernode.get("uppid"));
        	upperstruct.add((String) uppernode.get("uppstruct"));
        	uppfieldname.add((String) uppernode.get("uppfieldname"));
        	uppershow.add((Integer) uppernode.get("uppshow"));
        }        
        int index=0;
        for(index=0;index<updata.size();index++){
         	Record leafnode=updata.get(index);
        	System.out.println("id: "+leafnode.get("id"));
        	String str=leafnode.getStr("id");
         	 id=Integer.parseInt(str);
        	String struct=leafnode.getStr("struct");//得到了前端传来的struct
        	String nodename=leafnode.getStr("name");
        	if(id==-1){//如果id=-1，说明是新增的，将此记录插入upper
        		editService.editInsertTable(tableid,nodename,struct,allUpper.size()+index+1);//在upper中重新写入数据了
        		editService.editAddNewCol("_"+id,tableid);//在datatable_id表中插入新的
        	}//如果不是新增的，id！=-1，则与upper对比 id与upperid对比
        	else {
        		    for(upperindex = 0;upperindex<allUpper.size();upperindex++){
        		    	if(id==upperid.get(upperindex)){//如果id与数据库中的相等了，继续判断uppfieldname    		    		
        		    		System.out.println("nodename is ="+nodename);
        		    		System.out.println("uppfieldname is ="+uppfieldname.get(upperindex));
        		    		if(nodename.equals(uppfieldname.get(upperindex))){//如果名字相等，则继续判断结构
        		    			if(!struct.equals(upperstruct.get(upperindex))){//如果结构不相等，更改数据库
        		    				editService.editUpdateTableStruct(id,struct);
        		    			}
        		    		}
        		    		else{//id相等，名字不相等的情况，更改数据库，修改的不用更改datatable
        		    			editService.editUpdateTableName(id,nodename);
        		    			editService.editUpdateTableStruct(id,struct);
        		    		}
        		    	}
        		    }
        		   
        	}
        }  
        //处理删除节点
        for(upperindex = 0;upperindex<allUpper.size();upperindex++){//循环数据库
        	int uppid=upperid.get(upperindex);
        	System.out.println("数据库中的uppid="+uppid);
        	count=0;
        	System.out.println("allUpper.size()="+allUpper.size());
        	System.out.println("updata.size()="+updata.size());
        	for(index=0;index<updata.size();index++){
        		Record leafnode=updata.get(index);
        		String str=leafnode.getStr("id");
            	id=Integer.parseInt(str);
            	System.out.println("前端循环的ID = "+id);
            	 if(uppid==id){
            		 count++; 
            	 }
        	}
        	System.out.println("比对后的count = "+count);
        	 if(count==0){//在数据库中没找到相等的，那么设show=0
 		    	editService.editSetShowTable(uppid);
 		    }
        }
        return true;
    }   
	 
	public boolean  editSaveleft(int tableid,List<Record> leftdata){//传过来的参数应该时坐表头的
		System.out.println("this is editSaveleft()");
		if(editService.editFindLeftid(tableid)!=null){//当有左表头时：
		  List<Record> allLeft =editService.editFindLeftid(tableid);//在upp中查找到tableid所有对应的uppid
	        int colsize = allLeft.size();
	        int leftindex = 0;
	        int id = 0;
	        int count=0;
	        List<Integer> leftid=new ArrayList<Integer>();
	        List<Integer> leftshow=new ArrayList<Integer>();
	        List<String> leftstruct=new ArrayList<String>();
	        List<String> leftname=new ArrayList<String>();
	        for(leftindex = 0;leftindex<allLeft.size();leftindex++){//将数据库里的项目分类存储
	        	Record leftnode=allLeft.get(leftindex);
	        	leftid.add((Integer) leftnode.get("leftid"));
	        	leftstruct.add((String) leftnode.get("leftstruct"));
	        	leftname.add((String)leftnode.get("leftname"));
	        	leftshow.add((Integer) leftnode.get("leftshow"));
	        }  	        	        
	        int index=0;
	        for(index=0;index<leftdata.size();index++){
	         	Record leafnode=leftdata.get(index);
	        	System.out.println("id: "+leafnode.get("id"));
//	        	String str=leafnode.getStr("id");
//	         	 id=Integer.parseInt(str);
	         	 id=leafnode.getInt("id");
	        	String struct=leafnode.getStr("struct");//得到了前端传来的struct
	        	String nodename=leafnode.getStr("name");
	        	if(id==-1){//如果id=-1，说明是新增的，将此记录插入upper
	        		editService.editInsertLeftTable(tableid,nodename,struct,allLeft.size()+index+1);//在upper中重新写入数据了
//	        		editService.editAddNewCol("_"+id,tableid);//在datatable_id表中插入新的
	        	}//如果不是新增的，id！=-1，则与upper对比 id与upperid对比
	        	else {
	        		    for(leftindex = 0;leftindex<allLeft.size();leftindex++){
	        		    	if(id==leftid.get(leftindex)){//如果id与数据库中的相等了，继续判断uppfieldname    		    		
	        		    		System.out.println("nodename is ="+nodename);
	        		    		System.out.println("uppfieldname is ="+leftname.get(leftindex));
	        		    		if(nodename.equals(leftname.get(leftindex))){//如果名字相等，则继续判断结构
	        		    			if(!struct.equals(leftstruct.get(leftindex))){//如果结构不相等，更改数据库
	        		    				editService.editUpdateLeftTableStruct(id,struct);
	        		    			}
	        		    		}
	        		    		else{//id相等，名字不相等的情况，更改数据库，修改的不用更改datatable
	        		    			editService.editUpdateLeftTableName(id,nodename);
	        		    			editService.editUpdateLeftTableStruct(id,struct);
	        		    		}
	        		    	}
	        		    }
	        		   
	        	}
	        }  	        
	        for(leftindex = 0;leftindex<allLeft.size();leftindex++){//循环数据库	        	
	        	int lefid=leftid.get(leftindex);
	        	System.out.println("数据库中的uppid="+lefid);
	        	count=0;
	        	System.out.println("allLeft.size()="+allLeft.size());
	        	System.out.println("updata.size()="+leftdata.size());
	        	for(index=0;index<leftdata.size();index++){
	        		Record leafnode=leftdata.get(index);
//	        		String str=leafnode.getStr("id");
//	            	id=Integer.parseInt(str);
	            	id = leafnode.getInt("id");
	            	System.out.println("前端循环的ID = "+id);
	            	 if(lefid==id){
	            		 count++; 
	            	 }
	        	}
	        	System.out.println("比对后的count = "+count);
	        	 if(count==0){//在数据库中没找到相等的，那么设show=0
	 		    	editService.editSetShowLeftTable(lefid);
	 		    	System.out.println("lefid ="+lefid);
	 		    	System.out.println("id ="+id);
	 		    	
	 		    }
	        }	
		}else{//当没有左表头时，做处理，此时只能添加节点操作
			
			
		}
		return true;
		
		
		
	}
	
		
	public void renderId(){
		System.out.println("this is renderId");
		System.out.println("para(0) is " + getPara(0));
		setAttr("staid",getPara(0));
		render("/menu/edit_report.html");
	}
	public void renderIdtoTree(){
		System.out.println("this is renderId");
		System.out.println("para(0) is " + getPara(0));
		setAttr("staid",getPara(0));
		render("/eova/auth/edit_report.html");
	}
	public void renderTableId(){
		System.out.println("this is renderId");
		System.out.println("para(0) is " + getPara(0));
		setAttr("result",getPara(0));
		render("/menu/Inquery_report.html");
	}
	
	public void renderExcel(){
		System.out.println("para(0) is " + getPara(0));		
		setAttr("result",getPara(0));	
		int tableid=Integer.parseInt(getPara(0));
		getStatype(tableid);//去判断报表类型
	}
	 
	public void renderDelete(){
		BaseResponse response=new BaseResponse();
		System.out.println("this is renderDelete");
		int tableid=this.getParaToInt("id");//得到表的id
		try{
			System.out.println("ready to delete datatable");
		    editService.deleteDatatable(tableid);
		    editService.deleteStatements(tableid);//删除datatable表 成功的情况下，删除Statements表
		    response.setResult(ResultCodeEnum.SUCCESS);
		}catch(Exception e){
			e.printStackTrace();
			response.setResult(ResultCodeEnum.INNERERROR);
			}
            this.renderJson(response);
		}
	
	public void renderDeleteData(){
		BaseResponse response=new BaseResponse();
		System.out.println("this is renderDeleteData");
		int tableid=this.getParaToInt("tableid");//得到表的id
		int stageid=this.getParaToInt("stageid");
		System.out.println("tableid is ="+tableid+"stageid is ="+stageid);
		try{
		editService.deleteDatetable(tableid,stageid);
		editService.deletestage(tableid,stageid);
		 response.setResult(ResultCodeEnum.SUCCESS);
		}catch(Exception e){
			e.printStackTrace();
			response.setResult(ResultCodeEnum.INNERERROR);
			}
            this.renderJson(response);
	}	
		
	public void renderUpdateName(){
		setAttr("result",getPara(0));	
		render("/eova/auth/btn/updateName.html");
	}
	
	public void renderUpdateTableName(){
		BaseResponse response=new BaseResponse();
		System.out.println("this is renderUpdateTableName");
		int tableid=this.getParaToInt("tableid");
		String tableName=this.getPara("tableName");
		System.out.println("tableid is ="+tableid+"tableName is ="+tableName);
		try{
			editService.updateTableName(tableid,tableName);
			response.setResult(ResultCodeEnum.SUCCESS);
		}catch(Exception e){
			e.printStackTrace();
			response.setResult(ResultCodeEnum.INNERERROR);
		}
		 this.renderJson(response);
	}
	public void preEditSave(){
		String[] attributes=getPara("attributes").split(",");
		String oldTableId=getPara("oldTableId");
		String oldTableName=getPara("oldTableName");
		String newTableId=getPara("newTableId");
		String newTableName=getPara("newTableName");
		
			for(int i=0;i<attributes.length;i++){
				Record attribute = new Record().set("oldtableid", oldTableId).set("oldtablename", oldTableName).set("oldattributes", attributes[i]).set("newtableid", newTableId).set("newtablename", newTableName).set("newattributes", attributes[i]);
				Db.use("statistic").save("upper_change", attribute);
			}
		
	}
	public void addAttributes(){
		String oldTableId=getPara("oldTableId");
		String oldTableName=getPara("oldTableName");
		String newTableId=getPara("newTableId");
		String newTableName=getPara("newTableName");
		String newattribute=getPara("attribute");
		
		Record attribute = new Record().set("oldtableid", oldTableId).set("oldtablename", oldTableName).set("newtableid", newTableId).set("newtablename", newTableName).set("newattributes", newattribute);
		Db.use("statistic").save("upper_change", attribute);
		
	}
	public void editAttributes(){
		String oldattribute=getPara("oldattribute");
		String newattribute=getPara("newattribute");
		String oldTableId=getPara("oldTableId");
		String newTableId=getPara("newTableId");
		String newTableName=getPara("newTableName");
		
			Db.use("statistic").update("update upper_change set newtableid="+newTableId+",newtablename="+"'"+newTableName+"'"+",newattributes="+"'"+newattribute+"'"+" where oldtableid="+oldTableId+" and oldattributes="+"'"+oldattribute+"'");
		
	}
	public void removeAttributes(){
		String removeAttribute=getPara("removeAttribute");
		String oldTableId=getPara("oldTableId");
		
			Db.use("statistic").update("update upper_change set newattributes="+"'"+" "+"'"+" where oldtableid="+oldTableId+" and oldattributes="+"'"+removeAttribute+"'");
		
	}
	public void preLeftEditSave(){
		String[] attributesName=getPara("attributesName").split(",");
		String[] attributesId=getPara("attributesId").split(",");
		String oldTableId=getPara("oldTableId");
		String oldTableName=getPara("oldTableName");
		String newTableId=getPara("newTableId");
		String newTableName=getPara("newTableName");
		for(int i=0;i<attributesName.length;i++){
			Record attribute = new Record().set("oldtableid", oldTableId).set("oldtablename", oldTableName).set("attributesid", attributesId[i]).set("oldattributes", attributesName[i]).set("newtableid", newTableId).set("newtablename", newTableName).set("newattributes", attributesName[i]);
			Db.use("statistic").save("left_change", attribute);
			}
	}
	public void addLeftAttributes(){
		String oldTableId=getPara("oldTableId");
		String oldTableName=getPara("oldTableName");
		String newTableId=getPara("newTableId");
		String newTableName=getPara("newTableName");
		String newattribute=getPara("attribute");
		String attributesId=getPara("nodeId");

		Record attribute = new Record().set("oldtableid", oldTableId).set("oldtablename", oldTableName).set("newtableid", newTableId).set("newtablename", newTableName).set("attributesid", attributesId).set("newattributes", newattribute);
		Db.use("statistic").save("left_change", attribute);
		
	}
	public void editLeftAttributes(){
		String oldattribute=getPara("oldattribute");
		String newattribute=getPara("newattribute");
		String oldTableId=getPara("oldTableId");
		String newTableId=getPara("newTableId");
		String newTableName=getPara("newTableName");
		String attributesId=getPara("nodeId");

		Db.use("statistic").update("update left_change set newtableid="+newTableId+",newtablename="+"'"+newTableName+"'"+",newattributes="+"'"+newattribute+"'"+" where oldtableid="+oldTableId+" and oldattributes="+"'"+oldattribute+"'"+" and attributesid="+attributesId);
		
	}
	public void removeLeftAttributes(){
		String removeAttribute=getPara("removeAttribute");
		String oldTableId=getPara("oldTableId");
		String attributesId=getPara("removeNodeId");
		
		Db.use("statistic").update("update left_change set newattributes="+"'"+" "+"'"+" where oldtableid="+oldTableId+" and oldattributes="+"'"+removeAttribute+"'"+" and attributesid="+attributesId);
	}
	
	
	}


