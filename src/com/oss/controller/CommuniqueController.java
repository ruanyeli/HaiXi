package com.oss.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.jfinal.core.Controller;
import com.jfinal.kit.JsonKit;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.oss.service.CommuniqueService;
public class CommuniqueController extends Controller{
	
	private CommuniqueService communiqueService = null;
	
	public void addCommunique(){
		render("/menu/Communique/new_communique.html");
	}
	public void saveCommunique(){
		String id=getPara("id");
		String title=getPara("title");
		String content=getPara("content");
		String time=getPara("time");
		String type=getPara("communiquetype");
		List<Record> ids = Db.use("statistic").find("select id from communique");
		boolean isExist=true;
		for (Record record : ids) {
			System.out.println(record);
					if(id==record.get("id"))
					{
						isExist=false;
						renderJson("{\"isExist\":0}");
						System.out.println("增加一条公报模板失败，已存id为！"+id+"的模板");
						break;
					}		
			}
		if(isExist==true)
		{
			Record communique = new Record().set("id", id).set("title", title).set("updateTime", time).set("editorText", content).set("type", type);
			Db.use("statistic").save("communique", communique);
			System.out.println("增加一条id为"+id+"的公报模板！");
			renderJson("{\"isExist\":1}");
		}
	}
	public void editCommunique()
	{
		String id=getPara("id");
		String returnType=getPara("returnType");
		Record result = Db.use("statistic").findById("communique",Integer.parseInt(id));
		String title=result.get("title");
		String content=result.get("editorText");
		String type=result.get("type");
		System.out.println(content);
		setAttr("id",id);
		setAttr("title",title);
		setAttr("content","'"+content+"'");
		setAttr("type",type);
		if(returnType.equals("preview"))
		{
			String picName=getPara("picName");
			setAttr("picName",picName);
			render("/menu/preview_communique.html");
		}
		else if(returnType.equals("edit"))
		{
			render("/menu/Communique/edit_communique.html");
		}
		else if(returnType.equals("view"))
		{
			render("/menu/Communique/view_communique.html");
		}
		else if(returnType.equals("data_analysis"))
		{
			renderJson(result);
		}
		
	}
	public void updateCommunique(){
		String id=getPara("id");
		String title=getPara("title");
		String content=getPara("content");
		String time=getPara("time");
		String type=getPara("communiquetype");
		Record communique =Db.use("statistic").findById("communique", Integer.parseInt(id)).set("id", id).set("title", title).set("updateTime", time).set("editorText", content).set("type", type); 
		Db.use("statistic").update("communique", communique);
		System.out.println("成功修改一条id为"+id+"的公报模板！");

		renderJson();
	}
	public void getCommunique(){
		List<Record> communiques = Db.use("statistic").find("select id,title from communique");
		System.out.println(JsonKit.toJson(communiques));
		renderJson(communiques);
	}
	
	public void getChartData(){
		JSONArray jsonArray = JSONArray.parseArray(getPara("chartIndexs"));
		List<Map<String,Object>> result = new ArrayList<Map<String,Object>>();
		for(int i = 0; i < jsonArray.size();i++){
			Map<String,Object> temp = new HashMap<String,Object>((JSONObject)jsonArray.get(i));
			result.add(temp);
		}
		String startTime = getPara("startTime");
		String endTime = getPara("endTime");
		
		communiqueService = new CommuniqueService();
		communiqueService.getChartData(result, startTime, endTime);
		
		renderJson(result);
	}
}
