const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://lifehub-backend-1.onrender.com/api';

// Sync user profile after Firebase login
export const syncUserProfile = async (user) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.uid}` // Use Firebase UID as token
      },
      body: JSON.stringify({
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0]
      })
    });

    if (response.ok) {
      console.log('✅ User profile synced to database');
      return await response.json();
    } else {
      console.error('❌ Failed to sync user profile:', response.status);
    }
  } catch (error) {
    console.error('❌ Error syncing user profile:', error);
  }
};