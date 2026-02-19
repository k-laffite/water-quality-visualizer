/**
 * CSV Parser for Water Quality Data
 * Handles parsing and validation of CSV files
 */

class CSVParser {
    constructor() {
        this.data = [];
        this.headers = [];
    }

    /**
     * Parse CSV string into data array
     * @param {string} csvString - Raw CSV string
     * @returns {Object} Parsed data with headers and rows
     */
    parse(csvString) {
        const lines = csvString.trim().split('\n');
        
        if (lines.length === 0) {
            throw new Error('CSV file is empty');
        }

        // Parse headers
        this.headers = this.parseCSVLine(lines[0]);
        
        if (this.headers.length === 0) {
            throw new Error('No headers found in CSV');
        }

        // Parse data rows
        this.data = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '') continue;
            
            const values = this.parseCSVLine(line);
            if (values.length !== this.headers.length) {
                console.warn(`Row ${i} has ${values.length} values but expected ${this.headers.length}`);
                continue;
            }

            const row = {};
            this.headers.forEach((header, index) => {
                const value = values[index];
                // Try to convert to number
                row[header] = isNaN(value) ? value : parseFloat(value);
            });
            this.data.push(row);
        }

        if (this.data.length === 0) {
            throw new Error('No valid data rows found in CSV');
        }

        return {
            headers: this.headers,
            data: this.data
        };
    }

    /**
     * Parse a single CSV line, handling quoted values
     * @param {string} line - CSV line
     * @returns {Array} Array of values
     */
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let insideQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
                if (insideQuotes && nextChar === '"') {
                    current += '"';
                    i++;
                } else {
                    insideQuotes = !insideQuotes;
                }
            } else if (char === ',' && !insideQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current.trim());
        return result;
    }

    /**
     * Get numeric columns from headers
     * @returns {Array} Array of numeric column names
     */
    getNumericColumns() {
        if (this.data.length === 0) return [];

        return this.headers.filter(header => {
            return this.data.some(row => typeof row[header] === 'number');
        });
    }

    /**
     * Get all columns
     * @returns {Array} Array of all column names
     */
    getAllColumns() {
        return this.headers;
    }

    /**
     * Calculate statistics for a column
     * @param {string} columnName - Column name
     * @returns {Object} Statistics object
     */
    getColumnStats(columnName) {
        const values = this.data
            .map(row => row[columnName])
            .filter(val => typeof val === 'number');

        if (values.length === 0) {
            return null;
        }

        const sorted = [...values].sort((a, b) => a - b);
        const sum = values.reduce((a, b) => a + b, 0);
        const mean = sum / values.length;

        return {
            count: values.length,
            min: sorted[0],
            max: sorted[sorted.length - 1],
            mean: mean.toFixed(2),
            median: sorted[Math.floor(sorted.length / 2)].toFixed(2),
            stdev: this.calculateStdev(values, mean).toFixed(2)
        };
    }

    /**
     * Calculate standard deviation
     * @param {Array} values - Array of numbers
     * @param {number} mean - Mean value
     * @returns {number} Standard deviation
     */
    calculateStdev(values, mean) {
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
        return Math.sqrt(variance);
    }

    /**
     * Filter data by column value range
     * @param {string} columnName - Column name
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {Array} Filtered data
     */
    filterByRange(columnName, min, max) {
        return this.data.filter(row => {
            const value = row[columnName];
            return typeof value === 'number' && value >= min && value <= max;
        });
    }
}