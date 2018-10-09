package com.oss.controller;

import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.alibaba.fastjson.JSONArray;
import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.oss.service.ChartService;

/**
 * Echart图表控制类
 * 
 * @author bot
 *
 */
public class ChartController extends Controller {

	/**
	 * 根据图表ID返回图表信息JSON
	 */
	public void getChartInfo() {

		ChartService cs = new ChartService();
		Integer id = Integer.parseInt(getPara("id"));
		Record result = cs.getChart(id);

		renderJson(result);

	}

	public void test() {
		// int id = this.getParaToInt("id");
		// System.out.println(id);
		JSONArray test = new JSONArray();
		test.add("aaa");
		renderJson(test);
	}

	// 根据ids get表chart_info的记录
	public void getChartsInfo() {
		String ids = this.getPara("ids");
		// System.out.println(ids);
		List<Record> chartsInfo = Db.use("eova").find("select * from chart_info where id in (" + ids + ")");
		renderJson(chartsInfo);
	}

	// 根据表名以及字段名，返回数据
	public void getIndexsValue() {
		String indexColumns = this.getPara("indexColumns");
		String tablename = this.getPara("tablename");
		String begintime = this.getPara("begintime");
		String endtime = this.getPara("endtime");

		// System.out.println(indexColumns);
		List<Record> indexsValue = Db.use("statistic").find("select year," + indexColumns + " from " + tablename
				+ " where year >= " + begintime + " and year <= " + endtime + " order by year asc");
		renderJson(indexsValue);
	}

	// 返回major_ecomomic_view表的数据
	public void getData() {
		String begintime = this.getPara("begintime");
		String endtime = this.getPara("endtime");
		List<Record> indexsValue = Db.use("statistic").find("select * from major_ecomomic_view where year >= "
				+ begintime + " and year <= " + endtime + " order by year asc");
		renderJson(indexsValue);
	}

	// 返回全省主要经济指标qs_view视图的数据
	public void getQsData() {
		String begintime = this.getPara("begintime");
		String endtime = this.getPara("endtime");
		List<Record> indexsValue = Db.use("statistic").find(
				"select * from qs_view where year >= " + begintime + " and year <= " + endtime + " order by year asc");
		renderJson(indexsValue);
	}

	// 根据tables名称，返回首页地图联动折柱所需的数据
	public void getTablesData() {
		String[] tablesName = this.getParaValues("tablesName[]");
		Calendar date = Calendar.getInstance();
		int year = date.get(Calendar.YEAR);
		// System.out.println(year);
		int beginyear = year-6;
		int endyear = year-1;
		Map<String, Object> result = new HashMap<String, Object>();
		for (int i = 0; i < tablesName.length; i++) {
			List<Record> indexsValue = Db.use("statistic")
					.find("select * from " + tablesName[i] + " where year >= "+ beginyear+" and year <= "+ endyear+" order by year asc");
			result.put(tablesName[i], indexsValue);
		}
		renderJson(result);
	}

	// 根据tables名称，返回首页地图联动折柱所需的数据
	public void getZTablesData() {
		String[] tablesName = this.getParaValues("tablesName[]");
		String beginTime =  this.getPara("begintime");
		//Calendar date = Calendar.getInstance();
		//int year = date.get(Calendar.YEAR);
		//System.out.println("year:" + year);
		Map<String, Object> result = new HashMap<String, Object>();
		for (int i = 0; i < tablesName.length; i++) {
			List<Record> indexsValue = Db.use("statistic")
					.find("select * from " + tablesName[i] + " where year ="+ Integer.parseInt(beginTime) +" order by area asc");
			result.put(tablesName[i], indexsValue);
		}
		renderJson(result);
	}
}
