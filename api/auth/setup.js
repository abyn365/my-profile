import { hashPassword, validatePasswordStrength } from '../lib/auth.js';
import { setAdmin, isAdminSetup } from '../lib/achievements.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const alreadySetup = await isAdminSetup();
    if (alreadySetup) {
      return response.status(400).json({ 
        error: 'Already setup', 
        message: 'Admin account already exists. If you need to reset, clear the KV store.' 
      });
    }

    const { password } = request.body;

    if (!password) {
      return response.status(400).json({ 
        error: 'Bad request', 
        message: 'Password is required' 
      });
    }

    const validation = validatePasswordStrength(password);
    if (!validation.isValid) {
      return response.status(400).json({ 
        error: 'Weak password', 
        message: 'Password does not meet security requirements',
        requirements: validation.errors
      });
    }

    const hashedPassword = hashPassword(password);
    const success = await setAdmin(hashedPassword);

    if (!success) {
      return response.status(500).json({ 
        error: 'Setup failed', 
        message: 'Failed to create admin account. Make sure Vercel KV is configured.' 
      });
    }

    return response.status(201).json({ 
      success: true, 
      message: 'Admin account created successfully. You can now login.' 
    });

  } catch (error) {
    console.error('Setup error:', error);
    return response.status(500).json({ 
      error: 'Internal server error', 
      message: 'An unexpected error occurred' 
    });
  }
}
