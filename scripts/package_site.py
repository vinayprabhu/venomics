"""Validate and stage the static website for GitHub Pages using only Python's standard library."""
from pathlib import Path
import json
import shutil

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / '_site'

assert (ROOT / 'index.html').is_file(), 'index.html is missing from the repository root'
for name in ('assets', 'data', 'media'):
    assert (ROOT / name).is_dir(), f'Missing required directory: {name}'
for path in (ROOT / 'data').glob('*.json'):
    json.loads(path.read_text(encoding='utf-8'))
for animal in ('jararaca', 'gila', 'cone', 'bee'):
    model = ROOT / 'media' / 'models' / f'{animal}.glb'
    with model.open('rb') as stream:
        assert stream.read(4) == b'glTF', f'Invalid or missing GLB model: {animal}'
    assert (model.parent / f'{animal}-poster.png').is_file(), f'Missing fallback image: {animal}'

if OUTPUT.exists():
    shutil.rmtree(OUTPUT)
OUTPUT.mkdir()
for pattern in ('*.html', '*.js', '*.css'):
    for source in ROOT.glob(pattern):
        shutil.copy2(source, OUTPUT / source.name)
for name in ('assets', 'data', 'media'):
    shutil.copytree(ROOT / name, OUTPUT / name)
(OUTPUT / '.nojekyll').touch()
print(f'Prepared {sum(p.is_file() for p in OUTPUT.rglob("*"))} website files.')
