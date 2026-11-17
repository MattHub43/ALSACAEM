/**
 * Geo Hero personalization for AEM EDS / XWalk.
 *
 * Content order:
 * Default, Florida, New York, Tennessee.
 *
 * Image rows follow the same order.
 *
 * Priority:
 * 1. URL parameter
 * 2. Cookie
 * 3. Default
 */

const REGIONS = ['default', 'fl', 'ny', 'tn'];

function normalizeRegion(value) {
  const input = (value || '').trim().toLowerCase();

  const aliases = {
    florida: 'fl',
    virginia: 'fl',
    va: 'fl',
    'new-york': 'ny',
    'new york': 'ny',
    tennessee: 'tn',
  };

  const region = aliases[input] || input;

  return REGIONS.includes(region) ? region : 'default';
}

function getCookie(name) {
  const prefix = `${encodeURIComponent(name)}=`;
  const item = document.cookie.split('; ')
    .find((cookie) => cookie.startsWith(prefix));

  return item ? decodeURIComponent(item.slice(prefix.length)) : '';
}

function requestedRegion() {
  const params = new URLSearchParams(window.location.search);

  if (params.has('geo')) {
    return normalizeRegion(params.get('geo'));
  }

  return normalizeRegion(getCookie('eds_geo'));
}

export default function decorate(block) {
  const rows = [...block.children];

  // First row contains all personalized text variations.
  const contentRow = rows[0];
  const content = contentRow?.firstElementChild;

  if (!content) return;

  const elements = [...content.children];
  const fieldsPerRegion = 3;

  // Validate the current XWalk content structure.
  if (elements.length !== REGIONS.length * fieldsPerRegion) {
    return;
  }

  const requested = requestedRegion();
  const regionIndex = REGIONS.indexOf(requested);

  const start = regionIndex * fieldsPerRegion;
  const end = start + fieldsPerRegion;

  // Show only the selected regional text and CTA.
  elements.forEach((element, index) => {
    element.hidden = index < start || index >= end;
  });

  // Image rows:
  // 1 = Default
  // 2 = Florida
  // 3 = New York
  // 4 = Tennessee
  const imageRows = rows.slice(1, 5);

  // Find the regional image, falling back to Default.
  const selectedImageRow = imageRows[regionIndex];
  const selectedPicture = selectedImageRow?.querySelector('picture')
    || imageRows[0]?.querySelector('picture');

  // Hide the original image rows.
  imageRows.forEach((row) => {
    row.hidden = true;
  });

  if (selectedPicture) {
    const background = document.createElement('div');
    background.className = 'geo-hero-background';
    background.setAttribute('aria-hidden', 'true');

    // Preserve AEM responsive picture sources.
    const picture = selectedPicture.cloneNode(true);
    const img = picture.querySelector('img');

    if (img) {
      img.loading = 'eager';
      img.alt = '';
    }

    background.append(picture);
    block.prepend(background);
    block.classList.add('has-background');
  }

  block.dataset.activeGeo = requested;
  block.classList.add('geo-ready');
}
