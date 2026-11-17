/**
 * Geo Hero personalization for AEM EDS / XWalk.
 *
 * Supports flattened EDS markup and grouped AEM Author markup.
 *
 * Public experience:
 * 1. ?geo= URL parameter
 * 2. eds_geo cookie
 * 3. Default
 *
 * AEM Author:
 * Adds an interactive region preview selector.
 */

const REGIONS = ['default', 'fl', 'ny', 'tn'];

const REGION_LABELS = {
  default: 'Default',
  fl: 'Florida',
  ny: 'New York',
  tn: 'Tennessee',
};

const PREVIEW_STORAGE_KEY = 'geo-hero-author-preview';

function normalizeRegion(value) {
  const input = String(value || '').trim().toLowerCase();

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

function isAuthorEnvironment() {
  const hostname = window.location.hostname.toLowerCase();

  return hostname.startsWith('author-')
    && hostname.endsWith('.adobeaemcloud.com');
}

function getSavedPreviewRegion() {
  try {
    return window.sessionStorage.getItem(PREVIEW_STORAGE_KEY);
  } catch {
    return null;
  }
}

function savePreviewRegion(region) {
  try {
    window.sessionStorage.setItem(PREVIEW_STORAGE_KEY, region);
  } catch {
    // Session storage is optional.
  }
}

function requestedRegion(authorMode) {
  const params = new URLSearchParams(window.location.search);

  // Explicit URL targeting always takes priority.
  if (params.has('geo')) {
    return normalizeRegion(params.get('geo'));
  }

  // Author-only preview override.
  if (authorMode) {
    const saved = getSavedPreviewRegion();

    if (saved !== null) {
      return normalizeRegion(saved);
    }
  }

  return normalizeRegion(getCookie('eds_geo'));
}

function createAuthorToolbar(selectedRegion, onSelect) {
  const toolbar = document.createElement('div');
  toolbar.className = 'geo-hero-author-toolbar';

  const label = document.createElement('label');
  label.className = 'geo-hero-author-label';
  label.textContent = 'Geo Hero | Preview Region';

  const select = document.createElement('select');
  select.className = 'geo-hero-author-select';

  const selectId = `geo-hero-preview-${Math.random()
    .toString(36).slice(2, 10)}`;

  select.id = selectId;
  label.htmlFor = selectId;

  REGIONS.forEach((region) => {
    const option = document.createElement('option');

    option.value = region;
    option.textContent = REGION_LABELS[region];

    select.append(option);
  });

  select.value = selectedRegion;

  select.addEventListener('change', () => {
    const region = normalizeRegion(select.value);

    savePreviewRegion(region);
    onSelect(region);
  });

  toolbar.append(label, select);

  return toolbar;
}

export default function decorate(block) {
  const authorMode = isAuthorEnvironment();

  // Remove any previously generated background.
  block.querySelector('.geo-hero-background')?.remove();
  block.classList.remove('has-background');

  // Remove an old author toolbar if redecorated.
  if (block.previousElementSibling?.classList
    .contains('geo-hero-author-toolbar')) {
    block.previousElementSibling.remove();
  }

  const rows = [...block.children];
  const content = rows[0]?.firstElementChild;

  if (!content) return;

  const elements = [...content.children];

  // Collect images before adding a generated background.
  const originalPictures = [
    ...block.querySelectorAll('picture'),
  ];

  // Separate image-only elements from text content.
  const imageElements = elements.filter(
    (element) => element.querySelector('picture')
      && !element.querySelector('h2'),
  );

  const textElements = elements.filter(
    (element) => !imageElements.includes(element),
  );

  // Build regional content groups using H2 boundaries.
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

  // Avoid incorrect personalization if structure changes.
  const structureValid = currentGroup === REGIONS.length - 1
    && groups.every((group) => group.length > 0);

  if (!structureValid) return;

  // Hide all original image markup.
  imageElements.forEach((element) => {
    element.hidden = true;
  });

  // Also support separate image rows.
  rows.slice(1).forEach((row) => {
    if (row.querySelector('picture')) {
      row.hidden = true;
    }
  });

  // Background layer reused when switching regions.
  const background = document.createElement('div');
  background.className = 'geo-hero-background';
  background.setAttribute('aria-hidden', 'true');

  block.prepend(background);

  // This function is called whenever the selected region changes.
  function showRegion(value) {
    const region = normalizeRegion(value);
    const regionIndex = REGIONS.indexOf(region);

    // Select regional text and CTA.
    groups.forEach((group, index) => {
      group.forEach((element) => {
        element.hidden = index !== regionIndex;
      });
    });

    // Replace the background with the selected regional image.
    background.replaceChildren();

    const selectedPicture = originalPictures[regionIndex]
      || originalPictures[0];

    if (selectedPicture) {
      const picture = selectedPicture.cloneNode(true);
      const img = picture.querySelector('img');

      if (img) {
        img.loading = 'eager';
        img.alt = '';
      }

      background.append(picture);
      block.classList.add('has-background');
    } else {
      block.classList.remove('has-background');
    }

    // Activate region-specific colors, halos, height,
    // CTA styles, and image positioning.
    block.dataset.activeGeo = region;
    block.classList.add('geo-ready');
  }

  const initialRegion = requestedRegion(authorMode);

  // Apply the selected experience immediately.
  showRegion(initialRegion);

  // Add author-only region selector.
  if (authorMode) {
    const toolbar = createAuthorToolbar(
      initialRegion,
      showRegion,
    );

    // Place it outside the block to avoid changing
    // the editable content structure.
    block.before(toolbar);
  }
}
