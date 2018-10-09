/**
 *Licensed under the GPL license: http://www.gnu.org/licenses/gpl.txt
 * To use it on other terms please contact us at 1623736450@qq.com
 */
package com.oss;

import com.alibaba.druid.filter.stat.StatFilter;
import com.eova.config.EovaConfig;
import com.eova.interceptor.LoginInterceptor;
import com.jfinal.config.Plugins;
import com.jfinal.config.Routes;
import com.jfinal.core.JFinal;
import com.jfinal.plugin.activerecord.ActiveRecordPlugin;
import com.jfinal.plugin.druid.DruidPlugin;
import com.oss.controller.CommuniqueController;
import com.oss.controller.DepartmentController;
import com.oss.controller.DeriveController;
import com.oss.controller.EditController;
import com.oss.controller.ExcelController;
import com.oss.controller.GridOutputController;
import com.oss.controller.MenuController;
import com.oss.controller.PDFController;
import com.oss.controller.ReportController;
import com.oss.controller.RulestateController;
import com.oss.controller.StatypeController;

public class OSSConfig extends EovaConfig {

	/**
	 * 自定义路由
	 * 
	 * @param me
	 */
	@Override
	protected void route(Routes me) {
		// 自定义的路由配置往这里加。。。
		me.add("/diyMenu", MenuController.class);
		me.add("/department", DepartmentController.class);
		me.add("/statype", StatypeController.class);
		me.add("/diyEdit",EditController.class);
		me.add("/gridOutput",GridOutputController.class);
		me.add("/excel",ExcelController.class);
		me.add("/pdf",PDFController.class);
		me.add("/communique",CommuniqueController.class);
		me.add("/derive",DeriveController.class);
		me.add("/report",ReportController.class);
		me.add("/rule",RulestateController.class);
		// 不需要登录拦截的URL
		LoginInterceptor.excludes.add("/init");
		LoginInterceptor.excludes.add("/diyMenu/testInsertStatement");
		LoginInterceptor.excludes.add("/diyMenu/createTable");
		LoginInterceptor.excludes.add("/diyMenu/widthAndDeepth");
		LoginInterceptor.excludes.add("/diyMenu/fromJsontoTree");		
		LoginInterceptor.excludes.add("/diyMenu/renderId/");
		LoginInterceptor.excludes.add("/diyMenu/renderExcel/");
		LoginInterceptor.excludes.add("/diyEdit/getTableid");
		LoginInterceptor.excludes.add("/diyEdit/getUpperrowAndLeftcol");
		LoginInterceptor.excludes.add("/diyEdit/importExcel");
		LoginInterceptor.excludes.add("/diyEdit/renderDelete");
		LoginInterceptor.excludes.add("/diyEdit/renderDelete");
		LoginInterceptor.excludes.add("/diyMenu/showReport");
		LoginInterceptor.excludes.add("/diyMenu/sendReportData");
		LoginInterceptor.excludes.add("/diyMenu/getIndexStageData");
		LoginInterceptor.excludes.add("/diyMenu/getIndexData");
		LoginInterceptor.excludes.add("/diyMenu/getStatementListByDepartment");
		LoginInterceptor.excludes.add("/diyMenu/getStageAndUpper");	
		LoginInterceptor.excludes.add("/diyMenu/ListAllHaveDataStatement");	
	}

	/**
	 * 自定义Main数据源Model映射
	 * 
	 * @param arp
	 */
	@Override
	protected void mapping(ActiveRecordPlugin arp) {
		// 自定义的Model映射往这里加。。。
	}

	/**
	 * 自定义插件
	 */
	@Override
	protected void plugin(Plugins plugins) {
		// 添加数据源
		
		// 添加自动扫描插件

		// ...
	}

	/**
	 * init Druid
	 * 
	 * @param url
	 *            JDBC
	 * @param username
	 *            数据库用户
	 * @param password
	 *            数据库密码
	 * @return
	 */
	public DruidPlugin initDruidPlugin(String url, String username, String password) {
		// 设置方言
		// WallFilter wall = new WallFilter();
		// String dbType = null;
		// try {
		// dbType = JdbcUtils.getDbType(url, JdbcUtils.getDriverClassName(url));
		// } catch (SQLException e) {
		// throw new RuntimeException(e);
		// }
		// wall.setDbType(dbType);

		DruidPlugin dp = new DruidPlugin(url, username, password);
		dp.addFilter(new StatFilter());
		return dp;

	}

	/**
	 * Run Server
	 * 
	 * @param args
	 */
	public static void main(String[] args) {
		JFinal.start("webapp", 8082, "/", 0);
	}

}