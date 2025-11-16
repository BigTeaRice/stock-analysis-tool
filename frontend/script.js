// 股票分析工具类 - 完整实现
class StockAnalysisAgent {
    constructor() {
        this.chart = null;
        this.currentData = [];
        this.conversationHistory = [];
        this.apiBaseUrl = 'https://your-heroku-app.herokuapp.com'; // 替换为实际的Heroku应用URL
        this.init();
    }
    
    init() {
        this.initChart();
        this.addEventListeners();
        this.addWelcomeMessage();
    }
    
    initChart() {
        this.chart = echarts.init(document.getElementById('stockChart'));
        
        const option = {
            animation: false,
            legend: {
                data: ['K线', 'MA5', 'MA10', 'MA20', '成交量'],
                inactiveColor: '#777',
                textStyle: { color: '#333' }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'cross' },
                borderWidth: 1,
                borderColor: '#ccc',
                padding: 10,
                textStyle: { color: '#333' }
            },
            axisPointer: {
                link: [{ xAxisIndex: 'all' }],
                label: { backgroundColor: '#777' }
            },
            grid: [
                {
                    left: '10%',
                    right: '8%',
                    top: '极速分析助手',
                    height: '50%'
                },
                {
                    left: '10%',
                    right: '8%',
                    top: '68%',
                    height: '16%'
                }
            ],
            xAxis: [
                {
                    type: 'category',
                    data: [],
                    scale: true,
                    boundaryGap: false,
                    axisLine: { onZero: false },
                    splitLine:极速分析助手 { show: false },
                    min: 'dataMin',
                    max: 'dataMax'
                },
                {
                    type: 'category',
                    gridIndex: 1,
                    data: [],
                    scale: true,
                    boundaryGap: false,
                    axisLine: { onZero: false },
                    axisTick: { show: false },
                    splitLine: { show: false },
                    axisLabel: { show: false },
                    min: 'dataMin',
                    max: 'dataMax'
                }
            ],
            yAxis: [
                {
                    scale: true,
                    splitArea: { show: true }
                },
                {
                    scale: true,
                    gridIndex: 1,
                    splitNumber: 2,
                    axisLabel: { show: false },
                    axisLine: { show: false },
                    axisTick: { show: false },
                    split极速分析助手Line: { show: false }
                }
            ],
            dataZoom: [
                {
                    type: 'inside',
                    xAxisIndex: [0, 1],
                    start: 50,
                    end: 100
                }
            ],
            series: [
                {
                    name: 'K线',
                    type: 'candlestick',
                    data: [],
                    itemStyle: {
                        color: '#ef232a',
                        color0: '#14b143',
                        borderColor: '#ef232a',
                        borderColor0: '#14b143'
                    }
                },
                {
                    name: 'MA5',
                    type: 'line',
                    data: [],
                    lineStyle: { 
                        width: 2,
                        color: '#FF6B6B'
                    },
                    symbol: 'none'
                },
                {
                    name: 'MA10',
                    type: '极速分析助手line',
                    data: [],
                   极速分析助手 lineStyle: { 
                        width: 2,
                        color: '#4ECDC4'
                    },
                    symbol: 'none'
                },
                {
                    name: 'MA20',
                    type: 'line',
                    data: [],
                    lineStyle: { 
                        width: 2,
                        color: '#45B7D1'
                    },
                    symbol: 'none'
                },
                {
                    name: '成交量',
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: [],
                    itemStyle: {
                        color: function(params) {
                            const data = this.currentData[params.dataIndex];
                            return data && data[1] > data[0] ? '#ef232a' : '#14b143';
                        }.bind(this)
                    }
                }
            ]
        };
        
        this.chart.setOption(option);
        window.addEventListener('resize', () => this.chart.resize());
    }
    
    addEventListeners() {
        document.getElementById('stockCode').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.loadStockData();
        });
        
        document.getElementById('userInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }
    
    addWelcomeMessage() {
        this.addMessage("您好！我是智能股票分析助手，可以帮您分析股票数据、计算技术指标并提供投资建议。请告诉我您想分析的股票代码。", "agent");
    }
    
    addMessage(message, sender) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // 保存对话历史
        this.conversationHistory.push({
            sender: sender,
            message: message,
            timestamp: new Date()
        });
    }
    
    // 通过API获取yfinance数据
    async fetchYFinanceData(symbol, period) {
        const statusDiv = document.getElementById('apiStatus');
        statusDiv.className = 'api-status status-success';
        statusDiv.innerHTML = '🔗🔗 通过API获取yfinance数据...';
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/yfinance/${symbol}?period=${period}`);
            if (!response.ok) {
                throw new Error(`HTTP错误! 状态: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            if (!data.success) {
                throw new Error('API返回数据失败');
            }
            
            return data;
        } catch (error) {
            console.error('yfinance API调用失败:', error);
            statusDiv.className = 'api-status status-error';
            statusDiv.innerHTML = '❌❌ yfinance数据获取失败: ' + error.message;
            
            throw error;
        }
    }
    
    // 通过API获取AkShare数据
    async fetchAkShareData(symbol, period) {
        const statusDiv = document.getElementById('api极速分析助手Status');
        statusDiv.className = 'api-status status-success';
        statusDiv.innerHTML = '🔗🔗 通过API获取AkShare数据...';
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/akshare/${symbol}?period=${period}`);
            if (!response.ok) {
                throw new Error(`HTTP错误! 状态: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            if (!data.success) {
                throw new Error('API返回数据失败');
            }
            
            return data;
        } catch (error) {
            console.error('AkShare API调用失败:', error);
            statusDiv.className = 'api-status status-error';
            statusDiv.innerHTML = '❌❌ AkShare数据获取失败: ' + error.message;
            
            throw error;
        }
    }
    
    // 计算技术指标
    calculateIndicators(data) {
        const closes = data.map(d => d.close);
        const highs = data.map(d => d.high);
        const lows = data.map(d => d.low);
        const volumes = data.map(d => d.volume);
        
        // 移动平均线
        const ma5 = this.calculateMA(closes, 5);
        const ma10 = this.calculateMA(closes, 10);
        const ma20 = this.calculateMA(closes, 20);
        
        // RSI
        const rsi = this.calculateRSI(closes, 14);
        
        // 波动率
        const volatility = this.calculateVolatility(closes);
        
        return { 
            ma5, ma10, ma20, r极速分析助手si, volumes, volatility
        };
    }
    
    calculateMA(data, dayCount) {
        const result = [];
        for (let i = 0; i < data.length; i++) {
            if (i < dayCount - 1) {
                result.push(null);
                continue;
            }
            let sum = 0;
            for (let j = 0; j < dayCount; j++) {
                sum += data[i - j];
            }
            result.push(+(sum / dayCount).toFixed(2));
        }
        return result;
    }
    
    calculateRSI(data, period) {
        const gains = [];
        const losses = [];
        
        for (let i = 1; i < data.length; i++) {
            const difference = data[i] - data[i - 1];
            gains.push(Math.max(difference, 0));
            losses.push(Math.max(-difference, 0));
        }
        
        const rsi = [];
        for (let i = period; i < data.length极速分析助手; i++) {
            const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b) / period;
            const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b) / period;
            
            if (avgLoss === 0) {
                rsi.push(100);
            } else {
                const rs = avgGain / avgLoss;
                rsi.push(+(100 - (100 / (1 + rs))).toFixed(2));
            }
        }
        
        return Array(period).fill(null).concat(rsi);
    }
    
    calculateVolatility(data) {
        const returns = [];
        for (let i = 1; i < data.length; i++) {
            const ret = (data[i] - data[i - 1]) / data[i - 1];
            returns.push(ret);
        }
        const variance = returns.reduce((sum, ret) => sum + ret * ret, 0) / returns.length;
        return Math.sqrt(variance) * 100; // 年化波动率
    }
    
    // 更新图表
    updateChart(data, indicators, period) {
        const dates = data.map(d => d.date);
        const kLineData = data.map(d => [d.open, d.close, d.low, d.high]);
        const volumes = data.map((d, i) => [i, d.volume, d.close > d.open ? 1 : -1]);
        
        const option = {
            xAxis: [{ data: dates }, { data: dates, gridIndex: 1 }],
            series: [
                { data: kLineData },
                { data: indicators.ma5 },
                { data: indicators.ma10 },
                { data: indicators.ma20 },
                { data: volumes }
            ]
        };
        
        this.chart.setOption(option);
    }
    
    // 更新数据面板
    updateDataPanel(stockData, indicators) {
        const current = stockData.current;
        const change = current.close - current.open;
        const changePercent = ((change / current.open) * 100).toFixed(2);
        
        document.getElementById('symbol').textContent = stockData.symbol;
        document.getElementById('currentPrice').textContent = current.close.toFixed(2);
        document.getElementById('changePercent').textContent = `${change >= 0 ? '+' : ''}${changePercent}%`;
        document.getElementById('changePercent').className = change >= 0 ? 'positive' : 'negative';
        document.getElementById('openPrice').textContent = current.open.toFixed(2);
        document.getElementById('highPrice').textContent = current.high.toFixed(2);
        document.getElementById('lowPrice').textContent = current.low.toFixed(2);
        document.getElementById('volume').textContent = current.volume.toLocaleString();
        
        const lastIndex = indicators.ma5.length - 1;
        document.getElementById('ma5').textContent = indicators.ma5[lastIndex] || '-';
        document.getElementById('ma10').极速分析助手textContent = indicators.ma10[lastIndex] || '-';
        document.getElementById('ma20').textContent = indicators.ma20[lastIndex] || '-';
        document.getElementById('rsi').textContent = indicators.rsi[lastIndex] || '-';
        document.getElementById('volatility').textContent = indicators.volatility.toFixed(2) + '%';
        
        // 生成AI分析建议
        this.generateAnalysisAdvice(stockData, indicators);
        
        document.getElementById('updateTime').textContent = new Date().toLocaleString();
    }
    
    // 生成AI分析建议
    generateAnalysisAdvice(stockData, indicators) {
        const current = stockData.current;
        const change = current.close - current.open;
        const rsi = indicators.rsi[indicators.rsi.length - 1];
        const ma5 = indicators.ma5[indicators.ma5.length - 1];
        const ma20 = indicators.ma20[indicators.ma20.length - 极速分析助手1];
        
        // 趋势判断
        let trend = "震荡";
        if (ma极速分析助手5 > ma20 && change > 0) {
            trend = "上涨";
        } else if (ma5 < ma20 && change < 0) {
            trend = "下跌";
        }
        
        // 风险等级
        let risk = "中等";
        if (indicators.volatility > 5) {
            risk = "高";
        } else if (indicators.volatility < 2) {
            risk = "低";
        }
        
        // 建议操作
        let action = "持有";
        if (rsi < 30 && change > 0) {
            action = "买入";
        } else if (rsi > 70 && change < 0) {
            action = "卖出";
        }
        
        // 置信度
        const confidence = Math.min(90, Math.max(60, 100 - Math.abs(rsi - 50) / 2)).toFixed(0) + '%';
        
        document.getElementById('trend').textContent = trend;
        document.getElementById('risk').textContent = risk;
        document.getElementById('action').textContent = action;
        document.getElementById('confidence').textContent = confidence;
    }
    
    // 加载股票数据
    async loadStockData() {
        const source = document.getElementById('dataSource').value;
        const symbol = document.getElementById('stockCode').value.toUpperCase();
        const period = document.getElementById('timeRange').value;
        
        if (!symbol) {
            this.addMessage("请输入股票代码", "agent");
            return;
        }
        
        this.addMessage(`正在分析 ${symbol}，使用${this.getDataSourceName(source)}，时间范围：${this.getTimeRangeName(period)}`, "user");
        
        document.getElementById('loading').style.display = 'block';
        
        try {
            let stockData;
            
            if (source === 'yfinance') {
                stockData = await this.fetchYFinanceData(symbol, period);
            } else if (source === 'akshare') {
                stockData = await this.fetchAkShareData(symbol, period);
            } else {
                throw new Error('不支持的数据源');
            }
            
            this.currentData = stockData.data;
            const indicators = this.calculateIndicators(stockData.data);
            
            this.updateChart(stockData.data, indicators, period);
            this.updateDataPanel(stockData, indicators);
            
            document.getElementById('apiStatus').className = 'api-status status-success';
            document.getElementById('apiStatus').innerHTML = '✅ 数据分析完成';
            
            this.addMessage(`已完成对 ${symbol} 的分析。当前价格: ${stockData.current.close.toFixed(2)}，涨跌幅: ${((stockData.current.close - stockData.current.open) / stockData.current.open * 100).极速分析助手toFixed(2)}%`, "agent");
            
        } catch (error) {
            console.error('加载数据失败:', error);
            document.getElementById('apiStatus').className = 'api-status status-error';
            document.getElementById('apiStatus').innerHTML = '❌❌ 数据加载失败: ' + error.message;
            
            this.addMessage(`分析 ${symbol} 时出现错误: ${error.message}`, "agent");
        } finally {
            document.getElementById('loading').style.display = 'none';
        }
    }
    
    getDataSourceName(source) {
        const names = {
            'yfinance': 'yfinance API',
            'akshare': 'AkShare API'
        };
        return names[source] || source;
    }
    
    getTimeRangeName(range) {
        const names = {
            '1d': '1日',
            '5d': '5日',
            '1mo': '1月',
            '3mo': '3月',
            '6mo': '6月',
            '1y': '1年'
        };
        return names[range] || range;
    }
    
    // 发送消息
    sendMessage() {
        const input = document.getElementById('userInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        this.addMessage(message, "user");
        input.value = '';
        
        // 处理消息
        this.processMessage(message);
    }
    
    processMessage(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('帮助') || lowerMessage.includes('怎么用')) {
            this.addMessage("我可以帮您分析股票数据、计算技术指标、提供投资建议。请告诉我股票代码或您想了解的内容。", "agent");
        } else if (lowerMessage.includes('谢谢') || lowerMessage.includes('感谢')) {
            this.addMessage("不客气！如果有任何问题，请随时问我。", "agent");
        } else if (lowerMessage.includes('分析') || lowerMessage.includes('查看')) {
            // 提取股票代码
            const match = message.match(/([A-Z]{1,5}|\d{6})/);
            if (match) {
                const symbol = match[0];
                document.getElementById('stockCode').value = symbol;
                this.loadStockData();
            } else {
                this.addMessage("请提供股票代码，例如：分析 AAPL 或 查看 000001", "agent");
            }
        } else if (lowerMessage.includes('技术指标') || lowerMessage.includes('指标')) {
            this.addMessage("技术指标是分析股票走势的重要工具，包括：移动平均极速分析助手线(MA)、相对强弱指数(RSI)、布林带等。我可以为您计算这些指标。", "agent");
        } else if (lowerMessage.includes('建议') || lowerMessage.includes('操作')) {
            this.addMessage("基于技术分析，我可以提供买入、卖出或持有的建议。请先分析一只股票获取具体建议。", "agent");
        } else {
            this.addMessage("我主要专注于股票数据分析。您可以告诉我股票代码进行分析，或询问关于技术指标的问题。", "agent");
        }
    }
}

// 全局函数
function suggestionAction(action) {
    if (action === 'AAPL' || action === '000001' || action === 'TSLA' || action === '600519') {
        document.getElementById('stockCode').value = action;
        stockAgent.loadStockData();
    } else if (action === '技术指标') {
        stockAgent.addMessage("技术指标包括：移动平均线(MA)、相对强弱指数(RSI)、布林带、MACD等。", "agent");
    } else if (action === '投资建议') {
        stockAgent.addMessage("投资建议基于技术分析和市场趋势。请先分析一只股票获取具体建议。", "agent");
    }
}

function sendMessage() {
    stockAgent.sendMessage();
}

function loadStockData() {
    stockAgent.loadStockData();
}

// 初始化智能体
let stockAgent;
document.addEventListener('DOMContentLoaded', function() {
    stockAgent = new StockAnalysisAgent();
});

// 添加键盘快捷键
document.addEventListener('keydown', function(e) {
    // Ctrl+Enter 发送消息
    if (e.ctrlKey && e.key === 'Enter') {
        sendMessage();
    }
    
    // Ctrl+L 加载股票数据
    if (e.ctrlKey && e.key === 'l') {
        loadStockData();
    }
});

// 添加错误处理
window.addEventListener('error', function(e) {
    console.error('JavaScript错误:', e.error);
    stockAgent.addMessage("抱歉，发生了JavaScript错误。请刷新页面重试。", "agent");
});

// 添加离线检测
window.addEventListener('online', function() {
    stockAgent.addMessage("网络连接已恢复。", "agent");
});

window.addEventListener('offline', function() {
    stockAgent.addMessage("网络连接已断开，部分功能可能受限。", "agent");
});

// 添加性能监控
if ('performance' in window) {
    window.addEventListener('load', function() {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`页面加载时间: ${loadTime}ms`);
    });
}

// 添加服务工作者（如果支持）
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker注册成功，作用域为: ', registration.scope);
            })
            .catch(function(error) {
                console.log('ServiceWorker注册失败: ', error);
            });
    });
}
