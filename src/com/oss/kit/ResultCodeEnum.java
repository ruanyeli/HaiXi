package com.oss.kit;

public enum ResultCodeEnum {
	SUCCESS("0", "Success"),
	INNERERROR("500","内部错误请重试"),
	DATABASE_ERROR("101","数据库异常，请稍后重试"),
	DATA_ERROR("102","参数异常，请重试"),
	HAVE_SAMENAME("103","名称重复，请修改"),
	LIST_IS_NULL("104","数据不存在，请重新查询"),
	STAGE_ERROE("105","该衍生报表维度大于原报表维度，不可生成数据"),
	TIME_ERROE("106","时间选择有误，请重新选择");
	private String code;
    private String desc;

    ResultCodeEnum(String code, String desc)
    {
        this.code = code;
        this.desc = desc;
    }

    public String getCode()
    {
        return code;
    }

    public String getDesc()
    {
        return desc;
    }
}
