"""Package the self-contained edition for a normal Chrome ZIP download."""
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED
root = Path(__file__).resolve().parent.parent
output = root / 'standalone/projectmanager-ai-africa.zip'
with ZipFile(output, 'w', compression=ZIP_DEFLATED) as archive:
    for name in ['projectmanager-ai-africa.html', 'START-HERE.txt']:
        info = ZipInfo(name)
        info.compress_type = ZIP_DEFLATED
        archive.writestr(info, (root / 'standalone' / name).read_bytes())
with ZipFile(output) as archive:
    assert archive.testzip() is None
    assert len(archive.namelist()) == 2
print(f'Created {output.name} ({output.stat().st_size:,} bytes)')
