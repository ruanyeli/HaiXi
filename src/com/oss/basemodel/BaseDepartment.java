package com.oss.basemodel;

import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.IBean;

/**
 * Generated by JFinal, do not modify this file.
 */
@SuppressWarnings("serial")
public abstract class BaseDepartment<M extends BaseDepartment<M>> extends Model<M> implements IBean {

	public void setDepid(java.lang.Integer depid) {
		set("depid", depid);
	}

	public java.lang.Integer getDepid() {
		return get("depid");
	}

	public void setDepname(java.lang.String depname) {
		set("depname", depname);
	}

	public java.lang.String getDepname() {
		return get("depname");
	}

}