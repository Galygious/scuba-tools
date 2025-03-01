// Scuba Diving Calculations - Dalton's Triangle and Doppler No-Decompression Limits

// Helper Functions for Unit Conversions
function ftToATA(feet) {
    // 1 ATA at surface, and add 1 ATA for every 33 feet of seawater
    return 1 + (feet / 33);
}

function ataToFT(ata) {
    // Convert ATA to depth in feet
    return (ata - 1) * 33;
}

function percentToDecimal(percent) {
    return percent / 100;
}

function decimalToPercent(decimal) {
    return decimal * 100;
}

// Dalton's Triangle Calculations - 2 out of 3 calculator
function calculateDaltonsTriangle(inputs) {
    // Inputs should contain any 2 of the 3: depth (ft), fO2 (decimal), pO2 (ATA)
    const result = {};
    
    // Case 1: Calculate pO2 from depth and fO2
    if (inputs.depth !== undefined && inputs.fO2 !== undefined && inputs.pO2 === undefined) {
        const pressure = ftToATA(inputs.depth);
        const pO2 = pressure * inputs.fO2;
        const pN2 = pressure * (1 - inputs.fO2);
        
        result.depth = inputs.depth;
        result.fO2 = inputs.fO2;
        result.pressure = pressure;
        result.pO2 = pO2;
        result.pN2 = pN2;
    }
    // Case 2: Calculate depth from fO2 and pO2
    else if (inputs.fO2 !== undefined && inputs.pO2 !== undefined && inputs.depth === undefined) {
        const pressure = inputs.pO2 / inputs.fO2;
        const depth = ataToFT(pressure);
        const pN2 = pressure * (1 - inputs.fO2);
        
        result.depth = depth;
        result.fO2 = inputs.fO2;
        result.pressure = pressure;
        result.pO2 = inputs.pO2;
        result.pN2 = pN2;
    }
    // Case 3: Calculate fO2 from depth and pO2
    else if (inputs.depth !== undefined && inputs.pO2 !== undefined && inputs.fO2 === undefined) {
        const pressure = ftToATA(inputs.depth);
        const fO2 = inputs.pO2 / pressure;
        const pN2 = pressure * (1 - fO2);
        
        result.depth = inputs.depth;
        result.fO2 = fO2;
        result.pressure = pressure;
        result.pO2 = inputs.pO2;
        result.pN2 = pN2;
    }
    else {
        throw new Error("Invalid input combination. Provide exactly 2 of the 3 values: depth, fO2, pO2");
    }
    
    // Format results to 2 decimal places
    for (let key in result) {
        if (typeof result[key] === 'number') {
            result[key] = parseFloat(result[key].toFixed(2));
        }
    }
    
    return result;
}

// US Navy Dive Tables

// Table 1: No-Decompression Limits and Repetitive Group Designation
const navyTable1 = {
    // Depth in feet: [no-deco limit in minutes, group designations for different times]
    // Format: [max NDL, {minutes: group}]
    10: [60 * 5, {60: 'A', 120: 'B', 210: 'C', 300: 'D'}], // Unlimited in reality, using 5 hours as max
    15: [60 * 5, {35: 'A', 70: 'B', 110: 'C', 160: 'D', 225: 'E', 350: 'F'}],
    20: [325, {25: 'A', 50: 'B', 75: 'C', 100: 'D', 135: 'E', 180: 'F', 240: 'G', 325: 'H'}],
    25: [245, {20: 'A', 35: 'B', 55: 'C', 75: 'D', 100: 'E', 125: 'F', 160: 'G', 195: 'H', 245: 'I'}],
    30: [205, {15: 'A', 30: 'B', 45: 'C', 60: 'D', 75: 'E', 95: 'F', 120: 'G', 145: 'H', 170: 'I', 205: 'J'}],
    35: [160, {5: 'A', 15: 'B', 25: 'C', 40: 'D', 50: 'E', 60: 'F', 80: 'G', 100: 'H', 120: 'I', 140: 'J', 160: 'K'}],
    40: [130, {5: 'A', 15: 'B', 25: 'C', 30: 'D', 40: 'E', 50: 'F', 70: 'G', 80: 'H', 100: 'I', 110: 'J', 130: 'K'}],
    50: [70, {10: 'B', 15: 'C', 25: 'D', 30: 'E', 40: 'F', 50: 'G', 60: 'H', 70: 'I'}],
    60: [50, {10: 'B', 15: 'C', 20: 'D', 25: 'E', 30: 'F', 40: 'G', 50: 'H'}],
    70: [40, {5: 'B', 10: 'C', 15: 'D', 20: 'E', 30: 'F', 35: 'G', 40: 'H'}],
    80: [30, {5: 'B', 10: 'C', 15: 'D', 20: 'E', 25: 'F', 30: 'G'}],
    90: [25, {5: 'B', 10: 'C', 12: 'D', 15: 'E', 20: 'F', 25: 'G'}],
    100: [20, {5: 'B', 7: 'C', 10: 'D', 15: 'E', 20: 'F'}],
    110: [15, {5: 'B', 10: 'C', 13: 'D', 15: 'E'}],
    120: [10, {5: 'C', 10: 'D'}],
    130: [5, {5: 'D'}]
};

// Table 2: Surface Interval Credit Table (simplified version)
// This maps from current group to new group based on surface interval
const navyTable2 = {
    // Format: current group -> {min surface interval: new group}
    'A': {'0:10': 'A'},
    'B': {'0:10': 'A', '2:39': 'B'},
    'C': {'0:10': 'A', '1:39': 'B', '4:49': 'C'},
    'D': {'0:10': 'A', '1:09': 'B', '2:38': 'C', '5:48': 'D'},
    'E': {'0:10': 'A', '0:54': 'B', '1:57': 'C', '3:24': 'D', '6:34': 'E'},
    'F': {'0:10': 'A', '0:45': 'B', '1:29': 'C', '2:28': 'D', '3:57': 'E', '7:05': 'F'},
    'G': {'0:10': 'A', '0:40': 'B', '1:15': 'C', '1:59': 'D', '2:58': 'E', '4:25': 'F', '7:35': 'G'},
    'H': {'0:10': 'A', '0:36': 'B', '1:06': 'C', '1:41': 'D', '2:23': 'E', '3:20': 'F', '4:49': 'G', '7:59': 'H'},
    'I': {'0:10': 'A', '0:33': 'B', '0:59': 'C', '1:29': 'D', '2:02': 'E', '2:44': 'F', '3:43': 'G', '5:12': 'H', '8:21': 'I'},
    'J': {'0:10': 'A', '0:31': 'B', '0:54': 'C', '1:19': 'D', '1:47': 'E', '2:20': 'F', '3:04': 'G', '4:02': 'H', '5:40': 'I', '8:50': 'J'},
    'K': {'0:10': 'A', '0:28': 'B', '0:49': 'C', '1:11': 'D', '1:35': 'E', '2:03': 'F', '2:38': 'G', '3:21': 'H', '4:19': 'I', '5:48': 'J', '8:58': 'K'}
};

// Table 3: Residual Nitrogen Times (minutes)
const navyTable3 = {
    // Format: depth -> {group: [RNT, ANDL]}
    // RNT = Residual Nitrogen Time
    // ANDL = Adjusted No-Decompression Limit
    10: {
        'A': [39, 'N/L'], 'B': [88, 'N/L'], 'C': [159, 'N/L'], 'D': [279, 'N/L'],
        'E': ['N/L', 'N/L'], 'F': ['N/L', 'N/L'], 'G': ['N/L', 'N/L'], 'H': ['N/L', 'N/L'],
        'I': ['N/L', 'N/L'], 'J': ['N/L', 'N/L'], 'K': ['N/L', 'N/L']
    },
    20: {
        'A': [18, 'N/L'], 'B': [39, 'N/L'], 'C': [62, 'N/L'], 'D': [88, 'N/L'],
        'E': [120, 'N/L'], 'F': [159, 'N/L'], 'G': [208, 'N/L'], 'H': [279, 'N/L'],
        'I': [399, 'N/L'], 'J': ['N/L', 'N/L'], 'K': ['N/L', 'N/L']
    },
    30: {
        'A': [12, 193], 'B': [25, 180], 'C': [39, 166], 'D': [54, 151],
        'E': [70, 135], 'F': [88, 117], 'G': [109, 96], 'H': [132, 73],
        'I': [159, 46], 'J': [190, 15], 'K': ['N/L', 0]
    },
    40: {
        'A': [7, 123], 'B': [17, 113], 'C': [25, 105], 'D': [37, 93],
        'E': [49, 81], 'F': [61, 69], 'G': [73, 57], 'H': [87, 43],
        'I': [101, 29], 'J': [116, 14], 'K': [138, 0]
    },
    50: {
        'A': [6, 64], 'B': [13, 57], 'C': [21, 49], 'D': [29, 41],
        'E': [38, 32], 'F': [47, 23], 'G': [56, 14], 'H': [66, 4],
        'I': ['N/L', 0], 'J': ['N/L', 0], 'K': ['N/L', 0]
    },
    60: {
        'A': [5, 45], 'B': [11, 39], 'C': [17, 33], 'D': [24, 26],
        'E': [30, 20], 'F': [36, 14], 'G': [44, 6], 'H': ['N/L', 0],
        'I': ['N/L', 0], 'J': ['N/L', 0], 'K': ['N/L', 0]
    },
    70: {
        'A': [4, 36], 'B': [9, 31], 'C': [15, 25], 'D': [20, 20],
        'E': [26, 14], 'F': [31, 9], 'G': [37, 3], 'H': ['N/L', 0],
        'I': ['N/L', 0], 'J': ['N/L', 0], 'K': ['N/L', 0]
    },
    80: {
        'A': [4, 26], 'B': [8, 22], 'C': [13, 17], 'D': [18, 12],
        'E': [23, 7], 'F': [28, 2], 'G': ['N/L', 0], 'H': ['N/L', 0],
        'I': ['N/L', 0], 'J': ['N/L', 0], 'K': ['N/L', 0]
    },
    90: {
        'A': [3, 22], 'B': [7, 18], 'C': [11, 14], 'D': [16, 9],
        'E': [20, 5], 'F': [24, 1], 'G': ['N/L', 0], 'H': ['N/L', 0],
        'I': ['N/L', 0], 'J': ['N/L', 0], 'K': ['N/L', 0]
    },
    100: {
        'A': [3, 17], 'B': [7, 13], 'C': [10, 10], 'D': [14, 6],
        'E': [18, 2], 'F': ['N/L', 0], 'G': ['N/L', 0], 'H': ['N/L', 0],
        'I': ['N/L', 0], 'J': ['N/L', 0], 'K': ['N/L', 0]
    },
    110: {
        'A': [3, 12], 'B': [6, 9], 'C': [9, 6], 'D': [12, 3],
        'E': [15, 0], 'F': ['N/L', 0], 'G': ['N/L', 0], 'H': ['N/L', 0],
        'I': ['N/L', 0], 'J': ['N/L', 0], 'K': ['N/L', 0]
    },
    120: {
        'A': [3, 7], 'B': [6, 4], 'C': [9, 1], 'D': ['N/L', 0],
        'E': ['N/L', 0], 'F': ['N/L', 0], 'G': ['N/L', 0], 'H': ['N/L', 0],
        'I': ['N/L', 0], 'J': ['N/L', 0], 'K': ['N/L', 0]
    },
    130: {
        'A': [3, 2], 'B': ['N/L', 0], 'C': ['N/L', 0], 'D': ['N/L', 0],
        'E': ['N/L', 0], 'F': ['N/L', 0], 'G': ['N/L', 0], 'H': ['N/L', 0],
        'I': ['N/L', 0], 'J': ['N/L', 0], 'K': ['N/L', 0]
    }
};

// Helper function to find the closest depth in the tables
function findClosestDepth(depth) {
    const depths = Object.keys(navyTable1).map(Number);
    
    // If depth is less than the minimum in the table
    if (depth < depths[0]) {
        return depths[0];
    }
    
    // If depth is greater than the maximum in the table
    if (depth > depths[depths.length - 1]) {
        return -1; // No safe no-decompression limit
    }
    
    // Find the exact depth or next highest depth
    for (let i = 0; i < depths.length; i++) {
        if (depth <= depths[i]) {
            return depths[i];
        }
    }
    
    return -1; // Fallback (should not reach here)
}

// Get no-decompression limit and pressure group for a single dive
function getSingleDiveInfo(depth, bottomTime) {
    const tableDepth = findClosestDepth(depth);
    
    if (tableDepth === -1) {
        return {
            noDecoLimit: 0,
            pressureGroup: null,
            isExceeded: true,
            message: "Depth exceeds maximum table depth of 130 feet."
        };
    }
    
    const [maxNDL, timeGroups] = navyTable1[tableDepth];
    
    // Check if bottom time exceeds the maximum NDL
    if (bottomTime > maxNDL) {
        return {
            noDecoLimit: maxNDL,
            pressureGroup: null,
            isExceeded: true,
            message: `Bottom time exceeds the no-decompression limit of ${maxNDL} minutes for ${tableDepth} feet.`
        };
    }
    
    // Find the pressure group
    let pressureGroup = null;
    const times = Object.keys(timeGroups).map(Number).sort((a, b) => a - b);
    
    for (let i = 0; i < times.length; i++) {
        if (bottomTime <= times[i]) {
            pressureGroup = timeGroups[times[i]];
            break;
        }
    }
    
    return {
        noDecoLimit: maxNDL,
        pressureGroup: pressureGroup,
        isExceeded: false,
        message: `No-decompression limit: ${maxNDL} minutes. Pressure group: ${pressureGroup}.`
    };
}

// Parse a time string in the format "h:mm" to minutes
function parseTimeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

// Get new pressure group after surface interval
function getNewPressureGroup(currentGroup, surfaceInterval) {
    if (!navyTable2[currentGroup]) {
        return null;
    }
    
    // Convert surface interval to minutes for comparison
    const surfaceIntervalMinutes = parseTimeToMinutes(surfaceInterval);
    
    // Find the new group based on surface interval
    let newGroup = null;
    const intervals = Object.keys(navyTable2[currentGroup]).sort((a, b) => 
        parseTimeToMinutes(a) - parseTimeToMinutes(b));
    
    for (let i = 0; i < intervals.length; i++) {
        const minInterval = parseTimeToMinutes(intervals[i]);
        
        if (surfaceIntervalMinutes >= minInterval) {
            newGroup = navyTable2[currentGroup][intervals[i]];
            
            // Check if we need to update to a lower group based on longer surface interval
            if (i < intervals.length - 1) {
                const nextInterval = parseTimeToMinutes(intervals[i + 1]);
                if (surfaceIntervalMinutes >= nextInterval) {
                    continue; // Check the next interval
                }
            }
            break;
        }
    }
    
    return newGroup;
}

// Get residual nitrogen time and adjusted no-decompression limit for repetitive dive
function getRepetitiveDiveInfo(pressureGroup, depth) {
    const tableDepth = findClosestDepth(depth);
    
    if (tableDepth === -1 || !navyTable3[tableDepth] || !navyTable3[tableDepth][pressureGroup]) {
        return {
            residualNitrogenTime: null,
            adjustedNoDecoLimit: null,
            isExceeded: true,
            message: "Invalid depth or pressure group for repetitive dive."
        };
    }
    
    const [rnt, andl] = navyTable3[tableDepth][pressureGroup];
    
    // Check if the dive is possible
    if (rnt === 'N/L' || andl === 0) {
        return {
            residualNitrogenTime: rnt,
            adjustedNoDecoLimit: andl,
            isExceeded: true,
            message: "Repetitive dive not recommended at this depth with current pressure group."
        };
    }
    
    return {
        residualNitrogenTime: rnt,
        adjustedNoDecoLimit: andl,
        isExceeded: false,
        message: `Residual nitrogen time: ${rnt} minutes. Adjusted no-decompression limit: ${andl} minutes.`
    };
}

// Calculate final pressure group for a repetitive dive
function getFinalPressureGroup(depth, actualBottomTime, residualNitrogenTime) {
    const tableDepth = findClosestDepth(depth);
    const totalBottomTime = parseInt(actualBottomTime) + parseInt(residualNitrogenTime);
    
    // Get the pressure group based on the total bottom time
    return getSingleDiveInfo(tableDepth, totalBottomTime).pressureGroup;
}

// Event listeners for form submissions
document.addEventListener('DOMContentLoaded', function() {
    // Dalton's Triangle Calculator
    const daltonsForm = document.getElementById('daltons-form');
    if (daltonsForm) {
        daltonsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get all input values
            const depthInput = document.getElementById('depth').value;
            const fO2Input = document.getElementById('fo2').value;
            const pO2Input = document.getElementById('po2').value;
            
            // Count how many inputs are provided
            let inputCount = 0;
            const inputs = {};
            
            if (depthInput !== '') {
                inputs.depth = parseFloat(depthInput);
                inputCount++;
            }
            
            if (fO2Input !== '') {
                inputs.fO2 = percentToDecimal(parseFloat(fO2Input));
                inputCount++;
            }
            
            if (pO2Input !== '') {
                inputs.pO2 = parseFloat(pO2Input);
                inputCount++;
            }
            
            // Validate inputs
            if (inputCount !== 2) {
                alert('Please enter exactly 2 of the 3 values (Depth, O₂%, and pO₂).');
                return;
            }
            
            try {
                const results = calculateDaltonsTriangle(inputs);
                
                // Display results
                document.getElementById('depth-result').textContent = results.depth.toFixed(1) + ' ft';
                document.getElementById('fo2-result').textContent = decimalToPercent(results.fO2).toFixed(1) + '%';
                document.getElementById('pressure-result').textContent = results.pressure.toFixed(2) + ' ATA';
                document.getElementById('po2-result').textContent = results.pO2.toFixed(2) + ' ATA';
                document.getElementById('pn2-result').textContent = results.pN2.toFixed(2) + ' ATA';
                
                // Show warnings if applicable
                const pO2Warning = document.getElementById('po2-warning');
                if (results.pO2 > 1.4 && results.pO2 <= 1.6) {
                    pO2Warning.textContent = 'WARNING: pO₂ exceeds 1.4 ATA (maximum recommended for recreational diving)';
                    pO2Warning.style.display = 'block';
                } else if (results.pO2 > 1.6) {
                    pO2Warning.textContent = 'DANGER: pO₂ exceeds 1.6 ATA (risk of oxygen toxicity)';
                    pO2Warning.style.display = 'block';
                } else {
                    pO2Warning.style.display = 'none';
                }
                
                const pN2Warning = document.getElementById('pn2-warning');
                if (results.pN2 > 3.94) {
                    pN2Warning.textContent = 'WARNING: pN₂ exceeds 3.94 ATA (risk of nitrogen narcosis)';
                    pN2Warning.style.display = 'block';
                } else {
                    pN2Warning.style.display = 'none';
                }
                
                document.getElementById('daltons-results').style.display = 'block';
            } catch (error) {
                alert(error.message);
            }
        });
    }
    
// No-Decompression Limit Calculator
    const noDecoForm = document.getElementById('nodeco-form');
    if (noDecoForm) {
        noDecoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const diveType = document.querySelector('input[name="dive-type"]:checked').value;
            const depth = parseFloat(document.getElementById('nodeco-depth').value);
            
            if (isNaN(depth)) {
                alert('Please enter a valid depth.');
                return;
            }
            
            // Clear previous results
            document.getElementById('nodeco-results').style.display = 'none';
            document.getElementById('repetitive-dive-section').style.display = 'none';
            
            if (diveType === 'single') {
                // Single dive calculation
                const bottomTime = document.getElementById('bottom-time').value !== '' 
                    ? parseFloat(document.getElementById('bottom-time').value) 
                    : 0;
                
                const result = getSingleDiveInfo(depth, bottomTime);
                
                if (result.isExceeded) {
                    document.getElementById('nodeco-warning').textContent = result.message;
                    document.getElementById('nodeco-warning').style.display = 'block';
                    document.getElementById('pressure-group-result').textContent = 'N/A';
                } else {
                    document.getElementById('nodeco-result').textContent = result.noDecoLimit + ' minutes';
                    document.getElementById('pressure-group-result').textContent = bottomTime > 0 ? result.pressureGroup : 'N/A';
                    
                    if (result.noDecoLimit <= 10) {
                        document.getElementById('nodeco-warning').textContent = 'WARNING: Very short no-decompression limit. Consider a shallower depth.';
                        document.getElementById('nodeco-warning').style.display = 'block';
                    } else {
                        document.getElementById('nodeco-warning').style.display = 'none';
                    }
                }
                
                document.getElementById('nodeco-results').style.display = 'block';
            } else {
                // Repetitive dive calculation
                const pressureGroup = document.getElementById('pressure-group').value;
                const surfaceInterval = document.getElementById('surface-interval').value;
                
                if (!pressureGroup || !surfaceInterval) {
                    alert('Please enter pressure group and surface interval for repetitive dive.');
                    return;
                }
                
                // Calculate new pressure group after surface interval
                const newGroup = getNewPressureGroup(pressureGroup, surfaceInterval);
                
                if (!newGroup) {
                    document.getElementById('nodeco-warning').textContent = 'Invalid pressure group or surface interval.';
                    document.getElementById('nodeco-warning').style.display = 'block';
                    return;
                }
                
                // Get residual nitrogen time and adjusted NDL
                const repetitiveInfo = getRepetitiveDiveInfo(newGroup, depth);
                
                document.getElementById('new-group-result').textContent = newGroup;
                
                if (repetitiveInfo.isExceeded) {
                    document.getElementById('rnt-result').textContent = 'N/A';
                    document.getElementById('andl-result').textContent = 'N/A';
                    document.getElementById('nodeco-warning').textContent = repetitiveInfo.message;
                    document.getElementById('nodeco-warning').style.display = 'block';
                } else {
                    document.getElementById('rnt-result').textContent = repetitiveInfo.residualNitrogenTime + ' minutes';
                    document.getElementById('andl-result').textContent = repetitiveInfo.adjustedNoDecoLimit + ' minutes';
                    document.getElementById('nodeco-warning').style.display = 'none';
                    
                    // Calculate final pressure group if actual bottom time is provided
                    const actualBottomTime = document.getElementById('actual-bottom-time').value;
                    if (actualBottomTime && !isNaN(parseFloat(actualBottomTime))) {
                        const finalGroup = getFinalPressureGroup(depth, actualBottomTime, repetitiveInfo.residualNitrogenTime);
                        document.getElementById('final-group-result').textContent = finalGroup || 'Exceeds limits';
                    } else {
                        document.getElementById('final-group-result').textContent = 'N/A';
                    }
                }
                
                document.getElementById('repetitive-dive-section').style.display = 'block';
                document.getElementById('nodeco-results').style.display = 'block';
            }
        });
        
        // Toggle form fields based on dive type
        const diveTypeRadios = document.querySelectorAll('input[name="dive-type"]');
        diveTypeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                document.getElementById('single-dive-fields').style.display = this.value === 'single' ? 'block' : 'none';
                document.getElementById('repetitive-dive-fields').style.display = this.value === 'repetitive' ? 'block' : 'none';
            });
        });
    }
});
