/**
 * oymz
 */
package com.oss.service;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.oss.model.Operator;

public class OperatorService {

	public boolean addOperator(String orname,Integer orstatement,Integer orleft,Integer orupper,String orstagename,Integer orstage,Integer orastastage,Integer stattype, Integer ordepartment){
		Operator operator=new Operator();
		operator.setOrname(orname);
		operator.setOrstatement(orstatement);
		operator.setOrleft(orleft);
		operator.setOrupper(orupper);
		operator.setOrstagename(orstagename);
		operator.setOrstage(orstage);
		operator.setOrstastage(orastastage);
		operator.setStattype(stattype);
		operator.setOrdepartment(ordepartment);
		return Db.use("statistic").save("operator","orid", operator.toRecord());
	}
	
	public boolean editOperator(Long orid,String orname,Integer orstatement,Integer orleft,Integer orupper,String orstagename,Integer orstage,Integer ordepartment, Integer orstastage, Integer stattype){
		Record operator=Db.use("statistic").findFirst("select * from operator where orid=?",orid);
		operator.set("orname", orname);
		operator.set("orstatement",orstatement);
		operator.set("orleft",orleft);
		operator.set("orupper",orupper);
		operator.set("orstagename",orstagename);
		operator.set("orstage",orstage);
		operator.set("ordepartment",ordepartment);
		operator.set("orstastage", orstastage);
		operator.set("stattype", stattype);
		return Db.use("statistic").update("operator","orid", operator);
	}
	
	public boolean deleteOperator(Long orid){
		return Db.use("statistic").deleteById("operator", "orid",orid);
	}
	
	/**
	 * 添加时判断是否有重复的算子名
	 * @param orname
	 * @return
	 */
	public boolean haveSameOperatorname(String orname){
		return !Db.use("statistic").find("select orname from operator where orname like ?",orname).isEmpty();
	}
	
	/**
	 * 修改算子的时候判断是否有重复的算子名，除了自身外的
	 * @param orid
	 * @param orname
	 * @return
	 */
	public boolean haveSameOperatorname(Long orid, String orname){
		return !Db.use("statistic").find("select orname from operator where orid<>? and orname like ?",orid,orname).isEmpty();
	}
	
	public Record showOperator(Long orid){
		return Db.use("statistic").findFirst("select A.orid,A.orname,F.depname,B.staname,D.leftstruct,C.uppstruct,A.orstage,A.orstagename from operator A  LEFT JOIN statements B on A.orstatement=B.staid LEFT JOIN upper C ON A.orupper=C.uppid  LEFT JOIN `left` D ON A.orleft=D.leftid LEFT JOIN statype E ON B.stadeptype=E.statid LEFT JOIN department F ON F.depid=E.statdepartment where A.orid=?",orid);
	}
	
	public Record showOperatorUpdate(Long orid){
		return Db.use("statistic").findFirst("select A.*,C.statdepartment from operator A left join statements B on A.orstatement=B.staid left join statype C on B.stadeptype=C.statid where A.orid=?", orid);
	}
	
}
