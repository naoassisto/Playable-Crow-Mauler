#!/usr/bin/env python3
"""Package the mod without reading or distributing the game installation."""
import argparse
import hashlib
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
VERSION = '1.7.0-beta.1'
PAYLOAD = (
    'www/img/sv_actors/crow_mauler_player.png',
    'www/js/crow-mauler-compatibility.json',
    'www/js/main.js',
    'www/js/plugins/CrowMaulerPhysicalAttackFix.js',
    'www/js/plugins/PlayableCrowMauler.js',
)
DOCUMENTS = (
    'README.txt', 'CREDITS.txt', 'CHANGELOG.txt', 'GAMEPLAY.txt',
    'LICENSE-Coelocanth.txt', 'intro-text.json', 'ending-audit.txt',
)
HELPERS = (
    'manage-macOS.sh', 'manage-Windows.ps1',
    'Install-macOS.command', 'Uninstall-macOS.command',
    'Install-Windows.cmd', 'Uninstall-Windows.cmd',
)


def read_source(relative):
    file = ROOT / relative
    if file.is_symlink() or ROOT not in file.resolve().parents:
        raise SystemExit(f'Refusing linked source: {relative}')
    return file.read_bytes()


def build(manual, manifest):
    name = f'Playable-Crow-Mauler-{VERSION}' + ('-Manual' if manual else '')
    contents = {file: read_source(file) for file in PAYLOAD + DOCUMENTS}
    contents['payload-sha256.tsv'] = manifest
    if manual:
        contents['README.txt'] = read_source('docs/README-manual.txt')
    else:
        contents.update({file: read_source(file) for file in HELPERS})
    output = ROOT / 'dist'
    output.mkdir(exist_ok=True)
    archive = output / f'{name}.zip'
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as bundle:
        for relative, data in sorted(contents.items()):
            entry = zipfile.ZipInfo(relative, date_time=(2026, 10, 10, 0, 0, 0))
            entry.create_system = 3
            mode = 0o100755 if relative.endswith(('.command', '.sh')) else 0o100644
            entry.external_attr = mode << 16
            entry.compress_type = zipfile.ZIP_DEFLATED
            bundle.writestr(entry, data)
    with zipfile.ZipFile(archive) as bundle:
        if bundle.testzip() is not None or set(bundle.namelist()) != set(contents):
            raise SystemExit(f'Archive validation failed: {archive.name}')
        for relative, data in contents.items():
            if bundle.read(relative) != data:
                raise SystemExit(f'Archive content differs: {relative}')
    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    archive.with_suffix('.zip.sha256').write_bytes(
        f'{digest}  {archive.name}\n'.encode('utf-8'))
    print(f'{archive.name}: {len(contents)} files, {archive.stat().st_size:,} bytes')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--update-hashes', action='store_true',
                        help='Refresh the payload manifest after intentional source changes.')
    args = parser.parse_args()
    actual = {file.relative_to(ROOT).as_posix()
              for file in (ROOT / 'www').rglob('*') if file.is_file()}
    if actual != set(PAYLOAD):
        raise SystemExit(f'Unexpected or missing payload files: {sorted(actual ^ set(PAYLOAD))}')
    manifest = ''.join(
        hashlib.sha256(read_source(file)).hexdigest() + '\t' + file[4:] + '\n'
        for file in PAYLOAD
    ).encode('utf-8')
    if args.update_hashes:
        (ROOT / 'payload-sha256.tsv').write_bytes(manifest)
    elif read_source('payload-sha256.tsv') != manifest:
        raise SystemExit('Payload hashes differ. Review changes, then use --update-hashes.')
    build(manual=False, manifest=manifest)
    build(manual=True, manifest=manifest)


if __name__ == '__main__':
    main()
