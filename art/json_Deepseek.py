import os
import json

# Set the allowed image extensions
IMAGE_EXTENSIONS = ('.jpg', '.jpeg', '.png', ".webp")

def generate_artwork_json():
    artwork_data = []

    # Iterate through all directories in the current working directory
    for folder_name in next(os.walk('.'))[1]:
        folder_path = os.path.join('.', folder_name)
        files_in_folder = os.listdir(folder_path)
        
        # Filter image files
        image_files = [f for f in files_in_folder 
                      if os.path.splitext(f)[1].lower() in IMAGE_EXTENSIONS]

        main_files = []
        preview_files = []

        # Separate main files and preview files
        for file in image_files:
            if '_preview' in file:
                preview_files.append(file)
            else:
                main_files.append(file)

        # Process each main file
        for main_file in main_files:
            base_name, ext = os.path.splitext(main_file)
            preview_file = f"{base_name}_preview{ext}"
            
            # Find matching preview or use main file as preview
            preview = next((p for p in preview_files if p == preview_file), main_file)
            
            artwork_entry = {
                "name": folder_name,
                "preview": os.path.join(folder_name, preview),
                "file": os.path.join(folder_name, main_file)
            }
            artwork_data.append(artwork_entry)

    # Sort alphabetically by name
    artwork_data.sort(key=lambda x: x['name'])
    
    # Write to JSON file
    with open('art.json', 'w') as f:
        json.dump(artwork_data, f, indent=4)

if __name__ == "__main__":
    generate_artwork_json()
