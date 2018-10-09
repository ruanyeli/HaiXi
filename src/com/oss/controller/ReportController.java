package com.oss.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.jfinal.core.Controller;
import com.jfinal.kit.JsonKit;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Page;
import com.jfinal.plugin.activerecord.Record;

/** 
 * @author  superzbb 
 * @E-mail: 408873559@qq.com
 * @date 创建时间：2017年11月17日 下午11:41:24 
 */
public class ReportController extends Controller{

	/*
	 * @auth superzbb
	 * @date 2017/11/17
	 */
	public void showOperator(){
		render("/menu/GenerateReport/showOperator.html");
	}
	
	/*
	 * @auth superzbb
	 * @date 2017/11/17
	 */
	public void getOperatorData(){
		int page = getParaToInt("page");
		int rows = getParaToInt("rows");
		Page<Record> operators = Db.use("statistic").paginate(page, rows, "select *", "from operator_view");//Db.use("statistic").find("select * from operator");
		Map map = new HashMap();  
		//按照easyui datagrid 数据封装格式进行二次封装  
		map.put("rows", operators.getList());  
		map.put("total", operators.getTotalRow());  
		renderJson(map);
	}
	
	/*
	 * @auth superzbb
	 * @date 2017/11/20
	 */
	public void chooseStage(){
		String deid = getPara("deid");
		setAttr("deid", deid);
		render("/menu/GenerateReport/GenerateReport.html");
	}
	
	/*
	 * @auth superzbb
	 * @date 2017/11/22
	 */
	public void generateResult(){
		String deid = getPara("deid");//部门
		List<Record> formulas = Db.use("statistic").find("select * from formula where fastaid = '"+deid+"'");//部门公式
		for(int i=0;i<formulas.size();i++){
			//判断公式是否包含算子
			String facontent = formulas.get(i).getStr("facontent");
			System.out.println(facontent);
			if(facontent.indexOf("${")>=0){
				//包含算子
				String regx = "\\$\\{[0-9]*\\}";
				Pattern p = Pattern.compile(regx);
				Matcher m = p.matcher(facontent);
				System.out.println(m);
				//System.out.println(m.group(0));

				while(m.find()){
					String data = "";
					try{
						int operatorId = Integer.parseInt(m.group(0).split("\\$\\{")[1].split("\\}")[0]);
						//算子信息
						Record operator = Db.use("statistic").findFirst("select * from operator where orid = "+operatorId);
						int statementId = operator.getInt("orstatement");
						int stattype = operator.getInt("stattype");//报表类型(0-年报,1-半年报,2-季报,3-月报,4-常规报表)			
						int orstastage = operator.getInt("orstastage");//统计维度(0-年,1-季度,2-月)
						int orstage = operator.getInt("orstage");//比较维度(0-本期,1-环比,2-同比)
						int year,month,season;
						if(orstage == 1){
							//环比
							year = getParaToInt("year");month = getParaToInt("month")-1;season = getParaToInt("season")-1;
						}else if(orstage == 2){
							//同比
							year = getParaToInt("year")-1;month = getParaToInt("month");season = getParaToInt("season");
						}else{
							year = getParaToInt("year");month = getParaToInt("month");season = getParaToInt("season");
						}
						int orleft = operator.getInt("orleft");
						int orupper = operator.getInt("orupper");
						if(orstastage == 0){
							//按年份统计（年，季，月）
							Record rdata = Db.use("statistic").findFirst("select sum(a._"+String.valueOf(orupper)+") as data from datatable_"+statementId+" a inner join stages b on a.stageid = b.stageid where b.year = "+year+" and a.leftid = "+orleft);
							data = rdata.getDouble("data").toString();
						}else if(orstastage == 1){
							//按季度统计（季，月）
							if(stattype == 2){
								//季报
								Record rdata = Db.use("statistic").findFirst("select sum(a._"+String.valueOf(orupper)+") as data from datatable_"+statementId+" a inner join stages b on a.stageid = b.stageid where b.year = "+year+" and a.season = "+season+" and b.leftid = "+orleft);
								data = rdata.getDouble("data").toString();
							}else if(stattype == 3){
								//月报
								String season_month = "";
								if(season == 1)
									season_month = "(1,2,3)";
								else if(season == 2)
									season_month = "(4,5,6)";
								else if(season == 3)
									season_month = "(7,8,9)";
								else if(season == 4)
									season_month = "(10,11,12)";
								Record rdata = Db.use("statistic").findFirst("select sum(a._"+String.valueOf(orupper)+") as data from datatable_"+statementId+" a inner join stages b on a.stageid = b.stageid where b.year = "+year+" and b.month in "+season_month+" and a.leftid = "+orleft);
								data = rdata.getDouble("data").toString();
								
							}
						}else if(orstastage == 2){
							//按月份统计（月）
							Record rdata = Db.use("statistic").findFirst("select sum(a._"+String.valueOf(orupper)+") as data from datatable_"+statementId+" a inner join stages b on a.stageid = b.stageid where b.year = "+year+" and b.month = "+month+" and a.leftid = "+orleft);
							data = rdata.getDouble("data").toString();
						}
						if(data == ""){
							data = "无数据("+m.group(0)+")";
						}
//						//期数信息
//						Record stage = Db.use("statistic").findFirst("select * from stages where stagestatement="+statementId+" and year="+year+" and month="+month);
//						int stageId = stage.getInt("stageid"); 	
//						//具体数据信息
//						Record rdata = Db.use("statistic").findFirst("select * from datatable_"+statementId+" where stageid="+stageId+" and leftid="+orleft);
//						data = rdata.getStr("_"+String.valueOf(orupper));
						System.out.println("data ="+data);
					}catch(Exception e){
						e.printStackTrace();
						data = "无数据("+m.group(0)+")";
					}
					facontent = facontent.replace(m.group(0), data);
				}
				formulas.get(i).set("facontent", facontent);
			}
		}
		setAttr("deid", deid);
		setAttr("formulas", JsonKit.toJson(formulas));
		render("/menu/GenerateReport/GenerateResult.html");
	}
	public void generateResult1(){
		String[] formulas=getPara("formulas").split(",");
		List<String> returnFormulas=new ArrayList<String>();

		System.out.println("formulas:"+formulas);
		//int year = getParaToInt("year");
		for(int i=0;i<formulas.length;i++){
			String formula;
			//判断公式是否包含算子
			String regx1="\\@(.*)\\#";
			Pattern p1 = Pattern.compile(regx1);
			Matcher m1 = p1.matcher(formulas[i]);
			while(m1.find()){
				System.out.println("groupCount is -->" + m1.groupCount());
				formula=m1.group(1);//一个公式
				System.out.println(m1.group(1));
				System.out.println(m1.group(0));

				String regx2 = "\\{[0-9]*\\}";
				Pattern p2 = Pattern.compile(regx2);
				Matcher m2 = p2.matcher(formula);
				while(m2.find()){
					String data = "";
					try{
						int operatorId = Integer.parseInt(m2.group(0).split("\\{")[1].split("\\}")[0]);
						//算子信息
						Record operator = Db.use("statistic").findFirst("select * from operator where orid = "+operatorId);
						int statementId = operator.getInt("orstatement");
						int stattype = operator.getInt("stattype");//报表类型(0-年报,1-半年报,2-季报,3-月报,4-常规报表)			
						int orstastage = operator.getInt("orstastage");//统计维度(0-年,1-季度,2-月)
						int orstage = operator.getInt("orstage");//比较维度(0-本期,1-环比,2-同比)
						int year,month,season;
						int orleft = operator.getInt("orleft");
						int orupper = operator.getInt("orupper");
						
						if(orstage == 1){
							//环比
							year = getParaToInt("year");month = getParaToInt("month")-1;season = getParaToInt("season")-1;
						}else if(orstage == 2){
							//同比
							year = getParaToInt("year")-1;month = getParaToInt("month");season = getParaToInt("season");
						}else{
							year = getParaToInt("year");month = getParaToInt("month");season = getParaToInt("season");
						}
						System.out.println("orstastage:"+orstastage);

						if(orstastage == 0){
							//按年份统计（年，季，月）
							Record rdata = Db.use("statistic").findFirst("select sum(a._"+String.valueOf(orupper)+") as data from datatable_"+statementId+" a inner join stages b on a.stageid = b.stageid where b.year = "+year+" and a.leftid = "+orleft);
							data = (new java.text.DecimalFormat("#.00").format(rdata.getDouble("data"))).toString();
						}else if(orstastage == 1){
							System.out.println("stattype:"+stattype);
							//按季度统计（季，月）
							if(stattype == 2){
								//季报
								Record rdata = Db.use("statistic").findFirst("select sum(a._"+String.valueOf(orupper)+") as data from datatable_"+statementId+" a inner join stages b on a.stageid = b.stageid where b.year = "+year+" and a.season = "+season+" and b.leftid = "+orleft);
								data = rdata.getDouble("data").toString();
								
							}else if(stattype == 3){
								//月报
								String season_month = "";
								if(season == 1)
									season_month = "(1,2,3)";
								else if(season == 2)
									season_month = "(4,5,6)";
								else if(season == 3)
									season_month = "(7,8,9)";
								else if(season == 4)
									season_month = "(10,11,12)";
								Record rdata = Db.use("statistic").findFirst("select sum(a._"+String.valueOf(orupper)+") as data from datatable_"+statementId+" a inner join stages b on a.stageid = b.stageid where b.year = "+year+" and b.month in "+season_month+" and a.leftid = "+orleft);
								data = rdata.getDouble("data").toString();
								
							}
							
						}else if(orstastage == 2){
							//按月份统计（月）
							Record rdata = Db.use("statistic").findFirst("select sum(a._"+String.valueOf(orupper)+") as data from datatable_"+statementId+" a inner join stages b on a.stageid = b.stageid where b.year = "+year+" and b.month = "+month+" and a.leftid = "+orleft);
							data = rdata.getDouble("data").toString();
						}
						if(data == ""){
							data = "无数据("+m2.group(0)+")";
						}

					}catch(Exception e){
						e.printStackTrace();
						data = "无数据("+m2.group(0)+")";
					}
					System.out.println("data:"+data);
					formula= formula.replace(m2.group(0), data);
					
				}
				returnFormulas.add(formula);
			}
		}

		renderJson(returnFormulas);
	}
}


