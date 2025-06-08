import Guest from '../models/Guest.js';

export const trackGuest = async (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  
  try {
    let guest = await Guest.findOne({ ipAddress: ip });
    
    if (guest) {
      // Increment visit count but don't update lastVisit
      await Guest.findByIdAndUpdate(guest._id, { $inc: { visitCount: 1 } });
    } else {
      // Create new guest with initial visit
      guest = new Guest({ ipAddress: ip, visitCount: 1, lastVisit: new Date() });
      await guest.save();
    }
    
    req.guestId = guest._id;
  } catch (error) {
    console.error('Error tracking guest:', error);
  }
  
  next();
};