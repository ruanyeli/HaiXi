package com.oss.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.jfinal.core.Controller;
import com.jfinal.kit.JsonKit;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.oss.kit.BaseResponse;
import com.oss.kit.ResultCodeEnum;

public class RulestateController extends Controller {
	
	/**
	 * 保存新建规则衍生报表
	 */
	public void addRulestate(){
		String rename=this.getPara("rename");
		Integer retype=this.getParaToInt("retype");
		Integer restaid=this.getParaToInt("restaid");
		Integer stattype=this.getParaToInt("stattype");
		Integer redepartment=this.getParaToInt("redepartment");
		Integer rerow=this.getParaToInt("rerow");
		Integer recol=this.getParaToInt("recol");
		String rules=this.getPara("rules");//单元格中填写的规则
		String reformulas=this.getPara("reformulas");//单元格里面填写的公式或者是文本
		String reheader=this.getPara("rowandcol");//表头信息
		Integer restage=this.getParaToInt("restage");//衍生报表的维度信息
		BaseResponse response=new BaseResponse();
		try {
			if(rename==null||reheader==null||restaid==null||stattype==null||retype==null||redepartment==null||rerow==null||recol==null||restage==null){
				response.setResult(ResultCodeEnum.DATA_ERROR);
			}else{
				if(haveSameName(rename)){
					response.setResult(ResultCodeEnum.HAVE_SAMENAME);
				}else{
					final JSONArray ruleList=JSON.parseArray(rules);
					final JSONArray reformulaList=JSON.parseArray(reformulas);
					final JSONArray headerList=JSONArray.parseArray(reheader);
					if(headerList.size()<1||(ruleList.size()<1&&reformulaList.size()<1)){//判断除了上表头和左表头外的单元格里面是否有内容，如果没有，则该表没有意义不应该保存
						response.setResult(ResultCodeEnum.DATA_ERROR);
					}else{
						Record rulestatement=new Record();
						rulestatement.set("rename",rename);
						rulestatement.set("retype",retype);
						rulestatement.set("redepartment",redepartment);
						rulestatement.set("rerow",rerow);
						rulestatement.set("recol",recol);
						rulestatement.set("restage", restage);//报表也要统计维度
						rulestatement.set("restaid", restaid);//报表也要统计维度
						Db.use("statistic").save("rulestatement","reid" ,rulestatement);
						Long reid=rulestatement.getLong("reid");
						//保存表头
						for (Object header : headerList) {
							JSONObject header0=(JSONObject)header;
							Record headRecord=new Record();
							headRecord.setColumns(header0);
							headRecord.set("reheadstatement",reid);
							Db.use("statistic").save("reheader","reheadid",headRecord);
						}
						//添加规则
						for (Object rule0 : ruleList) {//保存规则
							JSONObject rule=(JSONObject)rule0;
							Record ruleRecord=new Record();
							Integer reupper=rule.getInteger("reupper");
							ruleRecord.set("reupper", reupper);
							String reconstraints=rule.getString("reconstraint");
							String reconstraint="";
							String[] reconstraintList1=reconstraints.split("\\&");
							String[] reconstraintList2=reconstraints.split("\\|");
							if(reconstraints==null||reconstraints.equals("")){
								reconstraint+="1=1";
							}else{
								if(reconstraintList1.length<=1){//单条件或者条件是|
									if(reconstraintList2.length<=1){//单条件
										reconstraint+="_"+reupper+reconstraints;
									}else{
										reconstraint+="_"+reupper+reconstraintList2[0];
										for (int i=1;i< reconstraintList2.length;i++) {
											reconstraint+=" or "+"_"+reupper+reconstraintList2[i];
										}
									}
								}else{
									reconstraint+="_"+reupper+reconstraintList1[0];
									for (int i=1;i< reconstraintList1.length;i++) {
										reconstraint+=" and "+"_"+reupper+reconstraintList1[i];
									}
								}
							}
							System.out.println(reconstraint);
							ruleRecord.set("reconstraint",reconstraint);
							ruleRecord.set("retype", rule.getInteger("retype"));
							ruleRecord.set("reposition", rule.getInteger("reposition"));
							ruleRecord.set("restaid", restaid);
							ruleRecord.set("restate", reid);
							ruleRecord.set("stattype", stattype);
							ruleRecord.set("refunction", Integer.parseInt(rule.getString("refunction")));
							Db.use("statistic").save("rules", ruleRecord);
						}
						for (Object reformula0 : reformulaList) {//保存公式
							JSONObject reformula=(JSONObject)reformula0;
							Record reformu=new Record();
							reformu.setColumns(reformula);
							reformu.set("restate", reid);
							Db.use("statistic").save("reformula", "refid",reformu);
						}
						response.setResult(ResultCodeEnum.SUCCESS);
					}
				}
			}
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
			response.setResult(ResultCodeEnum.DATABASE_ERROR);
		}
		renderJson(response);
	}

public void deleteRulestate(){
	Long restate=this.getParaToLong("restate");
	BaseResponse response=new BaseResponse();
	if(restate==null){
		response.setResult(ResultCodeEnum.DATA_ERROR);
	}else{
		try {
			List<Record> rules=Db.use("statistic").find("select * from rules where restate=?",restate);
			List<Record> reheaders=Db.use("statistic").find("select * from reheader where reheadstatement=?",restate);
			List<Record> reformula=Db.use("statistic").find("select * from reformula where restate=?",restate);
			for (Record record : rules) {
				Db.use("statistic").delete("rules","restate" ,record);
			}
			for (Record record : reformula) {
				Db.use("statistic").delete("reformula","restate", record);
			}
			for (Record record : reheaders) {
				Db.use("statistic").delete("reheader", "reheadstatement",record);
			}
			Db.use("statistic").deleteById("rulestatement", "reid", restate);
			response.setResult(ResultCodeEnum.SUCCESS);
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
			this.renderJson(false);
		}
	  }
		this.renderJson(response);
	}

	public void showRuleReportStage(){
		Integer reid=this.getParaToInt("reid");
//		System.out.println("衍生报表："+reid);
		Integer restage=this.getParaToInt("restage");
		String rename="'"+this.getPara("rename")+"'";
		BaseResponse response=new BaseResponse();
		try {
			Integer restaid=Db.use("statistic").findFirst("select restaid from rulestatement where reid=?",reid).getInt("restaid");
//			System.out.println("原报表："+restaid);
			Integer stattype=Db.use("statistic").findFirst("select stattype from statements_view where staid=?",restaid).getInt("stattype");
			List<Record> year=Db.use("statistic").find("select `year` from stages where stagestatement=?",restaid);
			System.out.println(JSONArray.toJSONString(year));
			Integer startyear=Db.use("statistic").findFirst("select min(`year`) startyear from stages where stagestatement=?",restaid).getInt("startyear");
			System.out.println(startyear);
			Integer endyear=Db.use("statistic").findFirst("select max(`year`) endyear from stages where stagestatement=?",restaid).getInt("endyear");
			System.out.println(endyear);
			if(stattype<restage){
				response.setResult(ResultCodeEnum.STAGE_ERROE);
				renderJson(response);
				return;
			}
			if(year==null){
				response.setResult(ResultCodeEnum.LIST_IS_NULL);
				renderJson(response);
				return ;
			}
			setAttr("endyear",endyear);
			setAttr("startyear",startyear);
			setAttr("reid", reid);
			setAttr("restaid",restaid);
			setAttr("restage",restage);
			setAttr("rename",rename);
			render("/eova/auth/ruleReportStage.html");
		} catch (Exception e) {
			response.setResult(ResultCodeEnum.DATABASE_ERROR);
			renderJson(response);
			return ;
		}
	}
	
	/**
	 * 统计衍生报表数据展示
	 */
	public void getRuleReportData(){
		BaseResponse response=new BaseResponse();
		Long reid=this.getParaToLong("reid");
		Integer restage=this.getParaToInt("restage");
		String rename=this.getPara("rename");
		String start=this.getPara("start");
		String end=this.getPara("end");
		Integer restaid=this.getParaToInt("restaid");
		if(reid==null||restage==null||start==null||end==null||rename==null||restaid==null){
			response.setResult(ResultCodeEnum.DATA_ERROR);
			renderJson(response);
			return;
		}else{
			//页面先填写表头，然后是规则定义的值，再填写值和公式
			List<Record> headers=Db.use("statistic").find("select * from reheader where reheadstatement=?",reid);
			List<Record> formulas=Db.use("statistic").find("select * from reformula where restate=?",reid);
			List<Record> colrules=Db.use("statistic").find("select * from rules where restate=? and retype=1 order by reposition",reid);
			List<Map<String, Object>> values=new ArrayList<Map<String,Object>>(); //存规则得到的值
			
			//找到衍生报表的行列数量
			Integer rowNum=Db.use("statistic").findFirst("select rerow from rulestatement where reid=?",reid).getInt("rerow");
			
			//遍历列规则，找到对应的上表头
			for(int i=0;i<colrules.size();i++){
				
				String selectStr="select ";
				String fromStr=" from datatable_"+restaid+" ";
				List<Record> stages=null;
				if(colrules.get(i).getInt("stattype")==0&&restage==0){
					stages=Db.use("statistic").find("select stageid from stages where `year`>=? and `year`<=?",Integer.parseInt(start),Integer.parseInt(end));
				}else if(colrules.get(i).getInt("stattype")==1){
					if(restage==0){
						stages=Db.use("statistic").find("select stageid from stages where `year`>=? and `year`<=?",Integer.parseInt(start),Integer.parseInt(end));
					}else if(restage==1){
						stages=Db.use("statistic").find("select stageid from stages where STR_TO_DATE(CONCAT(`year`,'-',halfyear),'%Y-%m')>=STR_TO_DATE(?,'%Y-%m') and STR_TO_DATE(CONCAT(`year`,'-',halfyear),'%Y-%m')<=STR_TO_DATE(?,'%Y-%m')",start.replace(",", "-"),end.replace(",", "-"));
					}
				}else if(colrules.get(i).getInt("stattype")==2){
					if(restage==0){
						stages=Db.use("statistic").find("select stageid from stages where `year`>=? and `year`<=?",Integer.parseInt(start),Integer.parseInt(end));
					}else if(restage==1){
						stages=Db.use("statistic").find("select stageid from stages where STR_TO_DATE(CONCAT(`year`,'-',season),'%Y-%m')>=STR_TO_DATE(?,'%Y-%m') and STR_TO_DATE(CONCAT(`year`,'-',season),'%Y-%m')<=STR_TO_DATE(?,'%Y-%m')",start.split(",")[0]+"-"+(start.split(",")[1].equals("1")?1:2),end.split(",")[0]+"-"+(end.split(",")[1].equals("1")?2:4));
					}else if(restage==2){
						stages=Db.use("statistic").find("select stageid from stages where STR_TO_DATE(CONCAT(`year`,'-',season),'%Y-%m')>=STR_TO_DATE(?,'%Y-%m') and STR_TO_DATE(CONCAT(`year`,'-',season),'%Y-%m')<=STR_TO_DATE(?,'%Y-%m')",start.replace(",", "-"),end.replace(",", "-"));
					}
				}else if(colrules.get(i).getInt("stattype")==3){
					if(restage==0){
						stages=Db.use("statistic").find("select stageid from stages where `year`>=? and `year`<=?",Integer.parseInt(start),Integer.parseInt(end));
					}else if(restage==1){
						stages=Db.use("statistic").find("select stageid from stages where STR_TO_DATE(CONCAT(`year`,'-',`month`),'%Y-%m')>=STR_TO_DATE(?,'%Y-%m') and STR_TO_DATE(CONCAT(`year`,'-',`month`),'%Y-%m')<=STR_TO_DATE(?,'%Y-%m')",start.split(",")[0]+"-"+(start.split(",")[1].equals("1")?1:6),end.split(",")[0]+"-"+(end.split(",")[1].equals("1")?6:12));
					}else if(restage==2){
						stages=Db.use("statistic").find("select stageid from stages where STR_TO_DATE(CONCAT(`year`,'-',`month`),'%Y-%m')>=STR_TO_DATE(?,'%Y-%m') and STR_TO_DATE(CONCAT(`year`,'-',`month`),'%Y-%m')<=STR_TO_DATE(?,'%Y-%m')",start.split(",")[0]+"-"+(Integer.parseInt(start.split(",")[1])*3),end.split(",")[0]+"-"+(Integer.parseInt(end.split(",")[1])*3));
					}else if(restage==3){
						stages=Db.use("statistic").find("select stageid from stages where STR_TO_DATE(CONCAT(`year`,'-',`month`),'%Y-%m')>=STR_TO_DATE(?,'%Y-%m') and STR_TO_DATE(CONCAT(`year`,'-',`month`),'%Y-%m')<=STR_TO_DATE(?,'%Y-%m')",start.replace(",", "-"),end.replace(",", "-"));
					}
				}
				if(stages==null){//如果查到没有对应的期数，证明没有数据，直接返回
					return;
				}
				Integer refunction=colrules.get(i).getInt("refunction");//获取计算方式
				switch(refunction){
				case 0:
					selectStr+=" cast(cellvalue as char) as cellvalue from (select _"+colrules.get(i).getInt("reupper")+" as cellvalue ";//原值，不做计算
					break;
				case 1:
					selectStr+=" cast(sum(cellvalue) as char) as cellvalue from (select SUM(_"+colrules.get(i).getInt("reupper")+") as cellvalue ";
					break;
				case 2:
					selectStr+=" cast(avg(cellvalue) as char) as cellvalue from (select AVG(_"+colrules.get(i).getInt("reupper")+") as cellvalue ";//平均值
					break;
				case 3:
					selectStr+=" cast(VAR(cellvalue) as char) as cellvalue from (select VAR(_"+colrules.get(i).getInt("reupper")+") as cellvalue ";//方差
					break;
				case 4:
					selectStr+=" cast(STDEV(cellvalue) as char) as cellvalue from (select STDEV(_"+colrules.get(i).getInt("reupper")+") as cellvalue ";//标准差
					break;
				case 5:
					selectStr+=" cast(cellvalue as char) as cellvalue from (select MAX(_"+colrules.get(i).getInt("reupper")+") as cellvalue ";//标准差
					break;
				case 6:
					selectStr+=" cast(cellvalue as char) as cellvalue from (select MIN(_"+colrules.get(i).getInt("reupper")+") as cellvalue ";//标准差
					break;
				case 7:
					selectStr+=" cast(sum(cellvalue) as char) as cellvalue from (select count(_"+colrules.get(i).getInt("reupper")+") as cellvalue ";//标准差
					break;
				}
				
				String colconstraint=colrules.get(i).getStr("reconstraint");
				int colindex=colrules.get(i).getInt("reposition");//excel列坐标
				String whereStr=" where ";
				whereStr+="("+colconstraint+") and (";
				whereStr+="stageid="+stages.get(0).getInt("stageid");
				for(int k=1;k<stages.size();k++){
					whereStr+=" or stageid="+stages.get(k).getInt("stageid")+" ";
				}
				whereStr+=") and";
				//逐行遍历行规则
				for(int row=0;row<rowNum;row++){
					String row_whereStr="";
					String position=row+"@#"+colindex;
					Map<String ,Object> cellValue=new HashMap<String ,Object>();
					cellValue.put("position", position);
					String groupStr=" group by (";
					List<Record> rows=Db.use("statistic").find("select * from rules where restate=? and reposition=? and retype=0",reid,row);
					if(rows.size()<1) continue;//有可能是表头
					System.out.println("restate:"+reid+"---"+"reposition:"+row);
					System.out.println("rows"+JsonKit.toJson(rows));
					groupStr+="_"+rows.get(0).getInt("reupper");
					row_whereStr+=" ("+rows.get(0).getStr("reconstraint")+") ";
					for(int j=1;j<rows.size();j++){
						row_whereStr+=" and ("+rows.get(j).getStr("reconstraint")+") ";
						groupStr+=",_"+rows.get(j).getInt("reupper");
					}
					groupStr+=") ";
					String sqlStr=selectStr+fromStr+whereStr+row_whereStr+groupStr+") as t";
					Record record = Db.use("statistic").findFirst(sqlStr);
					System.out.println(record);
					System.out.println(record.get("cellvalue"));
					String value=record.getStr("cellvalue");
					cellValue.put("value", value);
					values.add(cellValue);
				}
				
			}
			setAttr("reheader", JsonKit.toJson(headers));
			setAttr("reformula", JsonKit.toJson(formulas));
			setAttr("revalue",JsonKit.toJson(values));
			render("/eova/auth/showRuleReport.html");
		}
	}
	
	public boolean haveSameName(String name){
		if(Db.use("statistic").find("select `rename` from rulestatement where `rename`=?",name).isEmpty()){
			return false;
		}
		return true;
	}
	
}
