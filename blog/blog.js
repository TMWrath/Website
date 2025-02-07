// Fetch blog data from JSON
fetch('blog-index.json')
    .then(response => response.json())
    .then(postFiles => {
        // Fetch all individual blog posts
        postFiles.forEach(file => {
            fetch(`${file}`)
                .then(response => response.json())
                .then(post => {
                    const container = document.getElementById('blog-container');

                    // Create blog post element
                    const blogPost = document.createElement('article');
                    blogPost.classList.add('blog-post');

                    // Title
                    const title = document.createElement('h2');
                    title.textContent = post.title;
                    title.classList.add('blog-title');
                    blogPost.appendChild(title);

                    // Date
                    const date = document.createElement('p');
                    date.textContent = new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                    date.classList.add('blog-date');
                    blogPost.appendChild(date);

                    // Content
                    const content = document.createElement('div');
                    content.innerHTML = post.content || post.excerpt || 'No content available.';
                    content.classList.add('blog-content');
                    blogPost.appendChild(content);

                    // Append to container
                    container.appendChild(blogPost);
                })
                .catch(err => console.error(`Error loading blog post ${file}:`, err));
        });
    })
    .catch(err => console.error('Error loading blog index:', err));