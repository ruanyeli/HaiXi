package com.oss.basemodel;

import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.IBean;

/**
 * Generated by JFinal, do not modify this file.
 */
@SuppressWarnings("serial")
public abstract class BaseStattypeDict<M extends BaseStattypeDict<M>> extends Model<M> implements IBean {

	public void setStattype(java.lang.String stattype) {
		set("stattype", stattype);
	}

	public java.lang.String getStattype() {
		return get("stattype");
	}

	public void setTypename(java.lang.String typename) {
		set("typename", typename);
	}

	public java.lang.String getTypename() {
		return get("typename");
	}

}