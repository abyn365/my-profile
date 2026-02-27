import { withAuth } from '../lib/auth.js';
import { 
  getAchievements, 
  addAchievement, 
  updateAchievement, 
  deleteAchievement,
  setAchievements
} from '../lib/achievements.js';

async function handleGet(request, response) {
  try {
    const achievements = await getAchievements();
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

async function handlePost(request, response) {
  try {
    const { year, achievement } = request.body;

    if (!year || !achievement) {
      return response.status(400).json({ 
        error: 'Bad request', 
        message: 'Year and achievement are required' 
      });
    }

    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
      return response.status(400).json({ 
        error: 'Bad request', 
        message: 'Year must be a valid year between 1900 and 2100' 
      });
    }

    if (typeof achievement !== 'string' || achievement.trim().length === 0) {
      return response.status(400).json({ 
        error: 'Bad request', 
        message: 'Achievement must be a non-empty string' 
      });
    }

    const achievements = await addAchievement(yearNum.toString(), achievement.trim());
    
    return response.status(201).json({ 
      success: true, 
      message: 'Achievement added successfully',
      data: achievements 
    });

  } catch (error) {
    console.error('Add achievement error:', error);
    return response.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to add achievement' 
    });
  }
}

async function handlePut(request, response) {
  try {
    const { year, index, achievement } = request.body;

    if (!year || index === undefined || !achievement) {
      return response.status(400).json({ 
        error: 'Bad request', 
        message: 'Year, index, and achievement are required' 
      });
    }

    const indexNum = parseInt(index);
    if (isNaN(indexNum) || indexNum < 0) {
      return response.status(400).json({ 
        error: 'Bad request', 
        message: 'Index must be a non-negative number' 
      });
    }

    if (typeof achievement !== 'string' || achievement.trim().length === 0) {
      return response.status(400).json({ 
        error: 'Bad request', 
        message: 'Achievement must be a non-empty string' 
      });
    }

    const achievements = await updateAchievement(year, indexNum, achievement.trim());
    
    if (!achievements) {
      return response.status(404).json({ 
        error: 'Not found', 
        message: 'Achievement not found' 
      });
    }

    return response.status(200).json({ 
      success: true, 
      message: 'Achievement updated successfully',
      data: achievements 
    });

  } catch (error) {
    console.error('Update achievement error:', error);
    return response.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to update achievement' 
    });
  }
}

async function handleDelete(request, response) {
  try {
    const { year, index } = request.body;

    if (!year || index === undefined) {
      return response.status(400).json({ 
        error: 'Bad request', 
        message: 'Year and index are required' 
      });
    }

    const indexNum = parseInt(index);
    if (isNaN(indexNum) || indexNum < 0) {
      return response.status(400).json({ 
        error: 'Bad request', 
        message: 'Index must be a non-negative number' 
      });
    }

    const achievements = await deleteAchievement(year, indexNum);
    
    if (!achievements) {
      return response.status(404).json({ 
        error: 'Not found', 
        message: 'Achievement not found' 
      });
    }

    return response.status(200).json({ 
      success: true, 
      message: 'Achievement deleted successfully',
      data: achievements 
    });

  } catch (error) {
    console.error('Delete achievement error:', error);
    return response.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to delete achievement' 
    });
  }
}

async function handleBatchUpdate(request, response) {
  try {
    const { achievements } = request.body;

    if (!achievements || typeof achievements !== 'object') {
      return response.status(400).json({ 
        error: 'Bad request', 
        message: 'Achievements object is required' 
      });
    }

    for (const [year, items] of Object.entries(achievements)) {
      if (!/^\d{4}$/.test(year)) {
        return response.status(400).json({ 
          error: 'Bad request', 
          message: `Invalid year format: ${year}` 
        });
      }
      if (!Array.isArray(items)) {
        return response.status(400).json({ 
          error: 'Bad request', 
          message: `Achievements for year ${year} must be an array` 
        });
      }
    }

    await setAchievements(achievements);
    
    return response.status(200).json({ 
      success: true, 
      message: 'Achievements updated successfully',
      data: achievements 
    });

  } catch (error) {
    console.error('Batch update error:', error);
    return response.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to update achievements' 
    });
  }
}

async function handler(request, response) {
  switch (request.method) {
    case 'GET':
      return handleGet(request, response);
    case 'POST':
      return handlePost(request, response);
    case 'PUT':
      return handlePut(request, response);
    case 'DELETE':
      return handleDelete(request, response);
    case 'PATCH':
      return handleBatchUpdate(request, response);
    default:
      return response.status(405).json({ error: 'Method not allowed' });
  }
}

export default withAuth(handler);
