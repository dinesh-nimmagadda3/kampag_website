/**
 * Kampag IT Services - Main JavaScript
 * Contains all event listeners and functionality for the website
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all components
  initMobileMenu();
  initActiveNavigation();
  initSmoothScroll();
  initBackToTop();
  initCarousel();
  initFormValidation();
  initAnimations();
});

/**
 * Mobile Menu Functionality
 */
function initMobileMenu() {
  const mobileMenuToggle = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    mobileMenuToggle.setAttribute('aria-label', 'Toggle navigation menu');
    
    mobileMenuToggle.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent document click from immediately closing the menu
      navLinks.classList.toggle('active');
      document.body.classList.toggle('menu-open');
      
      // Toggle hamburger to X animation
      this.classList.toggle('active');
      
      // Accessibility
      const expanded = this.getAttribute('aria-expanded') === 'true' || false;
      this.setAttribute('aria-expanded', !expanded);
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!event.target.closest('nav') && 
          navLinks.classList.contains('active') && 
          !event.target.classList.contains('hamburger')) {
        navLinks.classList.remove('active');
        document.body.classList.remove('menu-open');
        mobileMenuToggle.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

/**
 * Set active navigation link based on current page
 */
function initActiveNavigation() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navItems = document.querySelectorAll('.nav-links a');
  
  navItems.forEach(item => {
    const href = item.getAttribute('href');
    if (href === currentPage || 
        (currentPage === 'index.html' && href === './index.html') ||
        (currentPage === '' && href === 'index.html')) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Update URL hash without jumping
        history.pushState(null, null, targetId);
      }
    });
  });
}

/**
 * Back to Top button functionality
 */
function initBackToTop() {
  const backToTopButton = document.getElementById('backToTop');
  
  if (!backToTopButton) {
    // Create the button if it doesn't exist in the DOM
    const button = document.createElement('a');
    button.id = 'backToTop';
    button.classList.add('back-to-top');
    button.innerHTML = '<i class="fas fa-arrow-up"></i>';
    button.setAttribute('aria-label', 'Back to top');
    button.setAttribute('href', '#');
    document.body.appendChild(button);
  }
  
  // Get the button (whether it existed or we just created it)
  const btn = document.getElementById('backToTop');
  
  // Show/hide button based on scroll position
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });
  
  // Smooth scroll to top when clicked
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * Carousel/Slider functionality
 */
function initCarousel() {
  const slides = document.querySelectorAll('.carousel-slide');
  const indicators = document.querySelectorAll('.indicator');
  
  if (!slides.length) return;
  
  let currentSlide = 0;
  let intervalId;
  
  function showSlide(index) {
    // Hide all slides
    slides.forEach(slide => {
      slide.classList.remove('active');
    });
    
    // Deactivate all indicators
    indicators.forEach(indicator => {
      indicator.classList.remove('active');
    });
    
    // Show the current slide and activate its indicator
    slides[index].classList.add('active');
    indicators[index].classList.add('active');
  }
  
  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }
  
  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
  }
  
  // Add click events to indicators
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      currentSlide = index;
      showSlide(currentSlide);
      
      // Reset the interval when manually changing slides
      clearInterval(intervalId);
      intervalId = setInterval(nextSlide, 5000);
    });
  });
  
  // Auto-advance slides every 5 seconds
  intervalId = setInterval(nextSlide, 5000);
  
  // Pause autoplay when hovering over the carousel (optional)
  const carouselContainer = document.querySelector('.carousel-container');
  if (carouselContainer) {
    carouselContainer.addEventListener('mouseenter', () => {
      clearInterval(intervalId);
    });
    
    carouselContainer.addEventListener('mouseleave', () => {
      intervalId = setInterval(nextSlide, 5000);
    });
  }
}

/**
 * Form Validation
 */
function initFormValidation() {
  const contactForm = document.getElementById('contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      let isValid = true;
      const requiredFields = contactForm.querySelectorAll('[required]');
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add('error');
          
          const errorMessage = field.dataset.errorMessage || 'This field is required';
          let errorElement = field.nextElementSibling;
          
          if (!errorElement || !errorElement.classList.contains('error-message')) {
            errorElement = document.createElement('span');
            errorElement.classList.add('error-message');
            field.parentNode.insertBefore(errorElement, field.nextSibling);
          }
          
          errorElement.textContent = errorMessage;
        } else {
          field.classList.remove('error');
          const errorElement = field.nextElementSibling;
          if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.remove();
          }
        }
      });
      
      // Email validation
      const emailField = contactForm.querySelector('input[type="email"]');
      if (emailField && emailField.value.trim()) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailField.value)) {
          isValid = false;
          emailField.classList.add('error');
          
          let errorElement = emailField.nextElementSibling;
          if (!errorElement || !errorElement.classList.contains('error-message')) {
            errorElement = document.createElement('span');
            errorElement.classList.add('error-message');
            emailField.parentNode.insertBefore(errorElement, emailField.nextSibling);
          }
          
          errorElement.textContent = 'Please enter a valid email address';
        }
      }
      
      if (!isValid) {
        e.preventDefault();
      }
    });
    
    // Clear error messages when typing
    contactForm.querySelectorAll('input, textarea').forEach(field => {
      field.addEventListener('input', function() {
        this.classList.remove('error');
        const errorElement = this.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
          errorElement.remove();
        }
      });
    });
  }
}

/**
 * Animations - Animate elements when they come into view
 */
function initAnimations() {
  // Add animation classes to service cards when they come into view
  const serviceItems = document.querySelectorAll('.service-item');
  
  if (serviceItems.length) {
    // Use Intersection Observer API if supported
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            observer.unobserve(entry.target);
          }
        });
      }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      });
      
      serviceItems.forEach(item => {
        observer.observe(item);
      });
    } else {
      // Fallback for browsers that don't support IntersectionObserver
      serviceItems.forEach(item => {
        item.classList.add('animate');
      });
    }
  }
  
  // Add general animation for other elements
  const animateElements = document.querySelectorAll('.animate-on-scroll');
  
  if (animateElements.length) {
    const checkInView = () => {
      animateElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        
        if (rect.top <= windowHeight * 0.8) {
          element.classList.add('in-view');
        }
      });
    };
    
    // Initial check
    checkInView();
    
    // Check on scroll
    window.addEventListener('scroll', checkInView);
  }
}

// Check for lazy loading support
if (!('loading' in HTMLImageElement.prototype)) {
  console.log('Native lazy loading not supported');
  // You could implement a lazyload library here
}


/**
 * Service tabs JavaScript - Updated version
 */
document.addEventListener('DOMContentLoaded', function() {
  // Initialize service tabs
  initServiceTabs();
});

function initServiceTabs() {
  const buttons = document.querySelectorAll('.category-button');
  
  if (!buttons.length) return;
  
  buttons.forEach(button => {
    button.addEventListener('click', function() {
      // Get target service id from data attribute
      const targetId = this.getAttribute('data-target');
      
      // Hide all service containers
      const serviceContainers = document.querySelectorAll('.service-detail-container');
      serviceContainers.forEach(container => {
        container.classList.remove('active');
      });
      
      // Show the selected service container
      document.getElementById(targetId).classList.add('active');
      
      // Update active button class
      buttons.forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Add active class to clicked button
      this.classList.add('active');
    });
  });
}