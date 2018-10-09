package com.oss.basemodel;

import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.IBean;

/**
 * Generated by JFinal, do not modify this file.
 */
@SuppressWarnings("serial")
public abstract class BaseFormula<M extends BaseFormula<M>> extends Model<M> implements IBean {

	public void setFaid(java.lang.Long faid) {
		set("faid", faid);
	}

	public java.lang.Long getFaid() {
		return get("faid");
	}

	public void setFastaid(java.lang.Long fastaid) {
		set("fastaid", fastaid);
	}

	public java.lang.Long getFastaid() {
		return get("fastaid");
	}

	public void setFalocation(java.lang.String falocation) {
		set("falocation", falocation);
	}

	public java.lang.String getFalocation() {
		return get("falocation");
	}

	public void setFacontent(java.lang.String facontent) {
		set("facontent", facontent);
	}

	public java.lang.String getFacontent() {
		return get("facontent");
	}

}
