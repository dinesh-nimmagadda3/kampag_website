/**
 * Kampag IT Services - Contact Form JavaScript
 * Handles the contact form submission with AJAX
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get the contact form element
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
      // Add submit event listener
      contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate the form before submission
        if (validateContactForm()) {
          submitContactForm();
        }
      });
      
      // Add input event listeners to clear errors when user types
      const formInputs = contactForm.querySelectorAll('input, textarea');
      formInputs.forEach(input => {
        input.addEventListener('input', function() {
          this.classList.remove('error');
          const errorElement = this.nextElementSibling;
          if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.remove();
          }
        });
      });
    }
    
    /**
     * Validates the contact form
     * @returns {boolean} True if form is valid, false otherwise
     */
    function validateContactForm() {
      let isValid = true;
      const requiredFields = contactForm.querySelectorAll('[required]');
      
      // Remove any existing error messages
      const existingErrors = contactForm.querySelectorAll('.error-message');
      existingErrors.forEach(error => error.remove());
      
      // Check each required field
      requiredFields.forEach(field => {
        field.classList.remove('error');
        
        if (field.type === 'checkbox') {
          if (!field.checked) {
            displayError(field, 'You must agree to our privacy policy');
            isValid = false;
          }
        } else if (field.value.trim() === '') {
          displayError(field, field.dataset.errorMessage || 'This field is required');
          isValid = false;
        }
      });
      
      // Validate email format
      const emailField = contactForm.querySelector('input[type="email"]');
      if (emailField && emailField.value.trim() !== '') {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailField.value)) {
          displayError(emailField, 'Please enter a valid email address');
          isValid = false;
        }
      }
      
      return isValid;
    }
    
    /**
     * Displays an error message for a form field
     * @param {Element} field - The form field with an error
     * @param {string} message - The error message to display
     */
    function displayError(field, message) {
      field.classList.add('error');
      
      const errorElement = document.createElement('div');
      errorElement.classList.add('error-message');
      errorElement.textContent = message;
      
      if (field.type === 'checkbox') {
        // For checkboxes, add error after the label
        field.closest('.checkbox-group').appendChild(errorElement);
      } else {
        // For other inputs, add error after the input
        field.insertAdjacentElement('afterend', errorElement);
      }
    }
    
    /**
     * Submits the contact form via AJAX
     */
    function submitContactForm() {
      // Show loading state
      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
      
      // Create form data
      const formData = new FormData(contactForm);
      
      // Send form data via fetch API
      fetch('submit-form.php', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        // Handle the response
        if (data.success) {
          // Show success message
          displayFormMessage('success', data.message);
          // Reset form
          contactForm.reset();
        } else {
          // Show error message
          displayFormMessage('error', data.message || 'Something went wrong. Please try again.');
        }
      })
      .catch(error => {
        // Handle fetch error
        console.error('Error:', error);
        displayFormMessage('error', 'A network error occurred. Please try again.');
      })
      .finally(() => {
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      });
    }
    
    /**
     * Displays a form submission message
     * @param {string} type - The message type ('success' or 'error')
     * @param {string} message - The message to display
     */
    function displayFormMessage(type, message) {
      // Remove any existing messages
      const existingMessages = document.querySelectorAll('.form-message');
      existingMessages.forEach(msg => msg.remove());
      
      // Create message element
      const messageElement = document.createElement('div');
      messageElement.classList.add('form-message');
      messageElement.classList.add(type === 'success' ? 'success-message' : 'error-message');
      messageElement.textContent = message;
      
      // Add some basic styling
      messageElement.style.padding = '15px';
      messageElement.style.marginBottom = '20px';
      messageElement.style.borderRadius = '4px';
      
      if (type === 'success') {
        messageElement.style.backgroundColor = '#d4edda';
        messageElement.style.color = '#155724';
        messageElement.style.border = '1px solid #c3e6cb';
      } else {
        messageElement.style.backgroundColor = '#f8d7da';
        messageElement.style.color = '#721c24';
        messageElement.style.border = '1px solid #f5c6cb';
      }
      
      // Insert at the top of the form
      contactForm.prepend(messageElement);
      
      // Scroll to the message
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // If success, hide the message after a few seconds
      if (type === 'success') {
        setTimeout(() => {
          messageElement.style.opacity = '0';
          messageElement.style.transition = 'opacity 0.5s ease';
          setTimeout(() => messageElement.remove(), 500);
        }, 5000);
      }
    }
  });