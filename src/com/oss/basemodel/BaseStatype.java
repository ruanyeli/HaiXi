package com.oss.basemodel;

import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.IBean;

/**
 * Generated by JFinal, do not modify this file.
 */
@SuppressWarnings("serial")
public abstract class BaseStatype<M extends BaseStatype<M>> extends Model<M> implements IBean {

	public void setStatid(java.lang.Integer statid) {
		set("statid", statid);
	}

	public java.lang.Integer getStatid() {
		return get("statid");
	}

	public void setStatdepartment(java.lang.Integer statdepartment) {
		set("statdepartment", statdepartment);
	}

	public java.lang.Integer getStatdepartment() {
		return get("statdepartment");
	}

	public void setStattype(java.lang.Integer stattype) {
		set("stattype", stattype);
	}

	public java.lang.Integer getStattype() {
		return get("stattype");
	}

}
