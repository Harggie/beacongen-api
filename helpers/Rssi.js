// calculation helpers

const KalmanFilter = require('kalmanjs').default;
const trilat = require('trilat');

module.exports = {
    calculatePoints: calculatePoints,
    filterScans: filterScans,
    sortReadingsByScanId, sortReadingsByScanId
}

function calculatePoints(filteredScans, beaconCoords) {
    return filteredScans.map(function (scan) {
        // min. 3 devices
        if (scan.length >= 3) {
            let input = [];
            scan.map(function (device) {
                let beacon = beaconCoords[device.address];
                input.push([beacon.x, beacon.y, device.distance]);
            });
            console.log(input);
            return trilat(input);
        }
    }).filter(function (coordinates) {
        return coordinates !== undefined;
    });
};

function filterScans(scans, scale) {
    return scans.map(function (scan) {
        return scan.map(function (device) {
            let kalmanFilter = new KalmanFilter({ R: 0.01, Q: 1 });
            let reducedDevice = device.map(function (reading) {
                // if data is malformed
                if (reading.rssi > 0) reading.rssi = -1 * reading.rssi;
                reading.rssi = kalmanFilter.filter(reading.rssi);
                return reading;
            }).reduce(function (prev, current) {
                return {
                    rssi: prev.rssi + current.rssi
                };
            });

            let avgRssi = reducedDevice.rssi / device.length;
            return {
                address: device[0].address,
                rssi: avgRssi,
                distance: Math.pow(10, (-59 - avgRssi) / (10 * 3)) * scale
            };
        });
    });
};

function sortReadingsByScanId(readings) {
    let data = {};
    readings.map(function (reading, index, array) {
        if (data[reading.scan_id] === undefined) {
            data[reading.scan_id] = {};
            data[reading.scan_id][reading.address] = [reading];
            return;
        }

        if (data[reading.scan_id][reading.address] === undefined) {
            data[reading.scan_id][reading.address] = [reading];
            return;
        }

        data[reading.scan_id][reading.address].push(reading);
    });

    let scanData = [];
    for (let scan in data) {
        let deviceData = [];
        for (let device in data[scan]) {
            deviceData.push(data[scan][device]);
        }
        scanData.push(deviceData);
    }

    return scanData;
};