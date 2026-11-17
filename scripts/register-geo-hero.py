#!/usr/bin/env python3
"""Add Geo Hero to existing XWalk source and compiled JSON without overwriting other models.
Run from the root of the ALSACAEM repo: python3 scripts/register-geo-hero.py
"""
import json
from pathlib import Path

root = Path.cwd()
block_path = root / 'blocks/geo-hero/_geo-hero.json'
if not block_path.exists():
    raise SystemExit('Run from the repository root after copying the geo-hero files.')
block = json.loads(block_path.read_text(encoding='utf-8'))

def update(path, callback):
    data = json.loads(path.read_text(encoding='utf-8'))
    changed = callback(data)
    if changed:
        path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print(f'{path.relative_to(root)}: {"updated" if changed else "already configured"}')

def add_section(data):
    section = next(x for x in data['filters'] if x['id'] == 'section')
    if 'geo-hero' in section['components']:
        return False
    section['components'].append('geo-hero')
    return True

def add_component_definition(data):
    group = next(x for x in data['groups'] if x['id'] == 'blocks')
    if any(item.get('id') == 'geo-hero' for item in group['components']):
        return False
    group['components'].extend(block['definitions'])
    return True

def add_model(data):
    if any(item.get('id') == 'geo-hero' for item in data):
        return False
    data.extend(block['models'])
    return True

def add_filter(data):
    section = next(x for x in data if x['id'] == 'section')
    if 'geo-hero' in section['components']:
        return False
    section['components'].append('geo-hero')
    return True

update(root / 'models/_section.json', add_section)
update(root / 'component-definition.json', add_component_definition)
update(root / 'component-models.json', add_model)
update(root / 'component-filters.json', add_filter)
print('Registration complete. Commit the changed files. Subsequent npm run build:json is safe.')
