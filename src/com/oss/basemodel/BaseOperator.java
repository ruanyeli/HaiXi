package com.oss.basemodel;

import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.IBean;

/**
 * Generated by JFinal, do not modify this file.
 */
@SuppressWarnings("serial")
public abstract class BaseOperator<M extends BaseOperator<M>> extends Model<M> implements IBean {

	public void setOrid(java.lang.Long orid) {
		set("orid", orid);
	}

	public java.lang.Long getOrid() {
		return get("orid");
	}

	public void setOrname(java.lang.String orname) {
		set("orname", orname);
	}

	public java.lang.String getOrname() {
		return get("orname");
	}

	public void setOrdepartment(java.lang.Integer ordepartment) {
		set("ordepartment", ordepartment);
	}

	public java.lang.Integer getOrdepartment() {
		return get("ordepartment");
	}

	public void setOrstatement(java.lang.Integer orstatement) {
		set("orstatement", orstatement);
	}

	public java.lang.Integer getOrstatement() {
		return get("orstatement");
	}

	public void setOrleft(Integer orleft) {
		set("orleft", orleft);
	}

	public java.lang.String getOrleft() {
		return get("orleft");
	}

	public void setOrupper(java.lang.Integer orupper) {
		set("orupper", orupper);
	}

	public java.lang.Integer getOrupper() {
		return get("orupper");
	}

	public void setOrstagename(java.lang.String orstagename) {
		set("orstagename", orstagename);
	}

	public java.lang.String getOrstagename() {
		return get("orstagename");
	}

	public void setOrstage(java.lang.Integer orstage) {
		set("orstage", orstage);
	}

	public java.lang.Integer getOrstage() {
		return get("orstage");
	}

	public void setOrstastage(java.lang.Integer orstastage) {
		set("orstastage", orstastage);
	}

	public java.lang.Integer getOrstastage() {
		return get("orstastage");
	}

	public void setStattype(java.lang.Integer stattype) {
		set("stattype", stattype);
	}

	public java.lang.Integer getStattype() {
		return get("stattype");
	}

}
