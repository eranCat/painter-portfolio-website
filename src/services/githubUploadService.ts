/**
 * GitHub Upload Service
 * Handles uploading image files directly to GitHub repository using the GitHub API
 */

interface GitHubUploadResponse {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

const GITHUB_API_URL = 'https://api.github.com';

/**
 * Upload an image file to GitHub
 * @param file - The image file to upload
 * @param githubToken - GitHub personal access token
 * @param owner - Repository owner username
 * @param repo - Repository name
 * @param branch - Branch name (default: main)
 * @returns Object with success status and the GitHub raw URL of the uploaded image
 */
export const uploadImageToGithub = async (
  file: File,
  githubToken: string,
  owner: string,
  repo: string,
  branch: string = 'main'
): Promise<GitHubUploadResponse> => {
  try {
    // Validate inputs
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    if (!githubToken) {
      return { success: false, error: 'GitHub token is required' };
    }

    if (!owner || !repo) {
      return { success: false, error: 'Owner and repo are required' };
    }

    // Read file and convert to base64
    const fileContent = await fileToBase64(file);
    const base64Content = fileContent.split(',')[1]; // Remove data URL prefix

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const filePath = `images/${filename}`;

    // Create commit message
    const commitMessage = `Upload painting image: ${file.name}`;

    // Upload to GitHub
    const uploadUrl = `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${filePath}`;

    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: commitMessage,
        content: base64Content,
        branch: branch,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      let errorMessage = `GitHub API error: ${response.status}`;

      if (errorData.message) {
        errorMessage = errorData.message;
      }

      if (response.status === 401) {
        errorMessage = 'Invalid GitHub token. Please check your credentials.';
      } else if (response.status === 404) {
        errorMessage = 'Repository not found. Check owner and repo names.';
      }

      return { success: false, error: errorMessage };
    }

    // Return the GitHub raw content URL
    const rawUrl = `${owner}/${repo}/${branch}/${filePath}`;

    return {
      success: true,
      url: `https://raw.githubusercontent.com/${rawUrl}`,
      path: rawUrl,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Unknown error during upload',
    };
  }
};

/**
 * Convert File to Base64 string
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

/**
 * Validate GitHub credentials by checking API access
 */
export const validateGithubCredentials = async (
  githubToken: string,
  owner: string,
  repo: string
): Promise<{ valid: boolean; error?: string }> => {
  try {
    const response = await fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { valid: false, error: 'Invalid GitHub token' };
      } else if (response.status === 404) {
        return { valid: false, error: 'Repository not found' };
      }
      return { valid: false, error: `API error: ${response.status}` };
    }

    return { valid: true };
  } catch (error: any) {
    return {
      valid: false,
      error: error?.message || 'Failed to validate credentials',
    };
  }
};
