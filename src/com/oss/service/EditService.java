package com.oss.service;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import oracle.sql.DATE;

import org.apache.poi.EncryptedDocumentException;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellValue;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.FormulaEvaluator;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;

public class EditService {
	
	SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	 Date date = new Date();//获得系统时间.
	 String nowTime = df.format(date);
    
	 
	public List<Record> getStatementTableIdAndName(){
		List<Record> s=Db.use("statistic").find("select staid,staname from statements");
		return s;
	}
	
	public Record getDetail(int tableid){
		Record s=Db.use("statistic").findFirst(" select * from statements where staid=? ",tableid);
		return s;
		
	}
	
	public Record getColType(String col_name,int id){
		Record r=Db.use("statistic").findFirst("select data_type from information_schema.columns where column_name="+col_name+" and table_name='datatable_"+id+"'");
		return r;
	}
	
		
	private String getCellStringValue(Row row,int cellIndex){//如果单元格是String形，就调用这个方法得到相应但愿个的值
		Cell cell=row.getCell(cellIndex);
		 return cell.getStringCellValue();
	}
	
	private double getCellNumericValue(Row row,int cellIndex){//如果单元格是整形，就调用这个方法得到相应但愿个的值
		Cell cell=row.getCell(cellIndex);
		 return cell.getNumericCellValue();
	}
	
	private int getCellIntValue(Row row,int cellIndex){//如果单元格是整形，就调用这个方法得到相应但愿个的值
		Cell cell=row.getCell(cellIndex);
		 return Integer.parseInt(String.valueOf(cell.getNumericCellValue()));
	}
	
	private String getCellFormulaValue(CellValue cell) {			
	        String cellValue = "NULL";
	        switch (cell.getCellType()) {
	        case Cell.CELL_TYPE_STRING:
	            System.out.print("String :");
	            cellValue=cell.getStringValue();
	            break;
	        case Cell.CELL_TYPE_NUMERIC:
	            System.out.print("NUMERIC:");
	            cellValue=String.valueOf(cell.getNumberValue());
	            break;
	        case Cell.CELL_TYPE_FORMULA:
	            System.out.print("FORMULA:");
	            break;
	        default:
	            break;
	        }	        
	        return cellValue;
	}
	
	private Date getDateCellValue(Row row,int cellIndex){
		Cell cell=row.getCell(cellIndex);
		return cell.getDateCellValue();
	}
	

	private String getBooleanCellValue(Row row, int cellIndex) {
		Cell cell=row.getCell(cellIndex);
		cell.getBooleanCellValue();
		return null;
	}

	public Boolean importExcel(Workbook wb,String datatableid,int stage,int upperrow, int uppercol,int leftcol,int upperFirstId,int leftid,int leftrow) {//传入文件，期数、上表头行数、上表头列数、左表头列数,起始上表头
		//获得工作簿
	   System.out.println("upperrow is :"+upperrow);
	   System.out.println("左表头列数是:"+leftcol);
	   
//	    解析工作表
		System.out.println("this is editService importExcel");
		FormulaEvaluator eva = wb.getCreationHelper().createFormulaEvaluator();  
	    int size=wb.getNumberOfSheets();//工作表的数目
	    System.out.println("一共有"+size+"个工作表");
	    Sheet sheet;
	    Row row;
	    Cell cell;	    
	    int count=0;
	    int alluppercol;
	    int allleftid=leftid;
	    for(int i=0;i<size;i++){//每一个工作表循环
	    	int allRow;
	    	 sheet = wb.getSheetAt(i);
	    	 System.out.println("读取当前工作表："+sheet.getSheetName());
	    	 //得到有效行数
	    	 int rowNumber=sheet.getPhysicalNumberOfRows();
	    	 System.out.println("有效行数："+rowNumber);
	    	 if(leftrow==0){
	    		 allRow=rowNumber;
	    	 }	    	 
	    	 else allRow=upperrow+leftrow; 
	    	 if(leftrow==0){//没有左表头
	    		 alluppercol=uppercol;	    		
	    	 }  else{
	    		 alluppercol=uppercol;
	    	 }	
	    	 for(int rowindex=upperrow;rowindex<allRow;rowindex++){//抛去上表头
	    		 System.out.println("正在读取第："+(rowindex)+"行");
	    		 if(rowindex==0){
	    			 continue;
	    		 }	    		 
	    		 row=sheet.getRow(rowindex);//得到某一行	    		 
	    		 System.out.println("得到第"+rowindex+"行");
	    		 System.out.println("row的数据是： "+row);
	    		 if(row==null){
	    			 break;
	    		 }
	    		 String sql = "insert into "+datatableid+"(stageid,";
	    		 for(int id=upperFirstId;id<uppercol+upperFirstId;id++)
	    		   {
	    			   sql+="_"+id+",";
	    		   }
	    		 sql+="leftid) values("+stage+",";
	    		 for(int p=0;p<leftcol;p++){
	    			 sql+="NULL,";
	    		 }
         		
	    		 for(int index=leftcol;index<alluppercol;index++)
	    		 {//在读取每一个单元格了
//insert into datatable_157(`stageid`,`_26`,`_27`,`_28`,`_29`,`_30`,`_31`,`leftid`) values(3,2,55,67,8,9,2,NULL);  
	    			 cell=row.getCell(index);
	    			 System.out.println("Cell is "+cell);	
	    			 if(cell==null) {
	    				 sql+= "NULL,";
	    			       continue;
	    			    }
//	    			 if(cell.equals("#DIV/0!")){
//	    				 sql+= "NULL,";
//	    			       continue;
//	    			 }
	    			 switch(cell.getCellType()){
	    			 case Cell.CELL_TYPE_NUMERIC:
	    			 {
	    				 System.out.println("这是整形");
	    				 if (DateUtil.isCellDateFormatted(cell)) {
	    					 System.out.println("列值："+getDateCellValue(row,index));
	    			            sql+=getDateCellValue(row,index)+",";
	    			        } 
	    				 else {

	    					 System.out.println("列值："+getCellNumericValue(row,index));
		    				 sql+=getCellNumericValue(row,index)+",";
	    			        }
	    				 break;
	    			 }	    			 
	    			 case Cell.CELL_TYPE_STRING:
	    			 {
	    				 System.out.println("这是String形");
	    				 System.out.println("列值："+getCellStringValue(row,index));
	    				 sql+="'"+getCellStringValue(row,index)+"'"+",";
	    				 break;
	    			 }
	    			 
	    			 case Cell.CELL_TYPE_FORMULA:
	    			 {
	    				 System.out.println("这是一个公式");
	    				 System.out.println("列值："+getCellFormulaValue(eva.evaluate(cell)));
	    				 if(!getCellFormulaValue(eva.evaluate(cell)).equals("NULL"))
	    				 sql+="'"+getCellFormulaValue(eva.evaluate(cell))+"'"+",";	
	    				 else 
	    					 sql+="NUll,";
	    				 break;
	    			 }
	    			 
	    			 case Cell.CELL_TYPE_BLANK: 
	    			 {
	    				 System.out.println("列值：为空");
	    				 sql+="NULL,";
	    	           break;  
	    			 }	    			 
	    			 case Cell.CELL_TYPE_BOOLEAN:{
	    				 System.out.println("列值："+getBooleanCellValue(row,index));	   
	    				    sql+="'"+getBooleanCellValue(row,index)+"'"+",";
	    				    break;	
	    			 }
	    			 default:{
	    				 sql+="NULL"+",";
	    				 break;
	    			 }
	    			 }
	    		   
	    		 }
	    		 if(allleftid==0){
	    			 sql+="NULL);";
	    		 }
	    		 else{
	    		 sql+=+leftid+");";}
	    		 leftid++;
	    		 System.out.println(sql);
	    		if(Db.use("statistic").update(sql) !=0)
	    			count++;
	    		 } 
	    	 
	    	 try {
				wb.close();
			} catch (IOException e) {
				
				e.printStackTrace();
			}
	    	 System.out.println("count is :"+count);
	    	 
	    	 }	    
	    	return true; 	    	
	}
	
	
	public List<Record> getUppercol(int uppstatement) {
		List<Record> s=Db.use("statistic").find(" select * from upper where uppstatement=? ",uppstatement);
		return s;	
	}

	public Record getFirstUpperid(int tableid) {
		Record s=Db.use("statistic").findFirst(" select * from upper where uppstatement=? ",tableid);
		return s;
	
	}

	public boolean uppDelete(int tableid) {//如果删除成功，返回true
		if(Db.use("statistic").update("delete * from upper where uppstatement=? ",tableid)!=0)
			return true;
		return false;
		// TODO Auto-generated method stub
		
	}

	public void editCreateTable(int tableid) {
		Db.use("statistic").update("create table datatable_"+tableid+" (dataid SERIAL not null,primary key(dataid));");	
	}

	
	
	public List<Record> editFindUppid(int tableid) {//此方法查询uppid
		System.out.println("this is editFindUppid!!");
		List<Record> r=Db.use("statistic").find("select * from upper where uppstatement=?",tableid);//查找所有tableid下的uppid，存入一个ArrayList中
		return r;	
	}
	
	public void editInsertTable(int tableid,String nodename,String struct,int index) {//在upper中插入数据，以叶子节点为基准
		//insert into datatable_157(`stageid`,`_26`,`_27`,`_28`,`_29`,`_30`,`_31`,`leftid`) values(3,2,55,67,8,9,2,NULL);  		
		Db.use("statistic").update("insert into upper(uppfieldname,uppstruct,uppstatement,uppshow,uppdatatype,uppcid,uppcreatetime,uppdeletetime) values(\""+nodename+"\",\""+struct+"\","+tableid+",1,0,"+index+",NULL,NULL)"); 	   
	}
	
	public void editAddNewCol(String col,int tableid) {
		System.out.println("this is editAddNewCol!!!!!!!!!!!!");
		System.out.println(Db.use("statistic").find("select  max(uppid) from upper"));
		Record r=Db.use("statistic").findFirst("select  max(uppid) from upper");
		int maxuppid=r.get("max(uppid)");	
		Db.use("statistic").update("alter table datatable_"+tableid+" add column _"+maxuppid+" varchar(25) not null after stageid");	
	}
	
	public void editUpdateTableStruct(int id, String struct) {
		Db.use("statistic").update("update upper set uppstruct ='"+struct+"' where uppid=?",id);
	}
	
	public void editUpdateLeftTableStruct(int id, String struct) {
		Db.use("statistic").update("update `left` set leftstruct ='"+struct+"' where leftid=?",id);
	}
	
	public boolean editUpdateTableName(int id, String nodename) {
		if(Db.use("statistic").update("update upper set uppfieldname ='"+nodename+"' where uppid=?",id)!=0)
			return true;
		return false;	
	}
	
	public boolean editUpdateLeftTableName(int id, String nodename) {
		if(Db.use("statistic").update("update `left` set leftname ='"+nodename+"' where leftid=?",id)!=0)

			return true;
		return false;	
	}
	
	public void editSetShowTable(int id) {
		System.out.println("this is editSetShowTable!!!!!!!!!!!!");
		Db.use("statistic").update("update upper set uppshow = 0 where uppid=?",id);		
	}
	
	public void editSetShowLeftTable(int id) {
		System.out.println("this is editSetShowLeftTable!!!!!!!!!!!!");
		Db.use("statistic").update("update `left` set `leftshow`=0 where `leftid`=?",id);	
	
	}

	public Record getStatype(int tableid) {
		Record r=Db.use("statistic").findFirst("select stadeptype from statements where staid=?",tableid);
		int statid=r.get("stadeptype");
		System.out.println("statid is ="+statid );
		Record r1=Db.use("statistic").findFirst("select stattype from statype where statid=?",statid);
		System.out.println("r1 is :"+r1);
		// TODO Auto-generated method stub
		return r1;
	}

	public int  insertStagesYear(String area,int tableid, int year) {
		Db.use("statistic").update("insert into stages(stagename,stagestatement,year,month,season,halfyear,normal) values(\""+area+"\","+tableid+","+year+",NULL,NULL,NULL,NULL)");
		Record r=Db.use("statistic").findFirst("select max(stageid) from stages");
		return r.get("max(stageid)");
		
	}

	public int  insertStagesHalfyear(String area,int tableid,int year, int halfyear) {
		Db.use("statistic").update("insert into stages(stagename,stagestatement,year,month,season,halfyear,normal) values(\""+area+"\","+tableid+","+year+",NULL,NULL,"+halfyear+",NULL)");
		Record r=Db.use("statistic").findFirst("select max(stageid) from stages");
		return r.get("max(stageid)");

		// TODO Auto-generated method stub
		
	}

	public int insertStagesSeason(String area,int tableid, int year,int season) {
		Db.use("statistic").update("insert into stages(stagename,stagestatement,year,month,season,halfyear,normal) values(\""+area+"\","+tableid+","+year+",NULL,"+season+",NULL,NULL)");
		Record r=Db.use("statistic").findFirst("select max(stageid) from stages");
		return r.get("max(stageid)");
		// TODO Auto-generated method stub
		
	}

	public int insertStagesMonth(String area,int tableid, int year,int month) {
		System.out.println("this is insertStagesMonth");
		Db.use("statistic").update("insert into stages(stagename,stagestatement,year,month,season,halfyear,normal) values(\""+area+"\","+tableid+","+year+","+month+",NULL,NULL,NULL)");
		Record r=Db.use("statistic").findFirst("select max(stageid) from stages");
		return r.get("max(stageid)");		
	}

	public int getLeftId(int tableid) {//获取tableid对应的第一个左表头id
		Record r=Db.use("statistic").findFirst("select leftid from `left` where leftstatement=? ",tableid);//查找
		if(r==null)//如果是一个空值
			return 0;

		return r.get("leftid");	
	}

	public int getLeftRow(int tableid) {
		List<Record> r=Db.use("statistic").find("select * from `left` where leftstatement=? ",tableid);
		return r.size();
	}

	public List<Record> editFindLeftid(int tableid) {//当有坐标头时，返回坐标头信息，当没有坐表头时，返回null；
		System.out.println("this is editFindUppid!!");
		List<Record> r=Db.use("statistic").find("select * from `left` where leftstatement=?",tableid);//查找所有tableid下的uppid，存入一个ArrayList中
		if(r!=null)
		return r;	
		else
			return null;
		// TODO Auto-generated method stub
		
	}

	public void editInsertLeftTable(int tableid, String nodename,String struct,int leftrid) {//在left表中新增数据
		Db.use("statistic").update("insert into `left`(`leftstruct`,`leftname`,`leftrid`,`leftstatement`,`leftshow`,`leftcreatetime`,`leftdeletetime`) values(\""+struct+"\",\""+nodename+"\","+leftrid+","+tableid+",1,NULL,NULL)");
	}



	public boolean deleteStage(int stageid) {
		
		System.out.println("stageid ="+stageid);
		if(Db.use("statistic").update("delete from stages where stageid =?",stageid)!=0)
		return true;
		
	    return false;
		
	}

	public int findStageid(String area,int tableid,int year,int halfyear) {
		Record r=Db.use("statistic").findFirst("select stageid from stages where stagename=? and stagestatement=? and `year`=? and halfyear=?",area,tableid,year,halfyear);
		int stageid=r.get("stageid");
		return stageid;		
	}
	
	public int findStageidYear(String area,int tableid,int year) {
		Record r=Db.use("statistic").findFirst("select stageid from stages where stagename=? and stagestatement=? and `year`=?",tableid,year);
		int stageid=r.get("stageid");
		return stageid;		
	}
	
	public int findStageidMonth(String area,int tableid,int year,int month) {
		Record r=Db.use("statistic").findFirst("select stageid from stages where stagename=? and stagestatement=? and `year`=? and month=?",area,tableid,year,month);
		int stageid=r.get("stageid");
		return stageid;		
	}
	
	public int findStageidSeason(String area,int tableid,int year,int season) {
		Record r=Db.use("statistic").findFirst("select stageid from stages where stagename=? and stagestatement=? and `year`=? and season=?",area,tableid,year,season);
		int stageid=r.get("stageid");
		return stageid;		
	}

	public boolean isExitHalfyearStageData(int tableid,int stageid) {
		return !Db.use("statistic").find("select * from datatable_"+tableid+" where `stageid`=?",stageid).isEmpty();	
	}

	public void deleteDatatable(int tableid) {	//删除datatable	
		System.out.println("this is delete Datatable");
		Db.use("statistic").update("drop table IF EXISTS datatable_"+tableid);
	}

	public boolean deleteStatements(int tableid) {//删除Statement表中的数据
		System.out.println("this is deleteStatements");
		if(Db.use("statistic").update("delete from `statements` where staid = ? ",tableid)!=0)
			return true;
		else
			return false;
		
	}

	public boolean Upper(int tableid) {
		System.out.println("this is delete Upper");
		if(Db.use("statistic").update("delete * from upper where uppstatement = ?"+tableid)!=0)
			return true;		
		return false;
	}

	public boolean Left(int tableid) {
		System.out.println("this is delete Left");
		if(Db.use("statistic").update("delete * from left  where leftstatement= ? "+tableid)!=0)
			return true;
		return false;
	}

	public boolean DeleteStages(int tableid) {
		System.out.println("this is delete DataStages");
		if(Db.use("statistic").update("delete * from stages where stagestatement = ? "+tableid)!=0)
			return true;
		return false;
	}

	public void deletestage(int tableid, int stageid) {//删除期数
		Db.use("statistic").update("delete from stages where stagestatement = ? and stageid =?" ,tableid,stageid);		
	}

	public void deleteDatetable(int tableid, int stageid) {//删除datatable中的数据
		Db.use("statistic").update("delete from datatable_"+tableid+" where stageid= ?",stageid);	
	}

	public void updateTableName(int tableid, String tableName) {
		Db.use("statistic").update("update statements set staname=\""+tableName+"\" where staid=? ",tableid);		
	}
}
