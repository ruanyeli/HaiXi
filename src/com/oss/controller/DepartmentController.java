package com.oss.controller;

import com.jfinal.core.Controller;
import com.oss.kit.BaseResponse;
import com.oss.kit.ResultCodeEnum;
import com.oss.service.DepartmentService;

public class DepartmentController extends Controller {
	private DepartmentService departmentService=null;
	public DepartmentController() {
		departmentService=new DepartmentService();
	}
	
	/**
	 * 返回科室信息列表
	 */
	public void ListDepartment(){
		BaseResponse response=new BaseResponse();
		try {
			response.setData(departmentService.ListDepartment());
			response.setResult(ResultCodeEnum.SUCCESS);
		} catch (Exception e) {
			e.printStackTrace();
			response.setResult(ResultCodeEnum.INNERERROR);
		}
		this.renderJson(response);
	}
	
}
