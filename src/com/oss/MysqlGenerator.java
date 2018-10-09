package com.oss;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import javax.sql.DataSource;

import com.alibaba.druid.filter.stat.StatFilter;
import com.eova.config.EovaConfig;
import com.jfinal.kit.PathKit;
import com.jfinal.kit.Prop;
import com.jfinal.kit.PropKit;
import com.jfinal.plugin.activerecord.ActiveRecordPlugin;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.jfinal.plugin.activerecord.dialect.MysqlDialect;
import com.jfinal.plugin.activerecord.generator.Generator;
import com.jfinal.plugin.c3p0.C3p0Plugin;
import com.jfinal.plugin.druid.DruidPlugin;

/** 
 * @author  superzbb 
 * @E-mail: 408873559@qq.com
 * @date 创建时间：2017年9月29日 下午11:02:49 
 */
public class MysqlGenerator {
	public static DataSource getDataSource() {
		Prop p = PropKit.use("config.properties");
		String statistic_url = p.get("statistic_url");
		String statistic_user = p.get("statistic_user");
		String statistic_pwd = p.get("statistic_pwd");
		C3p0Plugin c3p0Plugin = new C3p0Plugin(statistic_url,statistic_user, statistic_pwd);
		c3p0Plugin.start();
		return c3p0Plugin.getDataSource();
	}

	public static void main(String[] args) {
		// base model 所使用的包名
		String baseModelPackageName = "com.oss.basemodel";

		String baseModelOutputDir = PathKit.getWebRootPath()
				+ "\\..\\src\\com\\oss\\basemodel";
		// model 所使用的包名 (MappingKit 默认使用的包名)
		String modelPackageName = "com.oss.model";
		// model 文件保存路径 (MappingKit 与 DataDictionary 文件默认保存路径)
		String modelOutputDir = baseModelOutputDir + "/.."+"/model";
		// 创建生成器
		System.out.println(baseModelOutputDir);
		System.out.println(modelOutputDir);
		Generator gernerator = new Generator(getDataSource(),
				baseModelPackageName, baseModelOutputDir, modelPackageName,
				modelOutputDir);
		gernerator.setDialect(new MysqlDialect());
		// 添加不需要生成的表名
		gernerator.addExcludedTable(getExcTab("datatable_"));
		try{
			Connection conn = getDataSource().getConnection();
			Statement stat = conn.createStatement();
			ResultSet rs = stat.executeQuery("SELECT table_name from information_schema.tables WHERE table_name LIKE 'datatable%'");
			while(rs.next()){
				gernerator.addExcludedTable(rs.getString("table_name"));
			}
		}catch(Exception e){
			e.printStackTrace();
		}		
		gernerator.addExcludedTable(getExcTab("datatable_"));
		// 设置是否在 Model 生成 dao 对象
		gernerator.setGenerateDaoInModel(true);
		// 设置是否生成字典文件
		gernerator.setGenerateDataDictionary(false);

		// 设置需要被移除的表名前缀用于生成modelName。例如表名 "osc_user"，移除前缀 "osc_"后生成的model名为
		// "User"而非 OscUser
		//gernerator.setRemovedTableNamePrefixes("datatable_");
		// 生成
		gernerator.generate();
	}
	
	 private static String[] getExcTab(String preName){  
	        String sql="SELECT table_name from information_schema.tables WHERE table_name LIKE '"+preName+"%'";  
	        List<String> list = new ArrayList<String>();  
	        Connection conn = null;  
	        try {  
	            conn = getDataSource().getConnection();  
	            Statement stmt = conn.createStatement();  
	            ResultSet rs=stmt.executeQuery(sql);  
	            while (rs.next()) {  
	                list.add(rs.getString(1));  
	            }  
	        } catch (SQLException e) {  
	            // TODO Auto-generated catch block  
	            e.printStackTrace();  
	        }finally{  
	            try {  
	                conn.close();  
	            } catch (SQLException e) {  
	                // TODO Auto-generated catch block  
	                e.printStackTrace();  
	            }  
	        }  
	          
	        String[] s=new String[list.size()];  
	        for (int i = 0; i < list.size(); i++) {  
	            s[i]= list.get(i);  
	        }  
	        return s;  
	    } 
}
