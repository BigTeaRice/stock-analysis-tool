from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
import akshare as ak
import pandas as pd
from datetime import datetime, timedelta
import time
import logging
import json
import os

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # 启用CORS支持

# 缓存设置
cache = {}
CACHE_TIMEOUT = 300  # 5分钟缓存

def get_cached_data(key):
    """获取缓存数据"""
    if key in cache:
        data, timestamp = cache[key]
        if time.time() - timestamp < CACHE_TIMEOUT:
            return data
    return None

def set_cached_data(key, data):
    """设置缓存数据"""
    cache[key] = (data, time.time())

@app.route('/')
def index():
    """API首页"""
    return jsonify({
        "message": "股票数据API服务",
        "version": "1.0.0",
        "endpoints": {
            "yfinance": "/api/yfinance/<symbol>?period=3mo",
            "akshare": "/api/akshare/<symbol>?period=3mo",
            "health": "/api/health"
        },
        "timestamp": datetime.now().isoformat()
    })

@app.route('/api/yfinance/<symbol>')
def yfinance_endpoint(symbol):
    """yfinance数据接口"""
    try:
        period = request.args.get('period', '3mo')
        
        # 检查缓存
        cache_key = f"yfinance_{symbol}_{period}"
        cached_data = get_cached_data(cache_key)
        if cached_data:
            logger.info(f"使用缓存数据: {cache_key}")
            return jsonify(cached_data)
        
        logger.info(f"获取yfinance数据: {symbol}, 周期: {period}")
        
        # 创建ticker对象
        ticker = yf.Ticker(symbol)
        
        # 获取历史数据
        hist = ticker.history(period=period)
        
        if hist.empty:
            return jsonify({"error": "未找到股票数据", "symbol": symbol}), 404
        
        # 转换为列表格式
        data = []
        for index, row in hist.iterrows():
            data.append({
                "date": index.strftime("%Y-%m-%d"),
                "open": round(float(row['Open']), 2),
                "high": round(float(row['High']), 2),
                "low": round(float(row['Low']), 2),
                "close": round(float(row['Close']), 2),
                "volume": int(row['Volume']),
                "dividends": round(float(row['Dividends']), 4) if 'Dividends' in row and not pd.isna(row['Dividends']) else 0,
                "splits": round(float(row['Stock Splits']), 4) if 'Stock Splits' in row and not pd.isna(row['Stock Splits']) else 0
            })
        
        # 获取股票信息
        info = ticker.info
        stock_info = {
            "symbol": symbol,
            "name": info.get('longName', symbol),
            "currency": info.get('currency', 'USD'),
            "exchange": info.get('exchange', ''),
            "sector": info.get('sector', ''),
            "industry": info.get('industry', ''),
            "marketCap": info.get('marketCap', 0),
            "peRatio": info.get('trailingPE', 0),
            "previousClose": info.get('previousClose', 0),
            "regularMarketPrice": info.get('regularMarketPrice', 0)
        }
        
        result = {
            "success": True,
            "symbol": symbol,
            "period": period,
            "info": stock_info,
            "data": data,
            "lastUpdated": datetime.now().isoformat()
        }
        
        # 缓存数据
        set_cached_data(cache_key, result)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"yfinance数据获取失败: {str(e)}")
        return jsonify({"error": f"获取数据失败: {str(e)}", "symbol": symbol}), 500

@app.route('/api/akshare/<symbol>')
def akshare_endpoint(symbol):
    """AkShare数据接口"""
    try:
        period = request.args.get('period', '3mo')
        
        # 检查缓存
        cache_key = f"akshare_{symbol}_{period}"
        cached_data = get_cached_data(cache_key)
        if cached_data:
            logger.info(f"使用缓存数据: {cache_key}")
            return jsonify(cached_data)
        
        logger.info(f"获取AkShare数据: {symbol}, 周期: {period}")
        
        # 根据符号确定市场
        if symbol.startswith('6'):
            market_symbol = f"sh{symbol}"
            exchange = "上交所"
        elif symbol.startswith('0') or symbol.startswith('3'):
            market_symbol = f"sz{symbol}"
            exchange = "深交所"
        else:
            return jsonify({"error": "不支持的A股代码格式", "symbol": symbol}), 400
        
        # 获取实时数据
        realtime_data = ak.stock_zh_a_spot_em()
        if realtime_data.empty:
            return jsonify({"error": "未找到实时数据", "symbol": symbol}), 404
        
        # 筛选特定股票
        stock_data = realtime_data[realtime_data['代码'] == symbol]
        if stock_data.empty:
            return jsonify({"error": "未找到股票数据", "symbol": symbol}), 404
        
        # 获取历史数据
        # 根据period参数确定时间范围
        end_date = datetime.now().strftime("%Y%m%d")
        if period == "1d":
            start_date = datetime.now().strftime("%Y%m%d")
        elif period == "5d":
            start_date = (datetime.now() - timedelta(days=5)).strftime("%Y%m%d")
        elif period == "1mo":
            start_date = (datetime.now() - timedelta(days=30)).strftime("%Y%m%d")
        elif period == "3mo":
            start_date = (datetime.now() - timedelta(days=90)).strftime("%Y%m%d")
        elif period == "6mo":
            start_date = (datetime.now() - timedelta(days=180)).strftime("%Y%m%d")
        elif period == "1y":
            start_date = (datetime.now() - timedelta(days=365)).strftime("%Y%m%d")
        else:
            start_date = (datetime.now() - timedelta(days=90)).strftime("%Y%m%d")
        
        # 获取历史数据
        hist_data = ak.stock_zh_a_hist(symbol=symbol, period="daily", 
                                      start_date=start_date, end_date=end_date)
        
        if hist_data.empty:
            return jsonify({"error": "未找到历史数据", "symbol": symbol}), 404
        
        # 转换为列表格式
        data = []
        for index, row in hist_data.iterrows():
            data.append({
                "date": row['日期'],
                "open": round(float(row['开盘']), 2),
                "high": round(float(row['最高']), 2),
                "low": round(float(row['最低']), 2),
                "close": round(float(row['收盘']), 2),
                "volume": int(row['成交量']),
                "amount": round(float(row['成交额']), 2) if '成交额' in row else 0,
                "amplitude": round(float(row['振幅']), 2) if '振幅' in row else 0,
                "changePercent": round(float(row['涨跌幅']), 2) if '涨跌幅' in row else 0
            })
        
        # 获取股票基本信息
        stock_info = {
            "symbol": symbol,
            "name": stock_data.iloc[0]['名称'] if '名称' in stock_data.columns else symbol,
            "currency": "CNY",
            "exchange": exchange,
            "currentPrice": round(float(stock_data.iloc[0]['最新价']), 2) if '最新价' in stock_data.columns else 0,
            "change": round(float(stock_data.iloc[0]['涨跌额']), 2) if '涨跌额' in stock_data.columns else 0,
            "changePercent": round(float(stock_data.iloc[0]['涨跌幅']), 2) if '涨跌幅' in stock_data.columns else 0,
            "volume": int(stock_data.iloc[0]['成交量']),
            "amount": round(float(stock_data.iloc[0]['成交额']), 2)
        }
        
        result = {
            "success": True,
            "symbol": symbol,
            "period": period,
            "info": stock_info,
            "data": data,
            "lastUpdated": datetime.now().isoformat()
        }
        
        # 缓存数据
        set_cached_data(cache_key, result)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"AkShare数据获取失败: {str(e)}")
        return jsonify({"error": f"获取数据失败: {str(e)}", "symbol": symbol}), 500

@app.route('/api/health')
def health_check():
    """健康检查端点"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "Stock Data API",
        "version": "1.0.0"
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    # 获取端口，默认为5000
    port = int(os.environ.get('PORT', 5000))
    
    # 启动Flask应用
    print("启动股票数据API服务器...")
    print("API端点:")
    print("  - yfinance数据: /api/yfinance/<symbol>?period=3mo")
    print("  - AkShare数据: /api/akshare/<symbol>?period=3mo")
    print("  - 健康检查: /api/health")
    print(f"服务器运行在: http://localhost:{port}")
    
    app.run(host='0.0.0.0', port=port, debug=False)
