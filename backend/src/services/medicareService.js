const crypto = require('crypto');
const env = require('../config/env');

const ENCRYPTION_KEY = crypto.createHash('sha256').update(env.ENCRYPTION_KEY || 'nirbhaya_default_secret_key_32_b').digest();

// Verified Seed Facilities (Delhi NCR & National Centers)
const VERIFIED_FACILITIES = [
  {
    id: 'HOSP-AIIMS-TRAUMA',
    name: 'Jai Prakash Narayan Apex Trauma Center (AIIMS)',
    category: 'Trauma & Emergency Care',
    type: 'Government Super-Speciality',
    lat: 28.5672,
    lng: 77.1950,
    address: 'Chaudhary Jhandu Singh Marg, Raj Nagar, Safdarjung Enclave, New Delhi',
    phone: '011-26731112',
    emergencyPhone: '102 / 011-26588700',
    operatingHours: '24/7 Casualty & Emergency Operation Theatres',
    specialties: ['24/7 Trauma Care', 'Medico-Legal Cases (MLC)', 'Forensic Examination', 'ICU Care'],
    hasGynecology: true,
    hasForensicUnit: true,
    governmentAccredited: true
  },
  {
    id: 'HOSP-LADY-HARDINGE',
    name: 'Lady Hardinge Medical College & Smt. Sucheta Kriplani Hospital',
    category: 'Women & Child Healthcare',
    type: 'Government Premier Women Hospital',
    lat: 28.6328,
    lng: 77.2155,
    address: 'Shaheed Bhagat Singh Marg, Connaught Place, New Delhi',
    phone: '011-23363728',
    emergencyPhone: '011-23343974',
    operatingHours: '24/7 Emergency Casualty & Obstetric Care',
    specialties: ['Specialized Women Healthcare', 'Gynecology & Obstetrics', 'Crisis Intervention Center (OSC)', 'Psychological Trauma Counseling'],
    hasGynecology: true,
    hasForensicUnit: true,
    governmentAccredited: true
  },
  {
    id: 'HOSP-RML',
    name: 'Dr. Ram Manohar Lohia Hospital (RML Emergency)',
    category: 'Multi-Speciality Emergency',
    type: 'Central Government Hospital',
    lat: 28.6253,
    lng: 77.2017,
    address: 'Baba Kharak Singh Marg, Connaught Place, New Delhi',
    phone: '011-23365525',
    emergencyPhone: '102 / 011-23404286',
    operatingHours: '24 Hours Emergency Casualty',
    specialties: ['24/7 Casualty', 'One Stop Center (Sakhi) for Women', 'Medico-Legal Examination', 'Emergency Surgery'],
    hasGynecology: true,
    hasForensicUnit: true,
    governmentAccredited: true
  },
  {
    id: 'HOSP-SAFDARJUNG',
    name: 'Vardhman Mahavir Medical College & Safdarjung Hospital',
    category: 'Emergency & Burns Center',
    type: 'Central Government Multi-Speciality',
    lat: 28.5693,
    lng: 77.2078,
    address: 'Ansari Nagar East, Ring Road, Opposite AIIMS, New Delhi',
    phone: '011-26165060',
    emergencyPhone: '102 / 011-26707444',
    operatingHours: '24/7 Dedicated Emergency Ward',
    specialties: ['Trauma & Acute Care', 'Women Emergency Services', 'Clinical Forensic Medicine', 'Crisis Support'],
    hasGynecology: true,
    hasForensicUnit: true,
    governmentAccredited: true
  },
  {
    id: 'HOSP-LNJP',
    name: 'Lok Nayak Jai Prakash Narayan Hospital (LNJP)',
    category: 'General & Emergency Hospital',
    type: 'Govt. of NCT of Delhi',
    lat: 28.6366,
    lng: 77.2407,
    address: 'Jawaharlal Nehru Marg, Delhi Gate, New Delhi',
    phone: '011-23233000',
    emergencyPhone: '011-23239249',
    operatingHours: '24/7 Emergency Wing',
    specialties: ['Casualty & Trauma', 'Women Victim Crisis Cell', 'Forensic Toxicology', 'General Surgery'],
    hasGynecology: true,
    hasForensicUnit: true,
    governmentAccredited: true
  }
];

class MedicareService {
  /**
   * Calculate distance between two lat/lng pairs via Haversine formula
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  /**
   * Get emergency facilities sorted by proximity
   */
  getNearbyFacilities(userLat = 28.6295, userLng = 77.2075, filter = 'all') {
    let list = [...VERIFIED_FACILITIES];

    if (filter === 'women') {
      list = list.filter(f => f.hasGynecology);
    } else if (filter === 'trauma') {
      list = list.filter(f => f.specialties.some(s => s.toLowerCase().includes('trauma')));
    }

    const withDist = list.map(f => {
      const distanceKm = this.calculateDistance(userLat, userLng, f.lat, f.lng);
      return {
        ...f,
        distanceKm,
        approxDriveTimeMinutes: Math.max(3, Math.round(distanceKm * 2.8))
      };
    });

    withDist.sort((a, b) => a.distanceKm - b.distanceKm);
    return withDist;
  }

  /**
   * Encrypt sensitive health details using authenticated AES-256-GCM
   */
  encryptMedicalData(dataObject) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    const jsonString = JSON.stringify(dataObject);
    const encrypted = Buffer.concat([cipher.update(jsonString, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
      encryptedData: encrypted.toString('base64'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  /**
   * Decrypt sensitive health details
   */
  decryptMedicalData(encryptedBase64, ivHex, authTagHex) {
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedBase64, 'base64')),
      decipher.final()
    ]);

    return JSON.parse(decrypted.toString('utf8'));
  }

  /**
   * Generate 24-hour temporary doctor access pass
   */
  generateDoctorPass(doctorName = 'Attending Casualty Physician', hospitalName = 'Emergency Medical Centre') {
    const passCode = `PASS-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    return {
      passCode,
      doctorName,
      hospitalName,
      expiresAt,
      isActive: true,
      grantedAt: new Date()
    };
  }
}

module.exports = new MedicareService();

