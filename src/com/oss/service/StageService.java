package com.oss.service;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;

public class StageService {
	
	public List<Record> getStageData(int stageid,int statementid,List<Record> colnames){
		
		//在datatable中找出col 的名字
//		List<Record> colnames=Db.use("statistic").find("select  column_name from Information_schema.columns  where table_Name =?","datatable_"+statementid);
	    
		StringBuffer selectStr=new StringBuffer("select ");
		selectStr.append(colnames.get(0).getStr("column_name"));
		for(int i=1;i<colnames.size();i++){
			selectStr.append(", ifnull("+colnames.get(i).getStr("column_name")+",' ') as "+colnames.get(i).getStr("column_name"));
		}
		return Db.use("statistic").find(selectStr.append(" from datatable_? where stageid=?").toString(),statementid,stageid);
	}
	
	/**
	 * oymz
	 * 获取某一期全行业的指标
	 * @param stageid
	 * @param statementid
	 * @param upperid 
	 * @return
	 */
	public List<Record> getStageIndexData(int stageid,int statementid,int upperid){
		return Db.use("statistic").find("select _? from datatable_? where stageid=?",upperid,statementid,stageid);
	}
	
	/**
	 * 获取所有地区的报表
	 * @param statementid
	 * @return
	 */
	public List<Record> getStageByStaid(int statementid){
		return Db.use("statistic").find("select stageid,year,month,season,halfyear,normal from stages where stagestatement=? order by year ,month,season,halfyear,normal",statementid);
	}
	
	/**
	 * 获取不同地区的报表
	 * @param statementid
	 * @param stagename
	 * @return
	 */
	public List<Record> getStageByStaidAndStagename(int statementid,String stagename){
		return Db.use("statistic").find("select stageid,year,month,season,halfyear,normal from stages where stagestatement=? and stagename=? order by year ,month,season,halfyear,normal",statementid,stagename);
	}
	
	/**
	 * 返回某报表下的所有地区名
	 * @param staid
	 * @return
	 */
	public List<Record> getStagenameByStaid(Integer staid){
		return Db.use("statistic").find("select distinct stagename from stages where stagestatement=?",staid);
	}

	/**
	 * oymz
	 * 有左表头的报表查询
	 * @param stageid
	 * @param statementid
	 * @return
	 */
	
	public List<Record> getStageIncludeLeftData(Integer stageid, Integer statementid,List<Record> colnames) {
//		List<Record> colnames=Db.use("statistic").find("select  column_name from Information_schema.columns  where table_Name =?","datatable_"+statementid);	
	
		StringBuffer selectStr=new StringBuffer("select B.leftname as ");
		selectStr.append(colnames.get(1).getStr("column_name")).append(", ");
		StringBuffer fromStr=new StringBuffer(" from datatable_? A left join `left` B on A.leftid=B.leftid where A.stageid=? order by A.leftid ");
		selectStr.append("ifnull(A.").append(colnames.get(2).getStr("column_name")+",' ') as "+colnames.get(2).getStr("column_name"));
		for (int i=3;i<colnames.size()-2;i++) {
			selectStr.append(",");
			selectStr.append("ifnull(A.").append(colnames.get(i).getStr("column_name")+",' ') as "+colnames.get(i).getStr("column_name"));
		}		
		
		 List<Record> dataList=Db.use("statistic").find(selectStr.append(fromStr).toString(),statementid,stageid);		
		 return dataList;


		
		
	}
	
	/**
	 * oymz
	 * 根据stageid查询期数内容
	 * @param stageid
	 * @return
	 */
	public Record getStageByStageid(Integer stageid){
		try {
			return Db.use("statistic").findFirst("select * from stages where stageid=?", stageid);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}
	
	/**
	 * oymz
	 * 工业部门的选择期数范围内的报表期数，只考虑年报与月报
	 * @param stagetype
	 * @param staid
	 * @param startStages
	 * @param endStages
	 * @param stagename 
	 * @return
	 */
	public List<Record> getUseStageList(int stagetype,int staid,String startStages,String endStages, String stagename){
//		System.out.println(" "+stagetype+" "+staid+" "+startStages.toString()+" "+endStages.toString()+" ");
		switch(stagetype){
		case 0://年报
			return Db.use("statistic").find("select stageid,`year` from stages where stageid IN(SELECT stageid FROM datatable_"+staid+") and stagename=? and stagestatement=? and `year`>=? and `year`<=? order by `year`",stagename,staid,startStages,endStages);
		case 3://月报
			return Db.use("statistic").find("select stageid,`year`,`month` from stages where stagename=? and stagestatement=? and stageid IN(SELECT stageid FROM datatable_"+staid+") and STR_TO_DATE(CONCAT(`year`,'-',`month`),'%Y-%m')>=STR_TO_DATE(?,'%Y-%m') and STR_TO_DATE(CONCAT(`year`,'-',`month`),'%Y-%m')<=STR_TO_DATE(?,'%Y-%m')"
					+ "order by `year` ,`month`",stagename,staid,startStages.replace(",", "-"),endStages.replace(",", "-"));
		case 2://季报
			return Db.use("statistic").find("select stageid,`year`,season from stages where stagename=? and stagestatement=? and stageid IN(SELECT stageid FROM datatable_"+staid+") and STR_TO_DATE(CONCAT(`year`,'-',season),'%Y-%m')>=STR_TO_DATE(?,'%Y-%m') and STR_TO_DATE(CONCAT(`year`,'-',season),'%Y-%m')<=STR_TO_DATE(?,'%Y-%m')"
					+ "order by `year` ,season",stagename,staid,startStages.replace(",", "-"),endStages.replace(",", "-"));
		case 1://半年报
			return Db.use("statistic").find("select stageid,`year`,halfyear from stages where stagename=? and stagestatement=? and stageid IN(SELECT stageid FROM datatable_"+staid+") and STR_TO_DATE(CONCAT(`year`,'-',halfyear),'%Y-%m')>=STR_TO_DATE(?,'%Y-%m') and STR_TO_DATE(CONCAT(`year`,'-',halfyear),'%Y-%m')<=STR_TO_DATE(?,'%Y-%m')"
					+ "order by `year` ,halfyear",stagename,staid,startStages.replace(",", "-"),endStages.replace(",", "-"));
		case 4:
			return Db.use("statistic").find("select stageid,normal from stages where stageid IN(SELECT stageid FROM datatable_"+staid+") and stagename=? and stagestatement=? and normal>=? and normal<=?",stagename,startStages,endStages); 
		default:return null;
		}
	}
	
	/**
	 * oymz
	 * 获取指标分析的期数对应的数据表
	 * @param useStages
	 * @param statementid
	 * @param stagetype
	 * @param upperid
	 * @return
	 */
	public List<Record> getStageIndexDataList(List<Record> useStages ,int statementid,int stagetype,int upperid){
		int stagenum=useStages.size();
		System.out.println("有效期数："+stagenum);
		String colname="";
		Record firstStageData=useStages.get(0);
		if(stagetype==0){
			colname=colname+firstStageData.getInt("year")+"年";//列名
		}else if(stagetype==3){
			int month=firstStageData.getInt("month");
			String mon="";
			if(month<10){
				mon="0"+month;
			}else{
				mon=""+month;
			}
			colname=colname+firstStageData.getInt("year")+"年"+mon+"月";	
		}else if(stagetype==1){
			colname=colname+firstStageData.getInt("year")+"年"+(firstStageData.getInt("halfyear")==1?"上半年":"下半年");
		}else if(stagetype==2){
			String season="";
			switch(firstStageData.getInt("season")){
			case 1:season+="第1季度";break;
			case 2:season+="第2季度";break;
			case 3:season+="第3季度";break;
			case 4:season+="第4季度";break;
			}
			colname=colname+firstStageData.getInt("year")+"年"+season;
		}else{
			SimpleDateFormat sdf=new SimpleDateFormat("yyyy-MM-dd");
			colname=colname+sdf.format(firstStageData.getDate("normal"));
		}
		//select
		StringBuffer selectStr=new StringBuffer("");
		selectStr.append(" select ifnull(A1.").append("_").append(upperid).append(",' ') as ").append(colname);
		//from
		StringBuffer fromStr=new StringBuffer("");
		fromStr.append(" from datatable_").append(statementid).append(" A1 ");
		//where
		StringBuffer whereStr=new StringBuffer();
		whereStr.append(" where A1.stageid=").append(firstStageData.getInt("stageid"));
		
		//往sql语句中添加期
		for(int i=1;i<stagenum;i++){
			int k=i+1;
			Record stageData=useStages.get(i);
			//列名即期名
			String colname0="";
			if(stagetype==0){
				colname0=colname0+stageData.getInt("year")+"年";//列名
			}else if(stagetype==3){
				int month=stageData.getInt("month");
				String mon="";
				if(month<10){
					mon="0"+month;
				}else{
					mon=""+month;
				}
				colname0=colname0+stageData.getInt("year")+"年"+mon+"月";	
			}else if(stagetype==1){
				colname0=colname0+stageData.getInt("year")+"年"+(stageData.getInt("halfyear")==1?"上半年":"下半年");
			}else if(stagetype==2){
				String season="";
				switch(stageData.getInt("season")){
				case 1:season+="第1季度";break;
				case 2:season+="第2季度";break;
				case 3:season+="第3季度";break;
				case 4:season+="第4季度";break;
				}
				colname0=colname0+stageData.getInt("year")+"年"+season;
			}else{
				SimpleDateFormat sdf=new SimpleDateFormat("yyyy-MM-dd");
				colname0=colname0+sdf.format(stageData.getDate("normal"));
			}
			//扩展select的范围
			selectStr.append(",ifnull(A").append(k).append("._").append(upperid).append(",' ') as ").append(colname0);
			//扩展from的范围
			fromStr.append(" left join datatable_").append(statementid).append(" A").append(k).append(" on A1.leftid=").append("A").append(k).append(".leftid");
			//扩展where的范围
			whereStr.append(" and A").append(k).append(".stageid=").append(stageData.getInt("stageid"));
		}
		//selectStr.append(",A").append(stagenum+1).append(".leftname ");
		fromStr.append(" left join `left` A").append(stagenum+1).append(" on A1.leftid=A").append(stagenum+1).append(".leftid");
		return Db.use("statistic").find(selectStr.toString()+fromStr.toString()+whereStr.toString());
	}
	
	/**
	 * oymz
	 * 判断是否有期数相同的年报
	 * @param staid
	 * @param year
	 * @return
	 */
	public boolean IsExistStage(String area,int staid,int year){
		System.out.println("是否存在："+!Db.use("statistic").find("select * from stages where stagename=? and stagestatement=? and year=?",area,staid,year).isEmpty());
		return !Db.use("statistic").find("select * from stages where stagename=? and stagestatement=? and `year`=?",area,staid,year).isEmpty(); 
		
	}
	
	/**
	 * oymz
	 * 判断是否有期数相同的月报
	 * @param staid
	 * @param year
	 * @param month
	 * @return
	 */
	public boolean IsExistMonthStage(String area,int staid,int year,int month){
		System.out.println(!Db.use("statistic").find("select * from stages where stagename=? and stagestatement=? and `year`=? and `month`=?",area,staid,year,month).isEmpty() );
		return !Db.use("statistic").find("select * from stages where stagename=? and stagestatement=? and `year`=? and `month`=?",area,staid,year,month).isEmpty(); 
		
	}
	
	/**
	 * oymz
	 * 判断是否有期数相同的季报
	 * @param staid
	 * @param year
	 * @param season
	 * @return
	 */
	public boolean IsExistSeasonStage(String area,int staid,int year,int season){
		return !Db.use("statistic").find("select * from stages where stagename=? and stagestatement=? and `year`=? and season=?",area,staid,year,season).isEmpty();
	}
	
	/**
	 * oymz
	 * 判断是否有期数相同的半年报
	 * @param staid
	 * @param year
	 * @param halfyear
	 * @return
	 */
	public boolean IsExistHalfyearStage(String area,int staid,int year,int halfyear){
		return !Db.use("statistic").find("select * from stages where stagename=? and stagestatement=? and `year`=? and halfyear=?",area,staid,year,halfyear).isEmpty();
	}
	
	/**
	 * oymz
	 * 判断是否有期数相同的常规报
	 * @param staid
	 * @param normal
	 * @return
	 */
	public boolean IsExistStage(String area,int staid,String normal){
		return !Db.use("statistic").find("select * from stages where stagename=? and stagestatement=? and `year`=? and normal=?",area,staid,normal).isEmpty();
	}
	
	/*
	 * 根据所属报表stagestatement、期名stagename以及时间范围查询期数
	 * @stagestatement ： 所属报表
	 * @stagename ： 期名
	 * @startTime @endTime : 时间范围
	 */
	public List<Record> getStagesByStatementAndStagename(String stagestatement,String stagename,
			String startTime,String endTime){
//		String selectStr = "select stageid,year,halfyear,season,month,normal from stages "
//				+ "where stagestatement = "+stagestatement+" and stagename = '"+stagename+"' "
//				+ "and str_to_date(CONCAT(year,'-',month), '%Y-%m-%d %H') "
//				+ "between str_to_date('"+startTime+"', '%Y-%m-%d %H') and str_to_date('"+endTime+"', '%Y-%m-%d %H') "
//				+ "order by year,halfyear,season,month";
		String selectStr = "select stageid,year from stages "
				+ "where stagestatement = "+stagestatement+" and stagename = '"+stagename+"' "
				+ "and year >= "+startTime+" and year <= "+endTime+" "
				+ "and halfyear is null and season is null and month is null and normal is null order by year";
		return Db.use("statistic").find(selectStr);
	}

	public List<Record> getStageIncludeLeftColName(Integer stageid,
			Integer statementid) {
		List<Record> colnames=Db.use("statistic").find("select  column_name from Information_schema.columns  where table_Name =?","datatable_"+statementid);	

		return colnames;
	}

	public Record getuppfieldname(String colid) {
		Record uppfieldname=Db.use("statistic").findFirst("select * from upper where uppid=?", colid);
		return uppfieldname;
	}

	public Boolean isfloat(int statementid, int startcol,int stageid) {//
		Record DataType=Db.use("statistic").findFirst("select "+"_"+startcol+" from "+" datatable_"+statementid+ " where stageid = "+stageid);
		System.out.println("datatype ="+DataType);
		int index;
		String dataType=DataType.get("_"+startcol);
		if(dataType!=null){
			index=dataType.indexOf(".");
			if(index!=-1)//有小数点
			return true;
			else 
				return false;
		}
		return false;
		// TODO Auto-generated method stub
		
	}
}
