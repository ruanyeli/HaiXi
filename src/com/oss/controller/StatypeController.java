/**
 * 科室报表类型statdepartment,stattype
 */
package com.oss.controller;

import com.jfinal.core.Controller;
import com.oss.kit.BaseResponse;
import com.oss.kit.ResultCodeEnum;
import com.oss.service.StatypeService;

public class StatypeController extends Controller {
	private StatypeService statypeService=null;
	public StatypeController() {
		// TODO Auto-generated constructor stub
		statypeService=new StatypeService();
	}
	
	/**
	 * 根据部门id返回报表类型信息列表
	 */
	public void findStatype(){
		BaseResponse response=new BaseResponse();
		try {
			Integer statdepartment=this.getParaToInt("statdepartment");
			if(statdepartment==null||statdepartment<0){
				response.setResult(ResultCodeEnum.DATA_ERROR);
			}else{
				response.setData(statypeService.findStattype(statdepartment));
				response.setResult(ResultCodeEnum.SUCCESS);
			}
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
			response.setResult(ResultCodeEnum.INNERERROR);
		}
		this.renderJson(response);
	}
	
}
