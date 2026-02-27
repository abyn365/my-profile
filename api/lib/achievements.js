const ACHIEVEMENTS_KEY = 'achievements';
const ADMIN_KEY = 'admin';

let kv = null;
let cachedAchievements = null;
let cachedAdmin = null;

function getKV() {
  if (kv) return kv;
  
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      kv = require('@vercel/kv').kv;
      return kv;
    }
  } catch (error) {
    console.log('KV not available, using in-memory storage');
  }
  
  return null;
}

function getInitialAchievements() {
  if (cachedAchievements) {
    return cachedAchievements;
  }
  
  try {
    const fs = require('fs');
    const path = require('path');
    const dataPath = path.join(process.cwd(), 'data', 'achievements.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    cachedAchievements = JSON.parse(rawData);
    return cachedAchievements;
  } catch (error) {
    console.error('Error loading initial achievements:', error);
    return {};
  }
}

export async function getAchievements() {
  const kvClient = getKV();
  
  try {
    if (kvClient) {
      const achievements = await kvClient.get(ACHIEVEMENTS_KEY);
      if (achievements) {
        return achievements;
      }
    }
  } catch (error) {
    console.error('KV read error:', error);
  }
  
  if (cachedAchievements) {
    return cachedAchievements;
  }
  
  const initialData = getInitialAchievements();
  cachedAchievements = initialData;
  
  if (kvClient) {
    try {
      await kvClient.set(ACHIEVEMENTS_KEY, initialData);
    } catch (error) {
      console.error('KV write error:', error);
    }
  }
  
  return initialData;
}

export async function setAchievements(achievements) {
  cachedAchievements = achievements;
  
  const kvClient = getKV();
  if (kvClient) {
    try {
      await kvClient.set(ACHIEVEMENTS_KEY, achievements);
    } catch (error) {
      console.error('KV write error:', error);
    }
  }
  
  return true;
}

export async function addAchievement(year, achievement) {
  const achievements = await getAchievements();
  
  if (!achievements[year]) {
    achievements[year] = [];
  }
  
  achievements[year].push(achievement);
  await setAchievements(achievements);
  
  return achievements;
}

export async function updateAchievement(year, index, newAchievement) {
  const achievements = await getAchievements();
  
  if (!achievements[year] || achievements[year][index] === undefined) {
    return null;
  }
  
  achievements[year][index] = newAchievement;
  await setAchievements(achievements);
  
  return achievements;
}

export async function deleteAchievement(year, index) {
  const achievements = await getAchievements();
  
  if (!achievements[year] || achievements[year][index] === undefined) {
    return null;
  }
  
  achievements[year].splice(index, 1);
  
  if (achievements[year].length === 0) {
    delete achievements[year];
  }
  
  await setAchievements(achievements);
  
  return achievements;
}

export async function getAdmin() {
  const kvClient = getKV();
  
  if (kvClient) {
    try {
      return await kvClient.get(ADMIN_KEY);
    } catch (error) {
      console.error('KV read error:', error);
    }
  }
  
  return cachedAdmin;
}

export async function setAdmin(hashedPassword) {
  const adminData = {
    hashedPassword,
    createdAt: new Date().toISOString()
  };
  
  cachedAdmin = adminData;
  
  const kvClient = getKV();
  if (kvClient) {
    try {
      await kvClient.set(ADMIN_KEY, adminData);
      return true;
    } catch (error) {
      console.error('KV write error:', error);
    }
  }
  
  return true;
}

export async function isAdminSetup() {
  const admin = await getAdmin();
  return !!admin && !!admin.hashedPassword;
}
