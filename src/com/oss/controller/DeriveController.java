package com.oss.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.oss.kit.BaseResponse;
import com.oss.kit.ResultCodeEnum;
import com.oss.service.DerivestatementService;
import com.oss.service.OperatorService;

public class DeriveController extends Controller {
	
	private DerivestatementService derivestatementService=null;
	private OperatorService operatorService=null;
	
	public DeriveController(){
		derivestatementService=new DerivestatementService();
		operatorService=new OperatorService();
	}
	
	/**
	 * 添加算子
	 */
	public void addOperator(){
		BaseResponse response=new BaseResponse();
		try {
			String orname=this.getPara("operatorName");
			Integer orstatement=this.getParaToInt("orstatement"); 
			Integer orleft=this.getParaToInt("orleft");
			Integer orupper=this.getParaToInt("orupper");
			String orstagename=this.getPara("orstagename");
			Integer orstage=this.getParaToInt("orstage");
			Integer orstastage=this.getParaToInt("orstastage");
			Integer stattype = this.getParaToInt("stattype");
			Integer ordepartment=this.getParaToInt("ordepartment");
			if(orname==null||orname.isEmpty()||orstatement==null||orstage==null||orstastage==null){
				response.setResult(ResultCodeEnum.DATA_ERROR);
			}else{
				if(operatorService.haveSameOperatorname(orname)){
					response.setResult(ResultCodeEnum.HAVE_SAMENAME);
				}else{
					if(operatorService.addOperator(orname, orstatement, orleft, orupper, orstagename, orstage, orstastage, stattype, ordepartment)){
						response.setResult(ResultCodeEnum.SUCCESS);
					}else{
						response.setResult(ResultCodeEnum.DATABASE_ERROR);
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
	
	/**
	 * 修改算子
	 */
	public void editOperator(){
		BaseResponse response=new BaseResponse();
		try {
			Long orid=this.getParaToLong("orid");
			String orname=this.getPara("operatorName");
			Integer orstatement=this.getParaToInt("orstatement"); 
			Integer orleft=this.getParaToInt("orleft");
			Integer orupper=this.getParaToInt("orupper");
			String orstagename=this.getPara("orstagename");
			Integer orstage=this.getParaToInt("orstage");
			Integer orstastage=this.getParaToInt("orstastage");//统计维度
			Integer stattype = this.getParaToInt("stattype");//原始报表类型
			Integer ordepartment=this.getParaToInt("ordepartment");
			if(orid==null||orname==null||orname.isEmpty()||orstatement==null||orleft==null
					||orupper==null||orstagename==null||orstage==null||orstastage==null||stattype==null){
				response.setResult(ResultCodeEnum.DATA_ERROR);
			}else{
				if(operatorService.haveSameOperatorname(orid,orname)){
					response.setResult(ResultCodeEnum.HAVE_SAMENAME);
				}else{
					if(operatorService.editOperator(orid, orname, orstatement, orleft, orupper, orstagename, orstage,ordepartment,orstastage,stattype)){
						response.setResult(ResultCodeEnum.SUCCESS);
					}else{
						response.setResult(ResultCodeEnum.DATABASE_ERROR);
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
	
	/**
	 * 删除算子
	 */
	public void deleteOperator(){
		BaseResponse response=new BaseResponse();
		try {
			String orids=this.getPara("orids");
			if(orids==null||orids.isEmpty()){
				response.setResult(ResultCodeEnum.DATA_ERROR);
			}else{
				JSONArray oridArray=JSONArray.parseArray(orids);
				for (Object orid : oridArray) {
					JSONObject oridob=(JSONObject) orid;
					operatorService.deleteOperator(oridob.getLong("orid"));
				}
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
	 * 返回算子的信息
	 */
	public void showOperator(){
		BaseResponse response=new BaseResponse();
		try {
			Long orid=this.getParaToLong("orid");
			if(orid==null){
				response.setResult(ResultCodeEnum.DATA_ERROR);
			}else{
				response.setData(operatorService.showOperator(orid));
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
	 * 修改算子的时候调用
	 */
	public void showOperatorHtml(){
		BaseResponse response=new BaseResponse();
		try {
			Long orid=this.getParaToLong("orid");
			if(orid==null){
				response.setResult(ResultCodeEnum.DATA_ERROR);
				this.renderJson(response);
				return ;
			}else{
				this.setAttr("operator", operatorService.showOperatorUpdate(orid));//如果查询到了就给页面传递对象属性
			}
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
			response.setResult(ResultCodeEnum.INNERERROR);
			this.renderJson(response);
			return ;
		}
		this.render("/eova/auth/updateOperator.html");
	}
	
	/**
	 * 保存衍生报表的信息
	 */
	public void saveDestatement(){
		BaseResponse response=new BaseResponse();
		try {
			String dename=this.getPara("dename");//报表名称
			Integer detype=this.getParaToInt("detype");//报表类型
			Integer dedepartment=this.getParaToInt("dedepartment");//报表创建者
			Integer derow=this.getParaToInt("derow");//行数
			Integer decol=this.getParaToInt("decol");//列数
			String headers=this.getPara("rowandcol");//报表的表头信息
			String decontent=this.getPara("decontent");//报表里面的公式
			
			if(dename==null||headers==null||dedepartment==null||decontent==null||derow==null||decol==null){
				response.setResult(ResultCodeEnum.DATA_ERROR);
			}else{
				try {
					Long deid=derivestatementService.addDestatement(dename, detype, dedepartment,derow,decol);
					JSONArray headerList=JSONArray.parseArray(headers);
					JSONArray formulaList=JSONArray.parseArray(decontent);
					for (Object header : headerList) {
						JSONObject header0=(JSONObject)header;
						String headlocation=header0.getString("id");
						Integer deheadrowspan=header0.getInteger("rowspan");
						Integer deheadcolspan=header0.getInteger("colspan");
						String deheadname=header0.getString("content");
						derivestatementService.addDeheader(deheadname, deid, headlocation, deheadrowspan, deheadcolspan);
					}
					
					for (Object formula : formulaList) {
						JSONObject formula0=(JSONObject)formula;
						String facontent=formula0.getString("content");
						String colindex=formula0.getString("colindex");
						String rowindex=formula0.getString("rowindex");
						String falocation=rowindex+"@#"+colindex;
						derivestatementService.addFormula(deid, falocation, facontent);
					}
					response.setResult(ResultCodeEnum.SUCCESS);
				} catch (Exception e) {
					e.printStackTrace();
					response.setResult(ResultCodeEnum.DATABASE_ERROR);
					this.renderJson(response);
					return;
				}
			}
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
			response.setResult(ResultCodeEnum.INNERERROR);
		}
		this.renderJson(response);
	}
	
	/**
	 * 获取衍生报表列表
	 */
	public void getDestatementList(){
		BaseResponse response=new BaseResponse();
		try {
			Integer depid=this.getParaToInt("depid");//部门id
			if(depid==null){
				response.setResult(ResultCodeEnum.DATA_ERROR);
			}else{
				response.setData(derivestatementService.getDestatement(depid));
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
	 * 显示衍生报表表头
	 */
	public void showDestatement(){
		BaseResponse response=new BaseResponse();
		try {
			Long deid=this.getParaToLong("deid");
			if(deid==null){
				response.setResult(ResultCodeEnum.DATA_ERROR);
			}else{
				//Map<String ,Object> destatementInfo=new HashMap<String ,Object>();
				//destatementInfo.put("headers", derivestatementService.getHeadList(deid));
				//destatementInfo.put("formulas", derivestatementService.getformulaList(deid));
				response.setData(derivestatementService.getHeadList(deid));
				response.setResult(ResultCodeEnum.SUCCESS);
			}
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
			response.setResult(ResultCodeEnum.DATABASE_ERROR);
		}
		this.renderJson(response);
	}
	
	/**
	 * 获取算子信息
	 */
	public void getOperator(){
		BaseResponse response=new BaseResponse();
		try {
			Long orid=this.getParaToLong("orid");
			response.setData(Db.use("statistic").findById("operator","orid",orid));
			response.setResult(ResultCodeEnum.SUCCESS);
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
			response.setResult(ResultCodeEnum.INNERERROR);
		}
		this.renderJson(response);
	}
	
	public void getOperatorValue(){
		BaseResponse response=new BaseResponse();
		try {
			Integer stattype=this.getParaToInt("stattype");
			Integer staid=this.getParaToInt("staid");
			String stagename=this.getPara("stagename");
			String stagedate=this.getPara("stagedate");
			Integer upper=this.getParaToInt("upper");
			Integer left=this.getParaToInt("left");
			if(stattype==null||staid==null||stagename==null||stagedate==null){
				response.setResult(ResultCodeEnum.DATA_ERROR);
			}else{
				int stageid=0;
				switch(stattype){
					case 0:
						stageid=Db.use("statistic").findFirst("select stageid from stages where stagestatement=? and `year`=?",staid,Integer.parseInt(stagedate)).getInt("stageid");
						break;
					case 1:
						stageid=Db.use("statistic").findFirst("select stageid from stages where stagestatement=? and `year`=? and `halfyear`=?",staid,Integer.parseInt(stagedate.split("-")[0]),Integer.parseInt(stagedate.split("-")[1])).getInt("stageid");
						break;
					case 2:
						stageid=Db.use("statistic").findFirst("select stageid from stages where stagestatement=? and  `year`=? and `season`=?",staid,Integer.parseInt(stagedate.split("-")[0]),Integer.parseInt(stagedate.split("-")[1])).getInt("stageid");
						break;
					case 3:
						stageid=Db.use("statistic").findFirst("select stageid from stages where  stagestatement=? and `year`=? and `month`=?",staid,Integer.parseInt(stagedate.split("-")[0]),Integer.parseInt(stagedate.split("-")[1])).getInt("stageid");
						break;
					case 4:
						stageid=Db.use("statistic").findFirst("select stageid from stages where  stagestatement=? and `normal`=?",staid,stagedate).getInt("stageid");
						break;
				}
				if(stageid==0){
					response.setResult(ResultCodeEnum.LIST_IS_NULL);
				}else{
					System.out.println(stageid+"========"+left+"==="+staid+"=="+upper);
					response.setData(Db.use("statistic").findFirst("select * from datatable_"+staid+" where leftid="+left+" and stageid="+stageid).getStr("_"+upper));
					response.setResult(ResultCodeEnum.SUCCESS);
				}
			}
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
			response.setResult(ResultCodeEnum.INNERERROR);
		}
		this.renderJson(response);
	}
	
	/**
	 * 获取衍生报表
	 */
	public void getDestatement(){
		BaseResponse response=new BaseResponse();
		try {
			Integer deid=this.getParaToInt("deid");
			if(deid==null){
				response.setResult(ResultCodeEnum.DATA_ERROR);
			}else{
				response.setData(Db.use("statistic").findById("derivestatement", "deid",deid));
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
	 * 获取衍生报表的表头和值
	 */
	public void getDestatementContent(){
		BaseResponse response=new BaseResponse();
		try {
			Integer deid=this.getParaToInt("deid");
			if(deid==null){
				response.setResult(ResultCodeEnum.DATA_ERROR);
			}else{
				Map<String,Object> destateContent=new HashMap<String,Object>();
				List<Record> dehead=Db.use("statistic").find("select * from deheader where deheadstatement=?",deid);
				List<Record> deformula=Db.use("statistic").find("select * from formula where fastaid=?",deid);
				destateContent.put("deheader", dehead);
				destateContent.put("deformula", deformula);
				response.setData(destateContent);
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
	 * 删除衍生报表的 信息
	 * @param deid
	 */
	public boolean deleteDestatement(long deid){
		try {
			List<Record> deheaderList=Db.use("statistic").find("select * from deheader where deheadstatement=?",deid);
			for (Record dehead : deheaderList) {
				Db.use("statistic").deleteById("deheader", "deheadid",dehead.getLong("deheadid"));
			}
			List<Record> formulaList=Db.use("statistic").find("select * from formula where fastaid=?",deid);
			for (Record formula : formulaList) {
				Db.use("statistic").deleteById("formula", "faid",formula.getLong("faid"));
			}
			Db.use("statistic").deleteById("derivestatement", "deid",deid);
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}
	
	/**
	 * 编辑报表
	 */
	public void editDestatement(){
		BaseResponse response=new BaseResponse();
		Long deid=this.getParaToLong("deid");
		String dename=this.getPara("dename");//报表名称
		Integer detype=this.getParaToInt("detype");//报表类型
		Integer dedepartment=this.getParaToInt("dedepartment");//报表创建者
		Integer derow=this.getParaToInt("derow");//行数
		Integer decol=this.getParaToInt("decol");//列数
		String headers=this.getPara("rowandcol");//报表的表头信息
		String decontent=this.getPara("decontent");//报表里面的公式
	if(deid==null||dename==null||headers==null||dedepartment==null||decontent==null||derow==null||decol==null){
			response.setResult(ResultCodeEnum.DATA_ERROR);
		}else{
			try {
				if(deleteDestatement(deid)){
					try {
						derivestatementService.editDestatement(deid,dename, detype, dedepartment,derow,decol);
						JSONArray headerList=JSONArray.parseArray(headers);
						JSONArray formulaList=JSONArray.parseArray(decontent);
						for (Object header : headerList) {
							JSONObject header0=(JSONObject)header;
							String headlocation=header0.getString("id");
							Integer deheadrowspan=header0.getInteger("rowspan");
							Integer deheadcolspan=header0.getInteger("colspan");
							String deheadname=header0.getString("content");
							derivestatementService.addDeheader(deheadname, deid, headlocation, deheadrowspan, deheadcolspan);
						}
						
						for (Object formula : formulaList) {
							JSONObject formula0=(JSONObject)formula;
							String facontent=formula0.getString("content");
							String colindex=formula0.getString("colindex");
							String rowindex=formula0.getString("rowindex");
							String falocation=rowindex+"@#"+colindex;
							derivestatementService.addFormula(deid, falocation, facontent);
						}
						response.setResult(ResultCodeEnum.SUCCESS);
						renderJson(response);
					} catch (Exception e) {
						e.printStackTrace();
						response.setResult(ResultCodeEnum.DATABASE_ERROR);
						this.renderJson(response);
						return;
					}
				}else{
					response.setResult(ResultCodeEnum.DATABASE_ERROR);
					this.renderJson(response);
				}
			} catch (Exception e) {
				// TODO: handle exception
				e.printStackTrace();
				response.setResult(ResultCodeEnum.INNERERROR);
				this.renderJson(response);
			}
		}
	}
}
