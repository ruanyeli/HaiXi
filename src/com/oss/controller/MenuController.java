package com.oss.controller;

import java.math.BigDecimal;
import java.util.Date;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.apache.log4j.Logger;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.jfinal.core.Controller;
import com.jfinal.kit.JsonKit;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.oss.kit.BaseResponse;
import com.oss.kit.ResultCodeEnum;
import com.oss.service.ExcelService;
import com.oss.service.LeftService;
import com.oss.service.StageService;
import com.oss.service.StatementService;
import com.oss.service.UpperService;

/**
 * @author superzbb
 * @E-mail: 408873559@qq.com
 * @date 创建时间：2017年9月27日 下午9:56:31
 */
public class MenuController extends Controller {
	private ExcelService excelService = null;
	private UpperService upperService = null;
	private StageService stageService = null;
	private StatementService statementService = null;
	private LeftService leftService = null;

	public MenuController() {
		excelService = new ExcelService();
		upperService = new UpperService();
		stageService = new StageService();
		statementService = new StatementService();
		leftService = new LeftService();
	}

	public void test() {
		setAttr("test", 1);
		render("/menu/test.html");
	}

	/**
	 * oymz 创建新的报表模板 同一部门的报表明不能重复
	 */
	public void createTable() {
		BaseResponse response = new BaseResponse();
		try {
			Integer rowNum = this.getParaToInt("row");// 行数
			Integer colNum = this.getParaToInt("col");// 列数
			Integer upheadColNum = this.getParaToInt("upheadColNum");// 上表头的列数
			Integer leftheadRowNum = this.getParaToInt("leftheadRowNum");// 左表头的行数
			String header = this.getPara("rowandcol");// 表头信息
			Integer stacreator = this.getParaToInt("stacreator");// 报表模板创建者
			String staname = this.getPara("staname");
			Integer stadeptype = this.getParaToInt("stadeptype");// 报表类型
			if (rowNum == null || colNum == null || upheadColNum == null || leftheadRowNum == null || header == null
					|| header.isEmpty() || stacreator == null || staname == null || staname.isEmpty()
					|| stadeptype == null) {
				response.setResult(ResultCodeEnum.DATA_ERROR);
			} else {
				if (statementService.HaveSameName(staname, stadeptype)) {
					response.setResult(ResultCodeEnum.HAVE_SAMENAME);
				} else {
					int leftheadColNum = colNum - upheadColNum;// 左表头的列数
					System.out.println("左表头列数：" + leftheadColNum);
					int statype = 0;
					if (leftheadColNum > 0) {
						statype = 1;
					}
					int upheadRowNum = rowNum - leftheadRowNum;// 总行数-左表头的行数,上表头的行数
					System.out.println("上表头行数：" + upheadRowNum);
					Date statime = new Date();
					// 首先将信息存入statement表里面
					int tableid = excelService.insertOneTable(staname, stacreator, header, upheadRowNum, leftheadColNum,
							statime, statype, stadeptype);// tables中存入一行
					System.out.println("新建报表的id：" + tableid);
					// 初始化上表头名称
					List<String> colName = new ArrayList<String>();// 每一个列的名字置空
					for (int i = 0; i < upheadColNum; i++) {
						String name = "";
						colName.add(name);
					}
					System.out.println("colName is =" + colName);
					// 初始化左表头名称,如果没有的话
					List<String> rowName = new ArrayList<String>();// 每一个行的名字
					for (int i = 0; i < leftheadRowNum; i++) {
						String name = "";
						rowName.add(name);
					}
					System.out.println("左表头行名的个数" + rowName.size());
					// 对表头信息进行解析
					// {"id":"1-0","content":"2","colspan":1,"rowspan":1},
					JSONArray cells = JSONArray.parseArray(header);
					for (Object cell : cells) {
						JSONObject cell0 = JSONObject.parseObject(cell.toString());
						System.out.println("cell0 is" + cell0);
						String ids = cell0.getString("id");
						String content = cell0.getString("content");
						// if(content)
						int colspan = cell0.getInteger("colspan");// 列融合
						int rowspan = cell0.getInteger("rowspan");// 行融合
						String[] idArray = ids.split("-");
						int rowid = Integer.parseInt(idArray[1]);// 行号
						int colid = Integer.parseInt(idArray[0]);// 列号

						// 读表头结构,一层层读上表头的列名
						if (rowid < upheadRowNum) {// 如果这个单元格的行数在上表头行数之内
							if (colid < leftheadColNum) {// 判断单元格是否既不属于上表头也不属于左表头
								continue;
							}
							for (int k = 0; k < colspan; k++) {// k 小于合并的列

								String tempName = colName.get(colid - leftheadColNum + k);// 上表头第colid-leftheadColNum+k列的名字

								if (tempName.equals("")) {
									colName.set(colid - leftheadColNum + k, content);// 将列名存入列表
								} else {
									colName.set(colid - leftheadColNum + k, tempName + "/" + content);// 将列名存入列表
								}
							}
						} else {
							if (colid > leftheadColNum - 1) {// 不属于左表头且超过了列数
								continue;
							}
							for (int k = 0; k < rowspan; k++) {
								String tempName = rowName.get(rowid - upheadRowNum + k);
								if (tempName.equals("")) {
									rowName.set(rowid - upheadRowNum + k, content);
								} else {
									rowName.set(rowid - upheadRowNum + k, tempName + "/" + content);
								}
							}
						}
					}

					// 创建新报表数据存储表
					if (excelService.createOneTable("datatable_" + tableid)) {

						// 插入上表头信息
						for (int j = 0; j < colName.size(); j++) {
							int uppcid = j + leftheadColNum;
							String uppstruct = colName.get(j);
							System.out.println(colName.get(j).lastIndexOf('/'));
							int index = colName.get(j).lastIndexOf('/');
							String uppname = "";
							if (index <= 0) {
								uppname = colName.get(j);
							} else {
								uppname = colName.get(j).substring(index + 1);
							}
							int uppid = excelService.insertOneCol(tableid, uppname, uppstruct, 0, uppcid, statime);
							excelService.createOneCol("_" + uppid, "datatable_" + tableid, 0);// 在数据存储表中新建一列
						}
						// 插入左表头信息
						if (rowName.size() > 0) {
							for (int j = 0; j < rowName.size(); j++) {
								int leftrid = j + upheadRowNum;
								String leftstruct = rowName.get(j);
								int index = rowName.get(j).lastIndexOf('/');
								String leftname = "";
								if (index <= 0) {
									leftname = rowName.get(j);
								} else {
									leftname = rowName.get(j).substring(index);
								}
								excelService.insertOneRow(tableid, leftname, leftstruct, leftrid, statime);
							}
						}
						excelService.createConstraintCol("leftid", "datatable_" + tableid, "left", "leftid");// 新建一列
						excelService.createConstraintCol("stageid", "datatable_" + tableid, "stages", "stageid");// 新建一列
						response.setResult(ResultCodeEnum.SUCCESS);
					}
				}
			}
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
			response.setResult(ResultCodeEnum.INNERERROR);
		}
		this.renderJson(response);
	}

	public void renderExcel() {
		System.out.println("para(0) is " + getPara(0));
		Map<String, String> result = new HashMap<>();
		setAttr("result", getPara(0));
		this.setAttr("result", getPara(0));
		System.out.println(result);
		this.render("/menu/import_data.html");
	}

	/**
	 * oymz 查看报表，点击跳转到报表显示页面
	 */
	public void showReport() {
		BaseResponse response = new BaseResponse();
		try {
			Integer statementid = this.getParaToInt("statementid");
			Integer stageid = this.getParaToInt("stageid");
			if (statementid == null || stageid == null) {
				response.setResult(ResultCodeEnum.DATA_ERROR);
			} else {
				this.setAttr("statementid", statementid);
				this.setAttr("stageid", stageid);
				this.render("/eova/auth/showReport.html");
			}
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
			response.setResult(ResultCodeEnum.INNERERROR);
			this.renderJson(response);
		}
	}

	/**
	 * oymz 返回报表信息
	 */
	public void sendReportData() {
		BaseResponse response = new BaseResponse();
		try {
			Integer statementid = this.getParaToInt("statementid");
			Integer stageid = this.getParaToInt("stageid");
			// 获取列信息
			List<Record> upperList = upperService.getUpperByStaid(statementid);//上表头信息
			// 获取数据表的信息
			Record statement = statementService.getStatements(statementid);// 获取模板信息，主要是staupperrow多少行
			int statype = statement.getInt("statype");//用于判定有无左表头
			// int staleftcol=statement.getInt("staleftcol");//左表头的列数
			List<Record> dataList = new ArrayList<Record>();
			List<Record> colNames = new ArrayList<Record>();
			if (statype == 0) {//无左表头
				colNames=stageService.getStageIncludeLeftColName(stageid, statementid);
				dataList = stageService.getStageData(stageid, statementid,colNames);
			} else {
				colNames=stageService.getStageIncludeLeftColName(stageid, statementid);
				dataList = stageService.getStageIncludeLeftData(stageid, statementid,colNames);
			}
		
//			System.out.println(JsonKit.toJson(dataList));
			Record uppfieldname;
			
			for(int i=1;i<colNames.size()-2;i++){
				String colname_=colNames.get(i).getStr("column_name");
				String[] Str= colname_.split("_");
				String colid=Str[1];
				uppfieldname=stageService.getuppfieldname(colid);
				String colname=uppfieldname.get("uppstruct");
				
				int res=colname.indexOf("%");
				if(res!=-1){//包含%
					for(int index=0;index<dataList.size();index++){	
						try{
						   String data=dataList.get(index).getStr(colname_);	
						   if(!data.equals(" ")){							  
							   double d=Double.valueOf(data.trim()).doubleValue();
							   BigDecimal   b   =   new   BigDecimal(d);  
							   double   f1   =   b.setScale(1,   BigDecimal.ROUND_HALF_UP).doubleValue();  
//							   f1=f1*100;
							   String str_d = Double.toString(f1);
							   str_d +="%";
							   dataList.get(index).set(colname_,str_d);
						   }
						}catch(NumberFormatException e){
						     System.out.println("异常：不是数字");
						 
						}
					}
				}
				if(colname.equals("代码")){
					
				}
			}			
			// 有多少列
			int uppercol = upperList.size();
//			System.out.println(upperList.toString());
			// 有多少行
			int upperrow = statement.getInt("staupperrow");
			// 声明一个Map List数组存每一层表头的信息
			List<List<Map<String, Object>>> headInfo = new ArrayList<List<Map<String, Object>>>();
			// 新建了upperrow个list，存每一层的表头信息
			for (int i = 0; i < upperrow; i++) {
				headInfo.add(new ArrayList<Map<String, Object>>());
			}

			// 将所有的列信息读取出来，分层
			for (int i = 0; i < uppercol; i++) {
				String uppstruct = upperList.get(i).get("uppstruct");// 获取表头结构信息
				String[] uppstructList = uppstruct.split("/");// 分成数组
				int uppid = upperList.get(i).getInt("uppid");// 获取表头所在列的id
				for (int j = 0; j < uppstructList.length; j++) {// 第j层存数据
					String name = uppstructList[j].replaceAll("\\s*","");//替换任意的空白字符
					Map<String, Object> up = new HashMap<String, Object>();
					up.put("name", name);
					up.put("uppid", uppid);
					headInfo.get(j).add(up);
				}
			}
			System.out.println(headInfo.toString());// 打印表头信息，是否有异常
			List<List<Map<String, Object>>> headList = new ArrayList<List<Map<String, Object>>>();// 用来存表头，起始列，结束列的信息，以及行数
			for (int i = 0; i < upperrow; i++) {
				headList.add(new ArrayList<Map<String, Object>>());
			}
			// 将每一层的表头合并
		
			for (int i = 0; i < headInfo.size(); i++) {// 第i层开始
				int j = 0;
				for (j = 0; j < headInfo.get(i).size(); j++) {
					Map<String, Object> record_j = headInfo.get(i).get(j);// 第i层，第j个表头
					String name_j = record_j.get("name").toString();
				
					int uppid_j = (int) record_j.get("uppid");
					int rownum = i;
					int start = uppid_j;// 起始列号为当前列的列id
					
					int end = uppid_j;// 结束的列号也默认为当前的列id
					for (int k = j + 1; k < headInfo.get(i).size(); k++) {
						Map<String, Object> record_k = headInfo.get(i).get(k);// 第i层，第j个表头
						String name_k = record_k.get("name").toString();
						int uppid_k = (int) record_k.get("uppid");
						if (name_k.equals(name_j)) {// 如果列名相同则是和并列
							// System.out.println("列名相同哈哈哈哈哈");
							end = uppid_k;
							j = k + 1;
							continue;
						} else {// 如果不是合并列，就将前一个合并列的uppid作为结束列号,并将j的值设为新的开始列k,并跳出当前循环
							j = k - 1;
							break;
						}
					}
					Map<String, Object> uphead = new HashMap<String, Object>();// 合并列后的表头信息
					uphead.put("name", name_j);
					uphead.put("startcol", start);
					uphead.put("endcol", end);
					uphead.put("rownum", rownum);
					headList.get(i).add(uphead);
				}
				
			}

			// 得到了合并列之后的表头信息后，开始将信息写入columns中
			List<Map<String, Object>> headRecord = headList.get(0);
			List<Map<String, Object>> columns = createHeadInfo(statementid,headList, headRecord, upperrow, 0,stageid);
			Map<String, Object> reportInfo = new HashMap<String, Object>();
			reportInfo.put("columns", columns);
			reportInfo.put("dataList", JsonKit.toJson(dataList));
			System.out.println("columns ="+columns);
			System.out.println("最后的dataList is "+dataList);
			response.setData(reportInfo);			
			response.setResult(ResultCodeEnum.SUCCESS);
		} catch (Exception e) {
			e.printStackTrace();
			response.setResult(ResultCodeEnum.INNERERROR);
		}
		this.renderJson(JSONArray.toJSONString(response));
	}

	/**
	 * oymz columns结构化表头信息
	 * 
	 * @param headList
	 * @param headRecord
	 * @param rownum表头的行数
	 * @param index表头所在的层数，从0开始
	 * @return
	 */
	public List<Map<String, Object>> createHeadInfo(int statementid,List<List<Map<String, Object>>> headList,
			List<Map<String, Object>> headRecord, int rownum, int index,int stageid) {
		if (rownum > index) {
			List<Map<String, Object>> columns = new ArrayList<Map<String, Object>>();
			for (Map<String, Object> record : headRecord) {
				Map<String, Object> headrecord = new HashMap<String, Object>();
//				System.out.println(record.get("name").toString());
				String name = record.get("name").toString();
				int startcol = (int) record.get("startcol");
				int endcol = (int) record.get("endcol");
				headrecord.put("caption", name);
//				System.out.println(headrecord.toString());// 还未加入结构时打印
				List<Map<String, Object>> childheadreal = new ArrayList<Map<String, Object>>();// 真正是这个表头的子节点表头
				if (rownum > index + 1) {// 如果有下层节点，再判断下层节点中是否存在该表头的子节点，有就存入childheadreal
					List<Map<String, Object>> childheadRecord = headList.get(index + 1);
					for (int i = 0; i < childheadRecord.size(); i++) {
						Map<String, Object> record2 = childheadRecord.get(i);
						int startcol2 = (int) record2.get("startcol");
						int endcol2 = (int) record2.get("endcol");
						if (startcol2 >= startcol && endcol2 <= endcol) {
							childheadreal.add(record2);// 有就存入childheadreal
						}
					}
				}
				
				if (childheadreal.size() <= 0) {// 如果没有子节点,去找该列下对应的数据，如果没有小数点，则保留整数。
					headrecord.put("id", "_" + startcol);
					headrecord.put("dataField", "_" + startcol);	
					if(!stageService.isfloat(statementid,startcol,stageid)){//无有小数点
						headrecord.put("format", "0");
					}else{//有小数点
						headrecord.put("format", "0.00");
					}										
				} else {// 有子节点
					List<Map<String, Object>> childcolumns = createHeadInfo(statementid,headList, childheadreal, rownum, index + 1,stageid);// 为该表头节点的每个真正子节点填入信息
					headrecord.put("columns", childcolumns);// 将子节点信息存入父节点的columns里面
				}
				columns.add(headrecord);// 把最上层表头的信息填入columns中
			}
			return columns;
		} else {
			return null;
		}
	}

	/**
	 * oymz 根据部门获取有左表头的报表列表（管理员可以看到所有的报表）
	 */
	public void getStatementListByDepartment() {
		BaseResponse response = new BaseResponse();
		try {
			Integer depid = this.getParaToInt("depid");
			if (depid == null) {
				response.setResult(ResultCodeEnum.DATA_ERROR);
			} else {
				List<Record> statements = statementService.getStatementsByDepartment(depid);
				response.setData(statements);
				response.setResult(ResultCodeEnum.SUCCESS);
			}
		} catch (Exception e) {
			e.printStackTrace();
			response.setResult(ResultCodeEnum.INNERERROR);
		}
		this.renderJson(response);
	}

	/**
	 * oymz 獲取所有有數據的某个部门的報表的模板
	 */
	public void ListAllHaveDataStatement() {
		BaseResponse response = new BaseResponse();
		try {
			Integer depid = this.getParaToInt("depid");
			if (depid == null) {
				response.setResult(ResultCodeEnum.DATA_ERROR);
			} else {
				response.setData(statementService.ListAllHaveDataStatement(depid));
//				System.out.println(JSON.toJSONString(statementService.ListAllHaveDataStatement(depid)));
				response.setResult(ResultCodeEnum.SUCCESS);
			}
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
			response.setResult(ResultCodeEnum.INNERERROR);
		}
		this.renderJson(response);
	}

	/**
	 * 取出所有有数据的且有左表头的报表模板
	 */
	public void ListAllHaveLeftAndDataStatement(){
		BaseResponse response = new BaseResponse();
		try {
			Integer depid = this.getParaToInt("depid");
			Integer type = getParaToInt("type");
			if (depid == null) {
				response.setResult(ResultCodeEnum.DATA_ERROR);
			} else {
				response.setData(statementService.ListAllHaveLeftAndDataStatement(depid,type));
//				System.out.println(JSON.toJSONString(statementService.ListAllHaveDataStatement(depid)));
				response.setResult(ResultCodeEnum.SUCCESS);
			}
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
			response.setResult(ResultCodeEnum.INNERERROR);
		}
		this.renderJson(response);
	}
	
	/**
	 * oymz 獲取所有有數據的某个部门的報表的模板(指定类型)
	 */
	public void ListAllHaveDataStatementByType() {
		BaseResponse response = new BaseResponse();
		try {
			Integer depid = this.getParaToInt("depid");
			Integer stattype=this.getParaToInt("type");
			if (depid == null||stattype==null) {
				response.setResult(ResultCodeEnum.DATA_ERROR);
			} else {
				response.setData(Db.use("statistic").find("select staid,staname from statements_view where statdepartment = ? and stattype=?",depid,stattype));
//				System.out.println(JSON.toJSONString(statementService.ListAllHaveDataStatement(depid)));
				response.setResult(ResultCodeEnum.SUCCESS);
			}
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
			response.setResult(ResultCodeEnum.INNERERROR);
		}
		this.renderJson(response);
	}
	
	/**
	 * oymz 獲取某謳報表的上表頭和左表頭
	 */
	public void getStageAndUpperAndLeft() {
		BaseResponse response = new BaseResponse();
		try {
			Integer staid = this.getParaToInt("staid");
			if (staid == null || staid < 1) {
				response.setResult(ResultCodeEnum.DATA_ERROR);
			} else {
				Record statement = statementService.getStatements(staid);
				List<Record> upperList = null;
				if (statement.getInt("statype") == 0) {
					upperList = upperService.getUpperByStaid(staid);
				} else {
					upperList = upperService.getUpperByStaitNoLeft(staid);
				}
				Record statementtype = statementService.getStatementType(staid);
				List<Record> stageList = stageService.getStageByStaid(staid);
				List<Record> leftList = leftService.getLeftList(staid);
				Map<String, Object> datas = new HashMap<String, Object>();
				datas.put("upperList", upperList);
				datas.put("stageList", stageList);
				datas.put("statementtype", statementtype);
				datas.put("leftList", leftList);
				response.setData(datas);
				response.setResult(ResultCodeEnum.SUCCESS);
			}
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
			response.setResult(ResultCodeEnum.INNERERROR);
		}
		this.renderJson(response);
	}

	/**
	 * oymz 获取确定报表模板id 和地区的stage中的报表
	 */
	public void getStageAndUpper() {
		BaseResponse response = new BaseResponse();
		try {
			Integer staid = this.getParaToInt("staid");
			String stagename = this.getPara("stagename");
			if (staid == null || staid < 1) {
				response.setResult(ResultCodeEnum.DATA_ERROR);
			} else {
				Record statement = statementService.getStatements(staid);
				List<Record> upperList = null;
				if (statement.getInt("statype") == 0) {
					upperList = upperService.getUpperByStaid(staid);
				} else {
					upperList = upperService.getUpperByStaitNoLeft(staid);
				}
				Integer stattype=Db.use("statistic").findFirst("select stattype from statements_view where staid=?",staid).getInt("stattype");
				List<Record> stageList =null;
				switch(stattype){
					case 0:
						stageList=Db.use("statistic").find("SELECT `year` AS stagedate ,concat(`year`,'年') as datename from stages where stagestatement=? AND stagename=? ORDER BY `year`",staid,stagename);
						break;
					case 1:
						stageList=Db.use("statistic").find("SELECT CONCAT('',`year`,'-',halfyear) AS stagedate,concat(`year`,'年',(case halfyear when 1 then '上半年' when 2 then '下半年' end)) as datename from stages where stagestatement=? AND stagename=? ORDER BY `year`,halfyear",staid,stagename);
						break;
					case 2:
						stageList=Db.use("statistic").find("SELECT CONCAT('',`year`,'-',`season`) AS stagedate,concat(`year`,'年第',season,'季度') as datename from stages where stagestatement=? AND stagename=? ORDER BY `year`,`season`",staid,stagename);
						break;
					case 3:
						stageList=Db.use("statistic").find("SELECT CONCAT('',`year`,'-',`month`) AS stagedate,concat(`year`,'年',`month`,'月') as datename from stages where stagestatement=? AND stagename=? ORDER BY `year`,`month`",staid,stagename);
						break;
					case 4:
						stageList=Db.use("statistic").find("SELECT normal AS stagedate,DATE_FORMAT(normal,'Y%年m%月d%日') AS datename from stages where stagestatement=? AND stagename=? ORDER BY normal",staid,stagename);
						break;
				}
				Map<String, Object> datas = new HashMap<String, Object>();
				datas.put("upperList", upperList);
				datas.put("stageList", stageList);
				datas.put("statementtype", stattype);
				response.setData(datas);
				response.setResult(ResultCodeEnum.SUCCESS);
			}
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
			response.setResult(ResultCodeEnum.INNERERROR);
		}
		this.renderJson(response);
	}

	/**
	 * oymz 有左表头的表指标分析
	 */
//	public void getIndexStageData() {
//		BaseResponse response = new BaseResponse();
//		try {
//			Integer staid = this.getParaToInt("staid");
//			Integer startstageid = this.getParaToInt("startstageid");
//			Integer endstageid = this.getParaToInt("endstageid");
//			Integer stagetype = this.getParaToInt("stattype");// 报表类型、年报月报或是季报
//			Integer upperid = this.getParaToInt("upperids");
//			String stagename = this.getPara("stagename");
//			if (staid == null || startstageid == null || endstageid == null || stagetype == null) {
//				response.setResult(ResultCodeEnum.DATA_ERROR);
//			} else {
//				Record startStages = stageService.getStageByStageid(startstageid);
//				Record endStages = stageService.getStageByStageid(endstageid);
//				// System.out.println(startStages.toJson());
//				// System.out.println(endStages.toJson());
//				List<Record> useStages = stageService.getUseStageList(stagetype, staid, startStages, endStages,
//						stagename);// 所要展示的期数
//				Record upper = upperService.getUpperById(upperid);
//				String upperStructName = upper.getStr("uppstruct");
//				// 用List将每一期的指标存起来存起来
//				List<Map<String, Object>> columns = new ArrayList<Map<String, Object>>();// 表头
//				// 设置左表头
//				Map<String, Object> left = new HashMap<String, Object>();
//				left.put("caption", "指标");
//				left.put("id", "leftname");
//				left.put("dataField", "leftname");
//				columns.add(left);
//				// 设置指标对应的大表头
//				Map<String, Object> indexColumns = new HashMap<String, Object>();
//				indexColumns.put("caption", upperStructName);
//				// 设置期数对应的表头
//				List<Map<String, Object>> childColumns = new ArrayList<Map<String, Object>>();
//				List<String> stages = new ArrayList<String>();
//				if (stagetype == 0) {
//					int i = 0;
//					for (Record stage : useStages) {
//						int year = stage.getInt("year");
//						String colname = year + "年";
//						stages.add(colname);
//						Map<String, Object> stageColumns = new HashMap<String, Object>();
//						stageColumns.put("caption", colname);
//						stageColumns.put("id", "stage" + i);
//						stageColumns.put("dataField", colname);
//						stageColumns.put("format", "0.00");
//						childColumns.add(stageColumns);
//						i++;
//					}
//				} else {
//					int i = 0;
//					for (Record stage : useStages) {
//						int year = stage.getInt("year");
//						int month = stage.getInt("month");
//						String colname = year + "年" + month + "月";
//						stages.add(colname);
//						Map<String, Object> stageColumns = new HashMap<String, Object>();
//						stageColumns.put("caption", colname);
//						stageColumns.put("id", "stage" + i);
//						stageColumns.put("dataField", colname);
//						stageColumns.put("format", "0.00");
//						childColumns.add(stageColumns);
//						i++;
//					}
//				}
//				indexColumns.put("columns", childColumns);
//				columns.add(indexColumns);
//				// 指标对应的数据
//				List<Record> indexData = stageService.getStageIndexDataList(useStages, staid, stagetype, upperid);
//				Map<String, Object> dataInfo = new HashMap<String, Object>();
//				dataInfo.put("columns", columns);
//				dataInfo.put("indexData", indexData);
//				dataInfo.put("stages", stages);
//				dataInfo.put("title", upperStructName);
//				response.setData(dataInfo);
//				response.setResult(ResultCodeEnum.SUCCESS);
//			}
//		} catch (Exception e) {
//			// TODO: handle exception
//			e.printStackTrace();
//			response.setResult(ResultCodeEnum.INNERERROR);
//		}
//		this.renderJson(response);
//	}

	/**
	 * oymz 接收参数
	 * [{"statementid":"325-3","upperid":"666,667","startstage":"2005-5","endstage":"2005-9","stagename":"青海省-海西州"},
	 * {"statementid":"352-3","upperid":"815,816","startstage":"2005-4","endstage":"2008-11","stagename":"青海省-海西州"}]
	 */
	public void getIndexData() {
		BaseResponse response = new BaseResponse();
		try {
			String searchStr = this.getPara("searchList");
			System.out.println(searchStr);
			if (searchStr == null || searchStr.isEmpty()) {
				response.setResult(ResultCodeEnum.DATA_ERROR);
			} else {
				JSONArray searchList = JSON.parseArray(searchStr);
				int i=0;
				Map<String,Object> Info=new HashMap<String,Object>();
				List<Map<String,Object>> statementList=new ArrayList<Map<String ,Object>>();
				for ( ;i<searchList.size();i++) {
					JSONObject search=(JSONObject) searchList.get(i);
					String[] state=search.getString("statementid").split("-");
					Integer staid=Integer.parseInt(state[0]);
					Integer stattype=Integer.parseInt(state[1]);
					String[] upperids=search.getString("upperid").split(",");
					String startstage=search.getString("startstage");
					String endstage=search.getString("endstage");
					String stagename=search.getString("stagename");
					List<Record> left=Db.use("statistic").find("select leftname as '指标' from `left` where leftstatement=? order by leftid",staid);
					String statementname=Db.use("statistic").findFirst("select staname from statements where staid=?",staid).getStr("staname");
					List<Record> useStage=null;
					Map<String,Object> statement=new HashMap<String,Object>();
					switch(stattype){
						case 0:
							useStage=Db.use("statistic").find("select stageid,concat(`year`,'年')as stageIndex from stages where stagestatement=? and stagename=? and `year`>=? and `year`<=? order by `year`",staid,stagename,startstage,endstage);
							break;
						case 1:
							useStage=Db.use("statistic").find("select stageid,concat(`year`,'年',(case halfyear when 1 then '上半年' when 2 then '下半年' end))as stageIndex from stages where stagestatement=? and stagename=? and stageid IN(SELECT stageid FROM datatable_"+staid+") and STR_TO_DATE(CONCAT(`year`,'-',halfyear),'%Y-%m')>=STR_TO_DATE(?,'%Y-%m') and STR_TO_DATE(CONCAT(`year`,'-',halfyear),'%Y-%m')<=STR_TO_DATE(?,'%Y-%m')"
									+ "order by `year` ,halfyear",staid,stagename,startstage,endstage);
							break;
						case 2:
							useStage=Db.use("statistic").find("select stageid,concat(`year`,'年第',season,'季度')as stageIndex from stages where stagename=? and stagestatement=? and stageid IN(SELECT stageid FROM datatable_"+staid+") and STR_TO_DATE(CONCAT(`year`,'-',season),'%Y-%m')>=STR_TO_DATE(?,'%Y-%m') and STR_TO_DATE(CONCAT(`year`,'-',season),'%Y-%m')<=STR_TO_DATE(?,'%Y-%m')"
									+ "order by `year` ,season",stagename,staid,startstage,endstage);
							break;
						case 3:
							useStage=Db.use("statistic").find("select stageid,if((`month`)<10,concat(`year`,'年0',`month`,'月'),concat(`year`,'年',`month`,'月'))as stageIndex from stages where stagename=? and stagestatement=? and stageid IN(SELECT stageid FROM datatable_"+staid+") and STR_TO_DATE(CONCAT(`year`,'-',`month`),'%Y-%m')>=STR_TO_DATE(?,'%Y-%m') and STR_TO_DATE(CONCAT(`year`,'-',`month`),'%Y-%m')<=STR_TO_DATE(?,'%Y-%m')"
									+ "order by `year` ,`month`",stagename,staid,startstage,endstage);
							break;
						case 4:
							useStage=Db.use("statistic").find("select stageid,normal from stages where stageid IN(SELECT stageid FROM datatable_"+staid+") and stagename=? and stagestatement=? and normal>=? and normal<=?",stagename,startstage,endstage);
							break;
					}
					int stagenum=useStage.size();//有用期数
					System.out.println(JSON.toJSON(useStage));
					
					List<Map<String,Object>> upperList=new ArrayList<Map<String ,Object>>();
					for (String upper : upperids) {
						Map<String,Object> upperInfo=new HashMap<String,Object>();
						String uppername=Db.use("statistic").findById("upper", "uppid",Integer.parseInt(upper)).getStr("uppstruct");
						String whereStr=" where A.stageid="+useStage.get(0).getInt("stageid");
						for(int j=1;j<useStage.size();j++){
							whereStr+=" or A.stageid="+useStage.get(j).getInt("stageid");
						}
						List<Record> tempList=Db.use("statistic").find("select ifnull(A._"+upper+",' ')as _"+upper+" from `left` C left join datatable_"+staid+" A on C.leftid=A.leftid left join stages B on A.stageid=B.stageid "+whereStr+" order by A.leftid,B.`year`,B.halfyear,B.season,B.`month`,B.normal");
						
//						System.out.println(JSON.toJSON(tempList));
						System.out.println("所有的记录："+tempList.size());
						List<Map<String ,Object>> stageList=new ArrayList<Map<String,Object>>();
						System.out.println(tempList.size()+":"+stagenum);
						for(int k=0;k<tempList.size();k+=stagenum){
							Map<String,Object> leftInfo=new LinkedHashMap<String,Object>();
							for(int l=0;l<stagenum;l++){
								leftInfo.put(useStage.get(l).getStr("stageIndex"), tempList.get(k+l).getStr("_"+upper));//往stageList数组的元素中放入upper对应的指标的信息
							}
//							System.out.println("每行每个指标的信息："+JSON.toJSON(leftInfo));
							stageList.add(leftInfo);
						}
						upperInfo.put("uppername", uppername);
						upperInfo.put("upperid", Integer.parseInt(upper));
						upperInfo.put("stageList", stageList);
						upperList.add(upperInfo);
					}
					statement.put("statementname", statementname);
					statement.put("left", left);
					statement.put("statementid", staid);
					statement.put("upperList", upperList);
					statementList.add(statement);
				}
				if(i==searchList.size()){
					Info.put("statementList", statementList);
					Info.put("statementnum", searchList.size());
					response.setResult(ResultCodeEnum.SUCCESS);
					response.setData(Info);
				}else{
					response.setResult(ResultCodeEnum.DATABASE_ERROR);
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			response.setResult(ResultCodeEnum.INNERERROR);
		}
		this.renderJson(response);
	}

	/**
	 * 获取地区名
	 */
	public void getStagename() {
		BaseResponse response = new BaseResponse();
		try {
			Integer staid = this.getParaToInt("staid");
			if (staid == null) {
				response.setResult(ResultCodeEnum.DATA_ERROR);
			} else {
				response.setData(stageService.getStagenameByStaid(staid));
				response.setResult(ResultCodeEnum.SUCCESS);
			}
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
			response.setResult(ResultCodeEnum.INNERERROR);
		}
		this.renderJson(response);
	}
	
	/*
	 * superzbb
	 * 2017/11/27
	 */
	public void getStatementType(){
		int staid = getParaToInt("staid");
		Record r = Db.use("statistic").findFirst("select stattype from statements_view where staid = ?",staid);
		renderJson(r.getInt("stattype").toString());
	}
	
	/*
	 * superzbb
	 * 2017/11/27
	 */
	public void findStatementType(){
		int depid = getParaToInt("depid");
		List<Record> type = Db.use("statistic").find("select distinct concat('',a.stattype) stattype,b.typename typename from statements_view a inner join stattype_dict b on a.stattype = b.stattype where a.statdepartment = "+depid);
		renderJson(JsonKit.toJson(type));
	}
	
	public void EditStatementInfo(){				
		//BaseResponse response = new BaseResponse();
		try {
			int staid=getParaToInt("staid");			
			Record statement=Db.use("statistic").findFirst("select staname,statype,staupperrow,staleftcol,stattype,statdepartment from statements_view where staid=?",staid);
			List<Record> upper=Db.use("statistic").find("select * from upper where uppstatement=?",staid);
			List<Record> left=null;
			if(statement.getInt("statype")==1){
				System.out.println("b"+statement.getInt("statype"));
				left=Db.use("statistic").find("select * from `left` where leftstatement=?",staid);
			}
			Record statype=Db.use("statistic").findFirst("select statid from statype where statdepartment=?&&stattype=?",statement.get("statdepartment"),statement.get("stattype"));
			
			Map<String,Object> EditInfo=new HashMap<String,Object>();
			EditInfo.put("statype", statype);
			EditInfo.put("statement", statement);
			EditInfo.put("upper", upper);
			EditInfo.put("left", left);
			System.out.println(JsonKit.toJson(EditInfo));
			renderJson(JsonKit.toJson(EditInfo));
			//response.setResult(ResultCodeEnum.SUCCESS);
			//response.setData(EditInfo);
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
		}
	}
	public void renderId(){
		
		setAttr("staid",getPara(0));
		render("/menu/mapIndex.html");
	}
	public void mapIndex(){
		try {
			int staid=getParaToInt("staid");			
			Record statement1=Db.use("statistic").findFirst("select staname,statype,staupperrow,staleftcol,stattype,statdepartment from statements_view where staid=?",staid);
			
			String[] staname=statement1.getStr("staname").split("\\[");
			Record statement2=Db.use("statistic").findFirst("select * from statements where staname like '"+staname[0]+"%'&&staid!=?",staid);
			List<Record> upper1=Db.use("statistic").find("select * from upper where uppstatement=?",staid);
			List<Record> upper2=Db.use("statistic").find("select * from upper where uppstatement=?",statement2.getInt("staid"));
			Map<String,Object> StateInfo=new HashMap<String,Object>();		
			StateInfo.put("upper1", upper1);
			StateInfo.put("upper2", upper2);
			StateInfo.put("statement1", statement1);
			StateInfo.put("statement2", statement2);
			renderJson(JsonKit.toJson(StateInfo));
			//response.setResult(ResultCodeEnum.SUCCESS);
		
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
		}
		
	}
	public void insertCorrelation(){
		BaseResponse response = new BaseResponse();
		try {
			String[] staid=this.getPara("staid").split(",");
			String[] uppid=this.getPara("uppid").split(",");
			int[] staid1=new int[staid.length];
			int[] uppid1=new int[uppid.length];
			for(int i=0;i<staid1.length;i++){
				staid1[i]=Integer.parseInt(staid[i]);
				uppid1[i]=Integer.parseInt(uppid[i]);
				
			}
			Record info=new Record();
			info.set("oldtableid", staid1[0]).set("oldindexid", uppid1[0])
			.set("newtableid", staid1[1]).set("newindexid", uppid1[1]).set("type", 0);
			if (Db.use("statistic").save("table_change1", info)){
				response.setResult(ResultCodeEnum.SUCCESS);
				
				
			}else{
				response.setResult(ResultCodeEnum.INNERERROR);
				
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		this.renderJson(response);
		
	}
	public void saveChange(){
		
	}

	/**
	 *  修改报表信息
	 */
	public void updateReportData() {
		Integer statementid = this.getParaToInt("statementid");
		Integer stageid=this.getParaToInt("stageid");
		String upperid=getPara("id");
		Integer rowindex=getParaToInt("rowindex");
		String newvalue=getPara("newvalue");
		Record record=Db.use("statistic").find("select * from datatable_? where stageid=?",statementid,stageid).get(rowindex);
		Long dataid=record.get("dataid");
		Db.use("statistic").update("update datatable_"+statementid+" set "+upperid+" = '"+newvalue+"' where dataid = "+dataid);
	}
	
	/*
	 * 日志测试
	 */
	public void logTest(){
		Logger log = Logger.getLogger(MenuController.class);
		log.info("info");
		log.warn("warn");
		log.error("error");
	}
}
