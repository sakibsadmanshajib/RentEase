import { Unit } from './src/property/models/unit.model';
console.log('Unit:', Unit);

try {
    const Lease = require('./src/property/models/lease.model').Lease;
    console.log('Lease:', Lease);
} catch (e) {
    console.error('Failed to load Lease:', e);
}
