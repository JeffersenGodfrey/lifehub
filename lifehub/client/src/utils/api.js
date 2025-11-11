const API_BASE_URL = 'https://lifehub-wjir.onrender.com/api'; // Updated URL

// Sync user profile after Firebase login
export const syncUserProfile = async (user) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.uid}`
      },
      body: JSON.stringify({
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'User'
      })
    });

    if (response.ok) {
      console.log('✅ User profile synced to database');
      return await response.json();
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to sync user profile:', response.status, errorText);
    }
  } catch (error) {
    console.error('❌ Error syncing user profile:', error);
  }
};