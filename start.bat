@set APP_HOME=%~d0%~p0
@echo APP_HOME=%APP_HOME%
@set APP_CP=%APP_HOME%webapp\WEB-INF\lib\*;%APP_HOME%webapp\WEB-INF\classes
@set JVM_OPTS= -Xms256m -Xmx1024m
java -cp %APP_CP% %JVM_OPTS% com.oss.OSSConfig webapp 8080
@pause