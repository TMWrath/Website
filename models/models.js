function loadHTML(url, elementId) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
            updatePageTitle();
        })
        .catch(err => console.log('Error loading HTML:', err));
}

// Fetch models from JSON
fetch('models.json')
    .then(response => response.json())
    .then(models => {
        const container = document.getElementById('models-container');
        models.forEach(model => {
            const modelDiv = document.createElement('div');
            modelDiv.classList.add('model-item');

            const canvasContainer = document.createElement('div');
            canvasContainer.classList.add('canvas-container');
            modelDiv.appendChild(canvasContainer);

            // Initialize Three.js for 3D Preview
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
            camera.position.set(0, -100, 0);
            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(300, 300);
            renderer.setClearColor(0xdcdcdc, 1);
            canvasContainer.appendChild(renderer.domElement);

            // Orbit controls
            const controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;

            // Lighting
            const ambientLight = new THREE.AmbientLight(0x404040, 1);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
            directionalLight.position.set(5, 5, 5);
            scene.add(directionalLight);

            const loader = new THREE.STLLoader();
            loader.load(
                `${model['3dPreview']}`,
                geometry => {
                    const material = new THREE.MeshStandardMaterial({
                        color: 0xD3D3D3,
                        metalness: 0.2,
                        roughness: 0.5
                    });
                    const mesh = new THREE.Mesh(geometry, material);
                    mesh.rotation.x = Math.PI / 2;
                    mesh.scale.set(1, 1, 1);
                    scene.add(mesh);

                    const box = new THREE.Box3().setFromObject(mesh);
                    const size = box.getSize(new THREE.Vector3());
                    const center = box.getCenter(new THREE.Vector3());
                    camera.position.set(center.x, center.y + size.y, center.z + size.z * 2);
                    camera.lookAt(center);
                    controls.update();

                    animate();
                },
                undefined,
                error => {
                    console.error('Error loading STL model:', error);
                }
            );

            function animate() {
                requestAnimationFrame(animate);
                ambientLight.position.copy(camera.position);
                directionalLight.position.copy(camera.position);
                controls.update();
                renderer.render(scene, camera);
            }

            // Create carousel of images
            if (model.carouselImages && model.carouselImages.length > 0) {
                const carouselContainer = document.createElement('div');
                carouselContainer.classList.add('carousel-container');
                model.carouselImages.forEach(image => {
                    const img = document.createElement('img');
                    img.src = `/models/${image}`;
                    img.alt = `Preview of ${model.name}`;
                    img.classList.add('carousel-image');
                    img.addEventListener('click', () => {
                        replacePreviewWithImage(img.src);
                    });
                    carouselContainer.appendChild(img);
                });
                modelDiv.appendChild(carouselContainer);
            }

            // Create "Return to 3D Preview" button
            const returnButton = document.createElement('button');
            returnButton.textContent = 'Back to 3D Preview';
            returnButton.classList.add('return-button');
            returnButton.style.display = 'none';
            returnButton.addEventListener('click', () => {
                replacePreviewWith3D();
            });
            modelDiv.appendChild(returnButton);

            const title = document.createElement('p');
            title.textContent = model.name;
            title.classList.add('model-title');
            modelDiv.appendChild(title);

            const downloadButton = document.createElement('button');
            downloadButton.textContent = 'Download Model';
            downloadButton.classList.add('download-button');
            downloadButton.addEventListener('click', () => downloadModel(model.file));
            modelDiv.appendChild(downloadButton);

            if (model.printFile) {
                const printButton = document.createElement('button');
                printButton.textContent = 'Download Print File';
                printButton.classList.add('download-button');
                printButton.addEventListener('click', () => downloadModel(model.printFile));
                modelDiv.appendChild(printButton);
            }

            if (model.printTime) {
                const printTime = document.createElement('p');
                printTime.textContent = `Estimated print time: ${model.printTime}`;
                printTime.classList.add('model-print-time');
                modelDiv.appendChild(printTime);
            }

            if (model.hardwareRequirements) {
                const hardwareRequirements = document.createElement('p');
                hardwareRequirements.textContent = `Hardware Requirements: ${model.hardwareRequirements}`;
                hardwareRequirements.classList.add('model-hardware-requirements');
                modelDiv.appendChild(hardwareRequirements);
            }

            if (model.recommendedFilament) {
                const recommendedFilament = document.createElement('p');
                recommendedFilament.textContent = `Recommended Filament: ${model.recommendedFilament}`;
                recommendedFilament.classList.add('model-recommended-filament');
                modelDiv.appendChild(recommendedFilament);
            }

            container.appendChild(modelDiv);

            // Function to replace the preview with a clicked image
            function replacePreviewWithImage(src) {
                // Create image preview element
                const imagePreview = document.createElement('img');
                imagePreview.src = src;
                imagePreview.alt = 'Image Preview';
                imagePreview.classList.add('image-preview');

                // If there's already an image preview, remove it
                const existingImagePreview = canvasContainer.querySelector('.image-preview');
                if (existingImagePreview) {
                    existingImagePreview.remove();
                }

                // Place the image preview at the top
                canvasContainer.prepend(imagePreview);

                // Hide the 3D preview
                const rendererCanvas = canvasContainer.querySelector('canvas');
                if (rendererCanvas) {
                    rendererCanvas.style.display = 'none';
                }

                // Show the return button
                returnButton.style.display = 'inline-block';
            }

            // Function to replace the preview with 3D preview
            function replacePreviewWith3D() {
                // Show the 3D preview again
                const rendererCanvas = canvasContainer.querySelector('canvas');
                if (rendererCanvas) {
                    rendererCanvas.style.display = 'block';
                }

                // Remove the image preview if it exists
                const imagePreview = canvasContainer.querySelector('.image-preview');
                if (imagePreview) {
                    imagePreview.remove();
                }

                // Hide the return button
                returnButton.style.display = 'none';
            }

            // Download model using Blob URL
            function downloadModel(filePath) {
                fetch(`${filePath}`)
                    .then(response => response.blob())
                    .then(blob => {
                        const tempUrl = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = tempUrl;
                        a.download = filePath.split('/').pop();
                        a.click();

                        setTimeout(() => {
                            URL.revokeObjectURL(tempUrl);
                        }, 10000); // Revoke the URL after 10 seconds
                    })
                    .catch(err => console.error('Error downloading model:', err));
            }
        });
    })
    .catch(err => console.error('Error loading models list:', err));