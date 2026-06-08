import mongoose from 'mongoose';
import dotenv from 'dotenv';
import tzlookup from 'tz-lookup';
import { DateTime } from 'luxon';
import Country from '../models/Country.js';

dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const countries = await Country.find().lean().exec();
  const mismatches = [];

  for (const c of countries) {
    const latlng = (c.capitalInfo && Array.isArray(c.capitalInfo.latlng) && c.capitalInfo.latlng.length >= 2)
      ? c.capitalInfo.latlng
      : (Array.isArray(c.latlng) && c.latlng.length >= 2 ? c.latlng : null);

    if (!latlng) {
      mismatches.push({ code: c.code, name: c.name, reason: 'no-coords', stored: c.timezone || c.timezones });
      continue;
    }

    let derived = null;
    try {
      derived = tzlookup(latlng[0], latlng[1]);
    } catch (err) {
      mismatches.push({ code: c.code, name: c.name, reason: 'tz-lookup-failed', err: err.message, latlng });
      continue;
    }

    // compute derived offset string like "UTC+01:00"
    const now = DateTime.now();
    const minutesOffset = DateTime.now().setZone(derived).offset; // current minutes (may include DST)
    // compute standard (winter) offset using Jan 1 of current year
    const standard = DateTime.fromObject({ year: now.year, month: 1, day: 1 }).setZone(derived);
    const standardMinutes = standard.offset;
    const sign = minutesOffset >= 0 ? '+' : '-';
    const absMinutes = Math.abs(minutesOffset);
    const hh = String(Math.floor(absMinutes / 60)).padStart(2, '0');
    const mm = String(absMinutes % 60).padStart(2, '0');
    const derivedOffset = `UTC${sign}${hh}:${mm}`;
    // standard offset string
    const sSign = standardMinutes >= 0 ? '+' : '-';
    const sAbs = Math.abs(standardMinutes);
    const sH = String(Math.floor(sAbs / 60)).padStart(2, '0');
    const sM = String(sAbs % 60).padStart(2, '0');
    const derivedStandardOffset = `UTC${sSign}${sH}:${sM}`;

    // compare derivedOffset to stored timezone strings
    let matchFound = false;
    const normalize = (s) => {
      if (!s && s !== 0) return null;
      let x = String(s).trim();
      if (x === 'UTC') return 'UTC+00:00';
      const m = x.match(/^UTC([+-])(\d{1,2})(:?)(\d{2})?$/);
      if (m) {
        const sign = m[1];
        const hh = m[2].padStart(2, '0');
        const mm = m[4] ? m[4] : '00';
        return `UTC${sign}${hh}:${mm}`;
      }
      return x;
    };

    const normDerived = normalize(derivedOffset);
    const normStandard = normalize(derivedStandardOffset);

    if (c.timezone && (normalize(c.timezone) === normDerived || normalize(c.timezone) === normStandard)) matchFound = true;
    if (Array.isArray(c.timezones)) {
      for (const tz of c.timezones) if (normalize(tz) === normDerived || normalize(tz) === normStandard) matchFound = true;
    }

    if (!matchFound) {
      mismatches.push({ code: c.code, name: c.name, derived, derivedOffset, derivedStandardOffset, stored: { timezone: c.timezone, timezones: c.timezones }, latlng });
    }
  }

  console.log(`Checked ${countries.length} countries. Found ${mismatches.length} mismatches.`);
  if (mismatches.length) {
    for (const m of mismatches) console.log(JSON.stringify(m));
  }

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
