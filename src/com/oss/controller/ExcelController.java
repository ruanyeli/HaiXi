package com.oss.controller;

import java.io.File;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.alibaba.fastjson.JSONArray;
import com.eova.config.EovaConfig;
import com.eova.model.MetaField;
import com.jfinal.aop.Before;
import com.jfinal.core.Controller;
import com.jfinal.json.FastJson;
import com.jfinal.kit.JsonKit;
import com.jfinal.log.Log;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.jfinal.plugin.activerecord.tx.Tx;
import com.oss.service.ExcelService;

public class ExcelController extends Controller {
	private Log log = Log.getLog(getClass());
	private ExcelService es = new ExcelService();
	private String path = "./webapp/tempFile/";
	public void downloadExcel(){
		log.info("ExcelControl开始下载文件");
		String fileName = getPara(0);
		String filePath = EovaConfig.props.get("excelHome") + File.separator + fileName + ".xls";
		File excel = new File(filePath);
		if (excel.exists()) {
			renderFile(excel);
		} else {
			renderJson("下载失败");
		}
	}
	
	/*
	 * @auth superzbb
	 * @date 2017/10/19
	 * @params tableName 表名称 , dataSource 数据源 , objectCode 对象编码 , menuName 菜单名称
	 * @return boolean
	 * 全表生成Excel通用方法
	 */
	public void generateExcel(){
		String tableName = getPara("tableName");
		String dataSource = getPara("dataSource");
		String objectCode = getPara("objectCode");
		String menuName = getPara("menuName");
		//System.out.println(tableName+":"+dataSource);
		List<Record> records= Db.use(dataSource).find("select * from "+tableName+" where state != '删除'");
		List<MetaField> items = MetaField.dao.find("select * from eova.eova_field where object_code = '"+objectCode+"' and en != 'uuid'and en != 'state' and en!= 'currenttime'");
		Boolean bool = es.ListtoExcel(path+File.separator+menuName+".xls",records, items);
		renderJson(bool);
	}
	
	/*
	 * @auth superzbb
	 * @date 2017/10/20
	 * @return boolean
	 * 下载生成的Excel
	 */
	public void outputExcel(){
		String menuName = getPara("menuName");
		String filePath = path+File.separator+menuName+".xls";
		File f = new File(filePath);
		if(f.exists()){
			//bool = c.downloadZip(zip);
			renderFile(f);
		}else{
			renderJson(Boolean.FALSE);
		}
	}
	
	/*
	 * @auth superzbb
	 * @date 2017/10/23
	 * @params menuCode
	 * 基本单位名录库中跳转导入Excel文件选择页面
	 */
	public void chooseExcel(){
		String tableName = getPara("tableName");
		String objectCode = getPara("objectCode");
		String pkName = getPara("pkName");
		String menuName = getPara("menuName");
		setAttr("tableName", tableName);
		setAttr("objectCode", objectCode);
		setAttr("pkName", pkName);
		setAttr("menuName", menuName);
		render("/menu/ExcelImportandOutput/input.html");
	}
	
	/*
	 * @auth superzbb
	 * @date 2017/10/23
	 * @params file
	 */
	public void importExcelData(){
		final File file = getFile("file").getFile();
		final String tableName = getPara("tableName");
		final String objectCode = getPara("objectCode");
		final String pkName = getPara("pkName");
		final String menuName = getPara("menuName");
		Thread t = new Thread(new Runnable() {
			
			@Override
			public void run() {
				// TODO 自动生成的方法存根
				es.compareExcelData(file, tableName, objectCode, pkName, menuName);
			}
		});
		t.start();
		renderText("Excel提交中，请稍后点击‘查看导入结果’查看！");;
	}
	
	/*
	 * @auth superzbb
	 * @date 2017/10/26
	 * @params tableName pkName
	 * 跳转导入结果展示页面
	 */
	public void showImportResult(){
		String tableName = getPara("tableName");
		String pkName = getPara("pkName");
		String objectCode = getPara("objectCode");
		Record r = Db.use("statistic").findFirst("select * from "+tableName+"_temp");
		List<Record> columns = new ArrayList<Record>();
		Record r1 = new Record();
		r1.set("field", "ck");
		r1.set("checkbox",true);
		columns.add(r1);
		Record r2 = new Record();
		r2.set("field","state");
		r2.set("title", "状态");
		columns.add(r2);
		List<Record> columnsDb = Db.use("eova").find("select en field,cn title from eova_field where object_code = '"+objectCode+"' and en <> 'state' and en <> 'uuid'");
		columns.addAll(columnsDb);
		try{
			if(r.getStr(pkName).equals("false")){
				//数据导入出错
				renderText("Excel数据导入出错，请联系管理员！！！");
			}else{
				setAttr("tableName", tableName);
				setAttr("pkName", pkName);
				setAttr("columns", JsonKit.toJson(columns));
				render("/menu/DictImportResult/showImportResult.html");
			}
		}catch(Exception e){
			e.printStackTrace();
			renderText("请先导入Excel！！！");
		}
	}
	
	/*
	 * @auth superzbb
	 * 获取新登数据
	 */
	public void getAddRecord(){
		String tableName = getPara("tableName");
		List<Record> add = Db.use("statistic").find("select * from "+tableName+"_temp where state = '新登'");
		renderJson(JsonKit.toJson(add));
	}
	
	/*
	 * @auth superzbb
	 * 获取删除数据
	 */
	public void getDeleteRecord(){
		String tableName = getPara("tableName");
		List<Record> delete = Db.use("statistic").find("select * from "+tableName+"_temp where state = '删除'");
		renderJson(JsonKit.toJson(delete));
	}
	
	/*
	 * @auth superzbb
	 * 获取变更数据
	 */
	public void getChangeRecord(){
		String tableName = getPara("tableName");
		List<Record> change = Db.use("statistic").find("select * from "+tableName+"_temp where state like '变更%'");
		renderJson(JsonKit.toJson(change));
	}
	
	/*
	 * @auth superzbb
	 * 新登入库(status=0)or放弃新登(status=1)
	 */
	@SuppressWarnings("unchecked")
	@Before(Tx.class)
	public void confirmAdd() throws Exception{
		String rows = getPara("rows");
		String tableName = getPara("tableName");
		String pkName = getPara("pkName");
		int status = getParaToInt("status");
		JSONArray rowsJson = JSONArray.parseArray(rows);
		List<Record> rowsRecord = new ArrayList<Record>();
		for(int i=0;i<rowsJson.size();i++){
			rowsRecord.add(new Record().setColumns(FastJson.getJson().parse(rowsJson.get(i).toString(), Map.class)));
		}
		Boolean bool = true;
		for(int i=0;i<rowsRecord.size();i++){
			if(status == 0){
				bool = Db.use("statistic").save(tableName, rowsRecord.get(i));
				bool = Db.use("statistic").save(tableName+"_history", pkName, rowsRecord.get(i));
			}
			bool = Db.use("statistic").delete(tableName+"_temp", pkName,rowsRecord.get(i));
		}
		try{
			if(status == 0){
				Db.use("statistic").update("update dict_import_record set addNum = addNum+"+rowsRecord.size()+" where uuid = '"+rowsRecord.get(0).getStr("uuid")+"'");
			}
		}catch(Exception e){
			e.printStackTrace();
			bool = false;
		}
		renderJson(bool);
	}

	/*
	 * @auth superzbb
	 * 确认删除(status=0)or放弃删除(status=1)
	 */
	@SuppressWarnings("unchecked")
	@Before(Tx.class)
	public void confirmDelete() throws Exception{
		String rows = getPara("rows");
		String tableName = getPara("tableName");
		String pkName = getPara("pkName");
		int status = getParaToInt("status");
		JSONArray rowsJson = JSONArray.parseArray(rows);
		List<Record> rowsRecord = new ArrayList<Record>();
		for(int i=0;i<rowsJson.size();i++){
			rowsRecord.add(new Record().setColumns(FastJson.getJson().parse(rowsJson.get(i).toString(), Map.class)));
		}
		Boolean bool = true;
		for(int i=0;i<rowsRecord.size();i++){
			if(status == 0){
				rowsRecord.get(i).set("state","删除");
				bool = Db.use("statistic").update(tableName,pkName, rowsRecord.get(i));
				bool = Db.use("statistic").save(tableName+"_history", pkName, rowsRecord.get(i));
			}
			bool = Db.use("statistic").delete(tableName+"_temp", pkName,rowsRecord.get(i));
		}
		try{
			if(status == 0){
				Db.use("statistic").update("update dict_import_record set deleteNum = deleteNum+"+rowsRecord.size()+" where uuid = '"+rowsRecord.get(0).getStr("uuid")+"'");
			}
		}catch(Exception e){
			e.printStackTrace();
			bool = false;
		}
		renderJson(bool);
	}
	
	/*
	 * @auth superzbb
	 * 保存变更
	 */
	@Before(Tx.class)
	public void confirmChange() throws Exception{
		String rows = getPara("rows");
		String tableName = getPara("tableName");
		String pkName = getPara("pkName");
		JSONArray rowsJson = JSONArray.parseArray(rows);
		List<Record> rowsRecord = new ArrayList<Record>();
		for(int i=0;i<rowsJson.size();i++){
			rowsRecord.add(new Record().setColumns(FastJson.getJson().parse(rowsJson.get(i).toString(), Map.class)));
		}
		Boolean bool = true;
		for(int i=0;i<rowsRecord.size();i++){
			Record r = rowsRecord.get(i);
			r.set("state", "变更");
			bool = Db.use("statistic").update(tableName,pkName, r);
			Db.use("statistic").update("delete from "+tableName+"_temp where "+pkName+" = '"+rowsRecord.get(i).getStr(pkName)+"'");
			bool = Db.use("statistic").save(tableName+"_history", pkName, rowsRecord.get(i));
		}
		try{
			Db.use("statistic").update("update dict_import_record set changeNum = changeNum+"+rowsRecord.size()+" where uuid = '"+rowsRecord.get(0).getStr("uuid")+"'");
		}catch(Exception e){
			e.printStackTrace();
			bool = false;
		}
		renderJson(bool);
	}
	
	/*
	 * @auth superzbb
	 * @params rows
	 * 跳转字典库图表分析界面
	 */
	public void showDictChart(){
		System.out.println("sssssss");
		String rows = getPara("rows");
		JSONArray rowsJson = JSONArray.parseArray(rows);
		List<Record> rowsRecord = new ArrayList<Record>();
		for(int i=0;i<rowsJson.size();i++){
			rowsRecord.add(new Record().setColumns(FastJson.getJson().parse(rowsJson.get(i).toString(), Map.class)));
		}
		Set<String> set = new HashSet<String>();
		for(int i=0;i<rowsRecord.size();i++){
			set.add(rowsRecord.get(i).getStr("dict_name"));
		}
		if(set.size()>1){
			renderText("只能选择一个字典库生成图表！");
		}else{
			setAttr("rows", JsonKit.toJson(rowsRecord));
			render("/menu/DictAnalysis/showChart.html");
		}
	}
	
	/*
	 * @auth superzbb
	 * @date 2017/10/31
	 * 历史导入详情
	 */
	public void showHistoryDetail(){
		String uuid = getPara("uuid");
		String dictName = getPara("dictName");
		Record r = Db.use("eova").findFirst("select table_name,code from eova_object where name = '"+dictName+"'");
		String tableName = r.getStr("table_name");
		String objectCode = r.getStr("code");
		List<Record> columns = new ArrayList<Record>();
		Record r1 = new Record();
		r1.set("field","state");
		r1.set("title", "状态");
		columns.add(r1);
		List<Record> columnsDb = Db.use("eova").find("select en field,cn title from eova_field where object_code = '"+objectCode+"' and en <> 'state' and en <> 'uuid'");
		columns.addAll(columnsDb);
		setAttr("uuid", uuid);
		setAttr("tableName", tableName);
		setAttr("columns", JsonKit.toJson(columns));
		render("/menu/DictAnalysis/showDetail.html");
	}
	
	/*
	 * @auth superzbb
	 * @date 2017/10/31
	 * 展示历史详情
	 */
	public void getHistoryDetail(){
		String tableName = getPara("tableName");
		String uuid = getPara("uuid");
		String way = getPara("way");
		List<Record> result = Db.use("statistic").find("select * from "+tableName+"_history where uuid = '"+uuid+"' and state = '"+way+"'");
		renderJson(JsonKit.toJson(result));
	}
	
}

