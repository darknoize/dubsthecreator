// Portfolio functionality
class Portfolio {
    constructor() {
        this.projects = JSON.parse(localStorage.getItem('portfolioProjects')) || [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderProjects();
        this.animateTimelineItems();
    }

    setupEventListeners() {
        // Logo upload
        const logoUpload = document.getElementById('logoUpload');
        const logoInput = document.getElementById('logoInput');
        const logoPreview = document.getElementById('logoPreview');

        logoUpload.addEventListener('click', () => logoInput.click());
        logoInput.addEventListener('change', (e) => this.handleLogoUpload(e));

        // Modal controls
        const addProjectBtn = document.getElementById('addProjectBtn');
        const modal = document.getElementById('projectModal');
        const closeModal = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelBtn');

        addProjectBtn.addEventListener('click', () => this.openModal());
        closeModal.addEventListener('click', () => this.closeModal());
        cancelBtn.addEventListener('click', () => this.closeModal());
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });

        // Project image upload
        const imageUpload = document.getElementById('imageUpload');
        const projectImageInput = document.getElementById('projectImageInput');
        
        imageUpload.addEventListener('click', () => projectImageInput.click());
        projectImageInput.addEventListener('change', (e) => this.handleImageUpload(e));

        // Form submission
        const projectForm = document.getElementById('projectForm');
        projectForm.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
    }

    handleLogoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const logoPreview = document.getElementById('logoPreview');
            const placeholder = document.querySelector('.logo-upload-area .upload-placeholder');
            
            logoPreview.src = e.target.result;
            logoPreview.style.display = 'block';
            placeholder.style.display = 'none';
            
            // Save logo to localStorage
            localStorage.setItem('portfolioLogo', e.target.result);
        };
        reader.readAsDataURL(file);
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Check image dimensions
        const img = new Image();
        img.onload = () => {
            const isValidSize = (img.width === 1920 && img.height === 1080) || 
                              (img.width === 1080 && img.height === 1080);
            
            if (!isValidSize) {
                alert('Please upload an image with dimensions 1920x1080 or 1080x1080');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const imagePreview = document.getElementById('imagePreview');
                const placeholder = document.querySelector('.image-upload-area .upload-placeholder');
                
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
                placeholder.style.display = 'none';
            };
            reader.readAsDataURL(file);
        };
        
        const reader = new FileReader();
        reader.onload = (e) => img.src = e.target.result;
        reader.readAsDataURL(file);
    }

    openModal() {
        const modal = document.getElementById('projectModal');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Focus on first input
        setTimeout(() => {
            document.getElementById('projectTitle').focus();
        }, 100);
    }

    closeModal() {
        const modal = document.getElementById('projectModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.resetForm();
    }

    resetForm() {
        const form = document.getElementById('projectForm');
        form.reset();
        
        const imagePreview = document.getElementById('imagePreview');
        const placeholder = document.querySelector('.image-upload-area .upload-placeholder');
        
        imagePreview.style.display = 'none';
        placeholder.style.display = 'block';
    }

    handleFormSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const imagePreview = document.getElementById('imagePreview');
        
        if (!imagePreview.src || imagePreview.style.display === 'none') {
            alert('Please upload a project image');
            return;
        }

        const project = {
            id: Date.now(),
            title: document.getElementById('projectTitle').value,
            description: document.getElementById('projectDescription').value,
            date: document.getElementById('projectDate').value,
            image: imagePreview.src,
            createdAt: new Date().toISOString()
        };

        this.projects.push(project);
        this.saveProjects();
        this.renderProjects();
        this.closeModal();
        
        // Show success message
        this.showMessage('Project added successfully!', 'success');
    }

    saveProjects() {
        localStorage.setItem('portfolioProjects', JSON.stringify(this.projects));
    }

    renderProjects() {
        const timeline = document.getElementById('timeline');
        
        if (this.projects.length === 0) {
            timeline.innerHTML = `
                <div class="empty-timeline">
                    <i class="fas fa-folder-open"></i>
                    <h3>No Projects Yet</h3>
                    <p>Start building your portfolio by adding your first project!</p>
                </div>
            `;
            return;
        }

        // Sort projects by date (newest first)
        const sortedProjects = [...this.projects].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        timeline.innerHTML = sortedProjects.map(project => `
            <div class="timeline-item" data-project-id="${project.id}">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <img src="${project.image}" alt="${project.title}" class="project-image">
                    <h3 class="project-title">${project.title}</h3>
                    <div class="project-date">${this.formatDate(project.date)}</div>
                    <p class="project-description">${project.description}</p>
                    <div class="project-actions">
                        <button class="delete-btn" onclick="portfolio.deleteProject(${project.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Re-animate timeline items
        setTimeout(() => this.animateTimelineItems(), 100);
    }

    deleteProject(projectId) {
        if (confirm('Are you sure you want to delete this project?')) {
            this.projects = this.projects.filter(p => p.id !== projectId);
            this.saveProjects();
            this.renderProjects();
            this.showMessage('Project deleted successfully!', 'success');
        }
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    animateTimelineItems() {
        const items = document.querySelectorAll('.timeline-item');
        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
        });
    }

    showMessage(message, type = 'info') {
        // Create and show a toast message
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Add toast styles if not already added
        if (!document.querySelector('#toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 25px;
                    background: #333;
                    color: white;
                    border-radius: 8px;
                    z-index: 2000;
                    animation: slideIn 0.3s ease;
                }
                .toast-success { background: #22c55e; }
                .toast-error { background: #ef4444; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Load saved logo on page load
    loadSavedLogo() {
        const savedLogo = localStorage.getItem('portfolioLogo');
        if (savedLogo) {
            const logoPreview = document.getElementById('logoPreview');
            const placeholder = document.querySelector('.logo-upload-area .upload-placeholder');
            
            logoPreview.src = savedLogo;
            logoPreview.style.display = 'block';
            placeholder.style.display = 'none';
        }
    }
}

// Initialize portfolio when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.portfolio = new Portfolio();
    portfolio.loadSavedLogo();
});

// Add delete button styles
const deleteButtonStyles = `
    .project-actions {
        margin-top: 15px;
        text-align: right;
    }
    
    .delete-btn {
        background: transparent;
        border: 1px solid #666;
        color: #888;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.3s ease;
    }
    
    .delete-btn:hover {
        border-color: #ef4444;
        color: #ef4444;
    }
`;

// Add the styles to the document
const styleSheet = document.createElement('style');
styleSheet.textContent = deleteButtonStyles;
document.head.appendChild(styleSheet);