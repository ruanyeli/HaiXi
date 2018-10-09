
package com.oss.service;

import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;

public class UpperService {

	public List<Record> getUpperByStaid(int staid){
		return Db.use("statistic").find("select * from upper where uppstatement=?",staid);
	}
	
	public List<Record> getUpperByStaitNoLeft(int staid){
		return Db.use("statistic").find("select * from upper where uppstatement=? limit 1,999",staid);
	}
	
	public Record getUpperById(int upperid){
		return Db.use("statistic").findFirst("select * from upper where uppid=?",upperid);
	}
	
}