/**
 * Visualizer for Water Quality Data
 * Creates interactive charts using Plotly.js
 */

class Visualizer {
    constructor(containerId = 'chart') {
        this.container = document.getElementById(containerId);
        this.currentChart = null;
        this.data = [];
    }

    /**
     * Create a scatter plot
     * @param {Array} xData - X-axis data
     * @param {Array} yData - Y-axis data
     * @param {string} xLabel - X-axis label
     * @param {string} yLabel - Y-axis label
     * @param {string} title - Chart title
     */
    scatterPlot(xData, yData, xLabel, yLabel, title) {
        const trace = {
            x: xData,
            y: yData,
            mode: 'markers',
            type: 'scatter',
            marker: {
                size: 8,
                color: '#0066cc',
                opacity: 0.7,
                line: {
                    color: '#0052a3',
                    width: 1
                }
            },
            name: 'Data Points'
        };

        const layout = {
            title: title,
            xaxis: { title: xLabel },
            yaxis: { title: yLabel },
            hovermode: 'closest',
            plot_bgcolor: 'rgba(240, 240, 240, 0.5)',
            paper_bgcolor: 'white',
            font: { family: 'Segoe UI, sans-serif' }
        };

        Plotly.newPlot(this.container, [trace], layout, { responsive: true });
        this.container.classList.add('has-chart');
    }

    /**
     * Create a line chart
     * @param {Array} xData - X-axis data
     * @param {Array} yData - Y-axis data
     * @param {string} xLabel - X-axis label
     * @param {string} yLabel - Y-axis label
     * @param {string} title - Chart title
     */
    lineChart(xData, yData, xLabel, yLabel, title) {
        const trace = {
            x: xData,
            y: yData,
            mode: 'lines+markers',
            type: 'scatter',
            line: {
                color: '#0066cc',
                width: 2
            },
            marker: {
                size: 6,
                color: '#0052a3'
            },
            fill: 'tozeroy',
            fillcolor: 'rgba(0, 102, 204, 0.2)',
            name: 'Values'
        };

        const layout = {
            title: title,
            xaxis: { title: xLabel },
            yaxis: { title: yLabel },
            hovermode: 'x unified',
            plot_bgcolor: 'rgba(240, 240, 240, 0.5)',
            paper_bgcolor: 'white',
            font: { family: 'Segoe UI, sans-serif' }
        };

        Plotly.newPlot(this.container, [trace], layout, { responsive: true });
        this.container.classList.add('has-chart');
    }

    /**
     * Create a bar chart
     * @param {Array} xData - X-axis data
     * @param {Array} yData - Y-axis data
     * @param {string} xLabel - X-axis label
     * @param {string} yLabel - Y-axis label
     * @param {string} title - Chart title
     */
    barChart(xData, yData, xLabel, yLabel, title) {
        const trace = {
            x: xData,
            y: yData,
            type: 'bar',
            marker: {
                color: '#0066cc',
                line: {
                    color: '#0052a3',
                    width: 1
                }
            },
            name: 'Values'
        };

        const layout = {
            title: title,
            xaxis: { title: xLabel },
            yaxis: { title: yLabel },
            hovermode: 'x',
            plot_bgcolor: 'rgba(240, 240, 240, 0.5)',
            paper_bgcolor: 'white',
            font: { family: 'Segoe UI, sans-serif' }
        };

        Plotly.newPlot(this.container, [trace], layout, { responsive: true });
        this.container.classList.add('has-chart');
    }

    /**
     * Create a box plot
     * @param {Array} data - Array of data arrays for each box
     * @param {Array} names - Names for each box
     * @param {string} yLabel - Y-axis label
     * @param {string} title - Chart title
     */
    boxPlot(data, names, yLabel, title) {
        const traces = data.map((values, index) => ({
            y: values,
            name: names[index],
            type: 'box',
            marker: { color: '#0066cc' }
        }));

        const layout = {
            title: title,
            yaxis: { title: yLabel },
            plot_bgcolor: 'rgba(240, 240, 240, 0.5)',
            paper_bgcolor: 'white',
            font: { family: 'Segoe UI, sans-serif' }
        };

        Plotly.newPlot(this.container, traces, layout, { responsive: true });
        this.container.classList.add('has-chart');
    }

    /**
     * Create a multi-line chart for time series
     * @param {Array} xData - X-axis data
     * @param {Object} yDatasets - Object with label: [values] pairs
     * @param {string} xLabel - X-axis label
     * @param {string} yLabel - Y-axis label
     * @param {string} title - Chart title
     */
    multiLineChart(xData, yDatasets, xLabel, yLabel, title) {
        const colors = ['#0066cc', '#ff7700', '#00aa00', '#cc0000', '#9900cc'];
        const traces = Object.entries(yDatasets).map(([label, values], index) => ({
            x: xData,
            y: values,
            mode: 'lines+markers',
            name: label,
            line: {
                color: colors[index % colors.length],
                width: 2
            },
            marker: {
                size: 5
            }
        }));

        const layout = {
            title: title,
            xaxis: { title: xLabel },
            yaxis: { title: yLabel },
            hovermode: 'x unified',
            plot_bgcolor: 'rgba(240, 240, 240, 0.5)',
            paper_bgcolor: 'white',
            font: { family: 'Segoe UI, sans-serif' }
        };

        Plotly.newPlot(this.container, traces, layout, { responsive: true });
        this.container.classList.add('has-chart');
    }

    /**
     * Create a histogram
     * @param {Array} data - Data values
     * @param {string} label - Data label
     * @param {string} title - Chart title
     */
    histogram(data, label, title) {
        const trace = {
            x: data,
            type: 'histogram',
            marker: {
                color: '#0066cc'
            },
            name: label
        };

        const layout = {
            title: title,
            xaxis: { title: label },
            yaxis: { title: 'Frequency' },
            plot_bgcolor: 'rgba(240, 240, 240, 0.5)',
            paper_bgcolor: 'white',
            font: { family: 'Segoe UI, sans-serif' }
        };

        Plotly.newPlot(this.container, [trace], layout, { responsive: true });
        this.container.classList.add('has-chart');
    }

    /**
     * Clear the current chart
     */
    clear() {
        this.container.innerHTML = '';
        this.container.classList.remove('has-chart');
        this.currentChart = null;
    }
}