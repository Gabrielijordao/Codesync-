"""Offline structural verification of the consolidated academic deliverable.
This does not replace MySQL, Jest, Docker or AWS runtime checks.
"""
from pathlib import Path
import xml.etree.ElementTree as ET
import sys, re, zipfile
from collections import Counter

root=Path(__file__).resolve().parents[1]
errors=[]
required=['README.md','CONTRIBUTING.md','database/01_schema.sql','database/02_seed.sql',
          'database/03_verificacao.sql','src/app.js','src/docs/openapi.yaml',
          'docs/MATRIZ_REQUISITOS_CP2.md','docs/REVISAO_GERAL.md',
          'docs/DIVISAO_EQUIPE_E_BACKLOG.md','entrega/HospedJa_Checkpoint3_Documento_Unico.pdf']
for item in required:
    if not (root/item).is_file():errors.append('Falta '+item)
for p in sorted((root/'diagramas').glob('*.drawio')):
    try:
        doc=ET.parse(p); rootxml=doc.getroot()
        assert rootxml.tag=='mxfile'
        diagrams=rootxml.findall('./diagram')
        assert len(diagrams)==1
        graph=diagrams[0].find('mxGraphModel')
        assert graph is not None and graph.attrib.get('background')=='#FFFFFF'
        cells=graph.findall('./root/mxCell')
        ids={c.attrib.get('id') for c in cells}
        for c in cells:
            if c.attrib.get('edge')=='1':
                assert c.attrib.get('source') in ids and c.attrib.get('target') in ids
        print('OK drawio',p.name,len(cells),'cells')
    except Exception as e: errors.append(p.name+' inválido: '+str(e))
if len(list((root/'diagramas').glob('*.drawio')))!=6:
    errors.append('Quantidade de diagramas diferente de 6')
text=(root/'database/01_schema.sql').read_text()
if len(re.findall(r'CREATE TABLE IF NOT EXISTS',text,re.I))!=40:errors.append('Schema diferente de 40 tabelas')
if (root/'package-lock.json').exists():print('package-lock presente')
else: print('PENDENTE package-lock.json, gerar com npm install local')
if not (root/'entrega/HospedJa_Checkpoint3_Documento_Unico.pdf').read_bytes().startswith(b'%PDF-'):
    errors.append('PDF inválido ou ausente')
print('Erros estruturais:',len(errors))
for e in errors:print('ERROR',e)
sys.exit(1 if errors else 0)
