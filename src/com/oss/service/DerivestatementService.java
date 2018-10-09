package com.oss.service;

import java.util.List;

import com.alibaba.fastjson.JSON;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
//import com.oss.model.Derivestatement;


public class DerivestatementService {
	
	public long addDestatement(String dename,int detype,int dedepartment,int derow,int decol){
		Record derivestatement=new Record();
		derivestatement.set("dename", dename);
		derivestatement.set("detype",detype);
		derivestatement.set("dedepartment",dedepartment);
		derivestatement.set("derow", derow);
		derivestatement.set("decol", decol);
		Db.use("statistic").save("derivestatement", "deid",derivestatement);
		return derivestatement.getLong("deid");
	}
	
	public void editDestatement(Long deid,String dename,int detype,int dedepartment,int derow,int decol){
		Record derivestatement=new Record();
		derivestatement.set("deid", deid);
		derivestatement.set("dename", dename);
		derivestatement.set("detype",detype);
		derivestatement.set("dedepartment",dedepartment);
		derivestatement.set("derow", derow);
		derivestatement.set("decol", decol);
		Db.use("statistic").save("derivestatement", "deid",derivestatement);
	}
	
	/**
	 * 添加表头，返回表头deheadid
	 * @param deheadname
	 * @param deid
	 * @param deheadlocation
	 * @param rowspan
	 * @param colspan
	 * @return
	 */
	public boolean addDeheader(String deheadname,Long deid,String deheadlocation,Integer rowspan,Integer colspan){
		Record deheader=new Record();
		deheader.set("deheadname", deheadname);
		deheader.set("deheadstatement", deid);
		deheader.set("deheadlocation", deheadlocation);
		deheader.set("deheadrowspan", rowspan);
		deheader.set("deheadcolspan", colspan);
		return Db.use("statistic").save("deheader", "deheadid",deheader);
	}
	
	/**
	 * 添加公式
	 * @param fastaid
	 * @param falocation
	 * @param facontent
	 * @return
	 */
	public boolean addFormula(Long fastaid,String falocation,String facontent){
		Record formula=new Record();
		formula.set("fastaid", fastaid);
		formula.set("falocation", falocation);
		formula.set("facontent", facontent);
		return Db.use("statistic").save("formula", "faid",formula);
	}
	
	/**
	 * 根据部门返回衍生报表，如果是管理员则返回所有
	 * @param depid
	 * @return
	 */
	public List<Record> getDestatement(Integer depid){
		if(depid==0){
			return Db.use("statistic").find("select * from derivestatement");
		}else{
			return Db.use("statistic").find("select * from derivestatement where dedepartment=?",depid);
		}
	}
	
	/**
	 * 获取某衍生报表的表头信息
	 * @param deid
	 * @return
	 */
	public List<Record> getHeadList(Long deid){
		return Db.use("statistic").find("select * from deheader where deheadstatement=?",deid);
	}
	
	/**
	 * 返回衍生报表的公式信息
	 * @param deid
	 * @return
	 */
	public List<Record> getformulaList(Long deid){
		return Db.use("statistic").find("select * from formula where fastaid=?",deid);
	}
	
}
