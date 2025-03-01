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

// Table 2: Surface Interval Credit Table (corrected version)
// This maps from current group to new group based on surface interval
// Format: current group -> {new group: [min time, max time]}
const navyTable2 = {
    // For each starting group, we define the minimum and maximum surface interval time to reach each new group
    'K': {
        'K': ['0:10', '0:28'],  // Any surface interval less than 29 minutes means you remain in K
        'J': ['0:29', '0:49'],  // Minimum surface interval to reach J is 29 minutes
        'I': ['0:50', '1:11'],  // Minimum surface interval to reach I is 50 minutes
        'H': ['1:12', '1:35'],  // Minimum surface interval to reach H is 1 hour 12 minutes
        'G': ['1:36', '2:03'],  // Minimum surface interval to reach G is 1 hour 36 minutes
        'F': ['2:04', '2:38'],  // Minimum surface interval to reach F is 2 hours 4 minutes
        'E': ['2:39', '3:21'],  // Minimum surface interval to reach E is 2 hours 39 minutes
        'D': ['3:22', '4:19'],  // Minimum surface interval to reach D is 3 hours 22 minutes
        'C': ['4:20', '5:48'],  // Minimum surface interval to reach C is 4 hours 20 minutes
        'B': ['5:49', '8:58'],  // Minimum surface interval to reach B is 5 hours 49 minutes
        'A': ['8:59', '11:59'], // Minimum surface interval to reach A is 8 hours 59 minutes
        'None': ['12:00', '--'] // After 12 hours, no longer a repetitive dive
    },
    'J': {
        'J': ['0:10', '0:31'],  // Any surface interval less than 32 minutes means you remain in J
        'I': ['0:32', '0:54'],  // Minimum surface interval to reach I is 32 minutes
        'H': ['0:55', '1:19'],  // Minimum surface interval to reach H is 55 minutes
        'G': ['1:20', '1:47'],  // Minimum surface interval to reach G is 1 hour 20 minutes
        'F': ['1:48', '2:20'],  // Minimum surface interval to reach F is 1 hour 48 minutes
        'E': ['2:21', '3:04'],  // Minimum surface interval to reach E is 2 hours 21 minutes
        'D': ['3:05', '4:02'],  // Minimum surface interval to reach D is 3 hours 5 minutes
        'C': ['4:03', '5:40'],  // Minimum surface interval to reach C is 4 hours 3 minutes
        'B': ['5:41', '8:50'],  // Minimum surface interval to reach B is 5 hours 41 minutes
        'A': ['8:51', '11:59'], // Minimum surface interval to reach A is 8 hours 51 minutes
        'None': ['12:00', '--'] // After 12 hours, no longer a repetitive dive
    },
    'I': {
        'I': ['0:10', '0:33'],  // Any surface interval less than 34 minutes means you remain in I
        'H': ['0:34', '0:59'],  // Minimum surface interval to reach H is 34 minutes
        'G': ['1:00', '1:29'],  // Minimum surface interval to reach G is 1 hour
        'F': ['1:30', '2:02'],  // Minimum surface interval to reach F is 1 hour 30 minutes
        'E': ['2:03', '2:44'],  // Minimum surface interval to reach E is 2 hours 3 minutes
        'D': ['2:45', '3:43'],  // Minimum surface interval to reach D is 2 hours 45 minutes
        'C': ['3:44', '5:12'],  // Minimum surface interval to reach C is 3 hours 44 minutes
        'B': ['5:13', '8:21'],  // Minimum surface interval to reach B is 5 hours 13 minutes
        'A': ['8:22', '11:59'], // Minimum surface interval to reach A is 8 hours 22 minutes
        'None': ['12:00', '--'] // After 12 hours, no longer a repetitive dive
    },
    'H': {
        'H': ['0:10', '0:36'],  // Any surface interval less than 37 minutes means you remain in H
        'G': ['0:37', '1:06'],  // Minimum surface interval to reach G is 37 minutes
        'F': ['1:07', '1:41'],  // Minimum surface interval to reach F is 1 hour 7 minutes
        'E': ['1:42', '2:23'],  // Minimum surface interval to reach E is 1 hour 42 minutes
        'D': ['2:24', '3:20'],  // Minimum surface interval to reach D is 2 hours 24 minutes
        'C': ['3:21', '4:49'],  // Minimum surface interval to reach C is 3 hours 21 minutes
        'B': ['4:50', '7:59'],  // Minimum surface interval to reach B is 4 hours 50 minutes
        'A': ['8:00', '11:59'], // Minimum surface interval to reach A is 8 hours
        'None': ['12:00', '--'] // After 12 hours, no longer a repetitive dive
    },
    'G': {
        'G': ['0:10', '0:40'],  // Any surface interval less than 41 minutes means you remain in G
        'F': ['0:41', '1:15'],  // Minimum surface interval to reach F is 41 minutes
        'E': ['1:16', '1:59'],  // Minimum surface interval to reach E is 1 hour 16 minutes
        'D': ['2:00', '2:58'],  // Minimum surface interval to reach D is 2 hours
        'C': ['2:59', '4:25'],  // Minimum surface interval to reach C is 2 hours 59 minutes
        'B': ['4:26', '7:35'],  // Minimum surface interval to reach B is 4 hours 26 minutes
        'A': ['7:36', '11:59'], // Minimum surface interval to reach A is 7 hours 36 minutes
        'None': ['12:00', '--'] // After 12 hours, no longer a repetitive dive
    },
    'F': {
        'F': ['0:10', '0:45'],  // Any surface interval less than 46 minutes means you remain in F
        'E': ['0:46', '1:29'],  // Minimum surface interval to reach E is 46 minutes
        'D': ['1:30', '2:28'],  // Minimum surface interval to reach D is 1 hour 30 minutes
        'C': ['2:29', '3:57'],  // Minimum surface interval to reach C is 2 hours 29 minutes
        'B': ['3:58', '7:05'],  // Minimum surface interval to reach B is 3 hours 58 minutes
        'A': ['7:06', '11:59'], // Minimum surface interval to reach A is 7 hours 6 minutes
        'None': ['12:00', '--'] // After 12 hours, no longer a repetitive dive
    },
    'E': {
        'E': ['0:10', '0:54'],  // Any surface interval less than 55 minutes means you remain in E
        'D': ['0:55', '1:57'],  // Minimum surface interval to reach D is 55 minutes
        'C': ['1:58', '3:24'],  // Minimum surface interval to reach C is 1 hour 58 minutes
        'B': ['3:25', '6:34'],  // Minimum surface interval to reach B is 3 hours 25 minutes
        'A': ['6:35', '11:59'], // Minimum surface interval to reach A is 6 hours 35 minutes
        'None': ['12:00', '--'] // After 12 hours, no longer a repetitive dive
    },
    'D': {
        'D': ['0:10', '1:09'],  // Any surface interval less than 1 hour 10 minutes means you remain in D
        'C': ['1:10', '2:38'],  // Minimum surface interval to reach C is 1 hour 10 minutes
        'B': ['2:39', '5:48'],  // Minimum surface interval to reach B is 2 hours 39 minutes
        'A': ['5:49', '11:59'], // Minimum surface interval to reach A is 5 hours 49 minutes
        'None': ['12:00', '--'] // After 12 hours, no longer a repetitive dive
    },
    'C': {
        'C': ['0:10', '1:39'],  // Any surface interval less than 1 hour 40 minutes means you remain in C
        'B': ['1:40', '4:49'],  // Minimum surface interval to reach B is 1 hour 40 minutes
        'A': ['4:50', '11:59'], // Minimum surface interval to reach A is 4 hours 50 minutes
        'None': ['12:00', '--'] // After 12 hours, no longer a repetitive dive
    },
    'B': {
        'B': ['0:10', '3:20'],  // Any surface interval less than 3 hours 21 minutes means you remain in B
        'A': ['3:21', '11:59'], // Minimum surface interval to reach A is 3 hours 21 minutes
        'None': ['12:00', '--'] // After 12 hours, no longer a repetitive dive
    },
    'A': {
        'A': ['0:10', '11:59'], // Any surface interval less than 12 hours means you remain in A
        'None': ['12:00', '--'] // After 12 hours, no longer a repetitive dive
    }
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
    
    // Check each possible new group for the current group
    for (const [group, [minTime, maxTime]] of Object.entries(navyTable2[currentGroup])) {
        const minMinutes = parseTimeToMinutes(minTime);
        const maxMinutes = maxTime === '--' ? Infinity : parseTimeToMinutes(maxTime);
        
        // If the surface interval is within this range, we found our new group
        if (surfaceIntervalMinutes >= minMinutes && surfaceIntervalMinutes < maxMinutes) {
            newGroup = group === 'None' ? null : group;
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
// Nitrox (EANx) Calculations
// Calculate Equivalent Air Depth (EAD)
function calculateEAD(depth, o2Percentage) {
    // Formula: EAD = (Depth + 10) × (Fraction of N2 / 0.79) − 10
    const n2Fraction = (100 - o2Percentage) / 100;
    return (depth + 10) * (n2Fraction / 0.79) - 10;
}

// Calculate actual depth from EAD
function calculateActualDepthFromEAD(ead, o2Percentage) {
    // Formula: D = (((EAD + 10) × 0.79) ÷ (1 - (O2% ÷ 100))) - 10
    return (((ead + 10) * 0.79) / (1 - (o2Percentage / 100))) - 10;
}

// Calculate Maximum Operating Depth (MOD) based on pO2 limit
function calculateMOD(o2Percentage, pO2Limit = 1.4) {
    // Calculate MOD based on oxygen toxicity limit
    const o2Fraction = o2Percentage / 100;
    const pressure = pO2Limit / o2Fraction;
    return ataToFT(pressure);
}

// Check if a depth is at risk for nitrogen narcosis
function isNarcosisRisk(depth) {
    // Nitrogen narcosis risk increases significantly at 100 feet and beyond
    return depth >= 100;
}

// Event listeners for form submissions and UI interactions
document.addEventListener('DOMContentLoaded', function() {
    // Populate dive tables
    populateDiveTables();
    
    // Setup interactive functionality
    setupInteractiveTables();
    
    // Setup Nitrox functionality
    setupNitroxCalculations();
    
    // Show calculation results container by default
    document.getElementById('calculation-results').style.display = 'block';
    document.getElementById('calculation-results').style.display = 'block';
    
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
                    pN2Warning.textContent = 'WARNING: pN₂ exceeds 3.94 ATA (risk of nitrogen narcosis). Nitrogen narcosis affects divers breathing compressed air below 100 feet. To avoid it, use a higher oxygen mixture.';
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
    
    // No-Decompression Limit Calculator - Single Dive
    const calculateBottomTimeBtn = document.getElementById('calculate-bottom-time');
    if (calculateBottomTimeBtn) {
        calculateBottomTimeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const depth = parseFloat(document.getElementById('table-depth').value);
            const bottomTime = document.getElementById('bottom-time').value !== '' 
                ? parseFloat(document.getElementById('bottom-time').value) 
                : 0;
            
            if (isNaN(depth)) {
                alert('Please enter a valid depth.');
                return;
            }
            
            // Calculate single dive info
            const result = getSingleDiveInfo(depth, bottomTime);
            
            // Update results display
            document.getElementById('selected-depth-result').textContent = findClosestDepth(depth) + ' ft';
            document.getElementById('nodeco-result').textContent = result.noDecoLimit + ' minutes';
            document.getElementById('pressure-group-result').textContent = bottomTime > 0 ? result.pressureGroup : '--';
            
            // Show warning if applicable
            if (result.isExceeded) {
                document.getElementById('nodeco-warning').textContent = result.message;
                document.getElementById('nodeco-warning').style.display = 'block';
            } else if (result.noDecoLimit <= 10) {
                document.getElementById('nodeco-warning').textContent = 'WARNING: Very short no-decompression limit. Consider a shallower depth.';
                document.getElementById('nodeco-warning').style.display = 'block';
            } else {
                document.getElementById('nodeco-warning').style.display = 'none';
            }
            
            // Hide repetitive dive section
            document.getElementById('repetitive-dive-section').style.display = 'none';
            
            // Show results container
            document.getElementById('calculation-results').style.display = 'block';
            
            // Highlight the depth in the tables
            highlightDepthInTables(depth);
        });
    }
    
    // No-Decompression Limit Calculator - Repetitive Dive
    const calculateRepetitiveBtn = document.getElementById('calculate-repetitive');
    if (calculateRepetitiveBtn) {
        calculateRepetitiveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const depth = parseFloat(document.getElementById('table-depth').value);
            const pressureGroup = document.getElementById('pressure-group').value;
            const surfaceInterval = document.getElementById('surface-interval').value;
            
            if (isNaN(depth)) {
                alert('Please enter a valid depth.');
                return;
            }
            
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
            
            // Update results display
            document.getElementById('selected-depth-result').textContent = findClosestDepth(depth) + ' ft';
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
                    document.getElementById('final-group-result').textContent = '--';
                }
            }
            
            // Show repetitive dive section
            document.getElementById('repetitive-dive-section').style.display = 'block';
            
            // Show results container
            document.getElementById('calculation-results').style.display = 'block';
            
            // Highlight the depth in the tables
            highlightDepthInTables(depth);
        });
    }
    
    // Toggle form fields based on dive type
    const diveTypeRadios = document.querySelectorAll('input[name="dive-type"]');
    diveTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            document.getElementById('single-dive-fields').style.display = this.value === 'single' ? 'block' : 'none';
            document.getElementById('repetitive-dive-fields').style.display = this.value === 'repetitive' ? 'block' : 'none';
        });
    });
});

// Function to populate the dive tables
function populateDiveTables() {
    populateTable1();
    populateTable2();
    populateTable3();
}

// Global state to track the current selection
const diveState = {
    selectedDepth: null,
    selectedBottomTime: null,
    selectedPressureGroup: null,
    selectedSurfaceInterval: null,
    newPressureGroup: null,
    targetDepth: null,
    targetPressureGroup: null,
    nitroxO2: 21,
    isNitroxMode: false,
    mod: null
};

// Setup Nitrox calculations
function setupNitroxCalculations() {
    const nitroxO2Input = document.getElementById('nitrox-o2');
    const applyNitroxBtn = document.getElementById('apply-nitrox');
    const modResult = document.getElementById('mod-result');
    const tableMode = document.getElementById('table-mode');
    
    if (!nitroxO2Input || !applyNitroxBtn) return;
    
    // Initialize with default values
    diveState.nitroxO2 = parseInt(nitroxO2Input.value) || 21;
    diveState.isNitroxMode = diveState.nitroxO2 > 21;
    diveState.mod = calculateMOD(diveState.nitroxO2);
    
    // Update MOD display
    if (modResult) {
        if (!diveState.isNitroxMode) {
            modResult.textContent = 'No limit (Air)';
        } else {
            modResult.textContent = `${Math.floor(diveState.mod)} ft (pO₂ 1.4)`;
        }
    }
    
    // Update table mode display
    if (tableMode) {
        tableMode.textContent = diveState.isNitroxMode ?
            `EANx ${diveState.nitroxO2}%` :
            'Air (21% O₂)';
    }
    
    // Apply Nitrox button click handler
    applyNitroxBtn.addEventListener('click', function() {
        const newO2 = parseInt(nitroxO2Input.value);
        
        // Validate O2 percentage
        if (isNaN(newO2) || newO2 < 21 || newO2 > 100) {
            alert('Please enter a valid O₂ percentage between 21% and 100%');
            nitroxO2Input.value = diveState.nitroxO2;
            return;
        }
        
        // Update state
        diveState.nitroxO2 = newO2;
        diveState.isNitroxMode = newO2 > 21;
        diveState.mod = calculateMOD(newO2);
        
        // Update displays
        if (modResult) {
            if (!diveState.isNitroxMode) {
                modResult.textContent = 'No limit (Air)';
            } else {
                modResult.textContent = `${Math.floor(diveState.mod)} ft (pO₂ 1.4)`;
            }
        }
        
        if (tableMode) {
            tableMode.textContent = diveState.isNitroxMode ?
                `EANx ${diveState.nitroxO2}%` :
                'Air (21% O₂)';
        }
        
        // Repopulate Tables with Nitrox adjustments
        populateTable1();
        populateTable3();
        
        // Re-setup interactive functionality for both tables
        setupTable1Interactions();
        setupTable3Interactions();
        
        // Clear any highlights
        clearAllHighlights();
        
        // Reset selected values
        diveState.selectedDepth = null;
        diveState.selectedBottomTime = null;
        diveState.selectedPressureGroup = null;
        diveState.selectedSurfaceInterval = null;
        diveState.newPressureGroup = null;
        diveState.targetDepth = null;
        diveState.targetPressureGroup = null;
        
        // Update results display
        document.getElementById('selected-depth-result').textContent = '-- ft';
        document.getElementById('nodeco-result').textContent = '-- minutes';
        document.getElementById('pressure-group-result').textContent = '--';
        document.getElementById('repetitive-dive-section').style.display = 'none';
    });
}

// Setup interactive functionality for dive tables
function setupInteractiveTables() {
    // Add click event listeners to depth rows in Table 1
    setupTable1Interactions();
    
    // Add click event listeners to cells in Table 2
    setupTable2Interactions();
    
    // Add hover tooltips to Table 3 cells
    setupTable3Tooltips();
    
    // Show calculation results container by default
    document.getElementById('calculation-results').style.display = 'block';
}

// Setup Table 1 interactions
function setupTable1Interactions() {
    const table1 = document.getElementById('table1');
    if (!table1) return;
    
    const tbody = table1.querySelector('tbody');
    const rows = tbody.querySelectorAll('tr');
    
    // Make depth rows clickable
    rows.forEach(row => {
        row.classList.add('clickable');
        
        // Add click event to depth cell
        const depthCell = row.querySelector('td:first-child');
        if (depthCell) {
            depthCell.addEventListener('click', function() {
                const depth = parseFloat(this.textContent);
                
                // In Nitrox mode, we need to handle the depth differently
                if (diveState.isNitroxMode) {
                    // We're already displaying the actual depth for Nitrox
                    // Just pass it directly to selectDepth
                    selectDepth(depth);
                } else {
                    // Standard air mode
                    selectDepth(depth);
                }
            });
        }
        
        // Add click events to time cells
        const timeCells = row.querySelectorAll('td:not(:first-child):not(:nth-child(2))');
        timeCells.forEach((cell, index) => {
            if (cell.textContent !== '-') {
                cell.classList.add('clickable');
                cell.addEventListener('click', function() {
                    if (diveState.selectedDepth === null) {
                        alert('Please select a depth first');
                        return;
                    }
                    
                    const bottomTime = parseFloat(this.textContent);
                    
                    // Get the actual column index of this cell
                    const cellIndex = Array.from(row.cells).indexOf(this);
                    
                    // Get the pressure group from the column header
                    // The header is at the same column index
                    const headerCell = table1.querySelector(`thead tr:nth-child(2) th:nth-child(${cellIndex + 1})`);
                    const pressureGroup = headerCell.textContent;
                    
                    selectBottomTime(bottomTime, pressureGroup);
                });
            }
        });
    });
}

// Setup Table 2 interactions
function setupTable2Interactions() {
    const table2 = document.getElementById('table2');
    if (!table2) return;
    
    const tbody = table2.querySelector('tbody');
    const rows = tbody.querySelectorAll('tr');
    
    // Make rows clickable
    rows.forEach(row => {
        // Add click event to pressure group row
        const startGroupCell = row.querySelector('td:first-child');
        if (startGroupCell) {
            startGroupCell.classList.add('clickable');
            startGroupCell.addEventListener('click', function() {
                if (diveState.selectedPressureGroup === null) {
                    alert('Please select a depth and bottom time first to determine your pressure group');
                    return;
                }
                
                const startGroup = this.textContent;
                if (startGroup !== diveState.selectedPressureGroup) {
                    alert(`You selected pressure group ${startGroup}, but your current pressure group is ${diveState.selectedPressureGroup}`);
                    return;
                }
                
                selectStartGroup(startGroup);
            });
        }
        
        // Add click events to surface interval cells
        const intervalCells = row.querySelectorAll('td:not(:first-child)');
        intervalCells.forEach((cell, index) => {
            if (cell.textContent !== '-') {
                cell.classList.add('clickable');
                cell.addEventListener('click', function() {
                    if (diveState.selectedPressureGroup === null) {
                        alert('Please select a depth and bottom time first');
                        return;
                    }
                    
                    // Get the column index of this cell
                    const cellIndex = Array.from(row.cells).indexOf(this);
                    
                    // Get the header cell at the same column index
                    const headerCell = table2.querySelector(`thead tr:nth-child(2) th:nth-child(${cellIndex + 1})`);
                    const newGroup = headerCell.textContent;
                    
                    // If the new group is '-', it means 'None'
                    const finalGroup = newGroup === '-' ? null : newGroup;
                    
                    // Get the surface interval from the cell's top value
                    const surfaceInterval = cell.querySelector('.top-value').textContent;
                    
                    selectSurfaceInterval(surfaceInterval, finalGroup);
                });
            }
        });
    });
}

// Setup Table 3 tooltips
function setupTable3Tooltips() {
    const table3 = document.getElementById('table3');
    if (!table3) return;
    
    // Since we've simplified Table 3 to only show ANDL values, we don't need the dual tooltips anymore
}

// Setup Table 3 interactions
function setupTable3Interactions() {
    const table3 = document.getElementById('table3');
    if (!table3) return;
    
    const tbody = table3.querySelector('tbody');
    const rows = tbody.querySelectorAll('tr');
    
    // Add click events to depth cells
    rows.forEach(row => {
        const depthCell = row.querySelector('td:first-child');
        if (depthCell && !depthCell.classList.contains('cell-unavailable')) {
            // Make sure we don't add multiple event listeners to the same element
            depthCell.classList.add('clickable');
            
            // Remove any existing click event listeners (to prevent duplicates)
            const newDepthCell = depthCell.cloneNode(true);
            depthCell.parentNode.replaceChild(newDepthCell, depthCell);
            
            // Add click event to depth cell
            newDepthCell.addEventListener('click', function() {
                const clickedDepth = parseFloat(this.textContent);
                let airDepth, actualDepth;
                
                if (diveState.isNitroxMode) {
                    // In Nitrox mode, the displayed depth is the actual depth
                    // We need to calculate the air equivalent depth for table lookups
                    actualDepth = clickedDepth;
                    
                    // Find the closest air equivalent depth
                    const depths = Object.keys(navyTable3).map(Number).sort((a, b) => a - b);
                    let minDiff = Infinity;
                    
                    for (const d of depths) {
                        const nitroxDepth = Math.round(calculateActualDepthFromEAD(d, diveState.nitroxO2));
                        const diff = Math.abs(nitroxDepth - actualDepth);
                        if (diff < minDiff) {
                            minDiff = diff;
                            airDepth = d;
                        }
                    }
                    
                    // Check if this depth exceeds MOD
                    const exceedsMOD = actualDepth > diveState.mod;
                    
                    if (exceedsMOD) {
                        if (diveState.nitroxO2 < 27) {
                            alert(`Depth exceeds maximum operating depth of 100 feet (Nitrogen narcosis limit).`);
                        } else {
                            alert(`Depth exceeds maximum operating depth of ${Math.floor(diveState.mod)} feet (Oxygen toxicity limit).`);
                        }
                        return;
                    }
                } else {
                    // In air mode, the displayed depth is the air depth
                    airDepth = clickedDepth;
                    actualDepth = clickedDepth;
                }
                
                // If a pressure group is selected, highlight the row for this depth
                if (diveState.newPressureGroup) {
                    // Clear previous row highlights but keep column highlights
                    document.querySelectorAll('#table3 tr.highlighted-row').forEach(el => {
                        el.classList.remove('highlighted-row');
                    });
                    
                    // Highlight just this row
                    row.classList.add('highlighted-row');
                    
                    // Update the selected depth for the second dive
                    diveState.selectedAirDepth = airDepth;
                    diveState.selectedDepth = actualDepth;
                    diveState.targetDepth = actualDepth;
                } else {
                    // If no pressure group is selected yet, just highlight the row
                    document.querySelectorAll('#table3 tr.highlighted-row').forEach(el => {
                        el.classList.remove('highlighted-row');
                    });
                    
                    // Highlight just this row
                    row.classList.add('highlighted-row');
                    
                    // Update the selected depth
                    diveState.selectedAirDepth = airDepth;
                    diveState.selectedDepth = actualDepth;
                }
                
                // Update the results display with the selected depth
                document.getElementById('selected-depth-result').textContent = actualDepth + ' ft';
                
                // Update the residual nitrogen time and adjusted NDL
                try {
                    // Use the air equivalent depth for table lookups
                    const repetitiveInfo = getRepetitiveDiveInfo(diveState.newPressureGroup, airDepth);
                    
                    // Update the results display
                    document.getElementById('repetitive-dive-section').style.display = 'block';
                    
                    if (repetitiveInfo.isExceeded) {
                        document.getElementById('andl-result').textContent = 'N/A';
                        document.getElementById('nodeco-warning').textContent = repetitiveInfo.message;
                        document.getElementById('nodeco-warning').style.display = 'block';
                    } else {
                        document.getElementById('andl-result').textContent = repetitiveInfo.adjustedNoDecoLimit + ' minutes';
                        document.getElementById('nodeco-warning').style.display = 'none';
                        
                        // If we have both a selected pressure group and a target pressure group,
                        // calculate the minimum surface interval
                        if (diveState.selectedPressureGroup && diveState.targetPressureGroup) {
                            displayMinimumSurfaceInterval();
                        }
                    }
                } catch (error) {
                    console.error('Error getting repetitive dive info:', error);
                    document.getElementById('rnt-result').textContent = 'N/A';
                    document.getElementById('andl-result').textContent = 'N/A';
                    document.getElementById('nodeco-warning').textContent = 'Error calculating residual nitrogen time.';
                    document.getElementById('nodeco-warning').style.display = 'block';
                }
            });
        }
        
        // Add click events to ANDL cells (for target pressure group selection)
        const andlCells = row.querySelectorAll('td:not(:first-child)');
        andlCells.forEach((cell, index) => {
            if (cell.textContent !== '-' && !cell.classList.contains('cell-unavailable')) {
                // Make sure we don't add multiple event listeners to the same element
                cell.classList.add('clickable');
                
                // Remove any existing click event listeners (to prevent duplicates)
                const newCell = cell.cloneNode(true);
                cell.parentNode.replaceChild(newCell, cell);
                
                // Add click event to the cell
                newCell.addEventListener('click', function() {
                    // Get the column index of this cell
                    const cellIndex = Array.from(row.cells).indexOf(this);
                    
                    // Get the header cell at the same column index
                    const headerCell = table3.querySelector(`thead tr:nth-child(2) th:nth-child(${cellIndex + 1})`);
                    const targetGroup = headerCell.textContent;
                    
                    // Set the target pressure group
                    diveState.targetPressureGroup = targetGroup;
                    
                    // Get the depth from the first cell in this row
                    const depthCell = row.querySelector('td:first-child');
                    const depth = parseFloat(depthCell.textContent);
                    
                    if (diveState.isNitroxMode) {
                        // In Nitrox mode, the displayed depth is the actual depth
                        diveState.targetDepth = depth;
                        
                        // Find the air equivalent depth
                        const depths = Object.keys(navyTable3).map(Number).sort((a, b) => a - b);
                        let minDiff = Infinity;
                        let airDepth = null;
                        
                        for (const d of depths) {
                            const nitroxDepth = Math.round(calculateActualDepthFromEAD(d, diveState.nitroxO2));
                            const diff = Math.abs(nitroxDepth - depth);
                            if (diff < minDiff) {
                                minDiff = diff;
                                airDepth = d;
                            }
                        }
                        
                        diveState.targetAirDepth = airDepth;
                    } else {
                        // In air mode, the displayed depth is the air depth
                        diveState.targetDepth = depth;
                        diveState.targetAirDepth = depth;
                    }
                    
                    // Clear previous cell highlights in Table 3
                    document.querySelectorAll('#table3 td.target-highlighted').forEach(el => {
                        el.classList.remove('target-highlighted');
                    });
                    
                    // Clear any target highlights in Table 2
                    document.querySelectorAll('#table2 td.target-highlighted').forEach(el => {
                        el.classList.remove('target-highlighted');
                    });
                    
                    // Highlight this cell as the target
                    this.classList.add('target-highlighted');
                    
                    // If we have both a selected pressure group and a target pressure group,
                    // calculate the minimum surface interval and highlight it in Table 2
                    if (diveState.selectedPressureGroup && diveState.targetPressureGroup) {
                        displayMinimumSurfaceInterval();
                        
                        // Highlight the corresponding cell in Table 2
                        highlightSurfaceIntervalInTable2(diveState.selectedPressureGroup, diveState.targetPressureGroup);
                    }
                });
            }
        });
    });
}

// Calculate minimum surface interval between two dives
function calculateMinimumSurfaceInterval(startGroup, targetGroup) {
    // If the target group is the same or higher than the start group, no surface interval is needed
    if (!startGroup || !targetGroup) {
        return null;
    }
    
    // Get the alphabetical order of the groups
    const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
    const startIndex = groups.indexOf(startGroup);
    const targetIndex = groups.indexOf(targetGroup);
    
    // If target group is same or higher (alphabetically) than start group, return minimum interval
    if (targetIndex <= startIndex) {
        // Look up the minimum surface interval in navyTable2
        if (navyTable2[startGroup] && navyTable2[startGroup][targetGroup]) {
            return navyTable2[startGroup][targetGroup][0]; // Return the minimum time
        }
    }
    
    return null; // No valid surface interval found
}

// Display the minimum surface interval in the UI
function displayMinimumSurfaceInterval() {
    if (!diveState.selectedPressureGroup || !diveState.targetPressureGroup) {
        return;
    }
    
    const minSurfaceInterval = calculateMinimumSurfaceInterval(
        diveState.selectedPressureGroup,
        diveState.targetPressureGroup
    );
    
    if (minSurfaceInterval) {
        // Update the UI to show the minimum surface interval
        document.getElementById('repetitive-dive-section').style.display = 'block';
        
        // Create or update the minimum surface interval display
        let minIntervalElement = document.getElementById('min-interval-result');
        if (!minIntervalElement) {
            // Create the elements if they don't exist
            const resultItem = document.createElement('div');
            resultItem.classList.add('result-item');
            
            const label = document.createElement('span');
            label.classList.add('result-label');
            label.textContent = 'Minimum Surface Interval:';
            
            minIntervalElement = document.createElement('span');
            minIntervalElement.id = 'min-interval-result';
            minIntervalElement.classList.add('result-value');
            
            resultItem.appendChild(label);
            resultItem.appendChild(minIntervalElement);
            
            // Insert after the new pressure group result
            const newGroupResult = document.querySelector('.result-item:has(#new-group-result)');
            if (newGroupResult) {
                newGroupResult.parentNode.insertBefore(resultItem, newGroupResult.nextSibling);
            } else {
                document.getElementById('repetitive-dive-section').appendChild(resultItem);
            }
        }
        
        minIntervalElement.textContent = minSurfaceInterval;
        
        // Highlight the cell in Table 2
        highlightSurfaceIntervalInTable2(diveState.selectedPressureGroup, diveState.targetPressureGroup);
    }
}

// Highlight the surface interval cell in Table 2
function highlightSurfaceIntervalInTable2(startGroup, targetGroup) {
    const table2 = document.getElementById('table2');
    if (!table2) return;
    
    // Clear previous highlights but keep the row highlight
    document.querySelectorAll('#table2 td.highlighted-cell').forEach(el => {
        if (!el.parentElement.classList.contains('highlighted-row')) {
            el.classList.remove('highlighted-cell');
        }
    });
    
    // Clear any target highlights
    document.querySelectorAll('#table2 td.target-highlighted').forEach(el => {
        el.classList.remove('target-highlighted');
    });
    
    // Find the row for the start group
    const startRow = Array.from(table2.querySelectorAll('tbody tr')).find(row => {
        const firstCell = row.querySelector('td:first-child');
        return firstCell && firstCell.textContent === startGroup;
    });
    
    if (!startRow) return;
    
    // Find the column for the target group
    const headerRow = table2.querySelector('thead tr:nth-child(2)');
    let targetColIndex = -1;
    
    Array.from(headerRow.querySelectorAll('th')).forEach((th, index) => {
        if (th.textContent === targetGroup) {
            targetColIndex = index;
        }
    });
    
    if (targetColIndex === -1) return;
    
    // Highlight the cell at the intersection
    const targetCell = startRow.querySelector(`td:nth-child(${targetColIndex + 1})`);
    if (targetCell) {
        // Use target-highlighted class to make it stand out
        targetCell.classList.add('target-highlighted');
        
        // Scroll to make the cell visible
        targetCell.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Select a depth in Table 1
function selectDepth(depth) {
    // In Nitrox mode, we need to handle the depth differently
    if (diveState.isNitroxMode) {
        // The depth passed is the actual Nitrox depth
        // We need to find the corresponding air depth for the tables
        const depths = Object.keys(navyTable1).map(Number).sort((a, b) => a - b);
        let airDepth = null;
        let actualDepth = depth;
        
        // Find the air depth that corresponds to this Nitrox depth
        for (const d of depths) {
            const nitroxDepth = Math.round(calculateActualDepthFromEAD(d, diveState.nitroxO2));
            if (nitroxDepth === Math.round(actualDepth)) {
                airDepth = d;
                break;
            }
        }
        
        // If we couldn't find a matching air depth, find the closest one
        if (airDepth === null) {
            let minDiff = Infinity;
            for (const d of depths) {
                const nitroxDepth = Math.round(calculateActualDepthFromEAD(d, diveState.nitroxO2));
                const diff = Math.abs(nitroxDepth - Math.round(actualDepth));
                if (diff < minDiff) {
                    minDiff = diff;
                    airDepth = d;
                    actualDepth = nitroxDepth; // Use the exact Nitrox depth for display
                }
            }
        }
        
        // Check if the depth exceeds MOD
        if (actualDepth > diveState.mod) {
            if (diveState.nitroxO2 < 27) {
                alert(`Depth exceeds maximum operating depth of 100 feet (Nitrogen narcosis limit).`);
            } else {
                alert(`Depth exceeds maximum operating depth of ${Math.floor(diveState.mod)} feet (Oxygen toxicity limit).`);
            }
            return;
        }
        
        // Clear all highlights first
        clearAllHighlights();
        
        // Update state - store both the actual depth and the air equivalent depth
        diveState.selectedDepth = actualDepth;
        diveState.selectedAirDepth = airDepth; // Store the air equivalent for table lookups
        diveState.selectedBottomTime = null;
        diveState.selectedPressureGroup = null;
        diveState.selectedSurfaceInterval = null;
        diveState.newPressureGroup = null;
        diveState.targetDepth = null;
        diveState.targetPressureGroup = null;
        
        // Highlight the row in Table 1
        highlightRowInTable1(actualDepth);
        
        // Update the results display
        document.getElementById('selected-depth-result').textContent = actualDepth + ' ft';
        const [maxNDL, timeGroups] = navyTable1[airDepth];
        document.getElementById('nodeco-result').textContent = maxNDL + ' minutes';
        document.getElementById('pressure-group-result').textContent = '--';
    } else {
        // Standard air mode
        // Find the closest depth in the tables
        const tableDepth = findClosestDepth(depth);
        if (tableDepth === -1) {
            alert('Depth exceeds maximum table depth of 130 feet.');
            return;
        }
        
        // Clear all highlights first
        clearAllHighlights();
        
        // Update state
        diveState.selectedDepth = tableDepth;
        diveState.selectedAirDepth = tableDepth; // In air mode, these are the same
        diveState.selectedBottomTime = null;
        diveState.selectedPressureGroup = null;
        diveState.selectedSurfaceInterval = null;
        diveState.newPressureGroup = null;
        diveState.targetDepth = null;
        diveState.targetPressureGroup = null;
        
        // Highlight the row in Table 1
        highlightRowInTable1(tableDepth);
        
        // Update the results display
        document.getElementById('selected-depth-result').textContent = tableDepth + ' ft';
        const [maxNDL, timeGroups] = navyTable1[tableDepth];
        document.getElementById('nodeco-result').textContent = maxNDL + ' minutes';
        document.getElementById('pressure-group-result').textContent = '--';
    }
    
    // Hide repetitive dive section
    document.getElementById('repetitive-dive-section').style.display = 'none';
    
    // Remove the minimum surface interval display if it exists
    const minIntervalElement = document.getElementById('min-interval-result');
    if (minIntervalElement && minIntervalElement.parentElement) {
        minIntervalElement.parentElement.remove();
    }
}

// Select a bottom time and pressure group in Table 1
function selectBottomTime(bottomTime, pressureGroup) {
    if (!diveState.selectedDepth) return;
    
    // Update state
    diveState.selectedBottomTime = bottomTime;
    diveState.selectedPressureGroup = pressureGroup;
    
    // Highlight the pressure group column in Table 1
    highlightPressureGroupInTable1(pressureGroup);
    
    // Update the results display
    document.getElementById('pressure-group-result').textContent = pressureGroup;
    
    // Hide repetitive dive section
    document.getElementById('repetitive-dive-section').style.display = 'none';
}

// Select a starting pressure group in Table 2
function selectStartGroup(startGroup) {
    if (!diveState.selectedPressureGroup) return;
    
    // Clear previous highlights in Table 2 and 3
    clearTable2Highlights();
    clearTable3Highlights();
    
    // Highlight the row in Table 2
    highlightRowInTable2(startGroup);
}

// Select a surface interval and new pressure group in Table 2
function selectSurfaceInterval(surfaceInterval, newGroup) {
    if (!diveState.selectedPressureGroup) return;
    
    // Clear previous highlights in Table 2 and 3
    clearTable2Highlights();
    clearTable3Highlights();
    
    // Clear any target highlights in Table 3
    document.querySelectorAll('#table3 td.target-highlighted').forEach(el => {
        el.classList.remove('target-highlighted');
    });
    
    // Update state
    diveState.selectedSurfaceInterval = surfaceInterval;
    diveState.newPressureGroup = newGroup;
    
    // Re-highlight the starting pressure group row in Table 2
    highlightRowInTable2(diveState.selectedPressureGroup);
    
    // Highlight the new pressure group column in Table 2
    highlightNewGroupInTable2(newGroup);
    
    // Highlight only the column in Table 3, not the row
    highlightColumnInTable3(newGroup);
    
    // Keep the original first dive depth in the results display
    // Don't update the depth until user clicks on a row in Table 3
    
    // Update the results display
    document.getElementById('repetitive-dive-section').style.display = 'block';
    document.getElementById('new-group-result').textContent = newGroup || 'None';
    
    // Don't calculate repetitive info yet - wait for user to select a depth in Table 3
    document.getElementById('rnt-result').textContent = '-- minutes';
    document.getElementById('andl-result').textContent = '-- minutes';
    document.getElementById('nodeco-warning').style.display = 'none';
    document.getElementById('nodeco-warning').textContent = 'Please select a depth in Table 3 for your repetitive dive.';
    
    // If we already have a target pressure group and depth, update them
    if (diveState.targetPressureGroup && diveState.targetDepth) {
        // Clear the target pressure group since we're now working in the other direction
        diveState.targetPressureGroup = null;
        diveState.targetDepth = null;
        
        // Remove the minimum surface interval display if it exists
        const minIntervalElement = document.getElementById('min-interval-result');
        if (minIntervalElement && minIntervalElement.parentElement) {
            minIntervalElement.parentElement.remove();
        }
    }
}

// Clear all highlighted rows and cells
function clearAllHighlights() {
    clearTable1Highlights();
    clearTable2Highlights();
    clearTable3Highlights();
}

// Clear Table 1 highlights
function clearTable1Highlights() {
    document.querySelectorAll('#table1 tr.highlighted-row, #table1 td.highlighted-cell').forEach(el => {
        el.classList.remove('highlighted-row');
        el.classList.remove('highlighted-cell');
    });
}

// Clear Table 2 highlights
function clearTable2Highlights() {
    document.querySelectorAll('#table2 tr.highlighted-row, #table2 td.highlighted-cell').forEach(el => {
        el.classList.remove('highlighted-row');
        el.classList.remove('highlighted-cell');
    });
}

// Clear Table 3 highlights
function clearTable3Highlights() {
    // Clear all cell highlights
    document.querySelectorAll('#table3 td.highlighted-cell, #table3 th.highlighted-cell').forEach(el => {
        el.classList.remove('highlighted-cell');
    });
    
    // Clear target highlights
    document.querySelectorAll('#table3 td.target-highlighted').forEach(el => {
        el.classList.remove('target-highlighted');
    });
    
    // Clear row highlights separately
    document.querySelectorAll('#table3 tr.highlighted-row').forEach(el => {
        el.classList.remove('highlighted-row');
    });
}

// Highlight the row in Table 1 for the given depth
function highlightRowInTable1(depth) {
    const table1 = document.getElementById('table1');
    if (table1) {
        const tbody = table1.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');
        
        // Clear previous highlights first
        clearTable1Highlights();
        
        // In Nitrox mode, we need to find the row by the displayed depth, not the air depth
        if (diveState.isNitroxMode) {
            // Find the closest row by displayed depth
            let closestRow = null;
            let minDiff = Infinity;
            
            rows.forEach(row => {
                const depthCell = row.querySelector('td:first-child');
                if (depthCell) {
                    const rowDepth = parseFloat(depthCell.textContent);
                    const diff = Math.abs(rowDepth - depth);
                    if (diff < minDiff) {
                        minDiff = diff;
                        closestRow = row;
                    }
                }
            });
            
            if (closestRow) {
                // Highlight the entire row
                closestRow.classList.add('highlighted-row');
                
                // Highlight all cells in the row
                const cells = closestRow.querySelectorAll('td');
                cells.forEach(cell => {
                    cell.classList.add('highlighted-cell');
                });
                
                // Get the actual depth from the row
                const depthCell = closestRow.querySelector('td:first-child');
                const actualDepth = parseFloat(depthCell.textContent);
                
                // Find the corresponding air depth for this Nitrox depth
                // This is needed to get the correct NDL from navyTable1
                const depths = Object.keys(navyTable1).map(Number).sort((a, b) => a - b);
                let airDepth = null;
                
                for (const d of depths) {
                    const nitroxDepth = Math.round(calculateActualDepthFromEAD(d, diveState.nitroxO2));
                    if (nitroxDepth === actualDepth) {
                        airDepth = d;
                        break;
                    }
                }
                
                if (airDepth !== null) {
                    // Update the results display
                    document.getElementById('selected-depth-result').textContent = actualDepth + ' ft';
                    const [maxNDL, timeGroups] = navyTable1[airDepth];
                    document.getElementById('nodeco-result').textContent = maxNDL + ' minutes';
                }
            }
        } else {
            // Standard air mode - find exact depth match
            rows.forEach(row => {
                const depthCell = row.querySelector('td:first-child');
                if (depthCell && parseFloat(depthCell.textContent) === depth) {
                    // Highlight the entire row
                    row.classList.add('highlighted-row');
                    
                    // Highlight all cells in the row
                    const cells = row.querySelectorAll('td');
                    cells.forEach(cell => {
                        cell.classList.add('highlighted-cell');
                    });
                    
                    // Update the results display
                    document.getElementById('selected-depth-result').textContent = depth + ' ft';
                    const [maxNDL, timeGroups] = navyTable1[depth];
                    document.getElementById('nodeco-result').textContent = maxNDL + ' minutes';
                }
            });
        }
    }
}

// Highlight the pressure group column in Table 1
function highlightPressureGroupInTable1(pressureGroup) {
    const table1 = document.getElementById('table1');
    if (table1) {
        // Clear all highlights first
        clearAllHighlights();
        
        // Re-highlight the depth row
        if (diveState.selectedDepth) {
            highlightRowInTable1(diveState.selectedDepth);
        }
        
        const thead = table1.querySelector('thead');
        const tbody = table1.querySelector('tbody');
        
        // Find the column index for the pressure group
        let colIndex = -1;
        const headerCells = thead.querySelectorAll('tr:nth-child(2) th');
        
        headerCells.forEach((cell, index) => {
            if (cell.textContent === pressureGroup) {
                colIndex = index;
                // Highlight the header cell
                cell.classList.add('highlighted-cell');
            }
        });
        
        if (colIndex !== -1) {
            // Highlight the entire column - the actual column index in the table
            // is offset by 2 (depth and NDL columns)
            const actualColIndex = colIndex; 
            const rows = tbody.querySelectorAll('tr');
            
            rows.forEach(row => {
                if (row.cells[actualColIndex]) {
                    row.cells[actualColIndex].classList.add('highlighted-cell');
                }
            });
            
            // Highlight the cells in the selected depth row
            const depthRow = tbody.querySelector(`tr.highlighted-row`);
            if (depthRow) {
                const cell = depthRow.cells[actualColIndex];
                if (cell) {
                    // Update the pressure group result
                    document.getElementById('pressure-group-result').textContent = pressureGroup;
                    
                    // Enable transition to Table 2 by highlighting the corresponding row
                    highlightRowInTable2(pressureGroup);
                }
            }
        }
    }
}

// Highlight the row in Table 2 for the given pressure group
function highlightRowInTable2(pressureGroup) {
    const table2 = document.getElementById('table2');
    if (table2) {
        const tbody = table2.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');
        
        // Clear previous highlights first
        clearTable2Highlights();
        
        rows.forEach(row => {
            const groupCell = row.querySelector('td:first-child');
            if (groupCell && groupCell.textContent === pressureGroup) {
                // Highlight the entire row
                row.classList.add('highlighted-row');
                
                // Highlight all cells in the row
                const cells = row.querySelectorAll('td');
                cells.forEach(cell => {
                    cell.classList.add('highlighted-cell');
                });
            }
        });
    }
}

// Highlight the new pressure group column in Table 2
function highlightNewGroupInTable2(newGroup) {
    const table2 = document.getElementById('table2');
    if (table2) {
        const thead = table2.querySelector('thead');
        const tbody = table2.querySelector('tbody');
        
        // If newGroup is null (None), use the last column
        const displayGroup = newGroup === null ? '-' : newGroup;
        
        // Find the column index for the new pressure group
        let colIndex = -1;
        const headerCells = thead.querySelectorAll('tr:nth-child(2) th');
        
        headerCells.forEach((cell, index) => {
            if (cell.textContent === displayGroup) {
                colIndex = index;
                // Highlight the header cell
                cell.classList.add('highlighted-cell');
            }
        });
        
        if (colIndex !== -1) {
            // Highlight the entire column
            const actualColIndex = colIndex; // +1 because of start group column
            const rows = tbody.querySelectorAll('tr');
            
            rows.forEach(row => {
                if (row.cells[actualColIndex]) {
                    row.cells[actualColIndex].classList.add('highlighted-cell');
                }
            });
            
            // Highlight the cell in the selected pressure group row
            const groupRow = tbody.querySelector(`tr.highlighted-row`);
            if (groupRow) {
                const cell = groupRow.cells[actualColIndex];
                if (cell) {
                    // Update the new group result
                    document.getElementById('new-group-result').textContent = newGroup || 'None';
                }
            }
        }
    }
}

// Highlight only the column in Table 3 for the given pressure group
function highlightColumnInTable3(pressureGroup) {
    if (!pressureGroup) return;
    
    const table3 = document.getElementById('table3');
    if (table3) {
        const thead = table3.querySelector('thead');
        const tbody = table3.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');
        
        // Clear previous highlights first
        clearTable3Highlights();
        
        // Find the column index for the pressure group
        let colIndex = -1;
        const headerCells = thead.querySelectorAll('tr:nth-child(2) th');
        
        headerCells.forEach((cell, index) => {
            if (cell.textContent === pressureGroup) {
                colIndex = index;
                // Highlight the header cell
                cell.classList.add('highlighted-cell');
            }
        });
        
        if (colIndex !== -1) {
            // Highlight the entire column - no need to add 1 as the column index already accounts for the depth column
            const actualColIndex = colIndex;
            rows.forEach(row => {
                if (row.cells[actualColIndex]) {
                    row.cells[actualColIndex].classList.add('highlighted-cell');
                }
            });
        }
    }
}

// Highlight the row in Table 3 for the given depth and pressure group
function highlightRowInTable3(depth, pressureGroup = null) {
    const table3 = document.getElementById('table3');
    if (table3) {
        const thead = table3.querySelector('thead');
        const tbody = table3.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');
        
        // In Nitrox mode, we need to find the air equivalent depth for table lookups
        let lookupDepth = depth;
        if (diveState.isNitroxMode) {
            // Convert the actual depth to an air equivalent depth for table lookups
            const depths = Object.keys(navyTable3).map(Number).sort((a, b) => a - b);
            let airDepth = null;
            
            // Find the closest standard depth in the tables
            let minDiff = Infinity;
            for (const d of depths) {
                const diff = Math.abs(d - depth);
                if (diff < minDiff) {
                    minDiff = diff;
                    airDepth = d;
                }
            }
            
            if (airDepth !== null) {
                lookupDepth = airDepth;
            }
        }
        
        // Highlight the depth row
        rows.forEach(row => {
            const depthCell = row.querySelector('td:first-child');
            if (depthCell && parseFloat(depthCell.textContent) === lookupDepth) {
                // Highlight the entire row
                row.classList.add('highlighted-row');
                
                // Highlight all cells in the row
                const cells = row.querySelectorAll('td');
                cells.forEach(cell => {
                    cell.classList.add('highlighted-cell');
                });
                
                // If pressure group is provided, highlight that column too
                if (pressureGroup) {
                    // Find the column index for the pressure group
                    let colIndex = -1;
                    const headerCells = thead.querySelectorAll('tr:nth-child(2) th');
                    
                    headerCells.forEach((cell, index) => {
                        if (cell.textContent === pressureGroup) {
                            colIndex = index;
                            // Highlight the header cell
                            cell.classList.add('highlighted-cell');
                        }
                    });
                    
                    if (colIndex !== -1) {
                        // Highlight the entire column - no need to subtract 1
                        const actualColIndex = colIndex;
                        rows.forEach(r => {
                            if (r.cells[actualColIndex]) {
                                r.cells[actualColIndex].classList.add('highlighted-cell');
                            }
                        });
                        
                        try {
                            // Get residual nitrogen time and adjusted NDL
                            // In Nitrox mode, we use the air equivalent depth for table lookups
                            const repetitiveInfo = getRepetitiveDiveInfo(pressureGroup, lookupDepth);
                            
                            // Update the results display
                            document.getElementById('repetitive-dive-section').style.display = 'block';
                            
                            if (repetitiveInfo.isExceeded) {
                                document.getElementById('rnt-result').textContent = 'N/A';
                                document.getElementById('andl-result').textContent = 'N/A';
                                document.getElementById('nodeco-warning').textContent = repetitiveInfo.message;
                                document.getElementById('nodeco-warning').style.display = 'block';
                            } else {
                                document.getElementById('rnt-result').textContent = repetitiveInfo.residualNitrogenTime + ' minutes';
                                document.getElementById('andl-result').textContent = repetitiveInfo.adjustedNoDecoLimit + ' minutes';
                                document.getElementById('nodeco-warning').style.display = 'none';
                                
                                // In Nitrox mode, display the actual depth in the results
                                if (diveState.isNitroxMode) {
                                    document.getElementById('selected-depth-result').textContent = depth + ' ft';
                                }
                            }
                        } catch (error) {
                            console.error('Error getting repetitive dive info:', error);
                            document.getElementById('rnt-result').textContent = 'N/A';
                            document.getElementById('andl-result').textContent = 'N/A';
                            document.getElementById('nodeco-warning').textContent = 'Error calculating residual nitrogen time.';
                            document.getElementById('nodeco-warning').style.display = 'block';
                        }
                    }
                }
            }
        });
    }
}

// Populate Table 1: No-Decompression Limits and Repetitive Group Designation
function populateTable1() {
    const table = document.getElementById('table1');
    if (!table) return;
    
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
    
    // Get depths from navyTable1
    const depths = Object.keys(navyTable1).map(Number).sort((a, b) => a - b);
    
    // If in Nitrox mode, we need to calculate equivalent air depths
    if (diveState.isNitroxMode) {
        // Create rows for each depth
        depths.forEach(airDepth => {
            // Calculate the actual depth for this EAD based on Nitrox mix
            const actualDepth = calculateActualDepthFromEAD(airDepth, diveState.nitroxO2);
            const roundedActualDepth = Math.round(actualDepth);
            
            // Check if this depth exceeds MOD (oxygen toxicity limit)
            const exceedsMOD = roundedActualDepth > diveState.mod;
            
            // Check if this depth is at risk for nitrogen narcosis
            const narcosisRisk = isNarcosisRisk(roundedActualDepth);
            
            // Add a reason for the MOD limit or narcosis risk
            let modReason = '';
            if (exceedsMOD) {
                modReason = `Oxygen toxicity limit (pO₂ 1.4 ATA)`;
            }
            
            const [maxNDL, timeGroups] = navyTable1[airDepth];
            const row = document.createElement('tr');
            
            // Add classes for styling
            row.classList.add('adjusted-depth');
            if (exceedsMOD) {
                row.classList.add('beyond-mod');
            } else if (narcosisRisk) {
                row.classList.add('narcosis-risk');
            }
            
            // Add depth cell (showing the actual Nitrox depth)
            const depthCell = document.createElement('td');
            depthCell.textContent = roundedActualDepth;
            depthCell.title = `Equivalent Air Depth: ${airDepth} ft`;
            row.appendChild(depthCell);
            
            // Add NDL cell
            const ndlCell = document.createElement('td');
            ndlCell.textContent = maxNDL;
            row.appendChild(ndlCell);
            
            // Add cells for each pressure group
            const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
            groups.forEach(group => {
                const cell = document.createElement('td');
                
                // Find the time for this group
                let time = null;
                for (const [t, g] of Object.entries(timeGroups)) {
                    if (g === group) {
                        time = t;
                        break;
                    }
                }
                
                if (time) {
                    cell.textContent = time;
                    cell.classList.add(`group-${group.toLowerCase()}`);
                    
                    // If beyond MOD, make cell non-clickable
                    if (exceedsMOD) {
                        cell.classList.add('cell-unavailable');
                        cell.title = `Exceeds Maximum Operating Depth: ${modReason}`;
                    } else if (narcosisRisk) {
                        // For depths beyond 100ft, add warning but keep clickable
                        cell.classList.add('narcosis-warning');
                        cell.title = `Warning: Increased risk of nitrogen narcosis beyond 100ft`;
                    }
                } else {
                    cell.textContent = '-';
                }
                
                row.appendChild(cell);
            });
            
            tbody.appendChild(row);
        });
    } else {
        // Standard air table
        // Create rows for each depth
        depths.forEach(depth => {
            const [maxNDL, timeGroups] = navyTable1[depth];
            const row = document.createElement('tr');
            
            // Check if this depth is at risk for nitrogen narcosis
            const narcosisRisk = isNarcosisRisk(depth);
            
            // Add classes for styling
            if (narcosisRisk) {
                row.classList.add('narcosis-risk');
            }
            
            // Add depth cell
            const depthCell = document.createElement('td');
            depthCell.textContent = depth;
            if (narcosisRisk) {
                depthCell.title = `Warning: Increased risk of nitrogen narcosis beyond 100ft`;
            }
            row.appendChild(depthCell);
            
            // Add NDL cell
            const ndlCell = document.createElement('td');
            ndlCell.textContent = maxNDL;
            row.appendChild(ndlCell);
            
            // Add cells for each pressure group
            const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
            groups.forEach(group => {
                const cell = document.createElement('td');
                
                // Find the time for this group
                let time = null;
                for (const [t, g] of Object.entries(timeGroups)) {
                    if (g === group) {
                        time = t;
                        break;
                    }
                }
                
                if (time) {
                    cell.textContent = time;
                    cell.classList.add(`group-${group.toLowerCase()}`);
                    
                    // Add narcosis warning for depths beyond 100ft
                    if (narcosisRisk) {
                        cell.classList.add('narcosis-warning');
                        cell.title = `Warning: Increased risk of nitrogen narcosis beyond 100ft`;
                    }
                } else {
                    cell.textContent = '-';
                }
                
                row.appendChild(cell);
            });
            
            tbody.appendChild(row);
        });
    }
}

// Populate Table 2: Surface Interval Credit Table
function populateTable2() {
    const table = document.getElementById('table2');
    if (!table) return;
    
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
    
    // Update the table header to show groups from K to A
    const thead = table.querySelector('thead');
    const headerRow = thead.querySelector('tr:nth-child(2)');
    if (headerRow) {
        headerRow.innerHTML = '';
        const groups = ['K', 'J', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A', 'None'];
        
        // Add empty cell for the corner
        const cornerCell = document.createElement('th');
        headerRow.appendChild(cornerCell);
        
        // Add header cells for each group
        groups.forEach(group => {
            const th = document.createElement('th');
            th.textContent = group === 'None' ? '-' : group;
            headerRow.appendChild(th);
        });
    }
    
    // Get groups from navyTable2 in reverse order (K to A)
    const groups = Object.keys(navyTable2).sort().reverse();
    
    // Create rows for each starting group
    groups.forEach(startGroup => {
        const row = document.createElement('tr');
        
        // Add starting group cell
        const startGroupCell = document.createElement('td');
        startGroupCell.textContent = startGroup;
        startGroupCell.classList.add(`group-${startGroup.toLowerCase()}`);
        row.appendChild(startGroupCell);
        
        // Add cells for each ending group (K to A and None)
        const endGroups = ['K', 'J', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A', 'None'];
        endGroups.forEach(endGroup => {
            const cell = document.createElement('td');
            
            // Check if this end group is available for this start group
            if (navyTable2[startGroup] && navyTable2[startGroup][endGroup]) {
                const [minTime, maxTime] = navyTable2[startGroup][endGroup];
                
                cell.classList.add('cell-double');
                
                // Create top value (min time)
                const topSpan = document.createElement('span');
                topSpan.classList.add('top-value');
                topSpan.textContent = minTime;
                topSpan.title = 'Minimum surface interval to reach this group';
                
                // Create bottom value (max time)
                const bottomSpan = document.createElement('span');
                bottomSpan.classList.add('bottom-value');
                bottomSpan.textContent = maxTime;
                bottomSpan.title = 'Maximum surface interval to remain in this group';
                
                cell.appendChild(topSpan);
                cell.appendChild(bottomSpan);
                
                if (endGroup !== 'None') {
                    cell.classList.add(`group-${endGroup.toLowerCase()}`);
                }
                
                cell.classList.add('clickable');
                
                // Add click event to the cell
                cell.addEventListener('click', function() {
                    if (diveState.selectedPressureGroup !== startGroup) {
                        alert(`You selected pressure group ${startGroup}, but your current pressure group is ${diveState.selectedPressureGroup || 'not set'}`);
                        return;
                    }
                    
                    // Use the minimum time as the selected surface interval
                    selectSurfaceInterval(minTime, endGroup === 'None' ? null : endGroup);
                });
            } else {
                cell.textContent = '-';
            }
            
            row.appendChild(cell);
        });
        
        tbody.appendChild(row);
    });
}

// Populate Table 3: Adjusted No-Decompression Limits
function populateTable3() {
    const table = document.getElementById('table3');
    if (!table) return;
    
    // Update the table header to reflect the change
    const tableHeader = document.querySelector('#table3 thead tr:first-child th:first-child');
    if (tableHeader) {
        tableHeader.colSpan = 1;
    }
    
    // Update the table title
    const tableTitle = document.querySelector('h3:nth-of-type(3)');
    if (tableTitle) {
        tableTitle.textContent = 'Table 3: Adjusted No-Decompression Limits (Minutes)';
    }
    
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
    
    // Get depths from navyTable3
    const depths = Object.keys(navyTable3).map(Number).sort((a, b) => a - b);
    
    // If in Nitrox mode, we need to calculate equivalent air depths
    if (diveState.isNitroxMode) {
        // Create rows for each depth
        depths.forEach(airDepth => {
            // Calculate the actual depth for this EAD based on Nitrox mix
            const actualDepth = calculateActualDepthFromEAD(airDepth, diveState.nitroxO2);
            const roundedActualDepth = Math.round(actualDepth);
            
            // Check if this depth exceeds MOD (oxygen toxicity limit)
            const exceedsMOD = roundedActualDepth > diveState.mod;
            
            // Check if this depth is at risk for nitrogen narcosis
            const narcosisRisk = isNarcosisRisk(roundedActualDepth);
            
            // Add a reason for the MOD limit or narcosis risk
            let modReason = '';
            if (exceedsMOD) {
                modReason = `Oxygen toxicity limit (pO₂ 1.4 ATA)`;
            }
            
            const row = document.createElement('tr');
            
            // Add classes for styling
            row.classList.add('adjusted-depth');
            if (exceedsMOD) {
                row.classList.add('beyond-mod');
            } else if (narcosisRisk) {
                row.classList.add('narcosis-risk');
            }
            
            // Add depth cell (showing the actual Nitrox depth, not the air depth)
            const depthCell = document.createElement('td');
            depthCell.textContent = roundedActualDepth;
            depthCell.title = `Equivalent Air Depth: ${airDepth} ft`;
            depthCell.classList.add('clickable');
            
            // If beyond MOD, make cell non-clickable
            if (exceedsMOD) {
                depthCell.classList.add('cell-unavailable');
                depthCell.title = `Exceeds Maximum Operating Depth: ${modReason}`;
            } else if (narcosisRisk) {
                // For depths beyond 100ft, add warning but keep clickable
                depthCell.classList.add('narcosis-warning');
                depthCell.title = `Warning: Increased risk of nitrogen narcosis beyond 100ft`;
            }
            
            // Add click event to depth cell
            depthCell.addEventListener('click', function() {
                if (exceedsMOD) {
                    alert(`Depth exceeds maximum operating depth of ${Math.floor(diveState.mod)} feet (Oxygen toxicity limit).`);
                    return;
                }
                
                // For depths with narcosis risk, show a warning but allow the user to proceed
                if (narcosisRisk) {
                    if (!confirm(`Warning: Depths beyond 100 feet have an increased risk of nitrogen narcosis. Do you want to proceed?`)) {
                        return;
                    }
                }
                
                const actualDepthClicked = parseFloat(this.textContent);
                
                // If a pressure group is selected, highlight the row for this depth
                if (diveState.newPressureGroup) {
                    // Clear previous row highlights but keep column highlights
                    document.querySelectorAll('#table3 tr.highlighted-row').forEach(el => {
                        el.classList.remove('highlighted-row');
                    });
                    
                    // Highlight just this row
                    row.classList.add('highlighted-row');
                    
                    // Update the selected depth for the second dive
                    // In Nitrox mode, we need to store both the air depth and the actual depth
                    diveState.selectedAirDepth = airDepth;
                    diveState.selectedDepth = actualDepthClicked;
                    diveState.targetDepth = actualDepthClicked;
                } else {
                    // If no pressure group is selected yet, just highlight the row
                    // Clear previous row highlights
                    document.querySelectorAll('#table3 tr.highlighted-row').forEach(el => {
                        el.classList.remove('highlighted-row');
                    });
                    
                    // Highlight just this row
                    row.classList.add('highlighted-row');
                    
                    // Update the selected depth
                    diveState.selectedAirDepth = airDepth;
                    diveState.selectedDepth = actualDepthClicked;
                    
                    // Update the results display with the selected depth
                    document.getElementById('selected-depth-result').textContent = actualDepthClicked + ' ft';
                }
                
                // Update the results display with the selected depth
                document.getElementById('selected-depth-result').textContent = actualDepthClicked + ' ft';
                
                // Update the residual nitrogen time and adjusted NDL
                try {
                    // Use the air equivalent depth for table lookups, not the actual Nitrox depth
                    const repetitiveInfo = getRepetitiveDiveInfo(diveState.newPressureGroup, airDepth);
                    
                    // Update the results display
                    document.getElementById('repetitive-dive-section').style.display = 'block';
                    
                    if (repetitiveInfo.isExceeded) {
                        document.getElementById('rnt-result').textContent = 'N/A';
                        document.getElementById('andl-result').textContent = 'N/A';
                        document.getElementById('nodeco-warning').textContent = repetitiveInfo.message;
                        document.getElementById('nodeco-warning').style.display = 'block';
                    } else {
                        document.getElementById('rnt-result').textContent = repetitiveInfo.residualNitrogenTime + ' minutes';
                        document.getElementById('andl-result').textContent = repetitiveInfo.adjustedNoDecoLimit + ' minutes';
                        document.getElementById('nodeco-warning').style.display = 'none';
                        
                        // If we have both a selected pressure group and a target pressure group,
                        // calculate the minimum surface interval
                        if (diveState.selectedPressureGroup && diveState.targetPressureGroup) {
                            displayMinimumSurfaceInterval();
                        }
                    }
                } catch (error) {
                    console.error('Error getting repetitive dive info:', error);
                    document.getElementById('rnt-result').textContent = 'N/A';
                    document.getElementById('andl-result').textContent = 'N/A';
                    document.getElementById('nodeco-warning').textContent = 'Error calculating residual nitrogen time.';
                    document.getElementById('nodeco-warning').style.display = 'block';
                }
            });
            
            row.appendChild(depthCell);
            
            // Add cells for each pressure group
            const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
            groups.forEach(group => {
                const cell = document.createElement('td');
                
                // Get RNT and ANDL for this depth and group
                if (navyTable3[airDepth] && navyTable3[airDepth][group]) {
                    const [rnt, andl] = navyTable3[airDepth][group];
                    
                    if (rnt === 'N/L' || andl === 0) {
                        cell.textContent = '-';
                        cell.classList.add('cell-unavailable');
                        cell.title = 'Not available';
                    } else if (exceedsMOD) {
                        cell.textContent = '-';
                        cell.classList.add('cell-unavailable');
                        cell.title = `Exceeds Maximum Operating Depth: ${modReason}`;
                    } else if (narcosisRisk) {
                        // For depths beyond 100ft, add warning but keep clickable
                        cell.classList.add(`group-${group.toLowerCase()}`);
                        cell.classList.add('narcosis-warning');
                        cell.textContent = andl;
                        cell.title = `Warning: Increased risk of nitrogen narcosis beyond 100ft. Adjusted No-Decompression Limit: ${andl} minutes.`;
                    } else {
                        cell.classList.add(`group-${group.toLowerCase()}`);
                        cell.textContent = andl;
                        cell.title = `Adjusted No-Decompression Limit (${andl} minutes): This is the maximum time you can stay at this depth for your repetitive dive.`;
                        
                        // Make the cell clickable to select as target pressure group
                        cell.classList.add('clickable');
                        cell.addEventListener('click', function() {
                            // Set the target pressure group
                            diveState.targetPressureGroup = group;
                            diveState.targetDepth = roundedActualDepth;
                            diveState.targetAirDepth = airDepth;
                            
                            // Clear previous cell highlights in Table 3
                            document.querySelectorAll('#table3 td.target-highlighted').forEach(el => {
                                el.classList.remove('target-highlighted');
                            });
                            
                            // Clear any target highlights in Table 2
                            document.querySelectorAll('#table2 td.target-highlighted').forEach(el => {
                                el.classList.remove('target-highlighted');
                            });
                            
                            // Highlight this cell as the target
                            cell.classList.add('target-highlighted');
                            
                            // If we have both a selected pressure group and a target pressure group,
                            // calculate the minimum surface interval and highlight it in Table 2
                            if (diveState.selectedPressureGroup && diveState.targetPressureGroup) {
                                displayMinimumSurfaceInterval();
                                
                                // Highlight the corresponding cell in Table 2
                                highlightSurfaceIntervalInTable2(diveState.selectedPressureGroup, diveState.targetPressureGroup);
                            }
                        });
                    }
                } else {
                    cell.textContent = '-';
                }
                
                row.appendChild(cell);
            });
            
            tbody.appendChild(row);
        });
    } else {
        // Standard air table
        // Create rows for each depth
        depths.forEach(depth => {
            const row = document.createElement('tr');
            
            // Check if this depth is at risk for nitrogen narcosis
            const narcosisRisk = isNarcosisRisk(depth);
            
            // Add classes for styling
            if (narcosisRisk) {
                row.classList.add('narcosis-risk');
            }
            
            // Add depth cell
            const depthCell = document.createElement('td');
            depthCell.textContent = depth;
            depthCell.classList.add('clickable');
            
            if (narcosisRisk) {
                depthCell.classList.add('narcosis-warning');
                depthCell.title = `Warning: Increased risk of nitrogen narcosis at 100ft and beyond`;
            }
            
            // Add click event to depth cell
            depthCell.addEventListener('click', function() {
                const clickedDepth = parseFloat(this.textContent);
                
                // For depths with narcosis risk, show a warning but allow the user to proceed
                if (narcosisRisk) {
                    if (!confirm(`Warning: Depths at 100 feet and beyond have an increased risk of nitrogen narcosis. Do you want to proceed?`)) {
                        return;
                    }
                }
                
                // If a pressure group is selected, highlight the row for this depth
                if (diveState.newPressureGroup) {
                    // Clear previous row highlights but keep column highlights
                    document.querySelectorAll('#table3 tr.highlighted-row').forEach(el => {
                        el.classList.remove('highlighted-row');
                    });
                    
                    // Highlight just this row
                    row.classList.add('highlighted-row');
                    
                    // Update the selected depth for the second dive
                    diveState.selectedDepth = clickedDepth;
                    diveState.targetDepth = clickedDepth;
                    
                    // Update the results display with the selected depth
                    document.getElementById('selected-depth-result').textContent = clickedDepth + ' ft';
                    
                    // Update the residual nitrogen time and adjusted NDL
                    try {
                        const repetitiveInfo = getRepetitiveDiveInfo(diveState.newPressureGroup, clickedDepth);
                        
                        // Update the results display
                        document.getElementById('repetitive-dive-section').style.display = 'block';
                        
                        if (repetitiveInfo.isExceeded) {
                            document.getElementById('rnt-result').textContent = 'N/A';
                            document.getElementById('andl-result').textContent = 'N/A';
                            document.getElementById('nodeco-warning').textContent = repetitiveInfo.message;
                            document.getElementById('nodeco-warning').style.display = 'block';
                        } else {
                            document.getElementById('rnt-result').textContent = repetitiveInfo.residualNitrogenTime + ' minutes';
                            document.getElementById('andl-result').textContent = repetitiveInfo.adjustedNoDecoLimit + ' minutes';
                            document.getElementById('nodeco-warning').style.display = 'none';
                            
                            // If we have both a selected pressure group and a target pressure group,
                            // calculate the minimum surface interval
                            if (diveState.selectedPressureGroup && diveState.targetPressureGroup) {
                                displayMinimumSurfaceInterval();
                            }
                        }
                    } catch (error) {
                        console.error('Error getting repetitive dive info:', error);
                        document.getElementById('rnt-result').textContent = 'N/A';
                        document.getElementById('andl-result').textContent = 'N/A';
                        document.getElementById('nodeco-warning').textContent = 'Error calculating residual nitrogen time.';
                        document.getElementById('nodeco-warning').style.display = 'block';
                    }
                }
            });
            
            row.appendChild(depthCell);
            
            // Add cells for each pressure group
            const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
            groups.forEach(group => {
                const cell = document.createElement('td');
                
                // Get RNT and ANDL for this depth and group
                if (navyTable3[depth] && navyTable3[depth][group]) {
                    const [rnt, andl] = navyTable3[depth][group];
                    
                    if (rnt === 'N/L' || andl === 0) {
                        cell.textContent = '-';
                        cell.classList.add('cell-unavailable');
                        cell.title = 'Not available';
                    } else if (narcosisRisk) {
                        cell.classList.add(`group-${group.toLowerCase()}`);
                        cell.classList.add('narcosis-warning');
                        cell.textContent = andl;
                        cell.title = `Warning: Increased risk of nitrogen narcosis at 100ft and beyond. Adjusted No-Decompression Limit: ${andl} minutes.`;
                    } else {
                        cell.classList.add(`group-${group.toLowerCase()}`);
                        cell.textContent = andl;
                        cell.title = `Adjusted No-Decompression Limit (${andl} minutes): This is the maximum time you can stay at this depth for your repetitive dive.`;
                        
                        // Make the cell clickable to select as target pressure group
                        cell.classList.add('clickable');
                        cell.addEventListener('click', function() {
                            // Set the target pressure group
                            diveState.targetPressureGroup = group;
                            diveState.targetDepth = depth;
                            
                            // Clear previous cell highlights in Table 3
                            document.querySelectorAll('#table3 td.target-highlighted').forEach(el => {
                                el.classList.remove('target-highlighted');
                            });
                            
                            // Clear any target highlights in Table 2
                            document.querySelectorAll('#table2 td.target-highlighted').forEach(el => {
                                el.classList.remove('target-highlighted');
                            });
                            
                            // Highlight this cell as the target
                            cell.classList.add('target-highlighted');
                            
                            // If we have both a selected pressure group and a target pressure group,
                            // calculate the minimum surface interval and highlight it in Table 2
                            if (diveState.selectedPressureGroup && diveState.targetPressureGroup) {
                                displayMinimumSurfaceInterval();
                                
                                // Highlight the corresponding cell in Table 2
                                highlightSurfaceIntervalInTable2(diveState.selectedPressureGroup, diveState.targetPressureGroup);
                            }
                        });
                    }
                } else {
                    cell.textContent = '-';
                }
                
                row.appendChild(cell);
            });
            
            tbody.appendChild(row);
        });
    }
}
