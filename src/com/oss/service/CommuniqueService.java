package com.oss.service;

import java.util.List;
import java.util.Map;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;

public class CommuniqueService {
	
	private StageService stageService = null;
	
	/*
	 * 根据指标的基本信息以及时间范围，获取指标的数据信息
	 * @param indexs : 指标的基本信息，数据格式：
	 * [{statementId:352,stageName:青海省-海西州,upperId:815,leftId:1537},{},...]
	 * 返回值数据格式：
	 * [{statementId:352,stageName:青海省-海西州,upperId:815,leftId:1537,
	 * stagesList:[{stageid:6789,year:,halfyear:,season:,month:,normal:},{},...],
	 * indexData:[{_815:,stageid:6789},{},...]},{},...]
	 */
	public List<Map<String,Object>> getChartData(List<Map<String,Object>> indexs,
			String startTime,String endTime){
		stageService = new StageService();
		for(Map<String,Object> index : indexs){
			String statementId = (String)index.get("statementId");
			String stageName = (String)index.get("stageName");
			List<Record> stagesList = stageService.getStagesByStatementAndStagename(statementId, stageName, startTime, endTime);
			index.put("stagesList", stagesList);
			String stageids = "";
			for(Record stage : stagesList){
				stageids = stageids + stage.getInt("stageid") + ",";
			}
			stageids = stageids.substring(0,stageids.length()-1);
			
			String upperId = (String)index.get("upperId");
			String leftId = (String)index.get("leftId");
			List<Record> indexData = Db.use("statistic").find("select _"+upperId+",stageid from datatable_"+statementId+" "
					+ "where leftid = "+leftId+" and stageid in("+stageids+")");
			index.put("indexData", indexData);
		}
		
		return indexs;
	}
	
	
}
