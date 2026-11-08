"""Validate narration delivery and scientific assets without network requests."""
from pathlib import Path
import json

root = Path(__file__).resolve().parents[1]
data = json.loads((root / 'narration/narration.json').read_text())
master = (root / 'narration/venomics-stage-narration.txt').read_text()
assert len(data['clips']) == data['clip_count'] == 28
assert len({(c['animal'], c['stage']) for c in data['clips']}) == 24
assert len({c['file'] for c in data['clips']}) == 28
for c in data['clips']:
    assert (root / 'narration' / c['file']).read_text().strip() == c['text']
    assert c['text'] in master
    assert c['source_ids'] and all(k in data['sources'] for k in c['source_ids'])
    assert c['word_count'] == len(c['text'].split())
for animal in ['jararaca', 'gila', 'cone', 'bee']:
    clips = [c for c in data['clips'] if c['animal'] == animal]
    assert [c['phase'] for c in clips] == ['fauna', 'apparatus', 'venom', 'peptide', 'organ', 'mechanism', 'drug']
science = json.loads((root / 'data/science.json').read_text())
assert science['jararaca']['sequence'] == 'pGlu-WPRPQIPP'
for animal, count in [('gila', 39), ('cone', 25), ('bee', 134)]:
    assert len(science[animal]['sequence']) == science[animal]['residueCount'] == count
molecules = json.loads((root / 'data/molecules.json').read_text())
assert len(molecules['ace']['zinc']) == 3
print('28 synchronized speech clips, 24 stages, valid source mappings and residue counts.')
