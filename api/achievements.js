import { getAchievements } from '../lib/achievements.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const achievements = await getAchievements();
    
    response.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
    response.setHeader('Access-Control-Allow-Origin', '*');
    
    return response.status(200).json({ 
      success: true, 
      data: achievements 
    });

  } catch (error) {
    console.error('Get achievements error:', error);
    return response.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to fetch achievements' 
    });
  }
}
