/**
 * Geo Hero personalization for AEM EDS / XWalk.
 *
 * Supports both flattened and multi-row XWalk output.
 * Regions: Default, Florida, New York, Tennessee.
 *
 * Priority:
 * 1. URL parameter (?geo=)
 * 2. Browser cookie (eds_geo)
 * 3. Default
 */

const REGIONS = ['default', 'fl', 'ny', 'tn'];
const FIELDS_PER_REGION = 3;

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

  // First row contains regional text content.
  const content = rows[0]?.firstElementChild;

  if (!content) return;

  const children = [...content.children];

  // Separate text elements from image elements.
  // In flattened XWalk output, images are in the same row.
  const textElements = children.filter(
    (element) => !element.querySelector('picture'),
  );

  const expectedCount = REGIONS.length * FIELDS_PER_REGION;

  // Avoid selecting incorrect content if the model changes.
  if (textElements.length !== expectedCount) return;

  // Identify background image containers.
  let imageContainers;

  if (rows.length > 1) {
    // Original XWalk structure: separate image rows.
    imageContainers = rows.slice(1, 5);
  } else {
    // New XWalk structure: all images in one row.
    imageContainers = children.filter(
      (element) => element.querySelector('picture'),
    );
  }

  const requested = requestedRegion();
  const regionIndex = REGIONS.indexOf(requested);

  // Identify the three content elements for this region.
  const start = regionIndex * FIELDS_PER_REGION;
  const end = start + FIELDS_PER_REGION;

  // Show only the selected regional text.
  textElements.forEach((element, index) => {
    element.hidden = index < start || index >= end;
  });

  // Select matching background image.
  const selectedContainer = imageContainers[regionIndex];
  const selectedPicture = selectedContainer?.querySelector('picture')
    || imageContainers[0]?.querySelector('picture');

  // Hide all original image containers.
  imageContainers.forEach((container) => {
    container.hidden = true;
  });

  // Remove any previously generated background.
  block.querySelector('.geo-hero-background')?.remove();

  if (selectedPicture) {
    const background = document.createElement('div');
    background.className = 'geo-hero-background';
    background.setAttribute('aria-hidden', 'true');

    // Preserve AEM responsive image sources.
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

  // Mark personalization complete.
  block.dataset.activeGeo = requested;
  block.classList.add('geo-ready');
}
