package com.eova.config;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.beetl.core.GroupTemplate;
import org.beetl.ext.jfinal.BeetlRenderFactory;
import org.eclipse.jetty.server.Server;

import com.alibaba.druid.filter.stat.StatFilter;
import com.alibaba.druid.util.JdbcUtils;
import com.alibaba.druid.wall.WallFilter;
import com.eova.common.utils.xx;
import com.eova.core.IndexController;
import com.eova.core.button.ButtonController;
import com.eova.core.menu.MenuController;
import com.eova.core.meta.MetaController;
import com.eova.core.task.TaskController;
import com.eova.interceptor.LoginInterceptor;
import com.eova.model.Button;
import com.eova.model.EovaLog;
import com.eova.model.Menu;
import com.eova.model.MenuObject;
import com.eova.model.MetaField;
import com.eova.model.MetaObject;
import com.eova.model.Role;
import com.eova.model.RoleBtn;
import com.eova.model.Task;
import com.eova.model.User;
import com.eova.model.Widget;
import com.eova.service.ServiceManager;
import com.eova.template.masterslave.MasterSlaveController;
import com.eova.template.single.SingleController;
import com.eova.template.singletree.SingleTreeController;
import com.eova.template.treetogrid.TreeToGridController;
import com.eova.widget.WidgetController;
import com.eova.widget.form.FormController;
import com.eova.widget.grid.GridController;
import com.eova.widget.tree.TreeController;
import com.eova.widget.treegrid.TreeGridController;
import com.eova.widget.upload.UploadController;
import com.jfinal.config.Constants;
import com.jfinal.config.Handlers;
import com.jfinal.config.Interceptors;
import com.jfinal.config.JFinalConfig;
import com.jfinal.config.Plugins;
import com.jfinal.config.Routes;
import com.jfinal.plugin.activerecord.ActiveRecordPlugin;
import com.jfinal.plugin.activerecord.CaseInsensitiveContainerFactory;
import com.jfinal.plugin.activerecord.IDataSourceProvider;
import com.jfinal.plugin.activerecord.dialect.AnsiSqlDialect;
import com.jfinal.plugin.activerecord.dialect.Dialect;
import com.jfinal.plugin.activerecord.dialect.MysqlDialect;
import com.jfinal.plugin.activerecord.dialect.OracleDialect;
import com.jfinal.plugin.activerecord.dialect.PostgreSqlDialect;
import com.jfinal.plugin.druid.DruidPlugin;
import com.jfinal.plugin.druid.DruidStatViewHandler;
import com.jfinal.plugin.ehcache.EhCachePlugin;
import com.oss.controller.AuthController;
import com.oss.controller.ChartController;
import com.oss.controller.DepartmentController;
import com.oss.controller.EditController;
import com.oss.controller.ExcelController;
import com.oss.controller.StatypeController;
import com.oss.model.Department;
import com.oss.model.Left;
import com.oss.model.Stages;
import com.oss.model.Statements;
import com.oss.model.Statype;
import com.oss.model.Upper;
import com.oss.model.Users;

public class EovaConfig extends JFinalConfig{
  public static Map<String, String> props = new HashMap();
  public static String EOVA_DBTYPE = "mysql";
  public static List<String> dataSources = new ArrayList();
  private long startTime = 0L;
  
  @Override
  public void afterJFinalStart()
  {
    System.err.println("JFinal Started\n");
    
    costTime(this.startTime);
    

    Boolean isInit = xx.toBoolean(props.get("initPlugins"), Boolean.valueOf(true));
    if (isInit.booleanValue()) {
      EovaInit.initPlugins();
    }
    isInit = xx.toBoolean(props.get("initSql"), Boolean.valueOf(false));
    if ((isInit.booleanValue()) && (EOVA_DBTYPE.equals("mysql"))) {
      EovaInit.initCreateSql();
    }
  }
  
  @Override
  public void beforeJFinalStop() {}
  
  @Override
  public void configConstant(Constants me)
  {
    this.startTime = System.currentTimeMillis();
    System.err.println("Config Constants Starting...");
    EovaInit.initConfig();
    me.setDevMode(xx.toBoolean(props.get("devMode"), Boolean.valueOf(true)).booleanValue());
    me.setMainRenderFactory(new BeetlRenderFactory());
    me.setMaxPostSize(524288000);
    me.setError500View("/eova/500.html");
    me.setError404View("/eova/404.html");
    me.setBaseUploadPath("/upload");
    GroupTemplate group = BeetlRenderFactory.groupTemplate;    
    String STATIC = (String)props.get("domain_static");
    String CDN = (String)props.get("domain_cdn");
    String IMG = (String)props.get("domain_img");
    String FILE = (String)props.get("domain_file");    
    Map<String, Object> sharedVars = new HashMap();
    if (!xx.isEmpty(STATIC)) {
      sharedVars.put("STATIC", STATIC);
    } else {
      sharedVars.put("STATIC", "");
    }
    if (!xx.isEmpty(CDN)) {
      sharedVars.put("CDN", CDN);
    }
    if (!xx.isEmpty(IMG)) {
      sharedVars.put("IMG", IMG);
    }
    if (!xx.isEmpty(FILE)) {
      sharedVars.put("FILE", FILE);
    }
    PageConst.init(sharedVars);
    BeetlRenderFactory.groupTemplate.setSharedVars(sharedVars);
  }
  
  @Override
  public void configRoute(Routes me)
  {
    System.err.println("Config Routes Starting...");
    me.add("/", IndexController.class);
    
    me.add("single_grid", SingleController.class);
    me.add("single_tree", SingleTreeController.class);
    me.add("master_slave_grid", MasterSlaveController.class);
    me.add("tree_grid", TreeToGridController.class);
    
    me.add("/widget", WidgetController.class);
    me.add("/upload", UploadController.class);
    me.add("/form", FormController.class);
    me.add("/grid", GridController.class);
    me.add("/tree", TreeController.class);
    me.add("/treegrid", TreeGridController.class);
    
    me.add("/meta", MetaController.class);
    me.add("/menu", MenuController.class);
    me.add("/button", ButtonController.class);
    me.add("/auth", AuthController.class);
    me.add("/task", TaskController.class);
	me.add("/chart",ChartController.class);

    
    route(me);
  }
  
  @Override
  public void configPlugin(Plugins plugins)
  {
    System.err.println("Config Plugins Starting...");

    String eovaUrl = (String)props.get("eova_url");
    String eovaUser = (String)props.get("eova_user");
    String eovaPwd = (String)props.get("eova_pwd");
    
    String mainUrl = (String)props.get("main_url");
    String mainUser = (String)props.get("main_user");
    String mainPwd = (String)props.get("main_pwd");
    
    String statisticUrl = EovaConfig.props.get("statistic_url");
	String statisticUser = EovaConfig.props.get("statistic_user");
	String statisticPwd = EovaConfig.props.get("statistic_pwd");

    DruidPlugin dp = initDruidPlugin(mainUrl, mainUser, mainPwd);
    ActiveRecordPlugin arp = initActiveRecordPlugin(mainUrl, "main", dp);
    System.out.println("load data source:" + mainUrl + "/" + mainUser); 
    arp.setContainerFactory(new CaseInsensitiveContainerFactory());
    mapping(arp);
    plugins.add(dp).add(arp);
    
	dp = initDruidPlugin(statisticUrl, statisticUser, statisticPwd);
	arp = initActiveRecordPlugin(statisticUrl, "statistic", dp);
    System.out.println("load statistic datasource:" + statisticUrl + "/" + statisticUser);
    arp.setContainerFactory(new CaseInsensitiveContainerFactory());
    mappingStatistic(arp);
    plugins.add(dp).add(arp);
    
    dp = initDruidPlugin(eovaUrl, eovaUser, eovaPwd);
    arp = initActiveRecordPlugin(eovaUrl, "eova", dp);
    System.out.println("load eova datasource:" + eovaUrl + "/" + eovaUser);
    arp.setContainerFactory(new CaseInsensitiveContainerFactory());
    mappingEova(arp);
    plugins.add(dp).add(arp);
    
	System.out.println("插件安装完毕");
    
    try
    {
      EOVA_DBTYPE = JdbcUtils.getDbType(eovaUrl, JdbcUtils.getDriverClassName(eovaUrl));
    }
    catch (SQLException e)
    {
      e.printStackTrace();
    }
    plugin(plugins);

    ServiceManager.init();
    
    plugins.add(new EhCachePlugin());
  }
  
  @Override
  public void configInterceptor(Interceptors me)
  {
    System.err.println("Config Interceptors Starting...");
    me.add(new LoginInterceptor());
  }
  
  @Override
  public void configHandler(Handlers me)
  {
    System.err.println("Config Handlers Starting...");
    
    DruidStatViewHandler dvh = new DruidStatViewHandler("/druid");
    me.add(dvh);
  }
  
  protected void mappingEova(ActiveRecordPlugin arp)
  {
    arp.addMapping("eova_object", MetaObject.class);
    arp.addMapping("eova_field", MetaField.class);
    arp.addMapping("eova_button", Button.class);
    arp.addMapping("eova_menu", Menu.class);
    arp.addMapping("eova_menu_object", MenuObject.class);
    arp.addMapping("eova_user", User.class);
    arp.addMapping("eova_role", Role.class);
    arp.addMapping("eova_role_btn", RoleBtn.class);
    arp.addMapping("eova_log", EovaLog.class);
    arp.addMapping("eova_task", Task.class);
    arp.addMapping("eova_widget", Widget.class);
  }
  
  protected DruidPlugin initDruidPlugin(String url, String username, String password)
  {
    WallFilter wall = new WallFilter();
    String dbType = null;
    try
    {
      dbType = JdbcUtils.getDbType(url, JdbcUtils.getDriverClassName(url));
    }
    catch (SQLException e)
    {
      throw new RuntimeException(e);
    }
    wall.setDbType(dbType);
    
    DruidPlugin dp = new DruidPlugin(url, username, password);
    dp.addFilter(new StatFilter());
    dp.addFilter(wall);
    return dp;
  }
  
  protected ActiveRecordPlugin initActiveRecordPlugin(String url, String ds, IDataSourceProvider dp)
  {
    ActiveRecordPlugin arp = new ActiveRecordPlugin(ds, dp);
    
    int lv = xx.toInt(props.get("transaction_level"), 4);
    arp.setTransactionLevel(lv);
    String dbType;
    try
    {
      dbType = JdbcUtils.getDbType(url, JdbcUtils.getDriverClassName(url));
    }
    catch (SQLException e)
    {
      throw new RuntimeException(e);
    }
    //record是否对大小写敏感
    arp.setContainerFactory(new CaseInsensitiveContainerFactory());
    Dialect dialect;
    if (("mysql".equalsIgnoreCase(dbType)) || ("h2".equalsIgnoreCase(dbType)))
    {
      dialect = new MysqlDialect();
    }
    else if ("oracle".equalsIgnoreCase(dbType))
    {
      dialect = new OracleDialect();
      ((DruidPlugin)dp).setValidationQuery("select 1 FROM DUAL");
    }
    else
    {
      if ("postgresql".equalsIgnoreCase(dbType)) {
        dialect = new PostgreSqlDialect();
      } else {
        dialect = new AnsiSqlDialect();
      }
    }
    arp.setDialect(dialect);
    

    Boolean isShow = xx.toBoolean(props.get("showSql"), Boolean.valueOf(false));
    if (isShow != null) {
      arp.setShowSql(isShow.booleanValue());
    }

    dataSources.add(ds);
    
    return arp;
  }
  
  private void costTime(long time)
  {
    System.err.println("Load Cost Time:" + (System.currentTimeMillis() - time) + "ms\n");
  }

protected void plugin(Plugins plugins) {
	// TODO 自动生成的方法存根
	
}

protected void mapping(ActiveRecordPlugin arp) {
	// TODO 自动生成的方法存根
	
}

protected void mappingStatistic(ActiveRecordPlugin arp) {
	// TODO 自动生成的方法存根
	arp.addMapping("department", "depid", Department.class);
	arp.addMapping("left", "leftid", Left.class);
	arp.addMapping("stages", "stageid", Stages.class);
	arp.addMapping("statements", "staid", Statements.class);
	arp.addMapping("statype", "statid", Statype.class);
	arp.addMapping("upper", "uppid", Upper.class);
	arp.addMapping("users", "userid", Users.class);
}

protected void route(Routes me) {
	// TODO 自动生成的方法存根
	
}
}
