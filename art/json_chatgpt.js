import os
import json

# Define the image extensions to look for
IMAGE_EXTENSIONS = (".jpg", ".jpeg", ".png", ".webp")

def generate_json(directory):
    data = []
    
    # Loop through each folder in the directory
    for folder in sorted(os.listdir(directory)):
        folder_path = os.path.join(directory, folder)

        if os.path.isdir(folder_path):  # Ensure it's a folder
            images = [f for f in sorted(os.listdir(folder_path)) if f.lower().endswith(IMAGE_EXTENSIONS)]
            
            if images:
                preview_file = None
                main_file = None

                # Find preview and main file
                for image in images:
                    image_path = os.path.join(folder, image)  # Relative path
                    if "_preview" in image and not preview_file:
                        preview_file = image_path
                    elif not main_file:
                        main_file = image_path

                # If no preview file was found, use main_file for both fields
                if not preview_file:
                    preview_file = main_file

                # Add to JSON structure
                if main_file:
                    data.append({
                        "name": folder,
                        "preview": preview_file,
                        "file": main_file
                    })

    # Output JSON file
    output_path = os.path.join(directory, "art.json")
    with open(output_path, "w", encoding="utf-8") as json_file:
        json.dump(data, json_file, indent=4)

    print(f"JSON file saved as {output_path}")

# Run the function in the current directory
generate_json(os.getcwd())
