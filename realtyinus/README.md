# RealtyInUS - 房地产聚合服务

## 项目简介

RealtyInUS 是一个基于 Spring Boot 的房地产数据聚合服务，提供房产数据的查询、聚合和可视化功能。

## 功能特性

- ✅ 房地产数据聚合 (RapidAPI集成)
- ✅ 多条件筛选查询 (位置、价格、房型等)
- ✅ 并发数据获取和处理
- ✅ JSON数据导出
- ✅ HTML可视化报告生成
- ✅ 统计分析报告

## 项目结构

```
realtyinus/
├── src/
│   ├── main/
│   │   ├── java/com/ireia/realty/
│   │   │   ├── RealtyApplication.java          # Spring Boot主应用
│   │   │   ├── api/
│   │   │   │   ├── RapidApiGenericClient.java  # API客户端
│   │   │   │   └── dto/
│   │   │   │       ├── EnrichedProperty.java   # 房产数据DTO
│   │   │   │       └── EnrichedListQuery.java  # 查询参数DTO
│   │   │   ├── service/
│   │   │   │   └── RealtyAggregationService.java # 聚合服务
│   │   │   └── web/
│   │   │       └── EnrichedController.java      # REST控制器
│   │   └── resources/
│   │       └── application.yml                  # 应用配置
│   └── test/
│       └── java/com/ireia/realty/
│           └── RealtyVisualizerTest.java        # 测试和可视化工具
├── output/                                       # 输出目录
│   ├── properties_*.json                        # JSON数据
│   ├── visualization_*.html                     # HTML可视化
│   └── statistics_report_*.txt                  # 统计报告
└── pom.xml                                       # Maven配置
```

## 技术栈

- Java 17
- Spring Boot 3.2.0
- Apache HttpClient 5
- Jackson (JSON处理)
- Maven

## 快速开始

### 1. 环境要求

- Java 17+
- Maven 3.6+

### 2. 编译项目

```bash
cd realtyinus
mvn clean compile
```

### 3. 运行测试和生成可视化

```bash
mvn test-compile
mvn exec:java -Dexec.mainClass="com.ireia.realty.RealtyVisualizerTest" -Dexec.classpathScope=test
```

### 4. 查看可视化结果

生成的文件位于 `output/` 目录：
- `visualization_*.html` - 在浏览器中打开查看精美的房产卡片展示
- `properties_*.json` - JSON格式的房产数据
- `statistics_report_*.txt` - 详细的统计分析报告

## API端点

### 1. 原始列表查询
```
POST /api/listings/raw
```

### 2. 聚合查询（包含详细信息）
```
POST /api/listings/enriched
```

## 配置说明

在 `src/main/resources/application.yml` 中配置：

```yaml
server:
  port: 8080

realty:
  rapidapi:
    host: realty-in-us.p.rapidapi.com
    key: ${RAPIDAPI_KEY}  # 通过环境变量注入
  aggregation:
    detailTimeoutSec: 20
    perPageEnrichLimit: 20
```

## 查询参数示例

```json
{
  "offset": 0,
  "limit": 10,
  "city": "Boston",
  "state_code": "MA",
  "status": ["for_sale"],
  "price_min": 300000,
  "price_max": 1000000,
  "beds_min": 2,
  "baths_min": 1.5,
  "prop_type": ["single_family", "condo"],
  "sort_field": "list_date",
  "sort_dir": "desc",
  "includeDetail": true,
  "includePhotos": true
}
```

## 可视化输出示例

测试工具会生成包含以下内容的可视化报告：

### 统计概览
- 总房源数
- 平均价格
- 平均面积
- 在售房源数

### 房产卡片
每个房产包含：
- 封面图片
- 价格
- 地址
- 卧室/浴室/面积
- 房产类型和状态

### 数据分析
- 按城市分布
- 按状态分布
- 按类型分布
- 价格范围分析

## 测试结果示例

```
=== 开始生成测试数据和可视化 ===
JSON数据已保存: output/properties_20251021_154303.json
HTML可视化已生成: output/visualization_20251021_154303.html

【基本统计】
总房源数: 20
平均价格: $877,251.85
最低价格: $427,537
最高价格: $1,353,607

【按城市分布】
  Boston: 4 套
  Cambridge: 4 套
  Newton: 4 套
  Brookline: 4 套
  Somerville: 4 套
```

## 开发说明

### 添加新的数据源
在 `RapidApiGenericClient` 中添加新的API调用方法。

### 扩展聚合功能
在 `RealtyAggregationService` 中添加新的聚合逻辑。

### 自定义可视化
修改 `RealtyVisualizerTest` 中的HTML生成逻辑。

## License

MIT License

## 作者

Real-Time Real Estate Investment Analysis Team


