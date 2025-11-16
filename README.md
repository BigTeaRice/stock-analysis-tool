# 股票分析工具

一个基于Web的股票分析工具，集成yfinance和AkShare数据，提供技术分析和投资建议。

## 功能特点

- 实时股票数据获取（国际股票和A股）
- 技术指标计算（MA、RSI、波动率等）
- AI分析建议和趋势判断
- 交互式K线图表
- 自然语言对话交互

## 部署结构

- 前端：GitHub Pages
- 后端：Heroku（Flask应用）

## 本地开发

### 前端开发

# 智能股票分析工具 - GitHub Pages部署指南

## 项目概述
这是一个完整的股票分析工具，包含前端界面、技术指标计算和AI分析建议功能，专为GitHub Pages部署设计。

## 部署步骤

### 1. 创建GitHub仓库
1. 在GitHub上创建新仓库
2. 将提供的`index.html`文件上传到仓库根目录
3. 确保文件名完全为`index.html`（区分大小写）

### 2. 配置GitHub Pages
1. 进入仓库Settings → Pages
2. 在"Build and deployment"部分：
   - Source选择"GitHub Actions"
   - 分支选择main或master

### 3. 配置GitHub Actions（可选）
1. 在仓库中创建`.github/workflows/deploy.yml`文件
2. 使用提供的YAML配置内容
3. 提交并推送代码

### 4. 访问应用
部署完成后，访问：`https://[用户名].github.io/[仓库名]`

## 文件结构要求

