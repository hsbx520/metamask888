// Navigation toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });
}

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Payment method selection - remove USD1 option
document.querySelectorAll('.payment-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const currency = this.getAttribute('data-currency');
        const currencySymbol = document.querySelector('.currency-symbol');
        if (currencySymbol) {
            currencySymbol.textContent = currency.toUpperCase();
        }
    });
});

// Referral link generator
const generateBtn = document.getElementById('generate-link');
const walletInput = document.getElementById('wallet-input');
const referralLink = document.getElementById('referral-link');
const referralResult = document.getElementById('referral-result');

if (generateBtn && walletInput && referralLink && referralResult) {
    generateBtn.addEventListener('click', function() {
        const walletAddress = walletInput.value;
        if (walletAddress) {
            const link = `https://mask.metamask.io/presale?ref=${walletAddress}`;
            referralLink.textContent = link;
            referralResult.style.display = 'block';
        }
    });
}

// Copy referral link
const copyBtn = document.getElementById('copy-link');
if (copyBtn && referralLink) {
    copyBtn.addEventListener('click', function() {
        const link = referralLink.textContent;
        navigator.clipboard.writeText(link).then(() => {
            this.textContent = 'Copied!';
            setTimeout(() => {
                this.textContent = 'Copy';
            }, 2000);
        });
    });
}

// Buy button functionality
const buyBtn = document.getElementById('buy-btn');
const amountInput = document.getElementById('amount');

if (buyBtn && amountInput) {
    buyBtn.addEventListener('click', function() {
        const amount = amountInput.value;
        const currency = document.querySelector('.payment-btn.active')?.getAttribute('data-currency') || 'eth';
        
        if (amount && amount > 0) {
            alert(`Purchasing $MASK with ${amount} ${currency.toUpperCase()}. Official payment channel integration coming soon!`);
        } else {
            alert('Please enter a valid amount');
        }
    });
}

// Update presale address
const presaleAddress = document.getElementById('presale-address');
if (presaleAddress) {
    presaleAddress.textContent = '(To be announced after presale ends)';
}

// Enhanced presale functionality
let isWalletConnected = false;
let selectedNetwork = 'ethereum';
let selectedCurrency = 'eth';
const maskPrice = 0.0085; // Updated price: $0.0085 per MASK

// Currency exchange rates to USD
const currencyRates = {
    eth: 4550,    // ETH = $4550
    bnb: 1150,    // BNB = $1150
    usdt: 1,      // USDT = $1
    usdc: 1       // USDC = $1
};

// Minimum purchase amounts per currency
const minAmounts = {
    eth: 0.05,
    bnb: 0.2,
    usdt: 200,
    usdc: 200
};

// Network and currency configurations
const networkConfig = {
    ethereum: {
        currencies: ['eth', 'usdt', 'usdc'],
        contractAddress: '0x057d15f69f04975f68de662dd66fea954872e380'
    },
    bnb: {
        currencies: ['bnb', 'usdt', 'usdc'],
        contractAddress: '0x057d15f69f04975f68de662dd66fea954872e380'
    }
};

// Network selection handlers
document.querySelectorAll('input[name="network"]').forEach(radio => {
    radio.addEventListener('change', function() {
        selectedNetwork = this.value;
        updateCurrencyOptions();
        updateContractAddress();
    });
});

// Currency selection handlers
function updateCurrencyOptions() {
    const currencyContainer = document.getElementById('currency-options');
    if (!currencyContainer) return;
    
    const currencies = networkConfig[selectedNetwork].currencies;
    
    currencyContainer.innerHTML = '';
    
    currencies.forEach((currency, index) => {
        const btn = document.createElement('button');
        btn.className = `currency-btn ${index === 0 ? 'active' : ''}`;
        btn.setAttribute('data-currency', currency);
        btn.textContent = currency.toUpperCase();
        currencyContainer.appendChild(btn);
    });
    
    // Set first currency as selected
    selectedCurrency = currencies[0];
    updateSelectedCurrency();
    
    // Add event listeners to new buttons
    currencyContainer.querySelectorAll('.currency-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currencyContainer.querySelectorAll('.currency-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedCurrency = this.getAttribute('data-currency');
            updateSelectedCurrency();
        });
    });
}

function updateSelectedCurrency() {
    const selectedCurrencyElement = document.getElementById('selected-currency');
    const purchaseBtnText = document.getElementById('purchase-btn-text');
    const currencyDisplay = document.getElementById('currency-display');
    
    if (selectedCurrencyElement) {
        selectedCurrencyElement.textContent = selectedCurrency.toUpperCase();
    }
    
    if (currencyDisplay) {
        currencyDisplay.textContent = selectedCurrency.toUpperCase();
    }
    
    if (purchaseBtnText) {
        purchaseBtnText.textContent = 'Buy Now';
    }
    
    // Recalculate MASK amount when currency changes
    if (payAmountInput) {
        payAmountInput.dispatchEvent(new Event('input'));
    }
}

function updateContractAddress() {
    const contractAddress = document.getElementById('contract-address');
    if (contractAddress) {
        contractAddress.textContent = networkConfig[selectedNetwork].contractAddress;
    }
}

// Amount calculation with currency rates - also clear errors when user types
const payAmountInput = document.getElementById('pay-amount');
const receiveAmount = document.getElementById('receive-amount');

if (payAmountInput && receiveAmount) {
    payAmountInput.addEventListener('input', function() {
        // Clear any existing error messages when user starts typing
        clearErrorMessage();
        
        const amount = parseFloat(this.value) || 0;
        const currencyUsdPrice = currencyRates[selectedCurrency] || 1;
        const maskAmount = (amount * currencyUsdPrice / maskPrice);
        
        // Format number with commas
        const formattedAmount = maskAmount.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
        
        receiveAmount.textContent = `${formattedAmount} $MASK`;
    });
}

// Purchase button functionality - show payment modal instead of wallet connection
const purchaseBtn = document.getElementById('purchase-btn');
if (purchaseBtn) {
    purchaseBtn.addEventListener('click', function() {
        const payAmount = parseFloat(payAmountInput?.value) || 0;
        
        // Clear any existing error messages
        clearErrorMessage();
        
        if (!payAmount || payAmount <= 0) {
            showInlineError('Please enter a valid amount');
            return;
        }

        // Validate minimums based on selected currency
        const minRequired = minAmounts[selectedCurrency] ?? 0;
        if (payAmount < minRequired) {
            const label = selectedCurrency.toUpperCase();
            showInlineError(`Minimum purchase is ${minRequired} ${label}. Please increase your amount.`);
            return;
        }

        showPaymentModal();
    });
}

// New payment modal function
function showPaymentModal() {
    const payAmount = payAmountInput?.value;
    if (!payAmount) return;
    const currencyUsdPrice = currencyRates[selectedCurrency] || 1;
    const maskAmount = (parseFloat(payAmount) * currencyUsdPrice / maskPrice);
    const formattedMaskAmount = maskAmount.toLocaleString('en-US',{minimumFractionDigits:0,maximumFractionDigits:2});
    const networkName = selectedNetwork === 'ethereum' ? 'Use Ethereum network (ETH / ERC-20).' : 'Use BNB Chain (BNB / BEP-20).';
    const contractAddress = networkConfig[selectedNetwork].contractAddress;
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content payment-modal dark">
            <h3>Complete Your MASK Purchase</h3>
            <p class="subtitle-accent">Send the exact amount below to our secure presale address on the correct blockchain. <span class="accent">The system will automatically send MASK tokens to your wallet address once your payment is received — no manual claiming required.</span></p>
            <div class="payment-details">
                <div class="payment-section">
                    <h4>Send Amount</h4>
                    <div class="amount-display">${payAmount} ${selectedCurrency.toUpperCase()}</div>
                </div>
                <div class="payment-section">
                    <h4>You'll Receive</h4>
                    <div class="amount-display">${formattedMaskAmount} MASK</div>
                </div>
                <div class="payment-section">
                    <h4>Network</h4>
                    <div class="network-display">${networkName}</div>
                </div>
                <div class="payment-section">
                    <div class="section-title">Official Presale Address</div>
                    <div class="address-box">
                        <div class="address-container">
                            <code class="presale-address" id="modal-address">${contractAddress}</code>
                            <button class="btn btn-copy" onclick="copyPresaleAddress()">Copy</button>
                        </div>
                    </div>
                </div>
                <div class="payment-warning">
                    <p><strong>Important:</strong> Only send ETH, BNB, USDT, USDC from a personal wallet you control (e.g., MetaMask for EVM). Do NOT send from an exchange.</p>
                </div>
            </div>
            <div class="modal-buttons">
                <button class="btn btn-secondary" onclick="copyPresaleAddress()">Copy address</button>
                <button class="btn btn-primary" onclick="closePaymentModal()">Close</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    document.body.classList.add('no-scroll');
}

function copyPresaleAddress() {
    const addressElement = document.getElementById('modal-address');
    if (addressElement) {
        const address = addressElement.textContent;
        navigator.clipboard.writeText(address).then(() => {
            // Find copy button and update text
            const copyBtns = document.querySelectorAll('.modal .btn-copy, .modal .btn-secondary');
            copyBtns.forEach(btn => {
                if (btn.textContent.includes('Copy')) {
                    const originalText = btn.textContent;
                    btn.textContent = 'Copied!';
                    setTimeout(() => {
                        btn.textContent = originalText;
                    }, 2000);
                }
            });
        });
    }
}

function closePaymentModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
    document.body.classList.remove('no-scroll');
}

// How to Buy button functionality
const howToBuyBtn = document.getElementById('how-to-buy-btn');
if (howToBuyBtn) {
    howToBuyBtn.addEventListener('click', function() {
        showHowToBuyModal();
    });
}

function showHowToBuyModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content payment-modal how-to-buy">
            <h3>How to Buy $MASK Tokens</h3>
            <div class="payment-details">
                <div class="payment-section">
                    <h4 class="step-title">Step 1: Choose Network & Currency</h4>
                    <p>Select your preferred blockchain network (Ethereum or BNB Chain) and currency (ETH, BNB, USDT, or USDC).</p>
                </div>
                
                <div class="payment-section">
                    <h4 class="step-title">Step 2: Enter Purchase Amount</h4>
                    <p>Input the amount you want to spend. The system will automatically calculate how many $MASK tokens you'll receive.</p>
                    <p style="color: var(--primary-color); font-weight: 800; font-size: 1.05rem; text-shadow: 0 1px 3px rgba(0,0,0,0.3); margin-top: 1rem;"><strong>Minimum Purchase Requirements:</strong><br>
                    <span style="color: #ff6b6b; font-weight: 700;">• ETH: 0.05 ETH<br>
                    • BNB: 0.2 BNB<br>
                    • USDT/USDC: 200 tokens</span></p>
                </div>
                
                <div class="payment-section">
                    <h4 class="step-title">Step 3: Click "Buy Now"</h4>
                    <p>Click the Buy Now button to get payment instructions with the official presale wallet address.</p>
                </div>
                
                <div class="payment-section">
                    <h4 class="step-title">Step 4: Send Payment</h4>
                    <p>Send the exact amount from your personal wallet (MetaMask recommended) to the provided address. DO NOT send from exchanges.</p>
                </div>
                
                <div class="payment-section">
                    <h4 class="step-title">Step 5: Receive Tokens</h4>
                    <p>$MASK tokens will be automatically sent to your wallet address once payment is confirmed. No manual claiming required.</p>
                </div>
                
                <div class="how-to-buy-warning">
                    <p><strong>Important:</strong> Only send ETH, BNB, USDT, USDC from a personal wallet you control (e.g., MetaMask for EVM). Do NOT send from an exchange.</p>
                </div>
            </div>
            
            <div class="modal-buttons">
                <button class="btn btn-primary" onclick="closeHowToBuyModal()">Got It!</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.classList.add('no-scroll');
}

function closeHowToBuyModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
    document.body.classList.remove('no-scroll');
}

// Remove old confirmation functions
function showPurchaseConfirmation() {
    // This function is now replaced by showPaymentModal
}

function confirmPurchase() {
    // This function is now replaced by showPaymentModal
}

// Countdown timer
function initCountdown() {
    const targetDate = new Date('October 5, 2025 00:00:00').getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;
        
        const countdownContainer = document.querySelector('.countdown-container');
        if (distance < 0) {
            if (countdownContainer) {
                countdownContainer.innerHTML = '<h5 style="color: var(--primary-color);">Presale Ended</h5>';
            }
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        const daysElement = document.getElementById('days');
        const hoursElement = document.getElementById('hours');
        const minutesElement = document.getElementById('minutes');
        const secondsElement = document.getElementById('seconds');
        
        if (daysElement) daysElement.textContent = days.toString().padStart(3, '0');
        if (hoursElement) hoursElement.textContent = hours.toString().padStart(2, '0');
        if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
        if (secondsElement) secondsElement.textContent = seconds.toString().padStart(2, '0');
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply animation to sections
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCurrencyOptions();
    updateContractAddress();
    initCountdown();
    renderAccordion();
});

function renderAccordion(){const c=document.getElementById('faq-accordion');if(!c||!window.FAQ_DATA)return;c.innerHTML='';window.FAQ_DATA.forEach(q=>{const i=document.createElement('div');i.className='accordion-item';i.innerHTML=`<button class="accordion-header" aria-expanded="false"><span>${q.q}</span><span class="accordion-icon">+</span></button><div class="accordion-content" style="max-height:0;"><p>${q.a}</p></div>`;c.appendChild(i);});c.addEventListener('click',e=>{const h=e.target.closest('.accordion-header');if(!h)return;const ex=h.getAttribute('aria-expanded')==='true';document.querySelectorAll('.accordion-header[aria-expanded="true"]').forEach(x=>{x.setAttribute('aria-expanded','false');x.nextElementSibling.style.maxHeight='0';});if(!ex){h.setAttribute('aria-expanded','true');const ct=h.nextElementSibling;ct.style.maxHeight=ct.scrollHeight+'px';}});}

function showErrorModal(message) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content payment-modal" style="max-width: 400px;">
            <h3 style="color: #e74c3c; margin-bottom: 1rem;">⚠️ Input Error</h3>
            <div class="payment-details" style="margin-bottom: 1.5rem;">
                <p style="color: var(--text-secondary); text-align: center; font-size: 1.1rem; margin: 0;">${message}</p>
            </div>
            
            <div class="modal-buttons">
                <button class="btn btn-primary" onclick="closeErrorModal()" style="width: 100%;">OK</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.classList.add('no-scroll');
}

function closeErrorModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
    document.body.classList.remove('no-scroll');
}

// Anti-copy / anti-clone protections
document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('selectstart', (e) => e.preventDefault());
document.addEventListener('dragstart', (e) => e.preventDefault());
document.addEventListener('keydown', (e) => {
    const key = e.key?.toLowerCase();
    if (e.ctrlKey && (key === 'c' || key === 'a' || key === 'u' || key === 's')) e.preventDefault();
    if (e.metaKey && (key === 'c' || key === 'a' || key === 'u' || key === 's')) e.preventDefault();
    if (key === 'f12' || e.key === 'F12') e.preventDefault();
});

// Inline error functions
function showInlineError(message) {
    // Remove any existing error message
    clearErrorMessage();
    
    // Create error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'inline-error-message';
    errorElement.innerHTML = `
        <div class="error-content">
            <span class="error-icon">⚠️</span>
            <span class="error-text">${message}</span>
        </div>
    `;
    
    // Insert after the receive section
    const receiveSection = document.querySelector('.receive-section');
    if (receiveSection) {
        receiveSection.parentNode.insertBefore(errorElement, receiveSection.nextSibling);
    }
}

function clearErrorMessage() {
    const existingError = document.querySelector('.inline-error-message');
    if (existingError) {
        existingError.remove();
    }
}
