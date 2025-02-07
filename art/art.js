    function loadHTML(url, elementId) {
        fetch(url)
            .then(response => response.text())
            .then(data => {
                document.getElementById(elementId).innerHTML = data;
                updatePageTitle();  // Update the <h1> after header is loaded
            })
            .catch(err => console.log('Error loading HTML:', err));
    }

    // Function to fetch and create a temporary Blob URL for downloading
    function downloadFile(filePath, fileName) {
        fetch(filePath)
            .then(response => response.blob()) // Convert response to a blob
            .then(blob => {
                const url = URL.createObjectURL(blob); // Create temporary URL
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName; // Set the file name for download
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url); // Clean up after download
            })
            .catch(err => console.error('Error downloading file:', err));
    }

    // Fetch art data from JSON located in the 'art' folder
    fetch('/art/art.json')
        .then(response => response.json())
        .then(artworks => {
            const container = document.getElementById('art-container');
            artworks.forEach(artwork => {
                const artDiv = document.createElement('div');
                artDiv.classList.add('art-item');

                // Only display preview image (without 3D preview)
                if (artwork.preview) {
                    const img = document.createElement('img');
                    img.src = `/art/${artwork.preview}`;
                    img.alt = `Preview of ${artwork.name}`;
                    img.classList.add('art-preview');
                    artDiv.appendChild(img);
                }

                const title = document.createElement('p');
                title.textContent = artwork.name;
                title.classList.add('art-title');
                artDiv.appendChild(title);

                // Create a button instead of a direct link
                const downloadButton = document.createElement('button');
                downloadButton.textContent = 'Download Art';
                downloadButton.classList.add('download-button');
                downloadButton.onclick = () => downloadFile(`/art/${artwork.file}`, artwork.file);
                artDiv.appendChild(downloadButton);

                container.appendChild(artDiv);
            });
        })
        .catch(err => console.error('Error loading art list:', err));