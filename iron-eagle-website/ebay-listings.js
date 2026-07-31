/**
 * Iron Eagle Truck Center — eBay Listings Integration
 *
 * How it works:
 *  - Fetches live eBay listings from a backend endpoint (to be set up)
 *  - Trucks/vehicles → injected into #truck-listings (Sales tab)
 *  - Parts → injected into #parts-listings (Parts tab)
 *
 * Status: PENDING — wire up backend endpoint, then set EBAY_ENABLED = true
 */

const EBAY_ENABLED = false;

// Backend endpoint (Netlify function or server) that proxies eBay Browse API
const API_ENDPOINT = '/api/ebay-listings';

// eBay category IDs
const CATEGORY_TRUCKS = '63731';  // Commercial Trucks
const CATEGORY_PARTS  = '6030';   // Heavy Equipment Parts & Accessories

async function loadEbayListings() {
  if (!EBAY_ENABLED) return; // Remove this line when backend is ready

  try {
    const [trucksRes, partsRes] = await Promise.all([
      fetch(`${API_ENDPOINT}?category=${CATEGORY_TRUCKS}&limit=6`),
      fetch(`${API_ENDPOINT}?category=${CATEGORY_PARTS}&limit=6`)
    ]);

    const trucks = await trucksRes.json();
    const parts  = await partsRes.json();

    if (trucks.items?.length) renderListings('truck-listings', trucks.items);
    if (parts.items?.length)  renderListings('parts-listings', parts.items);

  } catch (err) {
    console.warn('eBay listings unavailable:', err);
    // Placeholders remain visible — graceful fallback
  }
}

function renderListings(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = items.map(item => `
    <a class="listing-card" href="${item.itemWebUrl}" target="_blank" rel="noopener">
      <div class="listing-img-wrap">
        ${item.image?.imageUrl
          ? `<img src="${item.image.imageUrl}" alt="${item.title}" loading="lazy" />`
          : `<div class="listing-img-placeholder">🚛</div>`
        }
      </div>
      <div class="listing-info">
        <span class="listing-badge badge-live">Live on eBay</span>
        <h3 class="listing-title">${item.title}</h3>
        <p class="listing-meta">${item.condition || ''} ${item.itemLocation?.city ? '· ' + item.itemLocation.city + ', ' + item.itemLocation.stateOrProvince : ''}</p>
        <p class="listing-price">${formatPrice(item.price)}</p>
      </div>
    </a>
  `).join('');
}

function formatPrice(price) {
  if (!price) return 'Contact for Price';
  const num = parseFloat(price.value);
  return isNaN(num) ? 'Contact for Price'
    : '$' + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

document.addEventListener('DOMContentLoaded', loadEbayListings);
