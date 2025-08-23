// DEBUG CART ISSUE - Find the actual source of /cart/add requests

console.log('🔍 DEBUGGING CART ISSUE - FINDING SOURCE OF /cart/add REQUESTS');

// 1. Monitor all form submissions
document.addEventListener('submit', function(event) {
  console.log('🚨 FORM SUBMISSION DETECTED:', {
    action: event.target.action,
    method: event.target.method,
    id: event.target.id,
    className: event.target.className,
    innerHTML: event.target.innerHTML.substring(0, 200)
  });
  
  if (event.target.action && event.target.action.includes('/cart/add')) {
    console.log('🚨 CART FORM SUBMISSION BLOCKED');
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
});

// 2. Monitor all button clicks
document.addEventListener('click', function(event) {
  if (event.target.type === 'submit' || event.target.tagName === 'BUTTON') {
    const form = event.target.closest('form');
    if (form) {
      console.log('🚨 BUTTON CLICK ON FORM:', {
        action: form.action,
        method: form.method,
        buttonText: event.target.textContent,
        buttonType: event.target.type
      });
    }
  }
});

// 3. Monitor all fetch requests
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  console.log('🌐 FETCH REQUEST:', {
    url: url,
    method: options ? options.method : 'GET',
    body: options ? options.body : null
  });
  
  if (typeof url === 'string' && url.includes('/cart/add')) {
    console.log('🚨 CART FETCH REQUEST DETECTED:', url);
  }
  
  return originalFetch.apply(this, arguments);
};

// 4. Monitor all XHR requests
const originalXHROpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, ...args) {
  console.log('🌐 XHR REQUEST:', {
    method: method,
    url: url
  });
  
  if (typeof url === 'string' && url.includes('/cart/add')) {
    console.log('🚨 CART XHR REQUEST DETECTED:', url);
  }
  
  return originalXHROpen.call(this, method, url, ...args);
};

// 5. Monitor form creation
const originalCreateElement = document.createElement;
document.createElement = function(tagName) {
  const element = originalCreateElement.call(this, tagName);
  
  if (tagName.toLowerCase() === 'form') {
    console.log('🚨 FORM CREATED:', element);
    
    // Monitor form action changes
    const originalSetAttribute = element.setAttribute;
    element.setAttribute = function(name, value) {
      if (name === 'action') {
        console.log('🚨 FORM ACTION SET:', value);
      }
      return originalSetAttribute.call(this, name, value);
    };
  }
  
  return element;
};

// 6. Scan for existing forms
console.log('🔍 SCANNING FOR EXISTING FORMS...');
const forms = document.querySelectorAll('form');
forms.forEach((form, index) => {
  console.log(`Form ${index + 1}:`, {
    action: form.action,
    method: form.method,
    id: form.id,
    className: form.className,
    innerHTML: form.innerHTML.substring(0, 300)
  });
});

// 7. Monitor DOM changes
const observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === 1) { // Element node
          if (node.tagName === 'FORM') {
            console.log('🚨 NEW FORM ADDED TO DOM:', node);
          }
          const forms = node.querySelectorAll ? node.querySelectorAll('form') : [];
          forms.forEach(function(form) {
            console.log('🚨 FORM FOUND IN NEW NODE:', form);
          });
        }
      });
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

console.log('🔍 CART ISSUE DEBUGGING ACTIVE - MONITORING ALL REQUESTS');
console.log('💡 Check console for any cart-related requests or form submissions'); 