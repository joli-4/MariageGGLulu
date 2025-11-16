/* 
 * This script fetches and displays all images
 * from the 'wedding-photos' bucket.
 */

// 1. Initialize Supabase Client (same as before)
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Get the gallery container from gallery-dev.html
const galleryContainer = document.getElementById('gallery-container');

// 3. Define the main function to load images
async function loadImages() {
  try {
    // 4. List all files in the 'public' folder [50, 51]
    const { data: fileList, error: listError } = await supabase
     .storage
     .from('wedding-photos')
     .list('public', {
        limit: 200, // Max 200 photos
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' } // Newest first
      });

    if (listError) throw listError;

    if (!fileList |

| fileList.length === 0) {
      galleryContainer.innerHTML = '<p>Pas de photos pour le moment. Soyez le premier!</p>';
      return;
    }

    // 5. Clear the 'Loading...' message
    galleryContainer.innerHTML = '';

    // 6. Loop through the file list
    for (const file of fileList) {
      // 7. Get the public URL for each file
      // This is possible because we made the bucket 'public'
      const { data: publicUrlData } = supabase
       .storage
       .from('wedding-photos')
       .getPublicUrl(`public/${file.name}`); // Get URL for the specific file
        
      if (publicUrlData.publicUrl) {
        // 8. Create an <img> element and add it to the gallery
        const img = document.createElement('img');
        img.src = publicUrlData.publicUrl;
        img.alt = 'Photo de mariage';
        galleryContainer.appendChild(img);
      }
    }
    
  } catch (error) {
    console.error('Error loading images:', error.message);
    galleryContainer.innerHTML = `<p>Error loading images: ${error.message}</p>`;
  }
}

// 9. Run the function when the page loads
loadImages();
