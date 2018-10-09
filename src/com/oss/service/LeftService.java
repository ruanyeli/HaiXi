package com.oss.service;

import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;

public class LeftService {
	
	/**
	 * 取leftname，只取可以显示的即leftshow=1的
	 * @param staid
	 * @return
	 */
	 public List<Record> getLeftListByStaid(int staid){
		 return Db.use("statistic").find("select leftname  as '指标' from `left` where leftshow=1 and leftstatement=?",staid);
	 }
	 
	 public List<Record> getLeftList(int staid){
		 return Db.use("statistic").find("select leftid,leftname,leftstruct from `left` where leftstatement=?",staid);
	 }
}
