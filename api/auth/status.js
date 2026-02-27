import { isAdminSetup } from '../lib/achievements.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const setupComplete = await isAdminSetup();
    
    return response.status(200).json({ 
      success: true, 
      setupRequired: !setupComplete,
      message: setupComplete 
        ? 'Admin account is configured' 
        : 'Please setup admin account at /api/auth/setup'
    });

  } catch (error) {
    console.error('Status check error:', error);
    return response.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to check status' 
    });
  }
}
