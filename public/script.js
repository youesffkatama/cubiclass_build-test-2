// script.js
class ScholarAIApp {
  constructor() {
    this.state = {
      user: null,
      classes: [],
      pdfs: [],
      tasks: [],
      activities: [],
      chatSessions: [],
      currentChatId: null,
      activeClassId: null,
      settings: {
        theme: 'dark',
        aiModel: 'mistralai/mistral-7b-instruct:free',
        notifications: true,
        aiPersonality: 'friendly'
      }
    };
    
    this.currentView = 'dashboard';
    this.eventSource = null;
    
    this.init();
  }

  async init() {
    // Show loading screen
    document.getElementById('loadingScreen').style.display = 'flex';
    
    // Initialize modules
    this.initializeModules();
    
    // Load user data
    await this.loadUserData();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Navigate to dashboard
    this.navigateTo('dashboard');
    
    // Hide loading screen and show app
    setTimeout(() => {
      document.getElementById('loadingScreen').style.display = 'none';
      document.getElementById('app').style.display = 'flex';
    }, 1500);
  }

  initializeModules() {
    // Initialize custom cursor effect (desktop only)
    if (window.innerWidth > 768) {
      this.initializeCursorEffect();
    }
    
    // Initialize particle system
    this.initializeParticleSystem();
  }

  initializeCursorEffect() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      background: var(--primary);
      border: 2px solid var(--primary);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      mix-blend-mode: difference;
      transition: transform 0.1s ease;
      transform: translate(-50%, -50%);
    `;
    document.body.appendChild(cursor);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animate() {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';
      requestAnimationFrame(animate);
    }
    animate();
  }

  initializeParticleSystem() {
    // Create canvas for particles
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -1;
      opacity: 0.3;
    `;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const particles = [];
    
    // Set canvas size
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        // Wrap edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 237, 100, ${p.opacity})`;
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    }
    animate();
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.getAttribute('data-view');
        this.navigateTo(view);
      });
    });

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', () => {
      this.toggleTheme();
    });

    // File upload
    document.getElementById('uploadFileBtn').addEventListener('click', () => {
      document.getElementById('fileInput').click();
    });

    document.getElementById('fileInput').addEventListener('change', (e) => {
      this.handleFileUpload(e.target.files[0]);
    });

    // Drag and drop for file upload
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'var(--primary)';
      uploadArea.style.backgroundColor = 'rgba(0, 237, 100, 0.1)';
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.style.borderColor = 'var(--border)';
      uploadArea.style.backgroundColor = 'var(--bg-card)';
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'var(--border)';
      uploadArea.style.backgroundColor = 'var(--bg-card)';
      
      const file = e.dataTransfer.files[0];
      if (file && file.type === 'application/pdf') {
        this.handleFileUpload(file);
      } else {
        this.showToast('Please upload a PDF file', 'error');
      }
    });

    // Chat functionality
    document.getElementById('sendChatBtn').addEventListener('click', () => {
      this.sendChatMessage();
    });

    document.getElementById('chatInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendChatMessage();
      }
    });

    // Auto-resize textarea
    document.getElementById('chatInput').addEventListener('input', (e) => {
      e.target.style.height = 'auto';
      e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
    });

    // Class creation
    document.getElementById('createClassModalBtn').addEventListener('click', () => {
      this.showCreateClassModal();
    });

    // Task creation
    document.getElementById('createTaskBtn').addEventListener('click', () => {
      this.showCreateTaskModal();
    });

    // Flashcard generation
    document.getElementById('generateFlashcardsBtn').addEventListener('click', () => {
      this.generateFlashcards();
    });

    // Quick actions
    document.getElementById('uploadBtn').addEventListener('click', () => {
      document.getElementById('fileInput').click();
    });

    document.getElementById('createClassBtn').addEventListener('click', () => {
      this.showCreateClassModal();
    });

    document.getElementById('newChatBtn').addEventListener('click', () => {
      this.navigateTo('chat');
    });

    // Task filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filterTasks(btn.dataset.filter);
      });
    });

    // Back to classes button
    document.getElementById('backToClasses').addEventListener('click', () => {
      document.getElementById('classDetailView').style.display = 'none';
      document.getElementById('classesGrid').style.display = 'grid';
    });

    // Poll for user updates every 10 seconds
    setInterval(async () => {
      try {
        const response = await API.get('/auth/me');
        const newUser = response.data.user;
        
        if (this.state.user && this.state.user.dna.xp !== newUser.dna.xp) {
          const xpDiff = newUser.dna.xp - this.state.user.dna.xp;
          if (xpDiff > 0) {
            if (newUser.dna.level > this.state.user.dna.level) {
              this.showToast(`🎉 Level Up! You're now level ${newUser.dna.level}!`, 'success');
            } else {
              this.showToast(`+${xpDiff} XP earned`, 'success');
            }
          }
          this.state.user = newUser;
          this.updateUserUI();
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 10000);
  }

  async loadUserData() {
    try {
      const response = await API.get('/auth/me');
      this.state.user = response.data.user;
      this.updateUserUI();
      
      // Load additional data
      await Promise.all([
        this.loadClasses(),
        this.loadPDFs(),
        this.loadTasks(),
        this.loadDashboardData()
      ]);
    } catch (error) {
      console.error('Error loading user data:', error);
      // If unauthorized, redirect to login
      if (error.message.includes('401')) {
        window.location.href = '/login';
      }
    }
  }

  updateUserUI() {
    if (!this.state.user) return;
    
    const user = this.state.user;
    
    // Update user profile
    document.getElementById('userAvatar').src = user.profile.avatar;
    document.getElementById('userName').textContent = user.username;
    document.getElementById('userLevel').textContent = `Level ${user.dna.level}`;
    document.getElementById('userXP').textContent = `${user.dna.xp} XP`;
    document.getElementById('headerAvatar').src = user.profile.avatar;
    document.getElementById('welcomeName').textContent = user.profile.firstName || user.username;
    
    // Update dashboard stats
    document.getElementById('totalFiles').textContent = this.state.pdfs.length;
    document.getElementById('totalChats').textContent = this.state.chatSessions.length;
    document.getElementById('totalTasks').textContent = this.state.tasks.length;
    document.getElementById('streakDays').textContent = user.dna.streakDays;
  }

  navigateTo(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(v => {
      v.style.display = 'none';
      v.classList.remove('active');
    });
    
    // Show target view
    const view = document.getElementById(`view-${viewName}`);
    view.style.display = 'block';
    view.classList.add('active', 'animate__animated', 'animate__fadeIn');
    
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-view') === viewName) {
        link.classList.add('active');
      }
    });
    
    // Update page title
    document.getElementById('pageTitle').textContent = this.getTitleForView(viewName);
    
    // Load view-specific data
    this.loadViewData(viewName);
    
    this.currentView = viewName;
  }

  getTitleForView(viewName) {
    const titles = {
      'dashboard': 'Dashboard',
      'workspace': 'Workspace',
      'chat': 'AI Chat',
      'classes': 'Classes',
      'tasks': 'Tasks',
      'analytics': 'Analytics',
      'flashcards': 'Flashcards'
    };
    return titles[viewName] || 'Scholar.AI';
  }

  async loadViewData(viewName) {
    switch (viewName) {
      case 'workspace':
        this.renderFiles();
        break;
      case 'chat':
        this.loadConversations();
        break;
      case 'classes':
        this.renderClasses();
        break;
      case 'tasks':
        this.renderTasks();
        break;
      case 'analytics':
        this.loadAnalytics();
        break;
      case 'flashcards':
        this.populateFlashcardSources();
        break;
    }
  }

  async loadClasses() {
    try {
      const response = await API.get('/classes');
      this.state.classes = response.data.classes;
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  }

  async loadPDFs() {
    try {
      const response = await API.get('/workspace/files');
      this.state.pdfs = response.data.files;
    } catch (error) {
      console.error('Error loading PDFs:', error);
    }
  }

  async loadTasks() {
    try {
      const response = await API.get('/tasks');
      this.state.tasks = response.data.tasks;
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }

  async loadDashboardData() {
    try {
      const response = await API.get('/analytics/dashboard');
      const data = response.data.data;
      
      // Update dashboard stats
      document.getElementById('totalFiles').textContent = data.stats.totalFiles;
      document.getElementById('totalChats').textContent = data.stats.totalConversations;
      document.getElementById('totalTasks').textContent = data.stats.totalTasks;
      document.getElementById('streakDays').textContent = data.user.streakDays;
      
      // Render recent activity
      this.renderRecentActivity(data.recentActivity);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }

  renderRecentActivity(activities) {
    const container = document.getElementById('recentActivity');
    container.innerHTML = activities.slice(0, 5).map(activity => `
      <div class="activity-item">
        <div class="activity-icon" style="background: ${activity.color}20; color: ${activity.color}">
          <i class="fas ${activity.icon}"></i>
        </div>
        <div class="activity-content">
          <h4>${activity.title}</h4>
          <p>${new Date(activity.time).toLocaleDateString()}</p>
          ${activity.xpGained ? `<span class="text-muted">+${activity.xpGained} XP</span>` : ''}
        </div>
      </div>
    `).join('');
  }

  renderFiles() {
    const container = document.getElementById('filesGrid');
    if (this.state.pdfs.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-file-pdf"></i>
          <h3>No Documents Yet</h3>
          <p>Upload your first PDF to get started with AI-powered study tools</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.state.pdfs.map(file => `
      <div class="file-card">
        <div class="file-icon">
          <i class="fas fa-file-pdf"></i>
        </div>
        <div class="file-info">
          <h4>${file.meta.originalName}</h4>
          <div class="file-meta">
            <span>${this.formatFileSize(file.meta.size)}</span>
            <span>${file.meta.pageCount || 0} pages</span>
          </div>
          <div class="file-status status-${file.status.toLowerCase()}">
            ${file.status} ${file.meta.progress ? `(${file.meta.progress}%)` : ''}
          </div>
        </div>
        <div class="file-actions">
          <button class="btn-icon" onclick="app.openChatWithFile('${file._id}')">
            <i class="fas fa-comments"></i>
          </button>
          <button class="btn-icon" onclick="app.deleteFile('${file._id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async handleFileUpload(file) {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await API.post('/workspace/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      this.showToast('File uploaded successfully!', 'success');
      
      // Add to state and re-render
      this.state.pdfs.push(response.data.data);
      this.renderFiles();
      
      // Start polling for status
      this.pollFileStatus(response.data.data.id);
    } catch (error) {
      console.error('Upload error:', error);
      this.showToast('Upload failed: ' + error.message, 'error');
    }
  }

  async pollFileStatus(fileId) {
    const interval = setInterval(async () => {
      try {
        const response = await API.get(`/workspace/files/${fileId}/status`);
        const status = response.data.data;
        
        // Update the file in the state
        const fileIndex = this.state.pdfs.findIndex(f => f._id === fileId);
        if (fileIndex !== -1) {
          this.state.pdfs[fileIndex].status = status.status;
          this.state.pdfs[fileIndex].meta.progress = status.progress;
          this.state.pdfs[fileIndex].meta.statusMessage = status.statusMessage;
          
          // Re-render files
          this.renderFiles();
        }
        
        if (status.status === 'INDEXED' || status.status === 'FAILED') {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Status polling error:', error);
        clearInterval(interval);
      }
    }, 3000);
  }

  async loadConversations() {
    try {
      const response = await API.get('/intelligence/chat/conversations');
      this.state.chatSessions = response.data.conversations;
      
      const container = document.getElementById('conversationsList');
      container.innerHTML = this.state.chatSessions.map(conv => `
        <div class="conversation-item ${conv._id === this.state.currentChatId ? 'active' : ''}" 
             onclick="app.selectConversation('${conv._id}')">
          <div class="conversation-preview">
            <h4>${conv.title}</h4>
            <p>${conv.messages.length} messages</p>
          </div>
        </div>
      `).join('');
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }

  async selectConversation(conversationId) {
    this.state.currentChatId = conversationId;
    
    // Reload conversations to update active state
    this.loadConversations();
    
    // Load conversation messages
    this.loadConversationMessages(conversationId);
  }

  async loadConversationMessages(conversationId) {
    try {
      const conv = this.state.chatSessions.find(c => c._id === conversationId);
      if (!conv) return;

      const container = document.getElementById('chatMessages');
      container.innerHTML = `
        <div class="messages-container">
          ${conv.messages.map(msg => `
            <div class="message ${msg.role}">
              <div class="message-content">
                ${this.formatMessageContent(msg.content)}
              </div>
            </div>
          `).join('')}
        </div>
      `;
      
      // Scroll to bottom
      container.scrollTop = container.scrollHeight;
    } catch (error) {
      console.error('Error loading conversation messages:', error);
    }
  }

  formatMessageContent(content) {
    // Simple markdown formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  async sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;

    // Clear input and reset height
    input.value = '';
    input.style.height = 'auto';

    // Add user message to UI
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML += `
      <div class="message user">
        <div class="message-content">
          ${this.formatMessageContent(message)}
        </div>
      </div>
    `;
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Prepare request data
    const requestData = {
      query: message,
      nodeId: this.state.currentChatId ? this.state.currentChatId : null,
      conversationId: this.state.currentChatId || null
    };

    try {
      // Send message and stream response
      this.streamChatResponse(requestData);
    } catch (error) {
      console.error('Chat error:', error);
      this.showToast('Error sending message', 'error');
    }
  }

  async streamChatResponse(data) {
    const messagesContainer = document.getElementById('chatMessages');
    
    // Add loading indicator
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'message assistant';
    loadingMsg.innerHTML = `
      <div class="message-content">
        <div class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    messagesContainer.appendChild(loadingMsg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
      // Create SSE connection
      const response = await fetch(`${API_CONFIG.baseURL}/intelligence/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Utils.loadFromStorage('scholar_token')}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let fullResponse = '';

      // Remove loading indicator
      loadingMsg.remove();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data.trim() === '') continue;

            try {
              const parsed = JSON.parse(data);
              
              if (parsed.content) {
                assistantMessage += parsed.content;
                fullResponse += parsed.content;
                
                // Update the message in real-time
                if (messagesContainer.lastChild && messagesContainer.lastChild.querySelector('.assistant-response')) {
                  messagesContainer.lastChild.querySelector('.assistant-response').textContent = assistantMessage;
                } else {
                  // Create new message element
                  const msgElement = document.createElement('div');
                  msgElement.className = 'message assistant';
                  msgElement.innerHTML = `
                    <div class="message-content">
                      <div class="assistant-response">${assistantMessage}</div>
                    </div>
                  `;
                  messagesContainer.appendChild(msgElement);
                }
                
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
              }
              
              if (parsed.done) {
                // Update conversation in state
                if (parsed.conversationId) {
                  this.state.currentChatId = parsed.conversationId;
                  
                  // Reload conversations
                  this.loadConversations();
                }
                
                // Award XP for chat message
                await this.awardXP(2, 'Sent chat message');
                break;
              }
              
              if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Stream error:', error);
      messagesContainer.removeChild(messagesContainer.lastChild); // Remove loading indicator
      this.showToast('Error streaming response', 'error');
    }
  }

  async awardXP(amount, reason) {
    // This would typically be handled server-side, but we'll update the UI
    // The server handles XP updates, we just refresh the user data
    try {
      const response = await API.get('/auth/me');
      this.state.user = response.data.user;
      this.updateUserUI();
    } catch (error) {
      console.error('Error updating XP:', error);
    }
  }

  async openChatWithFile(fileId) {
    // Create new conversation with file context
    this.state.currentChatId = null;
    document.getElementById('chatMessages').innerHTML = `
      <div class="welcome-message">
        <h3>AI Study Assistant</h3>
        <p>Ask me anything about this document: ${this.state.pdfs.find(f => f._id === fileId)?.meta.originalName}</p>
      </div>
    `;
    
    // Navigate to chat view
    this.navigateTo('chat');
  }

  async deleteFile(fileId) {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await API.delete(`/workspace/files/${fileId}`);
      this.showToast('File deleted successfully', 'success');
      
      // Remove from state and re-render
      this.state.pdfs = this.state.pdfs.filter(f => f._id !== fileId);
      this.renderFiles();
    } catch (error) {
      console.error('Delete error:', error);
      this.showToast('Delete failed: ' + error.message, 'error');
    }
  }

  renderClasses() {
    const container = document.getElementById('classesGrid');
    container.innerHTML = this.state.classes.map(cls => `
      <div class="class-card ${cls.color}" onclick="app.viewClass('${cls._id}')">
        <h3>${cls.name}</h3>
        <p>${cls.description || 'No description'}</p>
        <div class="class-members">
          <i class="fas fa-users"></i>
          ${cls.members.length} members
        </div>
      </div>
    `).join('');
  }

  async viewClass(classId) {
    const cls = this.state.classes.find(c => c._id === classId);
    if (!cls) return;

    // Update class detail view
    document.getElementById('classNameDetail').textContent = cls.name;
    
    // Load class posts
    this.loadClassPosts(classId);
    
    // Show class detail view and hide classes grid
    document.getElementById('classesGrid').style.display = 'none';
    document.getElementById('classDetailView').style.display = 'block';
    
    this.state.activeClassId = classId;
  }

  async loadClassPosts(classId) {
    // For now, we'll simulate posts since the backend doesn't have a direct endpoint
    const container = document.getElementById('classStream');
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-comments"></i>
        <h3>No Posts Yet</h3>
        <p>This class doesn't have any posts yet. Be the first to share something!</p>
      </div>
    `;
  }

  showCreateClassModal() {
    const modal = document.getElementById('modalOverlay');
    const body = document.getElementById('modalBody');
    const footer = document.getElementById('modalFooter');
    
    body.innerHTML = `
      <div class="form-group">
        <label for="className">Class Name</label>
        <input type="text" id="className" class="form-control" placeholder="Enter class name">
      </div>
      <div class="form-group">
        <label for="classDescription">Description</label>
        <textarea id="classDescription" class="form-control" placeholder="Enter class description" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label for="classColor">Color Theme</label>
        <select id="classColor" class="form-control">
          <option value="green">Green</option>
          <option value="blue">Blue</option>
          <option value="purple">Purple</option>
          <option value="orange">Orange</option>
        </select>
      </div>
    `;
    
    footer.innerHTML = `
      <button class="btn-text" id="cancelModal">Cancel</button>
      <button class="btn-primary" id="createClassConfirm">Create Class</button>
    `;
    
    document.getElementById('createClassConfirm').addEventListener('click', async () => {
      const name = document.getElementById('className').value;
      const description = document.getElementById('classDescription').value;
      const color = document.getElementById('classColor').value;
      
      if (!name) {
        this.showToast('Class name is required', 'error');
        return;
      }
      
      try {
        const response = await API.post('/classes', { name, description, color });
        this.showToast('Class created successfully!', 'success');
        
        // Add to state and re-render
        this.state.classes.push(response.data.data);
        this.renderClasses();
        
        modal.style.display = 'none';
      } catch (error) {
        console.error('Create class error:', error);
        this.showToast('Create class failed: ' + error.message, 'error');
      }
    });
    
    document.getElementById('cancelModal').addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    modal.style.display = 'flex';
  }

  renderTasks() {
    const container = document.getElementById('tasksGrid');
    if (this.state.tasks.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-tasks"></i>
          <h3>No Tasks Yet</h3>
          <p>Create your first task to stay organized</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.state.tasks.map(task => `
      <div class="task-card ${task.status}">
        <div class="task-header">
          <h4 class="task-title">${task.title}</h4>
          <span class="task-status">${task.status}</span>
        </div>
        <p class="task-description">${task.description || 'No description'}</p>
        <div class="task-meta">
          <span>${task.classId?.name || 'No class'}</span>
          <span>${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
        </div>
        <div class="task-actions">
          <button class="btn-text" onclick="app.editTask('${task._id}')">Edit</button>
          <button class="btn-text" onclick="app.updateTaskStatus('${task._id}', '${task.status === 'completed' ? 'pending' : 'completed'}')">
            ${task.status === 'completed' ? 'Mark Pending' : 'Complete'}
          </button>
        </div>
      </div>
    `).join('');
  }

  filterTasks(status) {
    // For simplicity, we'll just re-render all tasks
    // In a real app, we'd filter the state
    this.renderTasks();
  }

  showCreateTaskModal() {
    const modal = document.getElementById('modalOverlay');
    const body = document.getElementById('modalBody');
    const footer = document.getElementById('modalFooter');
    
    body.innerHTML = `
      <div class="form-group">
        <label for="taskTitle">Task Title</label>
        <input type="text" id="taskTitle" class="form-control" placeholder="Enter task title">
      </div>
      <div class="form-group">
        <label for="taskDescription">Description</label>
        <textarea id="taskDescription" class="form-control" placeholder="Enter task description" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label for="taskClass">Class</label>
        <select id="taskClass" class="form-control">
          <option value="">Select a class</option>
          ${this.state.classes.map(cls => `<option value="${cls._id}">${cls.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label for="taskDueDate">Due Date</label>
        <input type="date" id="taskDueDate" class="form-control">
      </div>
      <div class="form-group">
        <label for="taskPriority">Priority</label>
        <select id="taskPriority" class="form-control">
          <option value="low">Low</option>
          <option value="medium" selected>Medium</option>
          <option value="high">High</option>
        </select>
      </div>
    `;
    
    footer.innerHTML = `
      <button class="btn-text" id="cancelModal">Cancel</button>
      <button class="btn-primary" id="createTaskConfirm">Create Task</button>
    `;
    
    document.getElementById('createTaskConfirm').addEventListener('click', async () => {
      const title = document.getElementById('taskTitle').value;
      const description = document.getElementById('taskDescription').value;
      const classId = document.getElementById('taskClass').value;
      const dueDate = document.getElementById('taskDueDate').value;
      const priority = document.getElementById('taskPriority').value;
      
      if (!title || !classId) {
        this.showToast('Title and class are required', 'error');
        return;
      }
      
      try {
        const response = await API.post('/tasks', { 
          classId, 
          title, 
          description, 
          dueDate, 
          priority 
        });
        this.showToast('Task created successfully!', 'success');
        
        // Add to state and re-render
        this.state.tasks.push(response.data.data);
        this.renderTasks();
        
        modal.style.display = 'none';
      } catch (error) {
        console.error('Create task error:', error);
        this.showToast('Create task failed: ' + error.message, 'error');
      }
    });
    
    document.getElementById('cancelModal').addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    modal.style.display = 'flex';
  }

  async updateTaskStatus(taskId, newStatus) {
    try {
      const response = await API.patch(`/tasks/${taskId}`, { status: newStatus });
      this.showToast('Task status updated!', 'success');
      
      // Update state
      const taskIndex = this.state.tasks.findIndex(t => t._id === taskId);
      if (taskIndex !== -1) {
        this.state.tasks[taskIndex] = response.data.data;
      }
      
      this.renderTasks();
    } catch (error) {
      console.error('Update task error:', error);
      this.showToast('Update task failed: ' + error.message, 'error');
    }
  }

  populateFlashcardSources() {
    const select = document.getElementById('flashcardSource');
    select.innerHTML = '<option value="">Select Document</option>';
    
    this.state.pdfs.forEach(pdf => {
      if (pdf.status === 'INDEXED') {
        select.innerHTML += `<option value="${pdf._id}">${pdf.meta.originalName}</option>`;
      }
    });
  }

  async generateFlashcards() {
    const sourceId = document.getElementById('flashcardSource').value;
    if (!sourceId) {
      this.showToast('Please select a document', 'error');
      return;
    }

    try {
      const response = await API.post('/intelligence/flashcards', { 
        nodeId: sourceId, 
        count: 10 
      });
      
      this.renderFlashcards(response.data.data.flashcards);
    } catch (error) {
      console.error('Generate flashcards error:', error);
      this.showToast('Generate flashcards failed: ' + error.message, 'error');
    }
  }

  renderFlashcards(flashcards) {
    if (flashcards.length === 0) {
      document.getElementById('flashcardsContainer').innerHTML = `
        <div class="empty-state">
          <i class="fas fa-layer-group"></i>
          <h3>No Flashcards Generated</h3>
          <p>Try selecting a different document or generating again</p>
        </div>
      `;
      return;
    }

    let currentIndex = 0;
    let isFlipped = false;

    const renderCard = () => {
      const card = flashcards[currentIndex];
      document.getElementById('flashcardsContainer').innerHTML = `
        <div class="flashcard">
          <div class="flashcard-inner ${isFlipped ? 'flipped' : ''}">
            <div class="flashcard-front">
              <p>${card.question}</p>
            </div>
            <div class="flashcard-back">
              <p>${card.answer}</p>
            </div>
          </div>
        </div>
        <div class="flashcard-navigation">
          <button class="btn-text" onclick="app.flipFlashcard()">
            <i class="fas fa-sync-alt"></i> Flip
          </button>
          <div class="flashcard-counter">
            ${currentIndex + 1} / ${flashcards.length}
          </div>
          <div class="flashcard-controls">
            <button class="btn-text" onclick="app.prevFlashcard()" ${currentIndex === 0 ? 'disabled' : ''}>
              <i class="fas fa-arrow-left"></i>
            </button>
            <button class="btn-text" onclick="app.nextFlashcard()" ${currentIndex === flashcards.length - 1 ? 'disabled' : ''}>
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      `;
    };

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (this.currentView !== 'flashcards') return;
      
      if (e.key === ' ') {
        this.flipFlashcard();
      } else if (e.key === 'ArrowLeft') {
        this.prevFlashcard();
      } else if (e.key === 'ArrowRight') {
        this.nextFlashcard();
      }
    });

    this.flipFlashcard = () => {
      isFlipped = !isFlipped;
      renderCard();
    };

    this.prevFlashcard = () => {
      if (currentIndex > 0) {
        currentIndex--;
        isFlipped = false;
        renderCard();
      }
    };

    this.nextFlashcard = () => {
      if (currentIndex < flashcards.length - 1) {
        currentIndex++;
        isFlipped = false;
        renderCard();
      } else {
        this.showToast('Congratulations! You completed all flashcards.', 'success');
      }
    };

    renderCard();
  }

  async loadAnalytics() {
    try {
      // Load performance data
      const perfResponse = await API.get('/analytics/performance');
      const perfData = perfResponse.data.data.performance;
      
      // Prepare chart data
      const dates = Object.keys(perfData).sort();
      const values = dates.map(date => perfData[date].total || 0);
      
      // Render performance chart
      const perfCtx = document.getElementById('performanceChart').getContext('2d');
      new Chart(perfCtx, {
        type: 'line',
        data: {
          labels: dates,
          datasets: [{
            label: 'Daily Activity',
            data: values,
            borderColor: '#00ed64',
            backgroundColor: 'rgba(0, 237, 100, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
      
      // Load subject distribution
      const subjResponse = await API.get('/analytics/subjects');
      const subjData = subjResponse.data.data.distribution;
      
      // Render subject chart
      const subjCtx = document.getElementById('subjectChart').getContext('2d');
      new Chart(subjCtx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(subjData),
          datasets: [{
            data: Object.values(subjData),
            backgroundColor: [
              '#00ed64',
              '#00bfff',
              '#bd00ff',
              '#ff9800'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    } catch (error) {
      console.error('Load analytics error:', error);
    }
  }

  toggleTheme() {
    // For now, just toggle between light/dark themes
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    this.state.settings.theme = newTheme;
    
    // Update button icon
    const themeBtn = document.getElementById('themeToggle');
    themeBtn.innerHTML = newTheme === 'light' ? 
      '<i class="fas fa-moon"></i>' : 
      '<i class="fas fa-sun"></i>';
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type} animate__animated animate__fadeInRight`;
    
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      info: 'fa-info-circle',
      warning: 'fa-exclamation-triangle'
    };
    
    toast.innerHTML = `
      <i class="fas ${icons[type]}"></i>
      <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('animate__fadeOutRight');
      setTimeout(() => toast.remove(), 500);
    }, 4000);
  }
}

// API Client
const API_CONFIG = {
  baseURL: '/api/v1'
};

const API = {
  async request(endpoint, options = {}) {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    const token = Utils.loadFromStorage('scholar_token');
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && {Authorization: `Bearer ${token}`}),
        ...options.headers
      }
    };
    
    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          Utils.saveToStorage('scholar_token', null);
          window.location.href = '/login';
        }
        throw new Error(data.error?.message || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  },
  
  get(endpoint) { 
    return this.request(endpoint, {method: 'GET'}); 
  },
  
  post(endpoint, body, options = {}) { 
    return this.request(endpoint, {method: 'POST', body: JSON.stringify(body), ...options}); 
  },
  
  patch(endpoint, body) { 
    return this.request(endpoint, {method: 'PATCH', body: JSON.stringify(body)}); 
  },
  
  delete(endpoint) { 
    return this.request(endpoint, {method: 'DELETE'}); 
  }
};

// Utility Functions
const Utils = {
  loadFromStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error loading from storage:', error);
      return null;
    }
  },
  
  saveToStorage(key, value) {
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  },
  
  formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString();
  },
  
  formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString();
  }
};

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new ScholarAIApp();
});