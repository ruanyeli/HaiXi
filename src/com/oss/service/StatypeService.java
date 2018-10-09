package com.oss.service;

import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;

public class StatypeService {

	/**
	 * 根据部门id与类型号，返回报表类型信息
	 */
	public List<Record> findStattype(Integer statdepartment){
		return Db.use("statistic").find("select A.statid,B.typename from statype A left join stattype_dict B on A.stattype=B.stattype where A.statdepartment=? ", statdepartment);
	}
}
