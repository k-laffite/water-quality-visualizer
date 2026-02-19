/**
 * Main Application Logic
 * Handles file upload, data parsing, and UI interactions
 */

const parser = new CSVParser();
const visualizer = new Visualizer();

// DOM Elements
const csvFileInput = document.getElementById('csvFile');
const csvFileLabel = document.querySelector('.upload-box label');
const uploadBox = document.querySelector('.upload-box');
const clearBtn = document.getElementById('clearBtn');
const controlsSection = document.getElementById('controlsSection');
const infoSection = document.getElementById('infoSection');
const quickViewsSection = document.getElementById('quickViewsSection');
const xAxisSelect = document.getElementById('xAxisSelect');
const yAxisSelect = document.getElementById('yAxisSelect');
const chartTypeSelect = document.getElementById('chartTypeSelect');
const updateChartBtn = document.getElementById('updateChartBtn');
const dataStatsDiv = document.getElementById('dataStats');

let parsedData = null;

// ============ Event Listeners ============

// File input change
csvFileInput.addEventListener('change', handleFileSelect);

// Drag and drop
uploadBox.addEventListener('dragover', handleDragOver);
uploadBox.addEventListener('dragleave', handleDragLeave);
uploadBox.addEventListener('drop', handleFileDrop);

// Click to upload
csvFileLabel.addEventListener('click', () => csvFileInput.click());

// Clear button
clearBtn.addEventListener('click', clearAllData);

// Update chart button
updateChartBtn.addEventListener('click', updateChart);

// Quick view buttons
document.querySelectorAll('.quick-view-btn').forEach(btn => {
    btn.addEventListener('click', handleQuickView);
});

// ============ File Handling ============

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processFile(file);
    }
}

function handleDragOver(event) {
    event.preventDefault();
    uploadBox.classList.add('drag-over');
}

function handleDragLeave() {
    uploadBox.classList.remove('drag-over');
}

function handleFileDrop(event) {
    event.preventDefault();
    uploadBox.classList.remove('drag-over');
    const file = event.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
        processFile(file);
    } else {
        showError('Please drop a CSV file');
    }
}

function processFile(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        try {
            const csvString = e.target.result;
            parsedData = parser.parse(csvString);
            
            initializeUI();
            displayDataInfo();
            showSuccess(`Loaded ${parsedData.data.length} rows of data`);
        } catch (error) {
            showError(`Error parsing CSV: ${error.message}`);
        }
    };

    reader.onerror = () => {
        showError('Error reading file');
    };

    reader.readAsText(file);
}

// ============ UI Initialization ============

function initializeUI() {
    // Show controls
    controlsSection.style.display = 'block';
    infoSection.style.display = 'block';
    quickViewsSection.style.display = 'block';

    // Populate dropdowns
    const allColumns = parser.getAllColumns();
    const numericColumns = parser.getNumericColumns();

    xAxisSelect.innerHTML = allColumns.map(col => 
        `<option value="${col}">${col}</option>`
    ).join('');

    yAxisSelect.innerHTML = numericColumns.map(col => 
        `<option value="${col}">${col}</option>`
    ).join('');

    // Set defaults
    if (numericColumns.length > 0) {
        yAxisSelect.value = numericColumns[0];
    }
    if (numericColumns.length > 1) {
        xAxisSelect.value = numericColumns[1];
    }

    // Create initial chart
    updateChart();
}

function displayDataInfo() {
    const numericColumns = parser.getNumericColumns();
    
    let statsHtml = '';
    
    statsHtml += `
        <div class="stat-item">
            <strong>Total Rows</strong>
            <span>${parsedData.data.length}</span>
        </div>
        <div class="stat-item">
            <strong>Total Columns</strong>
            <span>${parsedData.headers.length}</span>
        </div>
    `;

    numericColumns.slice(0, 3).forEach(col => {
        const stats = parser.getColumnStats(col);
        if (stats) {
            statsHtml += `
                <div class="stat-item">
                    <strong>${col}</strong>
                    <span>${stats.mean}</span>
                    <small>Mean: ${stats.mean} | Range: ${stats.min}-${stats.max}</small>
                </div>
            `;
        }
    });

    dataStatsDiv.innerHTML = statsHtml;
}

// ============ Chart Management ============

function updateChart() {
    const xAxis = xAxisSelect.value;
    const yAxis = yAxisSelect.value;
    const chartType = chartTypeSelect.value;

    if (!xAxis || !yAxis) {
        showError('Please select both axes');
        return;
    }

    try {
        const xData = parsedData.data.map(row => row[xAxis]);
        const yData = parsedData.data.map(row => row[yAxis]);

        const title = `${yAxis} vs ${xAxis}`;

        switch (chartType) {
            case 'scatter':
                visualizer.scatterPlot(xData, yData, xAxis, yAxis, title);
                break;
            case 'line':
                visualizer.lineChart(xData, yData, xAxis, yAxis, title);
                break;
            case 'bar':
                visualizer.barChart(xData, yData, xAxis, yAxis, title);
                break;
            case 'box':
                // For box plot, group data if possible
                visualizer.boxPlot([yData], [yAxis], yAxis, title);
                break;
            default:
                visualizer.scatterPlot(xData, yData, xAxis, yAxis, title);
        }
    } catch (error) {
        showError(`Error creating chart: ${error.message}`);
    }
}

function handleQuickView(event) {
    const viewType = event.target.dataset.view;
    const numericColumns = parser.getNumericColumns();

    if (numericColumns.length < 1) {
        showError('No numeric data available');
        return;
    }

    try {
        switch (viewType) {
            case 'overview':
                if (numericColumns.length >= 2) {
                    const xData = parsedData.data.map((_, i) => i);
                    const datasets = {};
                    numericColumns.slice(0, 3).forEach(col => {
                        datasets[col] = parsedData.data.map(row => row[col]);
                    });
                    visualizer.multiLineChart(xData, datasets, 'Index', 'Value', 'Water Quality Overview');
                }
                break;
            case 'ph':
                const phCol = parsedData.headers.find(h => h.toLowerCase().includes('ph'));
                if (phCol) {
                    const phData = parsedData.data.map(row => row[phCol]);
                    visualizer.histogram(phData, 'pH', 'pH Distribution');
                } else {
                    showError('pH column not found');
                }
                break;
            case 'temperature':
                const tempCol = parsedData.headers.find(h => 
                    h.toLowerCase().includes('temp') || h.toLowerCase().includes('temperature')
                );
                if (tempCol) {
                    const tempData = parsedData.data.map(row => row[tempCol]);
                    visualizer.histogram(tempData, 'Temperature', 'Temperature Distribution');
                } else {
                    showError('Temperature column not found');
                }
                break;
            case 'dissolvedOxygen':
                const doCol = parsedData.headers.find(h => 
                    h.toLowerCase().includes('oxygen') || h.toLowerCase().includes('do')
                );
                if (doCol) {
                    const doData = parsedData.data.map(row => row[doCol]);
                    visualizer.histogram(doData, 'Dissolved Oxygen', 'Dissolved Oxygen Distribution');
                } else {
                    showError('Dissolved Oxygen column not found');
                }
                break;
            case 'turbidity':
                const turbCol = parsedData.headers.find(h => 
                    h.toLowerCase().includes('turbidity') || h.toLowerCase().includes('turb')
                );
                if (turbCol) {
                    const turbData = parsedData.data.map(row => row[turbCol]);
                    visualizer.histogram(turbData, 'Turbidity', 'Turbidity Distribution');
                } else {
                    showError('Turbidity column not found');
                }
                break;
        }
    } catch (error) {
        showError(`Error: ${error.message}`);
    }
}

// ============ Utility Functions ============

function clearAllData() {
    parser.data = [];
    parser.headers = [];
    parsedData = null;
    csvFileInput.value = '';

    controlsSection.style.display = 'none';
    infoSection.style.display = 'none';
    quickViewsSection.style.display = 'none';

    visualizer.clear();
    dataStatsDiv.innerHTML = '';

    showSuccess('All data cleared');
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;

    const container = document.querySelector('main');
    container.insertBefore(errorDiv, container.firstChild);

    setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success';
    successDiv.textContent = message;

    const container = document.querySelector('main');
    container.insertBefore(successDiv, container.firstChild);

    setTimeout(() => successDiv.remove(), 3000);
}