import os
import json

# Set the allowed model file extensions
MODEL_EXTENSIONS = ('.stl', '.obj', '.fbx')
# Set the allowed preview image extensions
IMAGE_EXTENSIONS = ('.jpg', '.jpeg', '.png', '.webp')
# Set the allowed print file extension
PRINT_FILE_EXTENSION = '.3mf'

def generate_models_json():
    models_data = []

    # Iterate through all directories in the current working directory
    for folder_name in next(os.walk('.'))[1]:
        folder_path = os.path.join('.', folder_name)
        files_in_folder = os.listdir(folder_path)

        # Filter model files (.stl, .obj, .fbx, etc.)
        model_files = [f for f in files_in_folder if f.endswith(tuple(MODEL_EXTENSIONS))]

        # Filter preview files
        preview_files = []
        previews_folder = os.path.join(folder_path, 'previews')

        # Check if the previews folder exists and gather all preview images
        if os.path.exists(previews_folder):
            preview_files = [os.path.join(folder_name, 'previews', f) for f in os.listdir(previews_folder)
                             if f.endswith(tuple(IMAGE_EXTENSIONS))]

        # Get .3mf files for the print file section
        print_files = [f for f in files_in_folder if f.endswith(PRINT_FILE_EXTENSION)]

        # Now process each model
        for model_file in model_files:
            model_data = {
                "file": os.path.join(folder_name, model_file),  # Full path to the model file
                "name": model_file.replace('_', ' ').replace('.stl', '').title(),
                "printTime": "N/A",  # Default as N/A
                "printFile": os.path.join(folder_name, print_files[0]) if print_files else "",
                "hardwareRequirements": "N/A",  # Can be modified later
                "3dPreview": os.path.join(folder_name, model_file),  # Full path to 3D preview model
                "recommendedFilament": "PLA"  # Default filament type
            }

            # If there are preview images, add them to the carouselImages field
            if preview_files:
                model_data["carouselImages"] = preview_files

            # Add this model's data to the final list
            models_data.append(model_data)

    # Write the data to a JSON file
    with open('models.json', 'w') as json_file:
        json.dump(models_data, json_file, indent=4)

if __name__ == "__main__":
    generate_models_json()
