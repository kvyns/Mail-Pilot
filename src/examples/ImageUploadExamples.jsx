/**
 * Example: How to Upload and Display Profile Pictures
 * Using CloudFront CDN for fast image delivery
 */

import { uploadAPI } from '../api';

// Example 1: Upload Profile Picture Component
const ProfilePictureUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState('');

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      // Upload file and get CloudFront CDN URL
      const result = await uploadAPI.uploadFile(file, 'profile');
      
      // Use the CDN URL for fast access
      const cdnUrl = result.data.cdnUrl;
      // Example: https://d2nw8bxx6o9c62.cloudfront.net/profile-1738564820123-avatar.jpg
      
      setProfilePicUrl(cdnUrl);
      
      // Save to backend (user profile)
      await updateUserProfile({ profilePicture: cdnUrl });
      
      alert('Profile picture updated!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileSelect}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {profilePicUrl && (
        <img 
          src={profilePicUrl} 
          alt="Profile" 
          style={{ width: 150, height: 150, borderRadius: '50%' }}
        />
      )}
    </div>
  );
};

// Example 2: Display User Profile Picture
const UserAvatar = ({ imageId }) => {
  // Construct CloudFront URL from image ID
  const cdnUrl = uploadAPI.getCdnUrl(imageId);
  // Returns: https://d2nw8bxx6o9c62.cloudfront.net/${imageId}
  
  return (
    <img 
      src={cdnUrl} 
      alt="User Avatar"
      onError={(e) => {
        // Fallback to default avatar
        e.target.src = '/default-avatar.png';
      }}
    />
  );
};

// Example 3: Business Logo Upload
const BusinessLogoUpload = async (logoFile) => {
  try {
    const result = await uploadAPI.uploadFile(logoFile, 'business-logo');
    
    // Get CDN URL for the logo
    const logoCdnUrl = result.data.cdnUrl;
    
    // Save to business settings
    await updateBusinessSettings({
      logo: logoCdnUrl,
      logoImageId: result.data.imageId
    });
    
    return logoCdnUrl;
  } catch (error) {
    throw new Error('Logo upload failed: ' + error.message);
  }
};

// Example 4: Display Multiple User Avatars (e.g., in a list)
const UserList = ({ users }) => {
  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          <img 
            src={`https://d2nw8bxx6o9c62.cloudfront.net/${user.profileImageId}`}
            alt={user.name}
            width="40"
            height="40"
          />
          <span>{user.name}</span>
        </div>
      ))}
    </div>
  );
};

// Example 5: Advanced - Manual Upload Flow with Progress
const AdvancedUpload = async (file, onProgress) => {
  try {
    // Step 1: Get pre-signed upload URL
    const uploadData = await uploadAPI.getUploadUrl({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      uploadType: 'profile'
    });
    
    const { uploadUrl, cdnUrl, imageId } = uploadData.data;
    
    // Step 2: Upload to S3 with progress tracking
    await axios.put(uploadUrl, file, {
      headers: { 'Content-Type': file.type },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    });
    
    // Step 3: Image is now accessible via CloudFront
    console.log('Image accessible at:', cdnUrl);
    console.log('Image ID:', imageId);
    
    return { cdnUrl, imageId };
  } catch (error) {
    throw error;
  }
};

// Example 6: Helper function to construct CDN URL
const getImageUrl = (imageId) => {
  if (!imageId) return '/default-avatar.png';
  
  // If already a full URL, return as is
  if (imageId.startsWith('http')) return imageId;
  
  // Construct CloudFront CDN URL
  return `https://d2nw8bxx6o9c62.cloudfront.net/${imageId}`;
};

// Usage in component
const MyComponent = () => {
  const user = { profileImageId: 'profile-123456.jpg' };
  
  return (
    <img src={getImageUrl(user.profileImageId)} alt="Profile" />
  );
};

/**
 * Important Notes:
 * 
 * 1. CloudFront CDN provides:
 *    - Fast global content delivery
 *    - Automatic caching
 *    - HTTPS by default
 *    - High availability
 * 
 * 2. Always store imageId in your database, not the full URL
 *    - Flexibility to change CDN provider
 *    - Smaller database storage
 *    - Easy to migrate
 * 
 * 3. Image formats supported:
 *    - JPEG (.jpg, .jpeg)
 *    - PNG (.png)
 *    - GIF (.gif)
 *    - WebP (.webp)
 * 
 * 4. Recommended image sizes:
 *    - Profile pictures: 200x200px to 500x500px
 *    - Business logos: 300x300px to 800x800px
 *    - Max file size: 5MB
 * 
 * 5. Error handling:
 *    - Always provide fallback images
 *    - Handle network errors gracefully
 *    - Validate file types and sizes before upload
 */
