package com.oss.basemodel;

import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.IBean;

/**
 * Generated by JFinal, do not modify this file.
 */
@SuppressWarnings("serial")
public abstract class BaseDictImportRecord<M extends BaseDictImportRecord<M>> extends Model<M> implements IBean {

	public void setUuid(java.lang.String uuid) {
		set("uuid", uuid);
	}

	public java.lang.String getUuid() {
		return get("uuid");
	}

	public void setDictName(java.lang.String dictName) {
		set("dict_name", dictName);
	}

	public java.lang.String getDictName() {
		return get("dict_name");
	}

	public void setImportTime(java.util.Date importTime) {
		set("import_time", importTime);
	}

	public java.util.Date getImportTime() {
		return get("import_time");
	}

	public void setAddNum(java.lang.String addNum) {
		set("addNum", addNum);
	}

	public java.lang.String getAddNum() {
		return get("addNum");
	}

	public void setDeleteNum(java.lang.String deleteNum) {
		set("deleteNum", deleteNum);
	}

	public java.lang.String getDeleteNum() {
		return get("deleteNum");
	}

	public void setChangeNum(java.lang.String changeNum) {
		set("changeNum", changeNum);
	}

	public java.lang.String getChangeNum() {
		return get("changeNum");
	}

}