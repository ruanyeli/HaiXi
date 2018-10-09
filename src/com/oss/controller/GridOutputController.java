/**
 * Copyright (c) 2013-2016, Jieven. All rights reserved.
 *
 * Licensed under the GPL license: http://www.gnu.org/licenses/gpl.txt
 * To use it on other terms please contact us at 1623736450@qq.com
 */
package com.oss.controller;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.eova.aop.MetaObjectIntercept;
import com.eova.config.EovaConfig;
import com.eova.config.PageConst;
import com.eova.model.Menu;
import com.eova.model.MetaField;
import com.eova.model.MetaObject;
import com.eova.vo.MenuConfig;
import com.jfinal.core.Controller;
import com.jfinal.log.Log;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Page;
import com.jfinal.plugin.activerecord.Record;
import com.oss.excel.ExcelUtil;
import com.oss.excel.XlsRender;

import jxl.write.WriteException;

/**
 * Grid组件
 * 
 * @author Jieven
 * 
 */
public class GridOutputController extends Controller {

	private Log log = Log.getLog(getClass());

	/**
	 * 跳过后续操作
	 */
	public static final String CONTINUE = "continue";

	final Controller ctrl = this;

	/** 元对象业务拦截器 **/
	protected MetaObjectIntercept intercept = null;

	public void getContent() {
		String sort = this.getPara("sort");
		String order = this.getPara("order");
		int pageNumber = getParaToInt(PageConst.PAGENUM, 1);
		int pageSize = getParaToInt(PageConst.PAGESIZE, 10000);
		String sortSQL = "";
		if (sort != null) {
			sortSQL = " order by " + sort + " " + order;
		} else {
			sortSQL = " order by id desc";
		}
		Page<Record> datas = Db.use("eova").paginate(pageNumber, pageSize, "select *", " from hx_content " + sortSQL);
		Map map = new HashMap();
		map.put("rows", datas.getList());
		map.put("total", datas.getTotalRow());
		renderJson(map);
	}

	public void detail() {

		Integer id = Integer.parseInt(getPara("id"));
		List<Record> result = Db.use("eova").find("select title,content,publisher,date_format(publishTime, '%Y-%m-%d %H:%i:%s') as publishTime from hx_content where id=? ", id);
		if(result != null && result.size() == 1){
			setAttr("bt", result.get(0).getStr("title"));
			setAttr("content", result.get(0).getStr("content"));
			setAttr("publisher", result.get(0).getStr("publisher"));
			setAttr("publishTime", result.get(0).getStr("publishTime"));
		}else{
			setAttr("bt","参数获取错误");
		}
		render("/eova/detail_content.html");

	}

	/**
	 * 导出
	 */
	public void export() {
		String objectCode = getPara(0);
		Menu menu = Menu.dao.findByCode(objectCode);
		String condition = getPara("fromParam");

		if (menu != null) {
			MenuConfig mg = menu.getConfig();
			if (mg != null) {
				MetaObject object = MetaObject.dao.getByCode(mg.getObjectCode());
				List<MetaField> items = MetaField.dao.queryByObjectCode(mg.getObjectCode());
				String sql = " where 1=1 ";
				if (condition != null && !"".equals(condition)) {

					String[] condStr = condition.split("&");
					if (condStr != null && condStr.length > 0) {
						for (int i = 0; i < condStr.length; i++) {
							String[] innerCondStr = condStr[i].split("=");
							if (innerCondStr.length == 2 && innerCondStr[1] != null && !"".equals(innerCondStr[1])) {
								String temp = innerCondStr[0].replace("query_", "");
								if (items != null) {
									for (int k = 0; k < items.size(); k++) {
										MetaField mf = items.get(k);
										if (mf.getEn().equals(temp) && (mf.getStr("data_type").equals("string")
												|| mf.getStr("data_type").equals("clob"))) {
											sql = sql + " and  " + temp + " like '%" + innerCondStr[1] + "%' ";
										} else if (mf.getEn().equals(temp) && mf.getStr("data_type").equals("number")) {
											sql = sql + " and  " + temp + "=" + innerCondStr[1] + "";
										}
									}
								}

							}
						}
					}

				}

				log.info("GridController export sql is " + "select * from " + object.getView() + sql);
				List<Record> data = Db.use(object.getDs()).find("select * from " + object.getView() + sql);
				XlsRender xls = new XlsRender(data, items, object);
				try {
					String fileName = xls.getFileName();

					fileName = EovaConfig.props.get("excelHome") + File.separator + fileName;

					ExcelUtil.createExcel(fileName, data, items, object);

					renderJson(object.getView());
				} catch (WriteException e) {
					renderJson("导出失败，请联系系统管理员WriteException");
				} catch (IOException e) {
					renderJson("导出失败，请联系系统管理员IOException");
				}

			} else {
				renderJson("导出失败，请联系系统管理员，错误信息：菜单Menu表Config配置为空" + objectCode);
			}
		} else {
			renderJson("导出失败，请联系系统管理员,错误信息：菜单Menu表配置为空" + objectCode);
		}
	}

}
