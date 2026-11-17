/**
 * Geo Hero personalization for AEM EDS / XWalk.
 *
 * Supports:
 * - Flattened EDS Preview markup
 * - Grouped AEM Author / Universal Editor markup
 * - Four regional background images
 * - Region-specific CSS design controls
 * - Region-specific text halos
 *
 * Priority:
 * 1. URL parameter (?geo=)
 * 2. eds_geo cookie
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
  // Clean up any background from a previous decoration.
  block.querySelector('.geo-hero-background')?.remove();
  block.classList.remove('has-background');

  const rows = [...block.children];
  const content = rows[0]?.firstElementChild;

  if (!content) return;

  const elements = [...content.children];
  const pictures = [...block.querySelectorAll('picture')];

  const region = requestedRegion();
  const regionIndex = REGIONS.indexOf(region);

  // Identify image-only containers in the content row.
  const imageElements = elements.filter(
    (element) => element.querySelector('picture')
      && !element.querySelector('h2'),
  );

  // Identify text content separately from images.
  const textElements = elements.filter(
    (element) => !imageElements.includes(element),
  );

  // Build groups from the four regional headings.
  // Works whether headings are direct elements or
  // wrapped inside additional div elements.
  const groups = REGIONS.map(() => []);
  let currentGroup = -1;

  textElements.forEach((element) => {
    const startsRegion = element.matches('h2')
      || !!element.querySelector('h2');

    if (startsRegion) {
      currentGroup += 1;
    }

    if (currentGroup >= 0 && currentGroup < REGIONS.length) {
      groups[currentGroup].push(element);
    }
  });

  // Do not modify content when the structure is unknown.
  if (
    currentGroup !== REGIONS.length - 1
    || groups.some((group) => group.length === 0)
  ) {
    return;
  }

  // Select only the active regional content.
  groups.forEach((group, index) => {
    group.forEach((element) => {
      element.hidden = index !== regionIndex;
    });
  });

  // Select the regional image before hiding originals.
  const selectedPicture = pictures[regionIndex] || pictures[0];

  // Hide original images in flattened output.
  imageElements.forEach((element) => {
    element.hidden = true;
  });

  // Hide original image rows in multi-row output.
  rows.slice(1).forEach((row) => {
    if (row.querySelector('picture')) {
      row.hidden = true;
    }
  });

  // Create the visible background image layer.
  if (selectedPicture) {
    const background = document.createElement('div');

    background.className = 'geo-hero-background';
    background.setAttribute('aria-hidden', 'true');

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

  // Activate region-specific CSS design controls.
  block.dataset.activeGeo = region;
  block.classList.add('geo-ready');
}
