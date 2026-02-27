import { comparePassword, generateToken } from '../lib/auth.js';
import { getAdmin, isAdminSetup } from '../lib/achievements.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const setupComplete = await isAdminSetup();
    if (!setupComplete) {
      return response.status(400).json({ 
        error: 'Not setup', 
        message: 'Admin account not created. Please run setup first at /api/auth/setup' 
      });
    }

    const { password } = request.body;

    if (!password) {
      return response.status(400).json({ 
        error: 'Bad request', 
        message: 'Password is required' 
      });
    }

    const admin = await getAdmin();
    
    if (!admin || !admin.hashedPassword) {
      return response.status(500).json({ 
        error: 'Configuration error', 
        message: 'Admin account data is corrupted' 
      });
    }

    const isValid = comparePassword(password, admin.hashedPassword);

    if (!isValid) {
      return response.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid password' 
      });
    }

    const token = generateToken({ 
      role: 'admin',
      iat: Math.floor(Date.now() / 1000)
    });

    return response.status(200).json({ 
      success: true, 
      message: 'Login successful',
      token,
      expiresIn: '2h'
    });

  } catch (error) {
    console.error('Login error:', error);
    return response.status(500).json({ 
      error: 'Internal server error', 
      message: 'An unexpected error occurred' 
    });
  }
}
