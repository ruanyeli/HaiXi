package com.oss.basemodel;

import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.IBean;

/**
 * Generated by JFinal, do not modify this file.
 */
@SuppressWarnings("serial")
public abstract class BaseLeft1<M extends BaseLeft1<M>> extends Model<M> implements IBean {

	public void setLeftid(java.lang.Integer leftid) {
		set("leftid", leftid);
	}

	public java.lang.Integer getLeftid() {
		return get("leftid");
	}

	public void setLeftstruct(java.lang.String leftstruct) {
		set("leftstruct", leftstruct);
	}

	public java.lang.String getLeftstruct() {
		return get("leftstruct");
	}

	public void setLeftname(java.lang.String leftname) {
		set("leftname", leftname);
	}

	public java.lang.String getLeftname() {
		return get("leftname");
	}

	public void setLeftrid(java.lang.Integer leftrid) {
		set("leftrid", leftrid);
	}

	public java.lang.Integer getLeftrid() {
		return get("leftrid");
	}

	public void setLeftstatement(java.lang.Integer leftstatement) {
		set("leftstatement", leftstatement);
	}

	public java.lang.Integer getLeftstatement() {
		return get("leftstatement");
	}

	public void setLeftshow(java.lang.Integer leftshow) {
		set("leftshow", leftshow);
	}

	public java.lang.Integer getLeftshow() {
		return get("leftshow");
	}

	public void setLeftcreatetime(java.util.Date leftcreatetime) {
		set("leftcreatetime", leftcreatetime);
	}

	public java.util.Date getLeftcreatetime() {
		return get("leftcreatetime");
	}

	public void setLeftdeletetime(java.util.Date leftdeletetime) {
		set("leftdeletetime", leftdeletetime);
	}

	public java.util.Date getLeftdeletetime() {
		return get("leftdeletetime");
	}

}
