// EdVents Application JavaScript

// Event data
// Global variable to store events data
let eventsData = { events: [] };

// Fetch events from JSON file
fetch('uk-education-events-2025-2026.json')
  .then(response => response.json())
  .then(data => {
    eventsData = data; // Store the fetched data
    currentEvents = eventsData.events; // Update current events
    
    // Initialize displays after data is loaded
    displayFeaturedEvents();
    displayAllEvents();
  })
  .catch(error => {
    console.error('Error loading events:', error);
    // Fallback to empty array if fetch fails
    eventsData = { events: [] };
  });

// Application state
let currentEvents = eventsData.events;
let currentFilters = {
  search: '',
  type: '',
  subject: '',
  format: '',
  audience: '',
  date: ''
};

// DOM elements
const elements = {
  // Navigation
  navLinks: document.querySelectorAll('.nav__link'),
  sections: document.querySelectorAll('.section'),
  menuToggle: document.getElementById('menuToggle'),
  mainNav: document.getElementById('mainNav'),
  
  // Homepage
  heroSearch: document.getElementById('heroSearch'),
  heroSearchBtn: document.getElementById('heroSearchBtn'),
  featuredEventsGrid: document.getElementById('featuredEventsGrid'),
  findEventsBtn: document.getElementById('findEventsBtn'),
  listEventBtn: document.getElementById('listEventBtn'),
  
  // Browse Events
  eventsGrid: document.getElementById('eventsGrid'),
  eventSearch: document.getElementById('eventSearch'),
  searchBtn: document.getElementById('searchBtn'),
  clearFilters: document.getElementById('clearFilters'),
  sortEvents: document.getElementById('sortEvents'),
  
  // Filters
  dateFilter: document.getElementById('dateFilter'),
  typeFilter: document.getElementById('typeFilter'),
  subjectFilter: document.getElementById('subjectFilter'),
  formatFilter: document.getElementById('formatFilter'),
  audienceFilter: document.getElementById('audienceFilter'),
  
  // Modal
  eventModal: document.getElementById('eventModal'),
  eventDetail: document.getElementById('eventDetail'),
  closeModal: document.getElementById('closeModal'),
  
  // Forms
  newsletterForm: document.getElementById('newsletterForm'),
  contactForm: document.getElementById('contactForm')
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  setupNavigation();
  setupEventHandlers();
  displayFeaturedEvents();
  displayAllEvents();
}

// Navigation functionality
function setupNavigation() {
  elements.navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      showSection(targetId);
      updateActiveNav(this);
      
      // Close mobile menu if open
      if (elements.mainNav.classList.contains('active')) {
        elements.mainNav.classList.remove('active');
      }
    });
  });
  
  // Mobile menu toggle
  if (elements.menuToggle) {
    elements.menuToggle.addEventListener('click', function() {
      elements.mainNav.classList.toggle('active');
    });
  }
  
  // Find Events and List Event buttons
  elements.findEventsBtn?.addEventListener('click', () => showSection('browse'));
  elements.listEventBtn?.addEventListener('click', () => showSection('organisers'));
}

function showSection(targetId) {
  // Define which sections belong to the homepage
  const homepageSections = ['home', 'featured-events', 'stats', 'value-props', 'newsletter'];
  
  elements.sections.forEach(section => {
    const sectionId = section.id;
    const sectionClasses = Array.from(section.classList);
    
    if (targetId === 'home') {
      // Show all homepage sections
      const isHomepageSection = homepageSections.includes(sectionId) || 
                               sectionClasses.some(cls => homepageSections.includes(cls));
      
      if (isHomepageSection || sectionId === 'home') {
        section.classList.remove('hidden');
      } else {
        section.classList.add('hidden');
      }
    } else {
      // Show only the target section, hide others
      if (sectionId === targetId) {
        section.classList.remove('hidden');
      } else {
        section.classList.add('hidden');
      }
    }
  });
}

function updateActiveNav(activeLink) {
  elements.navLinks.forEach(link => link.classList.remove('active'));
  activeLink.classList.add('active');
}

// Event handling setup
function setupEventHandlers() {
  // Hero search
  elements.heroSearchBtn?.addEventListener('click', performHeroSearch);
  elements.heroSearch?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') performHeroSearch();
  });
  
  // Browse events search
  elements.searchBtn?.addEventListener('click', performEventSearch);
  elements.eventSearch?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') performEventSearch();
  });
  
  // Filters
  elements.dateFilter?.addEventListener('change', applyFilters);
  elements.typeFilter?.addEventListener('change', applyFilters);
  elements.subjectFilter?.addEventListener('change', applyFilters);
  elements.formatFilter?.addEventListener('change', applyFilters);
  elements.audienceFilter?.addEventListener('change', applyFilters);
  
  // Clear filters
  elements.clearFilters?.addEventListener('click', clearAllFilters);
  
  // Sort events
  elements.sortEvents?.addEventListener('change', sortEvents);
  
  // Modal
  elements.closeModal?.addEventListener('click', closeEventModal);
  elements.eventModal?.addEventListener('click', function(e) {
    if (e.target === this || e.target.classList.contains('modal__backdrop')) {
      closeEventModal();
    }
  });
  
  // Forms
  elements.newsletterForm?.addEventListener('submit', handleNewsletterSubmit);
  elements.contactForm?.addEventListener('submit', handleContactSubmit);
}

// Event display functions
function displayFeaturedEvents() {
  if (!elements.featuredEventsGrid) return;
  
  const featuredEvents = eventsData.events.filter(event => event.featured);
  elements.featuredEventsGrid.innerHTML = featuredEvents.map(createEventCard).join('');
  
  // Add click handlers to event cards
  addEventCardHandlers();
}

function displayAllEvents() {
  if (!elements.eventsGrid) return;
  
  elements.eventsGrid.innerHTML = currentEvents.map(createEventCard).join('');
  addEventCardHandlers();
}

function createEventCard(event) {
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  return `
    <div class="event-card" data-event-id="${event.id}">
      <img src="default-image.jpg" alt="Event image for ${event.event_name}" class="event-card__image" loading="lazy">
      <div class="event-card__content">
        <h4 class="event-card__title">${event.event_name || 'Untitled Event'}</h4>
        <div class="event-card__meta">
          <span>📅 ${formattedDate}</span>
          <span>📍 ${event.location || 'Location TBA'}</span>
          <span>👥 ${event.target_audience || 'All audiences'}</span>
        </div>
        <p class="event-card__description">${truncateText(event.description || '', 120)}</p>
        <div class="event-card__footer">
          <div class="event-card__price">${event.ticket_prices?.general || 'TBA'}</div>
          <div class="event-tags">
            <span class="event-tag">${event.category || ''}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function truncateText(text, maxLength) {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function addEventCardHandlers() {
  const eventCards = document.querySelectorAll('.event-card');
  eventCards.forEach(card => {
    card.addEventListener('click', function() {
      const eventId = parseInt(this.dataset.eventId);
      showEventDetail(eventId);
    });
  });
}

// Search functionality
function performHeroSearch() {
  const searchTerm = elements.heroSearch?.value.trim();
  if (searchTerm) {
    currentFilters.search = searchTerm;
    showSection('browse');
    updateActiveNav(document.querySelector('[href="#browse"]'));
    elements.eventSearch.value = searchTerm;
    applyFilters();
  }
}

function performEventSearch() {
  currentFilters.search = elements.eventSearch?.value.trim() || '';
  applyFilters();
}

// Filtering functionality
function applyFilters() {
  // Get current filter values
  currentFilters = {
    search: elements.eventSearch?.value.trim() || '',
    type: elements.typeFilter?.value || '',
    subject: elements.subjectFilter?.value || '',
    format: elements.formatFilter?.value || '',
    audience: elements.audienceFilter?.value || '',
    date: elements.dateFilter?.value || ''
  };
  
  // Filter events
  currentEvents = eventsData.events.filter(event => {
    // Search filter
    if (currentFilters.search && !searchMatchesEvent(event, currentFilters.search)) {
      return false;
    }
    
    // Type filter
    if (currentFilters.type && event.type !== currentFilters.type) {
      return false;
    }
    
    // Subject filter
    if (currentFilters.subject && event.subject !== currentFilters.subject) {
      return false;
    }
    
    // Format filter
    if (currentFilters.format && event.format !== currentFilters.format) {
      return false;
    }
    
    // Audience filter
    if (currentFilters.audience && event.audience !== currentFilters.audience) {
      return false;
    }
    
    // Date filter
    if (currentFilters.date && !dateMatchesFilter(event.date, currentFilters.date)) {
      return false;
    }
    
    return true;
  });
  
  displayAllEvents();
}

function searchMatchesEvent(event, searchTerm) {
  const searchFields = [
    event.title,
    event.organiser,
    event.location,
    event.description,
    event.subject,
    event.type
  ].join(' ').toLowerCase();
  
  return searchFields.includes(searchTerm.toLowerCase());
}

function dateMatchesFilter(eventDate, filterValue) {
  const today = new Date();
  const eventDateObj = new Date(eventDate);
  
  switch (filterValue) {
    case 'thisWeek':
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return eventDateObj >= today && eventDateObj <= weekFromNow;
    case 'thisMonth':
      return eventDateObj.getMonth() === today.getMonth() && 
             eventDateObj.getFullYear() === today.getFullYear();
    case 'nextMonth':
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const monthAfter = new Date(today.getFullYear(), today.getMonth() + 2, 1);
      return eventDateObj >= nextMonth && eventDateObj < monthAfter;
    default:
      return true;
  }
}

function clearAllFilters() {
  // Reset filter inputs
  elements.eventSearch.value = '';
  elements.dateFilter.value = '';
  elements.typeFilter.value = '';
  elements.subjectFilter.value = '';
  elements.formatFilter.value = '';
  elements.audienceFilter.value = '';
  
  // Reset filters and display all events
  currentFilters = {
    search: '',
    type: '',
    subject: '',
    format: '',
    audience: '',
    date: ''
  };
  
  currentEvents = eventsData.events;
  displayAllEvents();
}

// Sorting functionality
function sortEvents() {
  const sortBy = elements.sortEvents?.value;
  
  currentEvents.sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(a.date) - new Date(b.date);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'price':
        const priceA = a.price === 'Free' ? 0 : parseInt(a.price.replace('£', ''));
        const priceB = b.price === 'Free' ? 0 : parseInt(b.price.replace('£', ''));
        return priceA - priceB;
      default:
        return 0;
    }
  });
  
  displayAllEvents();
}

// Modal functionality
function showEventDetail(eventId) {
  const event = eventsData.events.find(e => e.id === eventId);
  if (!event) return;
  
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  elements.eventDetail.innerHTML = `
    <img src="default-image.jpg" alt="${event.event_name}" class="event-detail__image">
    <div class="event-detail__header">
      <h3 class="event-detail__title">${event.event_name}</h3>
      <div class="event-detail__meta">
        <div class="event-detail__meta-item">
          <strong>📅 Date:</strong> ${formattedDate}
        </div>
        <div class="event-detail__meta-item">
          <strong>📍 Location:</strong> ${event.location}
        </div>
        <div class="event-detail__meta-item">
          <strong>🏢 Organiser:</strong> ${event.organizer}
        </div>
        <div class="event-detail__meta-item">
          <strong>👥 Audience:</strong> ${event.target_audience}
        </div>
        <div class="event-detail__meta-item">
          <strong>📚 Category:</strong> ${event.category}
        </div>
        <div class="event-detail__meta-item">
          <strong>⏰ CPD Hours:</strong> ${event.cpd_hours || 'TBA'}
        </div>
      </div>
    </div>
    
    <div class="event-detail__price">${event.ticket_prices?.general || 'TBA'}</div>
    
    <div class="event-detail__description">
      <p>${event.description}</p>
    </div>
    
    ${event.additional_notes ? `
    <div class="event-detail__section">
      <h4>Additional Information</h4>
      <p>${event.additional_notes}</p>
    </div>
    ` : ''}
    
    <div class="event-detail__actions">
      <button class="btn btn--primary btn--lg">Book Now</button>
      ${event.website ? `<a href="${event.website}" target="_blank" class="btn btn--outline btn--lg">Visit Website</a>` : ''}
    </div>
  `;
  
  elements.eventModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeEventModal() {
  elements.eventModal.classList.add('hidden');
  document.body.style.overflow = 'auto';
}

// Form handling
function handleNewsletterSubmit(e) {
  e.preventDefault();
  const email = e.target.querySelector('input[type="email"]').value;
  
  // Simple validation
  if (!email || !email.includes('@')) {
    alert('Please enter a valid email address.');
    return;
  }
  
  // Simulate subscription
  alert('Thank you for subscribing! You\'ll receive our newsletter soon.');
  e.target.reset();
}

function handleContactSubmit(e) {
  e.preventDefault();
  
  // Get form data
  const formData = new FormData(e.target);
  const name = e.target.querySelector('input[type="text"]').value;
  const email = e.target.querySelector('input[type="email"]').value;
  const packageSelect = e.target.querySelector('select').value;
  
  // Simple validation
  if (!name || !email || !packageSelect) {
    alert('Please fill in all required fields.');
    return;
  }
  
  if (!email.includes('@')) {
    alert('Please enter a valid email address.');
    return;
  }
  
  // Simulate form submission
  alert('Thank you for your inquiry! We\'ll get back to you within 24 hours.');
  e.target.reset();
}

// Keyboard accessibility
document.addEventListener('keydown', function(e) {
  // Close modal with Escape key
  if (e.key === 'Escape' && !elements.eventModal.classList.contains('hidden')) {
    closeEventModal();
  }
});

// Handle window resize
window.addEventListener('resize', function() {
  // Close mobile menu on resize to desktop
  if (window.innerWidth > 768 && elements.mainNav.classList.contains('active')) {
    elements.mainNav.classList.remove('active');
  }
});

// Smooth scrolling for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Image lazy loading fallback for older browsers
if ('loading' in HTMLImageElement.prototype) {
  // Browser supports lazy loading natively
} else {
  // Fallback for browsers that don't support lazy loading
  const images = document.querySelectorAll('img[loading="lazy"]');
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
}
