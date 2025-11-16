/* 
 * This script handles the photo upload logic.
 * It silently logs in as a 'guest' user,
 * uploads the file to Supabase Storage,
 * and then logs out.
 */

// 1. Initialize Supabase Client
// Get these values from your Supabase project's
// "Project Settings" -> "API"
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Define our shared guest credentials
// These are the credentials you created in the Supabase Auth dashboard
const GUEST_EMAIL = 'guest@yourwedding.com';
const GUEST_PASSWORD = 'June2026Photos!'; // The password you created

// 3. Get DOM elements from upload.html
const photoInput = document.getElementById('photo-input');
const uploadButton = document.getElementById('upload-button');
const uploadStatus = document.getElementById('upload-status');

// 4. Add click event listener to the upload button
uploadButton.addEventListener('click', async () => {
  const file = photoInput.files;
  
  if (!file) {
    uploadStatus.textContent = 'Veuillez sélectionner un fichier.';
    return;
  }
  
  // Disable button to prevent multiple uploads
  uploadButton.disabled = true;
  uploadStatus.textContent = 'Uploading...';
  
  try {
    // 5. Authenticate as the 'guest' user
    // This is required to get 'authenticated' rights for the RLS policy
    let { error: authError } = await supabase.auth.signInWithPassword({
      email: GUEST_EMAIL,
      password: GUEST_PASSWORD,
    });
    
    if (authError) throw authError; // Throw error if login fails

    // 6. Create a unique, randomized file path
    // We add 'public/' to put it in a folder
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    // 7. Upload the file to Supabase Storage [48, 49]
    let { data, error: uploadError } = await supabase
     .storage
     .from('wedding-photos') // The bucket name
     .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false // Do not overwrite existing files
      });

    if (uploadError) throw uploadError; // Throw error if upload fails

    // 8. Success!
    uploadStatus.textContent = 'Succès! Merci pour votre photo!';
    photoInput.value = ''; // Clear the file input

  } catch (error) {
    console.error('Upload Error:', error.message);
    uploadStatus.textContent = `Erreur: ${error.message}`;
    
  } finally {
    // 9. ALWAYS log out the guest user
    await supabase.auth.signOut();
    uploadButton.disabled = false; // Re-enable the button
  }
});
