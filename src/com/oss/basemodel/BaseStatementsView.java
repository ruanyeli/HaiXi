package com.oss.basemodel;

import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.IBean;

/**
 * Generated by JFinal, do not modify this file.
 */
@SuppressWarnings("serial")
public abstract class BaseStatementsView<M extends BaseStatementsView<M>> extends Model<M> implements IBean {

	public void setStaid(java.lang.Integer staid) {
		set("staid", staid);
	}

	public java.lang.Integer getStaid() {
		return get("staid");
	}

	public void setStaname(java.lang.String staname) {
		set("staname", staname);
	}

	public java.lang.String getStaname() {
		return get("staname");
	}

	public void setStacreatetime(java.util.Date stacreatetime) {
		set("stacreatetime", stacreatetime);
	}

	public java.util.Date getStacreatetime() {
		return get("stacreatetime");
	}

	public void setStatype(java.lang.Integer statype) {
		set("statype", statype);
	}

	public java.lang.Integer getStatype() {
		return get("statype");
	}

	public void setStaheader(byte[] staheader) {
		set("staheader", staheader);
	}

	public byte[] getStaheader() {
		return get("staheader");
	}

	public void setStaupperrow(java.lang.Integer staupperrow) {
		set("staupperrow", staupperrow);
	}

	public java.lang.Integer getStaupperrow() {
		return get("staupperrow");
	}

	public void setStaleftcol(java.lang.Integer staleftcol) {
		set("staleftcol", staleftcol);
	}

	public java.lang.Integer getStaleftcol() {
		return get("staleftcol");
	}

	public void setStattype(java.lang.Integer stattype) {
		set("stattype", stattype);
	}

	public java.lang.Integer getStattype() {
		return get("stattype");
	}

	public void setStatdepartment(java.lang.Integer statdepartment) {
		set("statdepartment", statdepartment);
	}

	public java.lang.Integer getStatdepartment() {
		return get("statdepartment");
	}

}
