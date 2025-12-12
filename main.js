// 工资计算器类
class SalaryCalculator {
    constructor() {
        this.dailySalary = 0;
        this.startTime = null;
        this.endTime = null;
        this.updateFrequency = 500;
        this.isRunning = false;
        this.intervalId = null;
        this.currentCurrency = 'RMB'; // RMB 或 USD
        this.exchangeRate = 7; // 1 USD = 7 RMB
        
        // K线图相关
        this.chart = null;
        this.chartData = []; // 存储历史数据点 {time, value}
        this.maxDataPoints = 50; // 最多显示50个数据点
        
        this.initElements();
        this.bindEvents();
        this.initChart();
    }
    
    // 初始化DOM元素
    initElements() {
        this.elements = {
            dailySalary: document.getElementById('dailySalary'),
            startTime: document.getElementById('startTime'),
            endTime: document.getElementById('endTime'),
            updateFrequency: document.getElementById('updateFrequency'),
            startBtn: document.getElementById('startBtn'),
            stopBtn: document.getElementById('stopBtn'),
            moneyDisplay: document.getElementById('moneyDisplay'),
            currencyUnit: document.getElementById('currencyUnit'),
            currencySymbol: document.getElementById('currencySymbol'),
            currencyToggle: document.getElementById('currencyToggle'),
            statusIndicator: document.getElementById('statusIndicator'),
            workDuration: document.getElementById('workDuration'),
            hourlyRate: document.getElementById('hourlyRate'),
            progressBar: document.getElementById('progressBar'),
            progressPercent: document.getElementById('progressPercent')
        };
    }
    
    // 绑定事件
    bindEvents() {
        this.elements.startBtn.addEventListener('click', () => this.start());
        this.elements.stopBtn.addEventListener('click', () => this.stop());
        this.elements.currencyToggle.addEventListener('click', () => this.toggleCurrency());
        
        // 输入框变化时更新显示
        this.elements.dailySalary.addEventListener('input', () => {
            if (this.isRunning) {
                this.updateDisplay();
            }
        });
    }
    
    // 开始计算
    start() {
        // 获取输入值
        this.dailySalary = parseFloat(this.elements.dailySalary.value) || 0;
        this.updateFrequency = parseInt(this.elements.updateFrequency.value) || 500;
        
        const startTimeStr = this.elements.startTime.value;
        const endTimeStr = this.elements.endTime.value;
        
        if (!startTimeStr || !endTimeStr) {
            alert('请设置工作时间区间！');
            return;
        }
        
        if (this.dailySalary <= 0) {
            alert('请输入有效的日薪！');
            return;
        }
        
        // 解析时间
        this.startTime = this.parseTime(startTimeStr);
        this.endTime = this.parseTime(endTimeStr);
        
        if (this.endTime <= this.startTime) {
            alert('结束时间必须晚于开始时间！');
            return;
        }
        
        // 重置图表数据并生成历史数据
        this.chartData = [];
        this.generateHistoricalData();
        
        // 开始运行
        this.isRunning = true;
        this.elements.startBtn.classList.add('hidden');
        this.elements.stopBtn.classList.remove('hidden');
        
        // 更新状态指示器
        this.updateStatusIndicator('running');
        
        // 立即更新一次显示
        this.updateDisplay();
        
        // 设置定时器
        this.intervalId = setInterval(() => {
            this.updateDisplay();
        }, this.updateFrequency);
    }
    
    // 生成从工作开始到当前时间的所有历史数据（按分钟）
    generateHistoricalData() {
        const now = this.getCurrentTime();
        const currentTimeInMs = now.getHours() * 3600000 + now.getMinutes() * 60000 + now.getSeconds() * 1000;
        const startTimeInMs = this.startTime.getHours() * 3600000 + this.startTime.getMinutes() * 60000;
        
        // 如果当前时间早于开始时间，不生成历史数据
        if (currentTimeInMs < startTimeInMs) {
            return;
        }
        
        // 计算已经过去的分钟数
        const workedMinutes = Math.floor((currentTimeInMs - startTimeInMs) / 60000);
        const totalMinutes = this.calculateTotalMinutes();
        
        // 为每一分钟生成数据点
        for (let i = 0; i <= workedMinutes; i++) {
            const minuteEarnings = (this.dailySalary / totalMinutes) * i;
            const timeInMs = startTimeInMs + (i * 60000);
            const hours = Math.floor(timeInMs / 3600000);
            const minutes = Math.floor((timeInMs % 3600000) / 60000);
            const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            
            let displayValue = minuteEarnings;
            if (this.currentCurrency === 'USD') {
                displayValue = minuteEarnings / this.exchangeRate;
            }
            
            // RMB精确到1元，USD精确到0.1
            if (this.currentCurrency === 'RMB') {
                displayValue = Math.round(displayValue);
            } else {
                displayValue = Math.round(displayValue * 10) / 10;
            }
            
            this.chartData.push({
                time: timeStr,
                value: displayValue,
                minute: i // 记录是第几分钟
            });
        }
        
        // 更新图表显示
        this.updateChartDisplay();
    }
    
    // 停止计算
    stop() {
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        this.elements.startBtn.classList.remove('hidden');
        this.elements.stopBtn.classList.add('hidden');
        
        // 更新状态指示器
        this.updateStatusIndicator('stopped');
    }
    
    // 解析时间字符串为今天的Date对象
    parseTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    }
    
    // 获取当前时间
    getCurrentTime() {
        return new Date();
    }
    
    // 计算已工作时长（分钟，精确到毫秒）
    calculateWorkedMinutes() {
        const now = this.getCurrentTime();
        
        // 计算精确的时间戳（毫秒）
        const currentTimeInMs = now.getHours() * 3600000 + now.getMinutes() * 60000 + now.getSeconds() * 1000 + now.getMilliseconds();
        const startTimeInMs = this.startTime.getHours() * 3600000 + this.startTime.getMinutes() * 60000;
        const endTimeInMs = this.endTime.getHours() * 3600000 + this.endTime.getMinutes() * 60000;
        
        // 如果当前时间早于开始时间
        if (currentTimeInMs < startTimeInMs) {
            return 0;
        }
        
        // 如果当前时间晚于结束时间
        if (currentTimeInMs >= endTimeInMs) {
            return (endTimeInMs - startTimeInMs) / 60000; // 转换为分钟
        }
        
        // 正常工作时间内，返回精确的分钟数（包含小数）
        return (currentTimeInMs - startTimeInMs) / 60000;
    }
    
    // 计算总工作时长（分钟）
    calculateTotalMinutes() {
        const startTimeInMinutes = this.startTime.getHours() * 60 + this.startTime.getMinutes();
        const endTimeInMinutes = this.endTime.getHours() * 60 + this.endTime.getMinutes();
        return endTimeInMinutes - startTimeInMinutes;
    }
    
    // 计算当前已赚金额
    calculateCurrentEarnings() {
        const workedMinutes = this.calculateWorkedMinutes();
        const totalMinutes = this.calculateTotalMinutes();
        
        if (totalMinutes <= 0) return 0;
        
        const earnings = (this.dailySalary / totalMinutes) * workedMinutes;
        return Math.max(0, earnings);
    }
    
    // 更新显示
    updateDisplay() {
        const earningsRMB = this.calculateCurrentEarnings();
        const workedMinutes = this.calculateWorkedMinutes();
        const totalMinutes = this.calculateTotalMinutes();
        
        // 根据当前货币单位显示
        let displayAmount = earningsRMB;
        if (this.currentCurrency === 'USD') {
            displayAmount = earningsRMB / this.exchangeRate;
        }
        
        // 更新金额显示（添加动画效果）
        this.elements.moneyDisplay.classList.add('animate-number-change');
        this.elements.moneyDisplay.textContent = displayAmount.toFixed(2);
        setTimeout(() => {
            this.elements.moneyDisplay.classList.remove('animate-number-change');
        }, 300);
        
        // 更新工作时长
        const hours = Math.floor(workedMinutes / 60);
        const minutes = Math.floor(workedMinutes % 60);
        const seconds = Math.floor((workedMinutes * 60) % 60);
        this.elements.workDuration.textContent = `${hours}小时${minutes}分${seconds}秒`;
        
        // 更新时薪
        const hourlyRateRMB = totalMinutes > 0 ? (this.dailySalary / totalMinutes) * 60 : 0;
        let hourlyRateDisplay = hourlyRateRMB;
        if (this.currentCurrency === 'USD') {
            hourlyRateDisplay = hourlyRateRMB / this.exchangeRate;
        }
        const currencySymbol = this.currentCurrency === 'RMB' ? '¥' : '$';
        this.elements.hourlyRate.textContent = `${currencySymbol}${hourlyRateDisplay.toFixed(2)}`;
        
        // 更新工作完成进度条
        const progress = totalMinutes > 0 ? (workedMinutes / totalMinutes) * 100 : 0;
        const progressClamped = Math.min(100, Math.max(0, progress));
        if (this.elements.progressBar && this.elements.progressPercent) {
            this.elements.progressBar.style.width = `${progressClamped}%`;
            this.elements.progressPercent.textContent = `${progressClamped.toFixed(1)}%`;
        }
        
        // 更新图表数据
        this.updateChartData(displayAmount);
    }
    
    // 切换货币单位
    toggleCurrency() {
        const oldCurrency = this.currentCurrency;
        
        if (this.currentCurrency === 'RMB') {
            this.currentCurrency = 'USD';
            this.elements.currencyUnit.textContent = 'USD';
            this.elements.currencySymbol.textContent = '$ USD';
        } else {
            this.currentCurrency = 'RMB';
            this.elements.currencyUnit.textContent = 'RMB';
            this.elements.currencySymbol.textContent = '¥ RMB';
        }
        
        // 转换图表数据
        if (oldCurrency === 'RMB' && this.currentCurrency === 'USD') {
            // RMB -> USD，精确到0.1
            this.chartData = this.chartData.map(d => ({
                time: d.time,
                value: Math.round((d.value / this.exchangeRate) * 10) / 10,
                minute: d.minute
            }));
        } else if (oldCurrency === 'USD' && this.currentCurrency === 'RMB') {
            // USD -> RMB，精确到1元
            this.chartData = this.chartData.map(d => ({
                time: d.time,
                value: Math.round(d.value * this.exchangeRate),
                minute: d.minute
            }));
        }
        
        // 更新图表显示
        if (this.chartData.length > 0) {
            this.updateChartDisplay();
        }
        
        // 如果正在运行，更新显示
        if (this.isRunning) {
            this.updateDisplay();
        } else {
            // 如果未运行，只更新金额显示
            const currentAmount = parseFloat(this.elements.moneyDisplay.textContent) || 0;
            let newAmount;
            if (this.currentCurrency === 'USD') {
                newAmount = currentAmount / this.exchangeRate;
            } else {
                newAmount = currentAmount * this.exchangeRate;
            }
            this.elements.moneyDisplay.textContent = newAmount.toFixed(2);
        }
    }
    
    // 更新状态指示器
    updateStatusIndicator(status) {
        const indicator = this.elements.statusIndicator;
        
        if (status === 'running') {
            indicator.className = 'inline-flex items-center px-6 py-3 rounded-full text-white font-semibold status-running';
            indicator.innerHTML = '<span class="w-3 h-3 rounded-full mr-2"></span>计算中...';
        } else if (status === 'stopped') {
            indicator.className = 'inline-flex items-center px-6 py-3 rounded-full text-white font-semibold status-stopped';
            indicator.innerHTML = '<span class="w-3 h-3 rounded-full mr-2"></span>已停止';
        } else {
            indicator.className = 'inline-flex items-center px-6 py-3 rounded-full bg-gray-500/30 text-white font-semibold';
            indicator.innerHTML = '<span class="w-3 h-3 bg-gray-400 rounded-full mr-2"></span>未开始';
        }
    }
    
    // 初始化图表
    initChart() {
        const chartDom = document.getElementById('salaryChart');
        this.chart = echarts.init(chartDom);
        
        const option = {
            backgroundColor: 'transparent',
            grid: {
                left: '5%',
                right: '3%',
                top: '10%',
                bottom: '10%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: [],
                axisLine: {
                    lineStyle: {
                        color: '#2a2a2a'
                    }
                },
                axisLabel: {
                    color: '#8c8c8c',
                    fontSize: 11,
                    formatter: (value) => {
                        // 只显示小时部分
                        return value.split(':')[0];
                    },
                    interval: (index, value) => {
                        // 只在整点小时显示标签（分钟为00）
                        return value.endsWith(':00');
                    }
                },
                splitLine: {
                    show: false
                }
            },
            yAxis: {
                type: 'value',
                min: 0,
                max: null, // 将在更新时动态设置
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    color: '#8c8c8c',
                    fontSize: 11,
                    formatter: (value) => {
                        // RMB显示整数，USD显示一位小数
                        if (this.currentCurrency === 'RMB') {
                            return Math.floor(value);
                        } else {
                            return value.toFixed(1);
                        }
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: '#2a2a2a',
                        type: 'dashed'
                    }
                },
                minInterval: this.currentCurrency === 'RMB' ? 1 : 0.1,
                scale: false
            },
            series: [{
                name: '工资',
                type: 'line',
                data: [],
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: {
                    color: '#00b894',
                    width: 2
                },
                itemStyle: {
                    color: '#00b894',
                    borderColor: '#00b894',
                    borderWidth: 2
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 0,
                            color: 'rgba(0, 184, 148, 0.3)'
                        }, {
                            offset: 1,
                            color: 'rgba(0, 184, 148, 0.05)'
                        }]
                    }
                },
                emphasis: {
                    focus: 'series',
                    itemStyle: {
                        color: '#00b894',
                        borderColor: '#fff',
                        borderWidth: 2,
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 184, 148, 0.5)'
                    }
                }
            }],
            tooltip: {
                trigger: 'axis',
                backgroundColor: '#1a1a1a',
                borderColor: '#2a2a2a',
                borderWidth: 1,
                textStyle: {
                    color: '#fff',
                    fontSize: 12
                },
                formatter: (params) => {
                    const param = params[0];
                    const currencySymbol = this.currentCurrency === 'RMB' ? '¥' : '$';
                    const precision = this.currentCurrency === 'RMB' ? 0 : 1;
                    return `${param.name}<br/>${currencySymbol}${param.value.toFixed(precision)}`;
                }
            }
        };
        
        this.chart.setOption(option);
        
        // 响应式调整
        window.addEventListener('resize', () => {
            this.chart.resize();
        });
    }
    
    // 更新图表数据（按分钟更新）
    updateChartData(value) {
        const now = new Date();
        const currentTimeInMs = now.getHours() * 3600000 + now.getMinutes() * 60000;
        const startTimeInMs = this.startTime.getHours() * 3600000 + this.startTime.getMinutes() * 60000;
        
        // 计算当前是第几分钟
        const currentMinute = Math.floor((currentTimeInMs - startTimeInMs) / 60000);
        
        // 如果还没有数据，不做任何操作
        if (this.chartData.length === 0) {
            return;
        }
        
        const lastDataPoint = this.chartData[this.chartData.length - 1];
        
        // RMB精确到1元，USD精确到0.1
        let preciseValue;
        if (this.currentCurrency === 'RMB') {
            preciseValue = Math.round(value);
        } else {
            preciseValue = Math.round(value * 10) / 10;
        }
        
        // 如果进入了新的一分钟，添加新数据点并更新图表
        if (lastDataPoint.minute < currentMinute) {
            const hours = Math.floor(currentTimeInMs / 3600000);
            const minutes = Math.floor((currentTimeInMs % 3600000) / 60000);
            const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            
            this.chartData.push({
                time: timeStr,
                value: preciseValue,
                minute: currentMinute
            });
            
            // 限制数据点数量
            if (this.chartData.length > this.maxDataPoints) {
                this.chartData.shift();
            }
            
            // 只在新分钟时更新图表显示
            this.updateChartDisplay();
        } else {
            // 同一分钟内只更新数据，不刷新图表
            lastDataPoint.value = preciseValue;
        }
    }
    
    // 更新图表显示
    updateChartDisplay() {
        const times = this.chartData.map(d => d.time);
        const values = this.chartData.map(d => d.value);
        
        // 计算Y轴最大值（日薪）
        let maxValue = this.dailySalary;
        if (this.currentCurrency === 'USD') {
            maxValue = this.dailySalary / this.exchangeRate;
        }
        
        // RMB精确到1元，USD精确到0.1
        if (this.currentCurrency === 'RMB') {
            maxValue = Math.ceil(maxValue);
        } else {
            maxValue = Math.ceil(maxValue * 10) / 10;
        }
        
        this.chart.setOption({
            xAxis: {
                data: times
            },
            yAxis: {
                max: maxValue,
                minInterval: this.currentCurrency === 'RMB' ? 1 : 0.1
            },
            series: [{
                data: values
            }]
        });
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    const calculator = new SalaryCalculator();
});