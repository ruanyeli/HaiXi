package com.oss.service;

import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;

public class ChartService {
	
	public List<Record> ListChart() {
		return Db.use("eova").find("select * from chart_info");
	}

	public Record getChart(int chartId) {
		return Db.use("eova").findFirst("select * from chart_info where id=?", chartId);
	}
	

}
