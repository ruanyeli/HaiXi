package com.oss.service;

import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;

public class StatementService {
	
	public Record getStatements(int statementid){
		return Db.use("statistic").findFirst("select * from statements where staid=?", statementid);
	}

	/**
	 * 管理员可以看到所有部门的
	 * @param departmentid
	 * @return
	 */
	public List<Record> getStatementsByDepartment(int departmentid){
		try {
			if(departmentid>0){
				return Db.use("statistic").find("select concat(A.staid,'-',B.stattype) as staid ,A.staname,B.stattype from  statements A left join statype B on A.stadeptype=B.statid where B.statdepartment=? and A.statype=1", departmentid);
			}else{
				return Db.use("statistic").find("select concat(A.staid,'-',B.stattype) as staid ,A.staname,B.stattype from  statements A left join statype B on A.stadeptype=B.statid where A.statype=1");
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}
	
	public Record getStatementType(int statementid){
		return Db.use("statistic").findFirst("select B.stattype from statements A left join statype B on A.stadeptype=B.statid where A.staid=?",statementid);
	}
	
	/**
	 * 根据id取报表名字
	 * @param staid
	 * @return
	 */
	public String getStatementname(Integer staid){
		return Db.use("statistic").findFirst("select staname from statements where staid=?", staid).getStr("staname");
	}
	
	/**
	 * 獲取所有有數據的報表的模板
	 * @return
	 */
	public List<Record> ListAllHaveDataStatement(Integer depid){
		return Db.use("statistic").find("select staid,staname from statements_view where statdepartment = ?",depid);
	}
	
	public boolean HaveSameName(String staname,Integer stadeptype){
		return !Db.use("statistic").find("select * from statements where staname=? and stadeptype=?",staname,stadeptype).isEmpty();
	}

	/**
	 * 获取所有有数据且有左表头的报表模板
	 * @param depid
	 * @return
	 */
	public Object ListAllHaveLeftAndDataStatement(Integer depid,Integer type) {
		return Db.use("statistic").find("select staid,staname from statements_view where statdepartment = ? and statype =1 and stattype = ?",depid,type);
		/*return Db.use("statistic").find("select distinct A.staid,A.staname from statements A left join "
				+ "stages B on A.staid=B.stagestatement left join statype C on A.stadeptype=C.statid "
				+ "where A.statype=1 and B.stagestatement is not null and C.statdepartment=?",depid);*/
	}
	
}
