package com.oss.excel;

import java.io.IOException;
import java.io.OutputStream;
import java.util.List;

import com.eova.common.utils.excel.ExcelUtil;
import com.eova.model.MetaField;
import com.eova.model.MetaObject;
import com.jfinal.kit.LogKit;
import com.jfinal.plugin.activerecord.Record;
import com.jfinal.render.Render;
import com.jfinal.render.RenderException;

public class XlsRender extends Render {

	private final static String CONTENT_TYPE = "application/msexcel;charset=" + getEncoding();

	private final MetaObject object;
	private final List<MetaField> items;
	private final List<Record> data;

	private final String fileName;

	public XlsRender(List<Record> data, List<MetaField> items, MetaObject object) {
		this.data = data;
		this.items = items;
		this.object = object;

		fileName = object.getView() + ".xls";
	}

	
	
	public MetaObject getObject() {
		return object;
	}



	public List<MetaField> getItems() {
		return items;
	}



	public List<Record> getData() {
		return data;
	}



	public String getFileName() {
		return fileName;
	}



	@Override
	public void render() {
		response.reset();
		response.setHeader("Content-disposition", "attachment; filename=" + fileName);
		response.setContentType(CONTENT_TYPE);
		OutputStream os = null;
		try {
			os = response.getOutputStream();
			ExcelUtil.createExcel(os, data, items, object);
		} catch (Exception e) {
			throw new RenderException(e);
		} finally {
			try {
				if (os != null) {
					os.flush();
					os.close();
				}
			} catch (IOException e) {
				LogKit.error(e.getMessage(), e);
			}

		}
	}

}
