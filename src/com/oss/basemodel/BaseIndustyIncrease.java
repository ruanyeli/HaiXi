package com.oss.basemodel;

import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.IBean;

/**
 * Generated by JFinal, do not modify this file.
 */
@SuppressWarnings("serial")
public abstract class BaseIndustyIncrease<M extends BaseIndustyIncrease<M>> extends Model<M> implements IBean {

	public void setId(java.lang.Integer id) {
		set("id", id);
	}

	public java.lang.Integer getId() {
		return get("id");
	}

	public void setYear(java.lang.Integer year) {
		set("year", year);
	}

	public java.lang.Integer getYear() {
		return get("year");
	}

	public void setArea(java.lang.String area) {
		set("area", area);
	}

	public java.lang.String getArea() {
		return get("area");
	}

	public void set绝对额(java.lang.String 绝对额) {
		set("绝对额", 绝对额);
	}

	public java.lang.String get绝对额() {
		return get("绝对额");
	}

	public void set比上年增长(java.lang.String 比上年增长) {
		set("比上年增长", 比上年增长);
	}

	public java.lang.String get比上年增长() {
		return get("比上年增长");
	}

}
