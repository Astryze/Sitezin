document.addEventListener('DOMContentLoaded', function() {
    // Get the current year for footer copyright
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Header scroll effect
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
      if (window.scrollY > 10) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
    
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    
    mobileMenuBtn.addEventListener('click', function() {
      mobileMenuBtn.classList.toggle('mobile-menu-open');
      mobileNav.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    const mobileNavLinks = document.querySelectorAll('.mobile-nav .nav-link');
    
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', function() {
        mobileMenuBtn.classList.remove('mobile-menu-open');
        mobileNav.classList.remove('active');
      });
    });
    
    // Smooth scrolling for all anchor links
    const allLinks = document.querySelectorAll('a[href^="#"]');
    
    allLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const headerHeight = header.offsetHeight;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
    
    // Handle contact form submission
    const contactForm = document.getElementById('contactForm');
    const formSuccessMessage = document.querySelector('.form-success-message');
    
    if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
          nome: document.getElementById('nome').value,
          email: document.getElementById('email').value,
          mensagem: document.getElementById('mensagem').value
        };
        
        // Show loading state on button
        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalBtnContent = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loader"></span> Enviando...';
        submitBtn.disabled = true;
        
        // Simulate form submission (would be replaced with actual API call)
        setTimeout(() => {
          // Hide form and show success message
          contactForm.style.display = 'none';
          formSuccessMessage.style.display = 'block';
          
          // Show toast notification
          showToast('Mensagem enviada!', 'Agradecemos seu contato. Responderemos em breve.');
          
          // Reset form
          contactForm.reset();
          
          // Reset button
          submitBtn.innerHTML = originalBtnContent;
          submitBtn.disabled = false;
          
          // After 3 seconds, hide success message and show form again
          setTimeout(() => {
            formSuccessMessage.style.display = 'none';
            contactForm.style.display = 'block';
          }, 3000);
        }, 1500);
      });
    }
    
    // Newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = this.querySelector('input[type="email"]').value;
        
        // Simulate submission
        setTimeout(() => {
          showToast('Inscrição realizada!', 'Você receberá nossas novidades no email: ' + email);
          this.reset();
        }, 500);
      });
    }
    
    // Toast notification function
    function showToast(title, description) {
      const toast = document.getElementById('toast');
      const toastTitle = toast.querySelector('.toast-title');
      const toastDescription = toast.querySelector('.toast-description');
      
      toastTitle.textContent = title;
      toastDescription.textContent = description;
      
      toast.style.display = 'block';
      
      // Toast some automaticamente em 4 segundos
      setTimeout(() => {
        toast.style.display = 'none';
      }, 4000);
    }
    
     // Animação ativada por scroll
    function handleScrollReveal() {
      const sections = document.querySelectorAll('.reveal-section');
      
      sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (sectionTop < windowHeight * 0.75) {
          section.classList.add('active');
        }
      });
    }
    
    // Chamar uma vez ao carregar
    handleScrollReveal();
    
    // // Ação ao rolar a página
    window.addEventListener('scroll', handleScrollReveal);
  });
  

// Envio com Z-API
const instanceId = 'SEU_INSTANCE_ID';
const token = 'SEU_TOKEN';

const clientesForm = document.getElementById('clientesForm');
if (clientesForm) {
  clientesForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const nome = document.getElementById('cliente-nome').value;
    const numero = document.getElementById('cliente-whatsapp').value.replace(/\D/g, '');
    const mensagem = document.getElementById('mensagem-cliente').value;

    const payload = {
      phone: '55' + numero,
      message: mensagem
    };

    fetch(`https://api.z-api.io/instances/${instanceId}/token/${token}/send-messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      if (data?.message) {
        showToast('Mensagem enviada!', `Mensagem para ${nome} enviada com sucesso.`);
      } else {
        showToast('Erro', 'Falha ao enviar mensagem. Verifique os dados.');
      }
      clientesForm.reset();
    })
    .catch(() => {
      showToast('Erro', 'Não foi possível se conectar com a Z-API.');
    });
  });
}
