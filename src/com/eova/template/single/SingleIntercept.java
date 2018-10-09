package com.eova.template.single;

import com.eova.aop.AopContext;

/** 
 * @author  superzbb 
 * @E-mail: 408873559@qq.com
 * @date 创建时间：2017年10月30日 下午5:14:50 
 */
public class SingleIntercept {

	 public void importBefore(AopContext ac)throws Exception{
		 System.out.println("importBefore");
	 }
			  
	 public void importAfter(AopContext ac)throws Exception{
		 System.out.println("importAfter");
	 }
			  
	 public void importSucceed(AopContext ac)throws Exception{
		 System.out.println("importSucceed");
	 }
}
