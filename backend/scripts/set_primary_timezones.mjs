import mongoose from 'mongoose';
import dotenv from 'dotenv';
import tzlookup from 'tz-lookup';
import { DateTime } from 'luxon';
import Country from '../models/Country.js';

dotenv.config();

async function computeForCountry(c) {
  const latlng = (c.capitalInfo && Array.isArray(c.capitalInfo.latlng) && c.capitalInfo.latlng.length >= 2)
    ? c.capitalInfo.latlng
    : (Array.isArray(c.latlng) && c.latlng.length >= 2 ? c.latlng : null);

  if (!latlng) return { primaryTimezone: '', primaryUtcOffset: '' };

  try {
    const derived = tzlookup(latlng[0], latlng[1]);
    const standard = DateTime.fromObject({ year: DateTime.now().year, month: 1, day: 1 }).setZone(derived);
    const standardMinutes = standard.offset;
    const sSign = standardMinutes >= 0 ? '+' : '-';
    const sAbs = Math.abs(standardMinutes);
    const sH = String(Math.floor(sAbs / 60)).padStart(2, '0');
    const sM = String(sAbs % 60).padStart(2, '0');
    const primaryUtcOffset = `UTC${sSign}${sH}:${sM}`;
    return { primaryTimezone: derived, primaryUtcOffset };
  } catch (err) {
    return { primaryTimezone: '', primaryUtcOffset: '' };
  }
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const countries = await Country.find().exec();
  let updated = 0;

  for (const c of countries) {
    const { primaryTimezone, primaryUtcOffset } = await computeForCountry(c);
    if (primaryTimezone || primaryUtcOffset) {
      await Country.updateOne({ _id: c._id }, { $set: { primaryTimezone, primaryUtcOffset } });
      updated++;
    }
  }

  console.log(`Updated ${updated} / ${countries.length} countries`);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
