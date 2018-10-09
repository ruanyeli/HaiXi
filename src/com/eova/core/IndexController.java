package com.eova.core;

import com.eova.common.Easy;
import com.eova.common.utils.EncryptUtil;
import com.eova.common.utils.db.JdbcUtil;
import com.eova.common.utils.xx;
import com.eova.config.EovaConfig;
import com.eova.model.Menu;
import com.eova.model.User;
import com.eova.service.AuthService;
import com.eova.service.sm;
import com.eova.widget.WidgetUtil;
import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Db;

import java.io.InputStream;
import java.io.PrintStream;
import java.net.URL;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.servlet.http.HttpServletRequest;

public class IndexController
  extends Controller
{
  public void toMain()
  {
    render("/eova/main.html");
  }
  
  public void toIndex()
  {
    render("/eova/index.html");
  }
  
  public void toHeader()
  {
    User user = (User)getSessionAttr("user");
    setAttr("user", user);
    render("/eova/header.html");
  }
  
  public void toIcon()
  {
    render("/eova/icon.html");
  }
  
  public void toUe()
  {
    render("/eova/uedemo.html");
  }
  
  public void toTest()
  {
    setAttr("id", "testGrid");
    setAttr("objectCode", getPara(0));
    render("/eova/test.html");
  }
  
  public void toForm()
  {
    render("/eova/test/form.html");
  }
  
  public void toLogin()
  {
    int port = getRequest().getServerPort();
    String name = getRequest().getServerName();
    String ctx = "http://" + name + ':' + port;
    try
    {
      URL url = new URL(ctx + "/ui/css/common.css");
      InputStream in;
      in = url.openStream();
    }
    catch (Exception e1)
    {
      System.out.println("资源无法访问，请检查Web容器配置!");
      setAttr("ctx", ctx);
      render("/eova/520.html");
      return;
    }
    render("/eova/login.html");
  }
  
  public void toUpdatePwd()
  {
    User user = (User)getSessionAttr("user");
    if (xx.isEmpty(user))
    {
      setAttr("msg", "请先登录");
      toLogin();
      return;
    }
    render("/eova/updatePwd.html");
  }
  
  public void index()
  {
    User user = (User)getSessionAttr("user");
    if (user != null)
    {
      int rid = user.getInt("rid").intValue();
      

      List<Menu> cacheList = Menu.dao.queryRoot();
      
      List<Menu> rootList = new ArrayList(cacheList);
      

      Iterator<Menu> it = rootList.iterator();
      while (it.hasNext())
      {
        Menu x = (Menu)it.next();
        


        boolean flag = sm.auth.isExistsAuthByPidRid(x.getInt("id").intValue(), rid);
        if (!flag) {
          it.remove();
        }
      }
      if (xx.isEmpty(rootList))
      {
        setAttr("msg", "当前角色没有任何功能授权！");
        toLogin();
        return;
      }
      setAttr("rootList", rootList);
      toIndex();
      return;
    }
    toLogin();
  }
  
  public void doExit()
  {
    removeSessionAttr("user");
    toLogin();
  }
  
  public void doLogin()
  {
    String loginId = getPara("loginId");
    String loginPwd = getPara("loginPwd");
    
    User user = User.dao.getByLoginId(loginId);
    if (user == null)
    {
      setAttr("msg", "用户名不存在");
      toLogin();
      return;
    }
    if (!user.getStr("login_pwd").equals(EncryptUtil.getSM32(loginPwd)))
    {
      setAttr("msg", "密码错误");
      keepPara(new String[] { "loginId" });
      toLogin();
      return;
    }
    int rid = user.getInt("rid");
    int departmentid = Db.use("eova").findFirst("select * from eova_role where id = "+rid).getInt("departmentid");
    user.set("hotel_id", departmentid);
    setSessionAttr("user", user);
    
    redirect("/");
  }
  
  public void updatePwd()
  {
    String oldPwd = getPara("oldPwd");
    String newPwd = getPara("newPwd");
    String confirm = getPara("confirm");
    if (xx.isOneEmpty(new Object[] { oldPwd, newPwd, confirm }))
    {
      renderJson(new Easy("三个密码都不能为空"));
      return;
    }
    if (!newPwd.equals(confirm))
    {
      renderJson(new Easy("新密码两次输入不一致"));
      return;
    }
    User user = (User)getSessionAttr("user");
    String pwd = user.getStr("login_pwd");
    if (!pwd.equals(EncryptUtil.getSM32(oldPwd)))
    {
      renderJson(new Easy("密码错误"));
      return;
    }
    ((User)user.set("login_pwd", EncryptUtil.getSM32(newPwd))).update();
    
    renderJson(new Easy());
  }
  
  public void showTree()
  {
    Integer rootId = getParaToInt(0);
    if (rootId == null)
    {
      renderJson("系统异常");
      return;
    }
    User user = (User)getSessionAttr("user");
    int rid = user.getInt("rid").intValue();
    

    LinkedHashMap<Integer, Menu> allMenu = (LinkedHashMap)sm.auth.getByParentId(rootId.intValue());
    
    WidgetUtil.formatEasyTree(allMenu);
    
    List<String> authMenuCodeList = sm.auth.queryMenuCodeByRid(rid);
    

    LinkedHashMap<Integer, Menu> authMenu = new LinkedHashMap();
    Menu menu;
    for (Map.Entry<Integer, Menu> map : allMenu.entrySet())
    {
      menu = (Menu)map.getValue();
      if (authMenuCodeList.contains(menu.getStr("code"))) {
        authMenu.put((Integer)map.getKey(), menu);
      }
    }
    LinkedHashMap<Integer, Menu> authParent = new LinkedHashMap();
    for (Object map : authMenu.entrySet()) {
      WidgetUtil.getParent(allMenu, authParent, (Menu)((Map.Entry)map).getValue());
    }
    authParent.remove(rootId);
    


    authParent.putAll(authMenu);
    

    String json = WidgetUtil.menu2TreeJson(authParent, rootId);
    
    renderJson(json);
  }
  
  public void init()
  {
    render("/eova/init.html");
  }
  
  public void upgrade()
  {
    String isUpgrade = (String)EovaConfig.props.get("isUpgrade");
    if ((xx.isEmpty(isUpgrade)) || (!isUpgrade.equals("true")))
    {
      renderText("未开启升级模式，请启动配置 isUpgrade = true");
      return;
    }
    render("/eova/help/upgrade.html");
  }
  
  public void doInit()
  {
    String ip = getPara("ip");
    String port = getPara("port");
    String userName = getPara("userName");
    String password = getPara("password");
    
    keepPara(new String[] { ip });
    keepPara(new String[] { port });
    keepPara(new String[] { userName });
    keepPara(new String[] { password });
    
    String local_url = MessageFormat.format("jdbc:mysql://{0}:{1}/web?characterEncoding=UTF-8&zeroDateTimeBehavior=convertToNull", new Object[] { ip, port });
    







    String msg = JdbcUtil.initConnection(local_url, userName, password);
    if (msg != null)
    {
      if (msg.startsWith("Communications link failure")) {
        msg = "无法连接数据库，请检查IP:Port";
      } else if (msg.startsWith("Access denied for user")) {
        msg = "用户无权限访问，请检查用户名和密码";
      }
      setAttr("msg", msg);
      init();
      return;
    }
  }
}
