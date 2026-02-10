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
    this.isInitialized = false;

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

      // Add entrance animations to elements
      this.animateEntrance();
      
      // Initialize additional features after DOM is ready
      this.initializeAdditionalFeatures();
      
      this.isInitialized = true;
    }, 1500);
  }

  animateEntrance() {
    // Add staggered animations to dashboard elements
    const elements = document.querySelectorAll('.stat-card, .section-card, .action-btn');
    elements.forEach((el, index) => {
      el.style.animationDelay = `${index * 0.1}s`;
      el.classList.add('fade-in-up-delayed');
    });

    // Add floating animation to logo
    const logo = document.querySelector('.logo');
    if (logo) {
      logo.classList.add('floating-animation');
    }

    // Add pulse animation to main header
    const header = document.querySelector('#pageTitle');
    if (header) {
      header.classList.add('pulse-animation');
    }
  }

  initializeAdditionalFeatures() {
    // Initialize tooltips
    this.initializeTooltips();
    
    // Initialize performance monitoring
    this.initializePerformanceMonitoring();
    
    // Initialize accessibility features
    this.initializeAccessibilityFeatures();
    
    // Initialize keyboard shortcuts
    this.initializeKeyboardShortcuts();
    
    // Initialize dynamic theming
    this.initializeDynamicTheming();
    
    // Initialize enhanced animations
    this.initializeEnhancedAnimations();
  }

  initializeTooltips() {
    // Add tooltip functionality to elements with data-tooltip attribute
    document.querySelectorAll('[data-tooltip]').forEach(el => {
      el.addEventListener('mouseenter', (e) => {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = el.getAttribute('data-tooltip');
        tooltip.style.position = 'absolute';
        tooltip.style.left = e.pageX + 10 + 'px';
        tooltip.style.top = e.pageY - 30 + 'px';
        tooltip.classList.add('visible');
        document.body.appendChild(tooltip);

        el._tooltip = tooltip;
      });

      el.addEventListener('mouseleave', () => {
        if (el._tooltip) {
          el._tooltip.remove();
          el._tooltip = null;
        }
      });

      el.addEventListener('mousemove', (e) => {
        if (el._tooltip) {
          el._tooltip.style.left = e.pageX + 10 + 'px';
          el._tooltip.style.top = e.pageY - 30 + 'px';
        }
      });
    });
  }

  initializePerformanceMonitoring() {
    // Basic performance monitoring
    this.startTime = Date.now();
    
    // Log performance metrics
    window.addEventListener('load', () => {
      const loadTime = Date.now() - this.startTime;
      console.log(`Page loaded in ${loadTime}ms`);
    });
  }

  initializeAccessibilityFeatures() {
    // Add keyboard navigation support
    document.addEventListener('keydown', (e) => {
      // Skip to main content with Ctrl+Alt+C
      if (e.ctrlKey && e.altKey && e.key === 'c') {
        e.preventDefault();
        document.querySelector('.main-content').focus();
      }
      
      // Skip to navigation with Ctrl+Alt+N
      if (e.ctrlKey && e.altKey && e.key === 'n') {
        e.preventDefault();
        document.querySelector('.main-nav').focus();
      }
    });

    // Add focus indicators for better accessibility
    document.addEventListener('focusin', (e) => {
      if (e.target.matches('a, button, input, select, textarea, [tabindex]')) {
        e.target.classList.add('focus-glow');
      }
    });

    document.addEventListener('focusout', (e) => {
      e.target.classList.remove('focus-glow');
    });
  }

  initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Global shortcuts
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        // Focus search or command palette
        this.openCommandPalette();
      }
      
      // View navigation shortcuts
      if (e.altKey) {
        switch(e.key) {
          case '1':
            e.preventDefault();
            this.navigateTo('dashboard');
            break;
          case '2':
            e.preventDefault();
            this.navigateTo('workspace');
            break;
          case '3':
            e.preventDefault();
            this.navigateTo('chat');
            break;
          case '4':
            e.preventDefault();
            this.navigateTo('classes');
            break;
          case '5':
            e.preventDefault();
            this.navigateTo('tasks');
            break;
          case '6':
            e.preventDefault();
            this.navigateTo('analytics');
            break;
          case '7':
            e.preventDefault();
            this.navigateTo('flashcards');
            break;
        }
      }
    });
  }

  openCommandPalette() {
    // Create a command palette overlay
    const palette = document.createElement('div');
    palette.id = 'commandPalette';
    palette.className = 'modal-overlay';
    palette.style.display = 'flex';
    palette.style.zIndex = '9999';
    
    palette.innerHTML = `
      <div class="modal-card" style="width: 90%; max-width: 600px;">
        <div class="modal-header">
          <h3 class="gradient-text">Command Palette</h3>
          <button class="btn-close" id="closeCommandPalette">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <input type="text" id="commandInput" placeholder="Type a command..." 
                 style="width: 100%; padding: 1rem; margin-bottom: 1rem; background: var(--bg-input); border: 1px solid var(--border); border-radius: 8px; color: var(--text-main);">
          <div id="commandResults" style="max-height: 300px; overflow-y: auto;"></div>
        </div>
      </div>
    `;
    
    document.body.appendChild(palette);
    
    // Add command suggestions
    const commands = [
      { action: 'navigateTo', params: ['dashboard'], label: 'Go to Dashboard', shortcut: 'Alt+1' },
      { action: 'navigateTo', params: ['workspace'], label: 'Go to Workspace', shortcut: 'Alt+2' },
      { action: 'navigateTo', params: ['chat'], label: 'Go to Chat', shortcut: 'Alt+3' },
      { action: 'navigateTo', params: ['classes'], label: 'Go to Classes', shortcut: 'Alt+4' },
      { action: 'navigateTo', params: ['tasks'], label: 'Go to Tasks', shortcut: 'Alt+5' },
      { action: 'navigateTo', params: ['analytics'], label: 'Go to Analytics', shortcut: 'Alt+6' },
      { action: 'navigateTo', params: ['flashcards'], label: 'Go to Flashcards', shortcut: 'Alt+7' },
      { action: 'showCreateClassModal', params: [], label: 'Create New Class', shortcut: 'Ctrl+Shift+C' },
      { action: 'showCreateTaskModal', params: [], label: 'Create New Task', shortcut: 'Ctrl+Shift+T' },
      { action: 'toggleTheme', params: [], label: 'Toggle Theme', shortcut: 'Ctrl+Shift+T' }
    ];
    
    const commandInput = document.getElementById('commandInput');
    const commandResults = document.getElementById('commandResults');
    
    commandInput.focus();
    
    // Populate command results
    const filteredCommands = commands.filter(cmd => 
      cmd.label.toLowerCase().includes(commandInput.value.toLowerCase())
    );
    
    commandResults.innerHTML = filteredCommands.map(cmd => `
      <div class="command-item" style="padding: 0.75rem; border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.2s;" 
           onclick="window.app.executeCommand('${cmd.action}', ${JSON.stringify(cmd.params)})">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>${cmd.label}</span>
          <small style="color: var(--text-muted);">${cmd.shortcut}</small>
        </div>
      </div>
    `).join('');
    
    // Close palette when clicking close button or pressing Escape
    document.getElementById('closeCommandPalette').addEventListener('click', () => {
      palette.remove();
    });
    
    commandInput.addEventListener('keyup', (e) => {
      if (e.key === 'Escape') {
        palette.remove();
      } else {
        // Update command results based on input
        const filtered = commands.filter(cmd => 
          cmd.label.toLowerCase().includes(commandInput.value.toLowerCase())
        );
        
        commandResults.innerHTML = filtered.map(cmd => `
          <div class="command-item" style="padding: 0.75rem; border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.2s;" 
               onclick="window.app.executeCommand('${cmd.action}', ${JSON.stringify(cmd.params)})">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>${cmd.label}</span>
              <small style="color: var(--text-muted);">${cmd.shortcut}</small>
            </div>
          </div>
        `).join('');
      }
    });
  }

  executeCommand(action, params) {
    if (this[action] && typeof this[action] === 'function') {
      this[action](...params);
      // Close the command palette
      const palette = document.getElementById('commandPalette');
      if (palette) {
        palette.remove();
      }
    }
  }

  initializeDynamicTheming() {
    // Allow users to customize theme colors dynamically
    const savedTheme = localStorage.getItem('scholar_theme');
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme);
        this.applyCustomTheme(theme);
      } catch (e) {
        console.error('Error applying saved theme:', e);
      }
    }
  }

  applyCustomTheme(theme) {
    const root = document.documentElement;
    Object.entries(theme).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }

  initializeEnhancedAnimations() {
    // Add intersection observer for scroll-triggered animations
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            
            // Add different animation classes based on element type
            if (entry.target.classList.contains('stat-card')) {
              entry.target.classList.add('slide-in-up-animation');
            } else if (entry.target.classList.contains('section-card')) {
              entry.target.classList.add('slide-in-right-animation');
            } else if (entry.target.classList.contains('file-card')) {
              entry.target.classList.add('slide-in-left-animation');
            }
            
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1
      });
      
      // Observe elements that should animate when scrolled into view
      document.querySelectorAll('.stat-card, .section-card, .file-card, .class-card, .task-card').forEach(el => {
        observer.observe(el);
      });
    }
  }

  initializeModules() {
    // Initialize custom cursor effect (desktop only)
    if (window.innerWidth > 768) {
      this.initializeCursorEffect();
    }

    // Initialize particle system
    this.initializeParticleSystem();

    // Initialize floating background elements
    this.initializeFloatingElements();

    // Initialize ripple effects
    this.initializeRippleEffects();

    // Initialize parallax scrolling
    this.initializeParallaxScrolling();
    
    // Initialize enhanced UI effects
    this.initializeEnhancedUIEffects();
  }

  initializeEnhancedUIEffects() {
    // Add enhanced hover effects to all interactive elements
    this.addEnhancedHoverEffects();
    
    // Initialize enhanced form controls
    this.initializeEnhancedFormControls();
    
    // Initialize dynamic content loading
    this.initializeDynamicContentLoading();
    
    // Initialize enhanced modals
    this.initializeEnhancedModals();
  }

  addEnhancedHoverEffects() {
    // Add enhanced hover effects to buttons
    document.querySelectorAll('.btn-primary, .btn-text, .btn-icon, .nav-link, .action-btn, .stat-card, .file-card, .class-card, .task-card').forEach(el => {
      el.classList.add('magnetic-hover-scale');
      
      // Add ripple effect to buttons
      if (el.classList.contains('btn-primary') || el.classList.contains('btn-text')) {
        el.classList.add('ripple-effect');
      }
      
      // Add glow effect to cards
      if (el.classList.contains('stat-card') || el.classList.contains('file-card') || 
          el.classList.contains('class-card') || el.classList.contains('task-card')) {
        el.classList.add('hover-glow');
      }
    });
  }

  initializeEnhancedFormControls() {
    // Add enhanced styling to form inputs
    document.querySelectorAll('input, textarea, select').forEach(input => {
      input.classList.add('input-focus-effect');
      
      // Add character counter to textareas
      if (input.tagName === 'TEXTAREA') {
        this.addCharacterCounter(input);
      }
    });
  }

  addCharacterCounter(textarea) {
    const maxLength = textarea.getAttribute('maxlength');
    if (!maxLength) return;
    
    const counter = document.createElement('div');
    counter.className = 'char-counter';
    counter.style.cssText = `
      font-size: 0.75rem;
      color: var(--text-muted);
      text-align: right;
      margin-top: 0.25rem;
    `;
    
    const updateCounter = () => {
      const currentLength = textarea.value.length;
      counter.textContent = `${currentLength}/${maxLength}`;
      
      if (currentLength > maxLength * 0.9) {
        counter.style.color = 'var(--accent-orange)';
      } else if (currentLength > maxLength * 0.8) {
        counter.style.color = 'var(--text-muted)';
      }
    };
    
    updateCounter();
    textarea.parentNode.appendChild(counter);
    
    textarea.addEventListener('input', updateCounter);
  }

  initializeDynamicContentLoading() {
    // Add loading states to AJAX-like operations
    document.querySelectorAll('[data-load-content]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Show loading state
        const originalHTML = el.innerHTML;
        el.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        el.disabled = true;
        
        // Simulate loading and restore original state
        setTimeout(() => {
          el.innerHTML = originalHTML;
          el.disabled = false;
        }, 1500);
      });
    });
  }

  initializeEnhancedModals() {
    // Add enhanced modal functionality
    document.querySelectorAll('.modal-card').forEach(modal => {
      // Add drag functionality to modal headers
      const header = modal.querySelector('.modal-header');
      if (header) {
        this.makeModalDraggable(modal, header);
      }
    });
  }

  makeModalDraggable(modal, header) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    header.style.cursor = 'move';

    const dragStart = (e) => {
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;

      if (e.target === header) {
        isDragging = true;
      }
    };

    const dragEnd = () => {
      initialX = currentX;
      initialY = currentY;

      isDragging = false;
    };

    const drag = (e) => {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, modal);
      }
    };

    const setTranslate = (xPos, yPos, el) => {
      el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    };

    header.addEventListener('mousedown', dragStart);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('mousemove', drag);
  }

  initializeParallaxScrolling() {
    // Add parallax effect to background elements
    document.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.floating-element');

      parallaxElements.forEach((element, index) => {
        const speed = 0.5 + (index * 0.1);
        element.style.transform = `translateY(${scrolled * speed}px)`;
      });
    });
  }

  // Add enhanced error handling and reporting
  handleError(error, context = 'General') {
    console.error(`[${context}] Error:`, error);
    
    // Show user-friendly error message
    this.showToast(`An error occurred: ${error.message || error}`, 'error');
    
    // Log error for debugging purposes
    if (typeof gtag !== 'undefined') {
      gtag('event', 'exception', {
        description: `${context}: ${error.message || error}`,
        fatal: false
      });
    }
  }

  // Add enhanced data persistence
  saveStateToStorage() {
    try {
      const stateToSave = {
        user: this.state.user,
        settings: this.state.settings,
        lastView: this.currentView,
        lastActiveTime: Date.now()
      };
      
      localStorage.setItem('scholar_app_state', JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save state to storage:', e);
    }
  }

  loadStateFromStorage() {
    try {
      const savedState = localStorage.getItem('scholar_app_state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        // Restore user and settings if they exist
        if (parsedState.user) {
          this.state.user = parsedState.user;
        }
        
        if (parsedState.settings) {
          this.state.settings = {...this.state.settings, ...parsedState.settings};
        }
        
        // Optionally restore last view
        if (parsedState.lastView && this.isInitialized) {
          // Don't navigate immediately after loading, let the initial navigation happen first
          setTimeout(() => {
            this.navigateTo(parsedState.lastView);
          }, 1000);
        }
      }
    } catch (e) {
      console.error('Failed to load state from storage:', e);
    }
  }

  // Add enhanced user experience features
  showFeatureAnnouncement(featureName, description) {
    const announcement = document.createElement('div');
    announcement.className = 'announcement-banner';
    announcement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      background: linear-gradient(45deg, var(--primary), var(--accent-blue));
      color: white;
      padding: 1rem;
      text-align: center;
      z-index: 10000;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      animation: slideInDown 0.3s ease-out;
    `;
    
    announcement.innerHTML = `
      <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong>New Feature:</strong> ${featureName} - ${description}
        </div>
        <button class="btn-close" style="color: white;" onclick="this.parentElement.parentElement.remove();">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    
    document.body.appendChild(announcement);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.remove();
      }
    }, 10000);
  }

  // Add enhanced notification system
  showNotification(title, message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification toast ${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--bg-panel);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1rem 1.5rem;
      min-width: 300px;
      box-shadow: var(--shadow);
      z-index: 10000;
      animation: slideInRight 0.3s ease, pulse 2s infinite;
      display: flex;
      align-items: center;
      gap: 1rem;
    `;
    
    const icons = {
      success: '<i class="fas fa-check-circle" style="color: var(--primary);"></i>',
      error: '<i class="fas fa-exclamation-circle" style="color: #ff4757;"></i>',
      info: '<i class="fas fa-info-circle" style="color: var(--accent-blue);"></i>',
      warning: '<i class="fas fa-exclamation-triangle" style="color: var(--accent-orange);"></i>'
    };
    
    notification.innerHTML = `
      ${icons[type]}
      <div>
        <strong>${title}</strong>
        <p style="margin: 0.25rem 0 0 0; font-size: 0.9rem;">${message}</p>
      </div>
      <button class="btn-close" onclick="this.parentElement.remove();" style="align-self: flex-start;">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after specified duration
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, duration);
  }

  initializeRippleEffects() {
    // Add ripple effect to buttons
    document.querySelectorAll('.btn-primary, .action-btn, .nav-link').forEach(button => {
      button.classList.add('ripple-effect');

      button.addEventListener('click', function(e) {
        // Create ripple element
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');

        // Position ripple at click location
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        // Add ripple to button
        this.appendChild(ripple);

        // Remove ripple after animation
        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });
  }

  // Override the original showToast method with enhanced version
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type} slide-in-right-animation`;

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

    // Add to beginning of container for stacking effect
    if (container.firstChild) {
      container.insertBefore(toast, container.firstChild);
    } else {
      container.appendChild(toast);
    }

    // Add entrance animation
    setTimeout(() => {
      toast.classList.add('bounce-in-animation');
    }, 10);

    // Auto remove after delay
    setTimeout(() => {
      toast.classList.remove('bounce-in-animation');
      toast.classList.add('slide-out-right-animation');
      setTimeout(() => toast.remove(), 500);
    }, 4000);
  }

  // Add method to update UI with new features
  updateUIWithNewFeatures() {
    // Add new UI elements and functionality
    this.addEnhancedDashboardWidgets();
    this.addQuickActionButtons();
    this.addEnhancedSearchFunctionality();
  }

  addEnhancedDashboardWidgets() {
    // Add additional widgets to the dashboard if they don't already exist
    const dashboardGrid = document.getElementById('view-dashboard');
    if (!dashboardGrid.querySelector('.productivity-widget')) {
      const productivityWidget = document.createElement('div');
      productivityWidget.className = 'section-card productivity-widget';
      productivityWidget.innerHTML = `
        <div class="section-header">
          <h3 class="gradient-text">Productivity Insights</h3>
          <button class="btn-text">View Report</button>
        </div>
        <div class="stats-grid" style="grid-template-columns: 1fr; margin-top: 1rem;">
          <div class="stat-card hover-lift" style="text-align: center; padding: 1.5rem;">
            <div class="stat-icon bg-purple" style="justify-content: center; margin: 0 auto 1rem;">
              <i class="fas fa-chart-line" style="font-size: 1.5rem;"></i>
            </div>
            <div class="stat-info">
              <h3 class="pulse-glow">87%</h3>
              <p>Focus Score</p>
            </div>
          </div>
        </div>
      `;
      
      // Insert after the stats grid
      const statsGrid = dashboardGrid.querySelector('.stats-grid');
      if (statsGrid) {
        statsGrid.parentNode.insertBefore(productivityWidget, statsGrid.nextSibling);
      }
    }
  }

  addQuickActionButtons() {
    // Add quick action buttons to the header
    const headerRight = document.querySelector('.header-right');
    if (!headerRight.querySelector('.quick-actions-menu')) {
      const quickActionsBtn = document.createElement('button');
      quickActionsBtn.className = 'btn-icon quick-actions-menu';
      quickActionsBtn.innerHTML = '<i class="fas fa-bolt"></i>';
      quickActionsBtn.title = 'Quick Actions';
      
      quickActionsBtn.addEventListener('click', (e) => {
        this.showQuickActionsMenu(e);
      });
      
      headerRight.insertBefore(quickActionsBtn, headerRight.firstChild);
    }
  }

  showQuickActionsMenu(event) {
    // Remove any existing menus
    document.querySelectorAll('.quick-actions-dropdown').forEach(menu => menu.remove());
    
    const menu = document.createElement('div');
    menu.className = 'quick-actions-dropdown dropdown-menu';
    menu.style.cssText = `
      position: absolute;
      top: ${event.clientY + 10}px;
      right: ${window.innerWidth - event.clientX}px;
      width: 250px;
    `;
    
    menu.innerHTML = `
      <div class="dropdown-header" style="padding: 1rem; border-bottom: 1px solid var(--border); font-weight: 600;">
        Quick Actions
      </div>
      <div class="dropdown-items" style="padding: 0.5rem 0;">
        <div class="dropdown-item" style="padding: 0.75rem 1rem; cursor: pointer; transition: background 0.2s;" 
             onclick="window.app.navigateTo('workspace'); window.app.closeQuickActionsMenu();">
          <i class="fas fa-file-upload" style="margin-right: 0.75rem; color: var(--primary);"></i>
          Upload Document
        </div>
        <div class="dropdown-item" style="padding: 0.75rem 1rem; cursor: pointer; transition: background 0.2s;" 
             onclick="window.app.navigateTo('chat'); window.app.closeQuickActionsMenu();">
          <i class="fas fa-comments" style="margin-right: 0.75rem; color: var(--accent-blue);"></i>
          Start Chat
        </div>
        <div class="dropdown-item" style="padding: 0.75rem 1rem; cursor: pointer; transition: background 0.2s;" 
             onclick="window.app.showCreateTaskModal(); window.app.closeQuickActionsMenu();">
          <i class="fas fa-tasks" style="margin-right: 0.75rem; color: var(--accent-purple);"></i>
          Create Task
        </div>
        <div class="dropdown-item" style="padding: 0.75rem 1rem; cursor: pointer; transition: background 0.2s;" 
             onclick="window.app.showCreateClassModal(); window.app.closeQuickActionsMenu();">
          <i class="fas fa-school" style="margin-right: 0.75rem; color: var(--accent-orange);"></i>
          Create Class
        </div>
      </div>
    `;
    
    document.body.appendChild(menu);
    
    // Close menu when clicking elsewhere
    const closeMenu = (e) => {
      if (!menu.contains(e.target)) {
        this.closeQuickActionsMenu();
        document.removeEventListener('click', closeMenu);
      }
    };
    
    setTimeout(() => {
      document.addEventListener('click', closeMenu);
    }, 10);
  }

  closeQuickActionsMenu() {
    document.querySelectorAll('.quick-actions-dropdown').forEach(menu => menu.remove());
  }

  addEnhancedSearchFunctionality() {
    // Add a global search bar to the header if it doesn't exist
    const header = document.querySelector('.header');
    if (!header.querySelector('.global-search')) {
      const searchContainer = document.createElement('div');
      searchContainer.className = 'global-search';
      searchContainer.style.cssText = `
        position: relative;
        margin-right: 1rem;
      `;
      
      searchContainer.innerHTML = `
        <input type="text" 
               placeholder="Search everything..." 
               class="search-input"
               style="background: var(--bg-input); border: 1px solid var(--border); 
                      border-radius: 20px; padding: 0.5rem 1rem 0.5rem 2.5rem; 
                      color: var(--text-main); width: 200px; transition: width 0.3s;">
        <i class="fas fa-search" style="position: absolute; left: 1rem; top: 50%; 
                                       transform: translateY(-50%); color: var(--text-muted);"></i>
      `;
      
      const searchInput = searchContainer.querySelector('.search-input');
      
      // Expand search on focus
      searchInput.addEventListener('focus', () => {
        searchInput.style.width = '250px';
      });
      
      searchInput.addEventListener('blur', () => {
        if (searchInput.value === '') {
          searchInput.style.width = '200px';
        }
      });
      
      // Add search functionality
      searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          this.performGlobalSearch(searchInput.value);
        }
      });
      
      header.insertBefore(searchContainer, header.querySelector('.header-right'));
    }
  }

  performGlobalSearch(query) {
    if (!query.trim()) return;
    
    // Show search results in a modal
    const modal = document.getElementById('modalOverlay');
    const body = document.getElementById('modalBody');
    const footer = document.getElementById('modalFooter');
    
    body.innerHTML = `
      <div class="search-results-container">
        <h3 class="gradient-text">Search Results for "${query}"</h3>
        <div class="search-results" id="searchResultsList">
          <div class="empty-state">
            <i class="fas fa-search"></i>
            <h3>No Results Found</h3>
            <p>Try different keywords or check your spelling</p>
          </div>
        </div>
      </div>
    `;
    
    footer.innerHTML = `
      <button class="btn-text" id="closeSearchModal">Close</button>
    `;
    
    document.getElementById('closeSearchModal').addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    modal.style.display = 'flex';
    
    // Simulate search results loading
    setTimeout(() => {
      document.getElementById('searchResultsList').innerHTML = `
        <div class="search-result-item">
          <i class="fas fa-file-pdf"></i>
          <div>
            <h4>Research Paper on AI Ethics</h4>
            <p>Uploaded to Workspace • 2 days ago</p>
          </div>
        </div>
        <div class="search-result-item">
          <i class="fas fa-comments"></i>
          <div>
            <h4>Chat about Machine Learning</h4>
            <p>Conversation with AI • 1 week ago</p>
          </div>
        </div>
        <div class="search-result-item">
          <i class="fas fa-tasks"></i>
          <div>
            <h4>Complete Assignment</h4>
            <p>Task in CS Class • Due tomorrow</p>
          </div>
        </div>
      `;
    }, 1000);
  }

  initializeFloatingElements() {
    // Create floating background elements
    const container = document.querySelector('.background-elements');
    if (!container) return;

    // Clear existing elements to prevent duplicates
    container.innerHTML = '';

    for (let i = 0; i < 15; i++) {
      const element = document.createElement('div');
      element.classList.add('floating-element');
      element.classList.add(`element-${i+1}`);
      element.style.cssText = `
        position: fixed;
        width: ${Math.random() * 100 + 50}px;
        height: ${Math.random() * 100 + 50}px;
        background: radial-gradient(circle, rgba(0, 237, 100, 0.1), transparent);
        border-radius: 50%;
        top: ${Math.random() * 100}vh;
        left: ${Math.random() * 100}vw;
        z-index: -1;
        opacity: 0.3;
        animation: float ${Math.random() * 20 + 10}s infinite ease-in-out;
        animation-delay: ${Math.random() * 5}s;
      `;
      container.appendChild(element);
    }
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
      animation: cursorPulse 2s infinite;
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
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        life: Math.random() * 100
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.1;

        // Wrap edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Reset particle if life is over
        if (p.life <= 0) {
          p.x = Math.random() * canvas.width;
          p.y = Math.random() * canvas.height;
          p.life = Math.random() * 100;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
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
      uploadArea.classList.add('glow-element');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.style.borderColor = 'var(--border)';
      uploadArea.style.backgroundColor = 'var(--bg-card)';
      uploadArea.classList.remove('glow-element');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'var(--border)';
      uploadArea.style.backgroundColor = 'var(--bg-card)';
      uploadArea.classList.remove('glow-element');

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

    // Add hover effects to all interactive elements
    this.addHoverEffects();

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

  addHoverEffects() {
    // Add hover effects to cards
    document.querySelectorAll('.stat-card, .file-card, .class-card, .task-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.classList.add('hover-glow');
        card.style.transform = 'translateY(-5px)';
      });

      card.addEventListener('mouseleave', () => {
        card.classList.remove('hover-glow');
        card.style.transform = 'translateY(0)';
      });
    });

    // Add hover effects to buttons
    document.querySelectorAll('.btn-primary, .btn-text, .btn-icon').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        btn.classList.add('hover-glow');
      });

      btn.addEventListener('mouseleave', () => {
        btn.classList.remove('hover-glow');
      });
    });

    // Add hover effects to navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('mouseenter', () => {
        link.classList.add('hover-glow');
      });

      link.addEventListener('mouseleave', () => {
        link.classList.remove('hover-glow');
      });
    });
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
    // Hide all views with animation
    document.querySelectorAll('.view').forEach(v => {
      v.classList.remove('active');
      v.classList.add('slide-out-left-animation');
      setTimeout(() => {
        v.style.display = 'none';
      }, 300);
    });

    // Show target view with animation
    const view = document.getElementById(`view-${viewName}`);
    view.style.display = 'block';
    view.classList.add('active', 'slide-in-right-animation');

    // Update nav links with animation
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-view') === viewName) {
        link.classList.add('active');
        link.classList.add('tada-animation');
        setTimeout(() => {
          link.classList.remove('tada-animation');
        }, 1000);
      }
    });

    // Update page title with animation
    const pageTitle = document.getElementById('pageTitle');
    pageTitle.classList.add('rubber-band-animation');
    setTimeout(() => {
      pageTitle.textContent = this.getTitleForView(viewName);
      pageTitle.classList.remove('rubber-band-animation');
    }, 100);

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
    container.innerHTML = activities.slice(0, 5).map((activity, index) => `
      <div class="activity-item hover-lift" style="animation-delay: ${index * 0.1}s;">
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

    // Add entrance animations to activity items
    const activityItems = document.querySelectorAll('.activity-item');
    activityItems.forEach((item, index) => {
      item.classList.add('slide-in-left-delayed');
      item.style.animationDelay = `${index * 0.1}s`;
    });
  }

  renderFiles() {
    const container = document.getElementById('filesGrid');
    if (this.state.pdfs.length === 0) {
      container.innerHTML = `
        <div class="empty-state bounce-animation">
          <i class="fas fa-file-pdf"></i>
          <h3>No Documents Yet</h3>
          <p>Upload your first PDF to get started with AI-powered study tools</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.state.pdfs.map((file, index) => `
      <div class="file-card hover-lift" style="animation-delay: ${index * 0.1}s;">
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

    // Add entrance animations to file cards
    const fileCards = document.querySelectorAll('.file-card');
    fileCards.forEach((card, index) => {
      card.classList.add('slide-in-up-delayed');
      card.style.animationDelay = `${index * 0.1}s`;
    });
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
    container.innerHTML = this.state.classes.map((cls, index) => `
      <div class="class-card ${cls.color} hover-lift" style="animation-delay: ${index * 0.1}s;" onclick="app.viewClass('${cls._id}')">
        <h3>${cls.name}</h3>
        <p>${cls.description || 'No description'}</p>
        <div class="class-members">
          <i class="fas fa-users"></i>
          ${cls.members.length} members
        </div>
      </div>
    `).join('');

    // Add entrance animations to class cards
    const classCards = document.querySelectorAll('.class-card');
    classCards.forEach((card, index) => {
      card.classList.add('slide-in-right-delayed');
      card.style.animationDelay = `${index * 0.1}s`;
    });
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
        <div class="empty-state bounce-animation">
          <i class="fas fa-tasks"></i>
          <h3>No Tasks Yet</h3>
          <p>Create your first task to stay organized</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.state.tasks.map((task, index) => `
      <div class="task-card ${task.status} hover-lift" style="animation-delay: ${index * 0.1}s;">
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

    // Add entrance animations to task cards
    const taskCards = document.querySelectorAll('.task-card');
    taskCards.forEach((card, index) => {
      card.classList.add('slide-in-left-delayed');
      card.style.animationDelay = `${index * 0.1}s`;
    });
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
  },

  // Add method to handle app updates
  checkForUpdates() {
    // In a real app, this would check for updates from a server
    // For now, we'll simulate checking for updates
    setTimeout(() => {
      // Example: Show a notification if there are updates
      this.showNotification(
        'Update Available', 
        'A new version of Scholar.AI is available with enhanced features and improvements.',
        'info',
        10000
      );
    }, 5000);
  },

  // Add method to handle app state synchronization
  syncAppState() {
    // Sync app state across tabs/windows
    window.addEventListener('storage', (e) => {
      if (e.key === 'scholar_app_state') {
        try {
          const newState = JSON.parse(e.newValue);
          if (newState && newState.user) {
            this.state.user = newState.user;
            this.updateUserUI();
          }
        } catch (error) {
          console.error('Error syncing app state:', error);
        }
      }
    });
  },

  // Add method to handle offline functionality
  setupOfflineFunctionality() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.showToast('Connection restored!', 'success');
      // Resync data when coming back online
      this.loadUserData();
    });

    window.addEventListener('offline', () => {
      this.showToast('You are offline. Some features may be limited.', 'warning');
    });
  }
};

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new ScholarAIApp();
  
  // Add additional enhancements after app initialization
  setTimeout(() => {
    if (window.app) {
      window.app.updateUIWithNewFeatures();
      window.app.checkForUpdates();
      window.app.syncAppState();
      window.app.setupOfflineFunctionality();
    }
  }, 2000);
});