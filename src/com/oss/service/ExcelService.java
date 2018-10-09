package com.oss.service;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;

import jxl.write.WriteException;

import com.eova.model.MetaField;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.oss.excel.ExcelUtil;
import com.oss.model.DictImportRecord;
import com.oss.model.Left;
import com.oss.model.Stages;
import com.oss.model.Statements;
import com.oss.model.Upper;

public class ExcelService {

	/**
	 * 插入报表模板信息
	 * @param staname
	 * @param stacreator
	 * @param header
	 * @param upheadRowNum
	 * @param leftheadColNum
	 * @param statime
	 * @param statype
	 * @param stadeptype
	 * @return
	 */
	public int insertOneTable(String staname,int stacreator,String header,int upheadRowNum,int leftheadColNum,Date statime,int statype,int stadeptype){//在总表中插入一个表格的数据
		Statements statements=new Statements();
		statements.use("statistic").setStaupperrow(upheadRowNum);
		statements.use("statistic").setStaleftcol(leftheadColNum);
		statements.use("statistic").setStaheader(header.getBytes());
		statements.use("statistic").setStaname(staname);
		statements.use("statistic").setStacreatetime(statime);
		statements.use("statistic").setStacreator(stacreator);
		statements.use("statistic").setStadeptype(stadeptype);
		statements.use("statistic").setStatype(statype);
		if(Db.use("statistic").save("statements", statements.toRecord())){
			return Db.use("statistic").findFirst("select * from statements where staname like ?",staname).getInt("staid");
		}
    	return 0;
    }

	/**
	 * 插入上表头信息
	 * @param tableid
	 * @param uppname
	 * @param uppstruct
	 * @param uppdatatype
	 * @param uppcid
	 * @param statime
	 * @return
	 */
	public int insertOneCol(int tableid, String uppname, String uppstruct, int uppdatatype, int uppcid, Date statime) {
		// TODO Auto-generated method stub
		Upper upper=new Upper();
		upper.use("statistic").setUppstatement(tableid);
		upper.use("statistic").setUppfieldname(uppname);
		upper.use("statistic").setUppstruct(uppstruct);
		upper.use("statistic").setUppdatatype(uppdatatype);
		upper.use("statistic").setUppcid(uppcid);
		upper.use("statistic").setUppcreatetime(statime);
		upper.use("statistic").setUppshow(1);
		Db.use("statistic").save("upper", upper.toRecord());
		return Db.use("statistic").findFirst("select * from upper where uppstatement=? and uppfieldname like ? and uppcid=?", tableid,uppname,uppcid).getInt("uppid");
	}
	
	/**
	 * 插入左表头信息
	 * @param tableid
	 * @param leftname
	 * @param leftstruct
	 * @param leftrid
	 * @param statime
	 */
	public boolean insertOneRow(int tableid, String leftname, String leftstruct, int leftrid, Date statime) {
		Left left = new Left();
		left.use("statistic").setLeftname(leftname);
		left.use("statistic").setLeftstruct(leftstruct);
		left.use("statistic").setLeftrid(leftrid);
		left.use("statistic").setLeftshow(1);
		left.use("statistic").setLeftstatement(tableid);
		left.use("statistic").setLeftcreatetime(statime);
		return Db.use("statistic").save("left", left.toRecord());
	}
	
	/**
	 * 创建数据表
	 * @param name
	 * @return
	 */
    public boolean createOneTable(String name){//创建一个数据表
    	List<Record> r= Db.find("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'excel' and TABLE_NAME=?",name);
		if(r.size()==0)
		{
			Db.use("statistic").update("create table "+name+" (dataid SERIAL not null,primary key(dataid));");
			return true;
		}
		else
		{
			return false;
		}
    }
    
    /**
     * 新建一列(没有约束条件的)
     * @param colname
     * @param tablename
     * @param uppdatatype 
     */
    public void createOneCol(String colname,String tablename, int uppdatatype){//在对应的数据表中创建一列
    	String type="";
    	switch(uppdatatype){
    	case 0:	type="varchar(25)";break;
    	case 1: type="double";break;
    	case 2: type="decimal";break;
    	default:type="varchar(25)";
    	}
    	System.out.println(colname+"  "+tablename);
    	Db.use("statistic").update("ALTER TABLE "+tablename+" ADD "+colname+" "+type);
    }
    
    /**
     * 添加有外键约束的列
     * @param colname
     * @param tablename
     * @param foreign
     * @param foreignkey
     */
    public void createConstraintCol(String colname,String tablename,String foreign,String foreignkey){
    	Db.use("statistic").update("ALTER TABLE "+tablename+" ADD "+colname+" int");
    	Db.use("statistic").update("ALTER TABLE "+tablename+" ADD constraint "+tablename+"_"+colname+"_fk"+" foreign key ("+colname+") references `"+foreign+"`("+foreignkey+")");
    }
    
    public Record showTable(int tableid){//查看已经创建的表格
		Record r=Db.use("statistic").findFirst("select staupperrow as row,staleftcol as col,staheader as rowandcol from statements where staid=? ",tableid);
    	List<Record> cols=Db.use("statistic").find("select uppid from upper where uppstatement=?",tableid);
    	String ids="";
    	for(int i=0;i<cols.size();i++){
    		ids+=cols.get(i).get("uppid")+",";
    	}
    	r.set("ids", ids);
    	return r;
    }
	public int getRowNum(int tableid) {
		Record record=Db.use("statistic").findFirst(" select staupperrow from statements where staid=? ",tableid);//待改
		return record.get("staupperrow");
	}
	public void insertOneData(int tableid,Integer stageid,Integer rowid,String para) {
		List<Record> records=Db.use("statistic").find("select uppid,uppdatatype from upper where uppstatement=? and uppshow=1",tableid);
		int ColCount=records.size();
		List<Record> record2=Db.use("statistic").find("SELECT MAX(dataid) as maxid FROM datatable_"+tableid);
		int maxid;
		if (record2.get(0).get("maxid")!=null) {
			maxid=record2.get(0).getInt("maxid")+1;
		}
		else{
			maxid=1;
		}
		String[] paras=para.split(",");
		String sql = "insert into datatable_"+tableid+"(dataid,stageid,";
		for (int i = 0; i < records.size(); i++) {
			sql+="_"+records.get(i).get("uppid")+",";
		}
		sql+="leftid) values("+maxid+","+stageid;//0暂时表示stageid
	 	for(int j=0;j<ColCount;j++){
	 		sql+=",'"+paras[j]+"'";
	 	}
	 	sql+=","+rowid+")";
	 	System.out.println(sql);
	 	Db.use("statistic").update(sql);
	}
//	public List<Record> showDatas(int tableid) {
//		return Db.find("select * from table"+tableid);
//	}
//	public boolean updateTableInfo(int tableid,int rowNum,int colNum,String header) {//修改tables表里面的信息
//		Tables tableinfo=Tables.dao.findFirst("select * from tables where t_id=?",tableid);
//		tableinfo.setTRownum(rowNum);
//		tableinfo.setTColnum(colNum);
//		tableinfo.setTHeader(header);
//		if (tableinfo.update()) {
//			return true;
//		}else {
//			return false;
//		}
//		
//	}
//	public String getColname(int colid) {
//		Columns col=Columns.dao.findFirst("select c_name from columns where c_id=?",colid);
//		return col.getCName();
//	}
//
//	public boolean changeColStatu(int colid) {
//		Columns c=Columns.dao.findById(colid);
//		c.setCstate(1);
//		if (c.update()) {
//			return true;
//		}else{
//			return false;
//		}
//	}
//	public boolean changeColName(int colid,String name) {
//		Columns c=Columns.dao.findById(colid);
//		c.setCName(name);
//		if (c.update()) {
//			return true;
//		}else{
//			return false;
//		}
//	}
//	public void changeColName2(int tableid,String oldname,String newname) {
//		Db.update("alter table table"+tableid+" change "+oldname+" "+newname+"  varchar(255)");
//	}

	
	public Record forDownLoad(int tableid) {
		Record r=Db.use("statistic").findFirst("select staupperrow as upperrow,staleftcol as leftcol,staheader as rowandcol from statements where staid=? ",tableid);
    	return r;
	}
	public Integer getTableType(int tableid) {//0-只有上表头；1-有上表头和左表头
		Record r=Db.use("statistic").findFirst("select statype from statements where staid=?", tableid);
		int statype=r.get("statype");
		return statype;
	}
	public List<Record> getUpperByTableid(int tableid) {
		return Db.use("statistic").find("select uppid,uppfieldname,uppstruct from upper where uppstatement=? and uppshow=1 order by uppcid",tableid);
	}
	public List<Record> getLeftByTableid(int tableid) {
		return Db.use("statistic").find("select leftid,leftname,leftstruct from `left` where leftstatement=? and leftshow=1 order by leftrid",tableid);
	}
	public Record getUpperById(int upperid) {
		return Db.use("statistic").findFirst("select upperid,uppfieldname,uppstruct from upper where uppid=?",upperid);
	}
	public List<Record> getColTypes(int tableid) {
		return Db.use("statistic").find("select uppdatatype from upper where uppstatement=? and uppshow=1 order by uppcid",tableid);
	}
	public int insertANewStage(String filename,Integer tableid) {
		Stages s=new Stages();
		s.setStagename(filename);
		s.setStagestatement(tableid);
		s.save();
		return s.getStageid();
	}
	public boolean StageNameExists(String stagename) {
		Record r=Db.use("statistic").findFirst("select stageid from stages where stagename=?",stagename);
		try {
			r.get("stageid");
			return true;
		} catch (Exception e) {
			return false;
		}
		
	}
	public Record widthAndDeepth(int tableid) {
		Record s=Db.use("statistic").findFirst("select staupperrow,staleftcol from statements where staid=?",tableid);
		return s;
	}
	
	/**
	 * 插入数据测试
	 * @param staname
	 * @param stacreator
	 * @param stacreatetime
	 * @param statype
	 * @param staheader
	 * @param staupperrow
	 * @param staleftcol
	 * @param stadetype
	 * @return
	 */
	public boolean testInsertStatement(String staname,int stacreator,Date stacreatetime,int statype,String staheader,int staupperrow,int staleftcol,int stadetype){
		System.out.println("hhhhhhahahahahahha");
		
//		System.out.println(Statements.dao.find("SELECT * FROM statements") + "=========");
		
		Statements statements=new Statements();
			statements.setStaname(staname);
			System.out.println(staname);
			statements.setStaupperrow(staupperrow);
			System.out.println(staupperrow);
			statements.setStaleftcol(staleftcol);
			System.out.println(staleftcol);
			statements.setStaheader(staheader.getBytes());
			System.out.println(staheader);
			statements.setStadeptype(stadetype);
			System.out.println(stadetype);
			statements.setStatype(statype);
			System.out.println(statype);
			statements.setStacreator(stacreator);
			System.out.println(stacreator);
			statements.setStacreatetime(stacreatetime);
			System.out.println(stacreatetime);
			System.out.println(statements+"=========================");
			
				return Db.use("statistic").save("statements", statements.toRecord());
	}

	/*
	 * @auth:superzbb
	 * @date:2017/10/19
	 * @params:List
	 * @return:Render
	 * List转Excel
	 */
	public Boolean ListtoExcel(String path,List<Record> records,List<MetaField> items){
		try {
			ExcelUtil.createExcel(path, records, items, null);
			return true;
		} catch (WriteException e) {
			// TODO 自动生成的 catch 块
			e.printStackTrace();
			return false;
		} catch (IOException e) {
			// TODO 自动生成的 catch 块
			e.printStackTrace();
			return false;
		}
	}
	
	/*
	 * @auth superzbb
	 * @date 2017/10/23
	 * @params file menuCode
	 * @return boolean
	 */
	public void compareExcelData(File file,final String tableName,String objectCode, String pkName, String menuName){
		List<Record> datas = Db.use("statistic").find("select * from "+tableName+" where state != '删除'");
		List<Record> columns = Db.use("eova").find("select en,cn from eova_field where object_code = '"+objectCode+"'");
		List<Record> excelDatas = new ArrayList<Record>();//Excel数据
		final List<Record> add = new ArrayList<Record>();//新登
		final List<Record> change = new ArrayList<Record>();//变更
		final List<Record> delete = new ArrayList<Record>();//删除
		String uuid = UUID.randomUUID().toString();
		try {
			Workbook wb = WorkbookFactory.create(file);
			Sheet sheet = wb.getSheetAt(0);
			Row head = sheet.getRow(0);
			int minColIx = head.getFirstCellNum();
			int maxColIx = head.getLastCellNum();
			List<String> col = new ArrayList<String>();
			for(int headNum=minColIx;headNum<maxColIx;headNum++){
				String headName = head.getCell(headNum).getStringCellValue();
				for(int i=0;i<columns.size();i++){
					if(columns.get(i).getStr("cn").equals(headName)){
						col.add(columns.get(i).getStr("en"));
						break;
					}
				}
			}
			for(int rowNum=1;rowNum<=sheet.getLastRowNum();rowNum++){
				Row hr = sheet.getRow(rowNum);
				Record r = new Record();
				minColIx = hr.getFirstCellNum(); 
				maxColIx = hr.getLastCellNum();
				for(int i=minColIx,j=0;i<maxColIx;i++,j++){
					String cellValue = hr.getCell(i).getStringCellValue();
					r.set(col.get(j), cellValue);
				}
				excelDatas.add(r);
			}
			for(int m=0;m<excelDatas.size();m++){
				//遍历Excel数据
				Record newData = excelDatas.get(m);
				for(int n=0;n<datas.size();n++){
					//遍历数据库原有数据
					Record oldData = datas.get(n);
					Boolean changed = false;
					if(newData.getStr(pkName).trim().equals(oldData.getStr(pkName).trim())){
						//找到已有数据（变更or正常）
						for(int k=0;k<col.size();k++){
							//遍历每一个数据项
							if(!newData.get(col.get(k)).equals(oldData.get(col.get(k)))){
								//变更
								changed = true;
								oldData.set(col.get(k), oldData.get(col.get(k))+"@#");
								newData.set(col.get(k), newData.get(col.get(k))+"@#");
							}
						}
					//datas.remove(n);
					//excelDatas.remove(m);
					}
					if(changed){
						oldData.set("state", "变更前");
						oldData.set("uuid",uuid);
						newData.set("state", "变更后");
						newData.set("uuid", uuid);
						change.add(oldData);
						change.add(newData);
					}
				}
			}
			//add=excelDatas;
			//delete=datas;
			for(int a=0;a<excelDatas.size();a++){
				Record e = excelDatas.get(a);
				int state = 0;
				for(int b=0;b<datas.size();b++){
					Record d = datas.get(b);
					if(e.getStr(pkName).trim().equals(d.getStr(pkName).trim())){
						state = 1;
						break;
					}
				}
				if(state == 0){
					e.set("state", "新登");
					e.set("uuid", uuid);
					add.add(e);
				}
			}
			for(int a=0;a<datas.size();a++){
				Record d = datas.get(a);
				int state = 0;
				for(int b=0;b<excelDatas.size();b++){
					Record e = excelDatas.get(b);
					if(e.getStr(pkName).trim().equals(d.getStr(pkName).trim())){
						state = 1;
						break;
					}
				}
				if(state == 0){
					d.set("state", "删除");
					d.set("uuid", uuid);
					delete.add(d);
				}
			}
			//插入记录
			Boolean succeed = true;
				try{
					Db.use("statistic").update("truncate table "+tableName+"_temp");
					for(int a=0;a<add.size();a++){
						Db.use("statistic").save(tableName+"_temp", add.get(a));
					}
				    for(int b=0;b<change.size();b++){	
						Db.use("statistic").save(tableName+"_temp", change.get(b));
					}
					for(int c=0;c<delete.size();c++){
						Db.use("statistic").save(tableName+"_temp", delete.get(c));
					}
				}catch(Exception e){
					//System.out.println("数据存入临时表报错啦！！！");
					succeed = false;
					e.printStackTrace();
					Db.use("statistic").update("truncate table "+tableName+"_temp");
					Record temp = new Record();
					temp.set(pkName, "false");
					Db.use("statistic").save(tableName, temp);
				}
				if(succeed){
					DictImportRecord dir = new DictImportRecord();
					dir.set("dict_name", menuName);
					dir.set("addNum", "0");
					dir.set("deleteNum", "0");
					dir.set("changeNum","0");
					dir.set("uuid", uuid);
					Db.use("statistic").update("update "+tableName+" set state = '正常' where state != '正常' and state != '删除'");
					Db.use("statistic").save("dict_import_record", dir.toRecord());
				}
		} catch (Exception e) {
			// TODO 自动生成的 catch 块
			e.printStackTrace();
			Db.use("statistic").update("truncate table "+tableName+"_temp");
			Record temp = new Record();
			temp.set(pkName, "false");
			Db.use("statistic").save(tableName, temp);
		}
		
	}
}
