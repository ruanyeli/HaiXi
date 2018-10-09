package com.oss.service;

import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;

public class DepartmentService {
	
	public List<Record> ListDepartment(){
		return Db.use("statistic").find("select * from department");
	}
}
